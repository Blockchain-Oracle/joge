import { hexToBin } from "@bitauth/libauth";
import {
  buildDollarLock,
  buildDollarLockTimeout,
  buildDollarSettle,
  buildDollarSettleTimeout,
  buildDollarSweep,
  buildLaneOpen,
  buildLock,
  buildLockTimeout,
  buildSettle,
  buildSettleTimeout,
  buildSweep,
  type Deployment,
  dollarContracts,
  openingContracts,
  roundContracts,
  type SideUtxo,
  type TokenUtxo,
  voidDeadline,
} from "@joge/contracts";
import { CHANNEL, type Database, keeperJobs, listen, type Network, rounds, wantedLanes } from "@joge/db";
import { decodeLane, type FeedId, feedsOf, LANE_BUDGET, MAX_SWEEP_BATCH, nextSlot, readLe } from "@joge/sdk";
import { and, asc, eq, inArray, isNotNull, lt, lte } from "drizzle-orm";
import { broadcast, chainProvider, type Fulcrum, type ListedUtxo, utxosAt } from "../chain/electrum.ts";
import { KEEPER_LEASE_MS, KEEPER_TICK_MS, KEEPER_TIMEOUT_LEASE_MS, OPEN_COIN_EXTRA } from "../constants.ts";
import { errorText, logger } from "../log.ts";
import { beat, MS, nowSeconds, sleep } from "../runtime.ts";
import { boundaryPair, bySequence, latest } from "./proofs.ts";
import type { KeeperWallet } from "./wallet.ts";

const log = logger("keeper");
const OPEN_COIN = LANE_BUDGET + OPEN_COIN_EXTRA;
const ROUND_ID_OFFSET = 1;
const ROUND_ID_BYTES = 4;
/** Errors that mean someone else already did this step (every lifecycle transaction is the same bytes for everyone). */
const ALREADY_DONE = /already|txn-mempool-conflict|missing inputs|missingorspent|bad-txns-inputs-missingorspent/i;

const roundIdOfCoin = (utxo: ListedUtxo): number | undefined =>
  utxo.token?.nft ? Number(readLe(hexToBin(utxo.token.nft.commitment), ROUND_ID_OFFSET, ROUND_ID_BYTES)) : undefined;

type Built = { hex: string; onSent?: () => void; onFailed?: () => void };

/**
 * The keeper: keeps every lane's next round open and moves every round through lock → settle → sweep as soon as the
 * oracle has signed what each step needs. Each step is built from live chain reads and signed oracle messages only, and
 * is the same bytes whoever builds it, so a visitor's browser can do any of it too; nothing here is trusted.
 */
export class Keeper {
  readonly #round;
  readonly #dollar;
  readonly #opening;
  #coins = new Map<string, Promise<ListedUtxo[]>>();
  #wake: (() => void) | undefined;

  private readonly database: Database;
  private readonly fulcrum: Fulcrum;
  private readonly network: Network;
  private readonly deployment: Deployment;
  private readonly wallet: KeeperWallet | undefined;
  private readonly laneThreads: Set<number> | "all";
  /** Lanes outside `laneThreads` open while a viewer wants them (KEEPER_DEMAND=on). */
  private readonly demand: boolean;

