import { hexToBin } from "@bitauth/libauth";
import {
  type AgentRead,
  agentPrompt,
  gate,
  MODEL_HINT,
  type PastRead,
  promptHash,
  type ResolvedModel,
  readRound,
  resolveModel,
} from "@joge/brain";
import { agentVaultContract, buildVaultBet, type Deployment, roundContracts, type TokenUtxo } from "@joge/contracts";
import {
  type AgentRow,
  agentCallsSince,
  agentMemory,
  agentReads,
  agents,
  CHANNEL,
  type Database,
  type LaneView,
  listAgents,
  listen,
  lobby,
  type Network,
  notify,
  priceSeries,
} from "@joge/db";
import { AGENT_BET_FEE, agentPrivateKey, decodeGate, MAX_STAKE, MIN_STAKE, TICKET_DUST } from "@joge/sdk";
import { SignatureTemplate } from "@solidcash/solidcash";
import { eq } from "drizzle-orm";
import { broadcast, chainProvider, type Fulcrum, utxosAt } from "../chain/electrum.ts";
import { errorText, logger } from "../log.ts";
import { beat, nowSeconds, sleep } from "../runtime.ts";
import {
  AGENT_PRINTS,
  AGENT_PRINTS_WINDOW_MS,
  AGENT_READ_AFTER_SHARE,
  AGENT_READ_LEAD_SECONDS,
  AGENT_TICK_MS,
  HOUR_MS,
  MEMORY_FOR_GATE,
  MEMORY_FOR_PROMPT,
  REASON_MAX,
  VAULT_CHANGE_MIN,
} from "./constants.ts";

const log = logger("agents");
const SATS_PER_BCH = 100_000_000;
const HOUR_SECONDS = 3_600;
const MINUTE_SECONDS = 60;
const lengthLabel = (seconds: number) =>
  seconds >= HOUR_SECONDS ? `${seconds / HOUR_SECONDS} h` : `${seconds / MINUTE_SECONDS} min`;

/**
 * Runs every active agent (F13). For each round it should read (its lanes' next rounds, after a quarter of the entry
 * window and at least a minute before the lock) it claims the read once, asks the model within the house budget, and
 * lets the deterministic gate decide. On its own, a vault bet signed with the agent's key; ask me first, a proposal
 * the owner signs in the app. Every read is the agent's memory.
 */
export class AgentRunner {
  readonly #round;
  #wake: (() => void) | undefined;

  private readonly database: Database;
  private readonly fulcrum: Fulcrum;
  private readonly network: Network;
  private readonly xprv: string | undefined;
  private readonly maxCallsPerHour: number;

  constructor(
    database: Database,
    fulcrum: Fulcrum,
    network: Network,
    deployment: Deployment,
    xprv: string | undefined,
    maxCallsPerHour: number,
  ) {
    this.database = database;
    this.fulcrum = fulcrum;
    this.network = network;
    this.xprv = xprv;
    this.maxCallsPerHour = maxCallsPerHour;
    this.#round = roundContracts({
      category: deployment.category,
      provider: chainProvider(fulcrum, network),
      protocolLockingBytecode: deployment.protocolLockingBytecode,
    });
  }

  async run(signal: AbortSignal) {
    const stop = await listen(this.database.sql, CHANNEL.round, () => this.#wake?.());
    const model = resolveModel();
    log.info("running", { model: model ? `${model.id} via ${model.via}` : "none", signs: this.xprv ? "yes" : "no" });
    while (!signal.aborted) {
      try {
        await this.tick(model);
      } catch (error) {
        log.warn("tick failed", { error: errorText(error) });
      }
      await Promise.race([
        sleep(AGENT_TICK_MS, signal),
        new Promise<void>((resolve) => {
          this.#wake = resolve;
        }),
      ]);
      this.#wake = undefined;
    }
    await stop.unlisten();
  }

  private async tick(model: ResolvedModel | null) {
    const { db } = this.database;
    const calls = await agentCallsSince(db, this.network, new Date(Date.now() - HOUR_MS));
    await beat(this.database, `agents:${this.network}`, {
      at: nowSeconds(),
      calls,
      budget: this.maxCallsPerHour,
      model: model?.id ?? null,
    });
    const all = await listAgents(db, this.network);
    if (all.length === 0) return;
    const now = nowSeconds();
    let lanes: LaneView[] | null = null;
    for (const agent of all) {
      // Every vault stays current, paused ones too: the agents page ranks by it and owners withdraw while paused.
      const { largest } = await this.refreshVault(agent);
      if (agent.status !== "active") continue;
      lanes ??= await lobby(db, this.network, now);
      for (const thread of agent.lanes) {
        const lane = lanes.find((candidate) => candidate.thread === thread);
        if (lane) await this.consider(agent, largest, lane, model, now);
      }
    }
  }

  /**
   * The vault's balance straight from its coins, kept on the agent's row (the agents page ranks by it), and its
   * largest coin: a bet spends exactly one vault coin, so that is what one bet can draw on.
   */
  private async refreshVault(agent: AgentRow): Promise<{ balance: bigint; largest: bigint }> {
    const coins = (await utxosAt(this.fulcrum, agent.vaultLockingBytecode)).filter((coin) => !coin.token);
    const balance = coins.reduce((sum, coin) => sum + coin.satoshis, 0n);
    const largest = coins.reduce((most, coin) => (coin.satoshis > most ? coin.satoshis : most), 0n);
    if (Number(balance) !== agent.vaultSats) {
      await this.database.db
        .update(agents)
        .set({ vaultSats: Number(balance) })
        .where(eq(agents.id, agent.id));
    }
    return { balance, largest };
  }

  private async consider(agent: AgentRow, largest: bigint, lane: LaneView, model: ResolvedModel | null, now: number) {
    const round = lane.next;
    if (!round) return;
    const left = round.lockTime - now;
    if (left < AGENT_READ_LEAD_SECONDS || left > lane.seconds * AGENT_READ_AFTER_SHARE) return;
    const { db } = this.database;
    if ((await agentCallsSince(db, this.network, new Date(Date.now() - HOUR_MS))) >= this.maxCallsPerHour) return;
    const [claimed] = await db
      .insert(agentReads)
      .values({ network: this.network, agentId: agent.id, roundId: round.roundId, verdict: "reading" })
      .onConflictDoNothing()
      .returning({ id: agentReads.id });
    if (!claimed) return;
    const where = eq(agentReads.id, claimed.id);
    const finish = async (values: Partial<typeof agentReads.$inferInsert>, verdict: "enter" | "hold") => {
      await db
        .update(agentReads)
        .set({ ...values, verdict })
        .where(where);
      await notify(this.database.sql, CHANNEL.agent, {
        network: this.network,
        agentId: agent.id,
        roundId: round.roundId,
        verdict,
      });
      log.info("read", { agent: agent.id, round: round.roundId, verdict, reason: values.reason ?? undefined });
    };
    if (!model) return finish({ reason: `No model on the engine. ${MODEL_HINT}` }, "hold");

    const pot = round.totals.reduce((sum, total) => sum + total, 0);
    const memory = await agentMemory(db, this.network, agent, MEMORY_FOR_GATE);
    const past: PastRead[] = memory.slice(0, MEMORY_FOR_PROMPT).map((entry) => ({
      side: entry.side ?? "hold",
      why: entry.why ?? "",
      outcome: entry.outcome,
    }));
    const prints = await this.recentPrices(round.asset);
    const bchUsd = (await this.recentPrices("BCH")).at(-1) ?? 0;
    const brief = {
      roundId: round.roundId,
      asset: round.asset,
      length: lengthLabel(lane.seconds),
      locksInSeconds: left,
      priceNowUsd: prints.at(-1) ?? 0,
      prints,
      upShare: pot > 0 ? (round.totals[0] ?? 0) / pot : 0,
      downShare: pot > 0 ? (round.totals[1] ?? 0) / pot : 0,
      potUsd: (pot / SATS_PER_BCH) * bchUsd,
    };
    const prompt = agentPrompt(agent.persona, agent.posture, brief, past);
    const read: AgentRead = await readRound(model, prompt);
    const asked = {
      side: read.side,
      confidence: read.confidence,
      why: read.why,
      model: model.id,
      promptHash: promptHash(prompt),
    };

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const today = memory.filter((entry) => entry.createdAt >= startOfDay && entry.verdict === "enter");
    const settled = memory.filter((entry) => entry.outcome === "won" || entry.outcome === "lost");
    const streakEnd = settled.findIndex((entry) => entry.outcome !== "lost");
    const lossStreak = streakEnd === -1 ? settled.length : streakEnd;
    const stakeOf = (entries: typeof memory) => entries.reduce((sum, entry) => sum + BigInt(entry.stake ?? 0), 0n);
    const sideShare = read.side === "up" ? brief.upShare : read.side === "down" ? brief.downShare : 0;
    const laneCap = MAX_STAKE[lane.seconds >= HOUR_SECONDS ? "hourly" : "short"];
    const perBetCap = BigInt(agent.perBetCap) < laneCap ? BigInt(agent.perBetCap) : laneCap;
    const verdict = gate({
      read,
      posture: agent.posture,
      sideShare,
      lossStreak,
      lastLossAt: settled.find((entry) => entry.outcome === "lost")?.createdAt.getTime() ?? null,
      lostToday: stakeOf(today.filter((entry) => entry.outcome === "lost")),
      stakedToday: stakeOf(today),
      dailyCap: BigInt(agent.dailyCap),
      perBetCap,
      // The bet's coin must also leave the vault a change output above dust (the covenant wants exactly three outputs).
      spendable: agent.mode === "auto" ? largest - AGENT_BET_FEE - TICKET_DUST - VAULT_CHANGE_MIN : perBetCap,
      minStake: MIN_STAKE,
      nowMs: Date.now(),
    });
    if (!verdict.enter) return finish({ ...asked, reason: verdict.reason }, "hold");
    const outcome = read.side === "up" ? 0 : 1;
    if (agent.mode === "ask") {
      return finish({ ...asked, stake: Number(verdict.stake), proposal: "open", reason: verdict.reason }, "enter");
    }
    if (!this.xprv) return finish({ ...asked, reason: "The engine holds no agent key, so it cannot sign." }, "hold");
    try {
      const txid = await this.bet(agent, round.roundId, outcome, verdict.stake);
      return finish({ ...asked, stake: Number(verdict.stake), txid, reason: verdict.reason }, "enter");
    } catch (error) {
      return finish({ ...asked, reason: `Could not enter: ${errorText(error).slice(0, REASON_MAX)}` }, "hold");
    }
  }

  /** The indicative price line over the last few minutes, thinned to a dozen points (oldest first). */
  private async recentPrices(asset: Parameters<typeof priceSeries>[1]): Promise<number[]> {
    const ticks = await priceSeries(this.database.db, asset, new Date(Date.now() - AGENT_PRINTS_WINDOW_MS));
    if (ticks.length <= AGENT_PRINTS) return ticks.map((tick) => tick.price);
    const step = ticks.length / AGENT_PRINTS;
    return Array.from({ length: AGENT_PRINTS }, (_, index) => ticks[Math.floor(index * step)]?.price ?? 0);
  }

  /** Signs and sends a vault bet: a live lane gate of the round + the vault's coin, signed with the agent's key. */
  private async bet(agent: AgentRow, roundId: number, outcome: number, stake: bigint): Promise<string> {
    const privateKey = agentPrivateKey(this.xprv ?? "", agent.id);
    const round = this.#round;
    const ownerPkh = hexToBin(agent.ownerPkh);
    const vault = agentVaultContract(round, round.gate.provider, {
      ownerPkh,
      agentKey: hexToBin(agent.agentPubkey),
      perBetCap: BigInt(agent.perBetCap),
    });
    if (vault.lockingBytecode !== agent.vaultLockingBytecode) throw new Error("the vault does not match its terms");
    const needed = stake + TICKET_DUST + AGENT_BET_FEE;
    const vaultUtxo = (await utxosAt(this.fulcrum, agent.vaultLockingBytecode))
      .filter((coin) => !coin.token && coin.satoshis >= needed)
      .sort((a, b) => (b.satoshis > a.satoshis ? 1 : -1))[0];
    if (!vaultUtxo) throw new Error("the vault has no coin large enough");
    const gates = (await utxosAt(this.fulcrum, round.gate.lockingBytecode)).filter(
      (coin) => coin.token?.nft && decodeGate(coin.token.nft.commitment).roundId === roundId,
    ) as unknown as TokenUtxo[];
    const laneGate = gates[Math.floor(Math.random() * gates.length)];
    if (!laneGate) throw new Error("the round is no longer taking entries");
    const hex = await buildVaultBet({
      round,
      vault,
      vaultUtxo,
      gate: laneGate,
      outcome,
      stake,
      ownerPkh,
      agentSigner: new SignatureTemplate(privateKey),
    }).build();
    return broadcast(this.fulcrum, hex);
  }
}