  constructor(
    database: Database,
    fulcrum: Fulcrum,
    network: Network,
    deployment: Deployment,
    wallet: KeeperWallet | undefined,
    laneThreads: Set<number> | "all",
    demand = false,
  ) {
    this.database = database;
    this.fulcrum = fulcrum;
    this.network = network;
    this.deployment = deployment;
    this.wallet = wallet;
    this.laneThreads = laneThreads;
    this.demand = demand;
    const provider = chainProvider(fulcrum, network);
    this.#round = roundContracts({
      category: deployment.category,
      provider,
      protocolLockingBytecode: deployment.protocolLockingBytecode,
    });
    this.#dollar = dollarContracts(this.#round, {
      dollarCategory: deployment.dollarCategory,
      provider,
      protocolLockingBytecode: deployment.protocolLockingBytecode,
    });
    this.#opening = openingContracts(this.#round, provider, deployment.protocolLockingBytecode, this.#dollar);
  }

  /**
   * A dollar event's sidecars: dollar-token coins at the sidecar contract made by one of `txids` (each sidecar is
   * re-made in the same transaction as its gate or master, so it shares that coin's transaction).
   */
  private async sidesOf(txids: string[]) {
    const all = await utxosAt(this.fulcrum, this.deployment.lockingBytecode.dollarSide);
    return all.filter(
      (coin) => coin.token?.category === this.deployment.dollarCategory && !coin.token.nft && txids.includes(coin.txid),
    ) as unknown as SideUtxo[];
  }

  async run(signal: AbortSignal) {
    const poke = () => this.#wake?.();
    const stops = await Promise.all([
      listen(this.database.sql, CHANNEL.round, poke),
      listen(this.database.sql, CHANNEL.oracle, poke),
    ]);
    if (this.wallet) log.info("funding", { address: this.wallet.address, sats: await this.wallet.balance() });
    else log.warn("no KEEPER_WIF: lanes will not be opened by this engine");
    while (!signal.aborted) {
      try {
        await this.tick();
      } catch (error) {
        log.warn("tick failed", { error: errorText(error) });
      }
      await Promise.race([
        sleep(KEEPER_TICK_MS, signal),
        new Promise<void>((resolve) => {
          this.#wake = resolve;
        }),
      ]);
      this.#wake = undefined;
    }
    for (const stop of stops) await stop.unlisten();
  }

  async tick() {
    this.#coins = new Map();
    const now = nowSeconds();
    await this.lockDue(now);
    await this.settleDue(now);
    await this.sweepDue();
    if (this.wallet) await this.openLanes(now, this.wallet);
    // The wallet's balance rides on the heartbeat: /status shows how long the keeper can keep opening lanes.
    const balance = this.wallet ? Number(await this.wallet.balance().catch(() => -1n)) : null;
    await beat(this.database, `keeper:${this.network}`, { at: now, balance });
  }

  /** Live coins at one covenant, read once per tick. */
  private coinsAt(lockingBytecode: string) {
    let coins = this.#coins.get(lockingBytecode);
    if (!coins) {
      coins = utxosAt(this.fulcrum, lockingBytecode).then((all) =>
        all.filter((coin) => coin.token?.category === this.deployment.category),
      );
      this.#coins.set(lockingBytecode, coins);
    }
    return coins;
  }

  private async liveOf(lockingBytecode: string, roundId: number) {
    return (await this.coinsAt(lockingBytecode)).filter((coin) => roundIdOfCoin(coin) === roundId) as Array<
      ListedUtxo & TokenUtxo
    >;
  }

  /** Claims a step (one engine, one attempt per lease), broadcasts it, and records the outcome. */
  private async attempt(
    key: string,
    kind: string,
    roundId: number | null,
    build: () => Built | Promise<Built>,
    leaseMs = KEEPER_LEASE_MS,
  ) {
    const network = this.network;
    const leaseUntil = new Date(Date.now() + leaseMs);
    const claimed = await this.database.db
      .insert(keeperJobs)
      .values({ network, key, kind, roundId, status: "running", attempts: 1, leaseUntil })
      .onConflictDoUpdate({
        target: [keeperJobs.network, keeperJobs.key],
        set: { status: "running", leaseUntil, error: null },
        setWhere: lt(keeperJobs.leaseUntil, new Date()),
      })
      .returning({ key: keeperJobs.key });
    if (claimed.length === 0) return;
    const where = and(eq(keeperJobs.network, network), eq(keeperJobs.key, key));
    let built: Built | undefined;
    try {
      built = await build();
      const txid = await broadcast(this.fulcrum, built.hex);
      built.onSent?.();
      await this.database.db.update(keeperJobs).set({ status: "sent", txid }).where(where);
      log.info(kind, { round: roundId ?? undefined, txid });
    } catch (error) {
      built?.onFailed?.();
      const text = errorText(error);
      await this.database.db.update(keeperJobs).set({ status: "failed", error: text }).where(where);
      if (ALREADY_DONE.test(text)) log.info(`${kind} already done`, { round: roundId ?? undefined });
      else log.warn(`${kind} failed`, { round: roundId ?? undefined, error: text });
    }
  }

  private due(state: "open" | "locked", time: typeof rounds.lockTime | typeof rounds.closeTime, now: number) {
    return this.database.db
      .select()
      .from(rounds)
      .where(and(eq(rounds.network, this.network), eq(rounds.state, state), lte(time, now)))
      .orderBy(asc(time));
  }

  private async lockDue(now: number) {
    const { db } = this.database;
    for (const round of await this.due("open", rounds.lockTime, now)) {
      const dollar = round.stakeClass === "dollar";
      const { lockingBytecode } = this.deployment;
      const [master] = await this.liveOf(
        dollar ? lockingBytecode.dollarMasterOpen : lockingBytecode.masterOpen,
        round.roundId,
      );
      if (!master) continue;
      const gates = dollar
        ? await this.liveOf(lockingBytecode.dollarGate, round.roundId)
        : [
            ...(await this.liveOf(lockingBytecode.gate, round.roundId)),
            ...(await this.liveOf(lockingBytecode.eventGate, round.roundId)),
          ];
      if (gates.length !== round.gates) continue;
      const sides = dollar ? await this.sidesOf([master.txid, ...gates.map((gate) => gate.txid)]) : [];
      if (dollar && sides.length !== round.gates) continue;
      const [main, xau] = feedsOf(round.asset) as [FeedId, FeedId | undefined];
      const proof = await boundaryPair(db, main, round.lockTime);
      const xauProof = xau ? await boundaryPair(db, xau, round.lockTime) : undefined;
      const contracts = this.#round;
      const dollarContracts_ = this.#dollar;
      if (proof && (!xau || xauProof)) {
        const gold = xauProof ? { xauProof } : {};
        await this.attempt(`lock:${round.roundId}`, "lock", round.roundId, () => ({
          hex: dollar
            ? buildDollarLock({ contracts, dollar: dollarContracts_, master, gates, sides, proof, ...gold }).build()
            : buildLock({ contracts, master, gates, proof, ...gold }).build(),
        }));
      } else if (now > voidDeadline(round.closeTime)) {
        await this.attempt(
          `lock-timeout:${round.roundId}`,
          "lock-timeout",
          round.roundId,
          () => ({
            hex: dollar
              ? buildDollarLockTimeout({ contracts, dollar: dollarContracts_, master, gates, sides }).build()
              : buildLockTimeout({ contracts, master, gates }).build(),
          }),
          KEEPER_TIMEOUT_LEASE_MS,
        );
      }
    }
  }

  private async settleDue(now: number) {
    const { db } = this.database;
    for (const round of await this.due("locked", rounds.closeTime, now)) {
      const dollar = round.stakeClass === "dollar";
      const { lockingBytecode } = this.deployment;
      const [master] = await this.liveOf(
        dollar ? lockingBytecode.dollarMasterLocked : lockingBytecode.masterLocked,
        round.roundId,
      );
      if (!master || round.lockSequence === null) continue;
      const [side] = dollar ? await this.sidesOf([master.txid]) : [];
      if (dollar && !side) continue;
      const [main, xau] = feedsOf(round.asset) as [FeedId, FeedId | undefined];
      const strike = await bySequence(db, main, round.lockSequence + 1);
      const close = await boundaryPair(db, main, round.closeTime);
      const xauStrike = xau && round.xauLockSequence ? await bySequence(db, xau, round.xauLockSequence + 1) : undefined;
      const xauClose = xau ? await boundaryPair(db, xau, round.closeTime) : undefined;
      const contracts = this.#round;
      const protocolLockingBytecode = this.deployment.protocolLockingBytecode;
      if (strike && close && (!xau || (xauStrike && xauClose))) {
        const gold = xauStrike && xauClose ? { xau: { strike: xauStrike, close: xauClose } } : {};
        const settle = { contracts, master, strike, close, protocolLockingBytecode, ...gold };
        await this.attempt(`settle:${round.roundId}`, "settle", round.roundId, () => ({
          hex:
            dollar && side
              ? buildDollarSettle({ ...settle, dollar: this.#dollar, side }).builder.build()
              : buildSettle(settle).builder.build(),
        }));
      } else if (now > voidDeadline(round.closeTime)) {
        await this.attempt(
          `settle-timeout:${round.roundId}`,
          "settle-timeout",
          round.roundId,
          () => ({
            hex:
              dollar && side
                ? buildDollarSettleTimeout({ contracts, dollar: this.#dollar, master, side }).build()
                : buildSettleTimeout({ contracts, master }).build(),
          }),
          KEEPER_TIMEOUT_LEASE_MS,
        );
      }
    }
  }

  private async sweepDue() {
    const done = await this.database.db
      .select()
      .from(rounds)
      .where(
        and(
          eq(rounds.network, this.network),
          inArray(rounds.state, ["settled", "void"]),
          isNotNull(rounds.masterOutpoint),
        ),
      )
      .orderBy(asc(rounds.closeTime));
    for (const round of done) {
      const dollar = round.stakeClass === "dollar";
      const { lockingBytecode } = this.deployment;
      const [master] = await this.liveOf(
        dollar ? lockingBytecode.dollarMasterSweep : lockingBytecode.masterSweep,
        round.roundId,
      );
      if (!master) continue;
      const [side] = dollar ? await this.sidesOf([master.txid]) : [];
      if (dollar && !side) continue;
      const tickets = (await this.liveOf(this.deployment.lockingBytecode.ticket, round.roundId))
        .sort((a, b) => (a.txid === b.txid ? a.vout - b.vout : a.txid < b.txid ? -1 : 1))
        .slice(0, MAX_SWEEP_BATCH);
      const contracts = this.#round;
      await this.attempt(`sweep:${round.roundId}:${master.txid}:${master.vout}`, "sweep", round.roundId, () => ({
        hex:
          dollar && side
            ? buildDollarSweep({ contracts, dollar: this.#dollar, master, side, tickets }).builder.build()
            : buildSweep({ contracts, master, tickets }).builder.build(),
      }));
    }
  }

  /**
   * Keeps one round taking entries on every lane it runs: when a lane's latest round locks, its next one opens. With
   * demand on, a lane outside the always-open set runs too while someone has woken it (an empty round costs its
   * opener about 4,600 sats in fees, so idle lanes sleep).
   */
  private async openLanes(now: number, wallet: KeeperWallet) {
    const clock = await latest(this.database.db, "USD/BCH");
    if (!clock) return;
    const lanes = (await this.coinsAt(this.deployment.lockingBytecode.laneThread)) as Array<ListedUtxo & TokenUtxo>;
    const wanted = this.demand ? await wantedLanes(this.database.db, this.network, new Date(now * MS)) : new Set();
    for (const lane of lanes) {
      const state = decodeLane(lane.token.nft.commitment);
      const always = this.laneThreads === "all" || this.laneThreads.has(state.thread);
      if (!always && !wanted.has(state.thread)) continue;
      if (state.counter > 0 && state.nextLock - state.seconds > now) continue;
      const slot = nextSlot(state, now);
      const round = this.#round;
      const opening = this.#opening;
      await this.attempt(`open:${state.thread}:${slot}`, "lane-open", null, async () => {
        const funding = await wallet.coins(OPEN_COIN);
        if (!funding) throw new Error(`the keeper wallet ${wallet.address} has too little for a lane opening`);
        try {
          const hex = buildLaneOpen({
            round,
            opening,
            lane,
            slot,
            openerPkh: wallet.pkh,
            clock,
            funding,
            change: wallet.address,
          }).builder.build();
          const forget = () => {
            for (const coin of funding) wallet.forget(coin);
          };
          return { hex, onSent: () => wallet.track(hex), onFailed: forget };
        } catch (error) {
          for (const coin of funding) wallet.release(coin);
          throw error;
        }
      });
    }
  }
}
