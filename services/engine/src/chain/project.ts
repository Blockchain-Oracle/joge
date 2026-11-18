import { binToHex } from "@bitauth/libauth";
import {
  type Db,
  type GateContract,
  gates,
  type Network,
  oracleMessages,
  type RoundState,
  rounds,
  type TicketStatus,
  type TxKind,
  tickets,
  type VoidReason,
} from "@joge/db";
import {
  decodeGate,
  decodeLocked,
  decodeOpen,
  decodeSweep,
  decodeTicket,
  type FeedId,
  feedsOf,
  GATE_DUST,
  GOLD_FACTOR,
  LANES,
  SIDE_SEED,
  titleFromOutput,
} from "@joge/sdk";
import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { type DecodedOutput, type DecodedTx, outpointOf } from "./decode.ts";

type Query = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Round = typeof rounds.$inferSelect;

export interface Applied {
  kind: TxKind;
  roundId: number | null;
  state?: RoundState;
}

const THREAD_MASK = 0xff;
const GATE_DUST_SATS = Number(GATE_DUST);
const SIDE_SEED_UNITS = Number(SIDE_SEED);
/** Every gate contract; dollar events' gates keep their stakes in a sidecar (output 1 of their transactions). */
const GATE_CONTRACTS = ["gate", "eventGate", "dollarGate"] as const;
const numbers = (values: bigint[]) => values.map(Number);
const laneSecondsOf = (thread: number) => LANES.find((lane) => lane.thread === thread)?.seconds ?? null;

const outputsAt = (tx: DecodedTx, ...names: DecodedOutput["contract"][]) =>
  tx.outputs.filter((output) => output.contract && names.includes(output.contract));

/** Re-sums a round's live totals, entrants and pot from its gates (while it takes entries). */
async function refreshRoundFromGates(q: Query, network: Network, roundId: number) {
  const rows = await q
    .select()
    .from(gates)
    .where(and(eq(gates.network, network), eq(gates.roundId, roundId)));
  const width = Math.max(0, ...rows.map((gate) => gate.totals.length));
  const totals = Array.from({ length: width }, (_, index) =>
    rows.reduce((sum, gate) => sum + (gate.totals[index] ?? 0), 0),
  );
  await q
    .update(rounds)
    .set({
      totals,
      entrants: rows.reduce((sum, gate) => sum + gate.entrants, 0),
      // A dollar event's pot is what its sidecars hold beyond their seeds (cents); otherwise the gates' satoshis.
      pot: rows.reduce(
        (sum, gate) => sum + (gate.dollars === null ? gate.value - GATE_DUST_SATS : gate.dollars - SIDE_SEED_UNITS),
        0,
      ),
      stakeClass: rows[0]?.stakeClass ?? null,
    })
    .where(and(eq(rounds.network, network), eq(rounds.roundId, roundId)));
}

async function upsertGate(q: Query, network: Network, tx: DecodedTx, output: DecodedOutput, sideDollars?: number) {
  const state = decodeGate(output.commitment ?? "");
  const contract: GateContract =
    output.contract === "eventGate" || output.contract === "dollarGate" ? output.contract : "gate";
  const values = {
    contract,
    dollars: contract === "dollarGate" ? (sideDollars ?? null) : null,
    stakeClass: state.stakeClass,
    entrants: state.entrants,
    totals: numbers(state.totals),
    value: output.value,
    outpoint: outpointOf(tx.txid, output.vout),
  };
  await q
    .insert(gates)
    .values({ network, roundId: state.roundId, gateIndex: state.gateIndex, ...values })
    .onConflictDoUpdate({ target: [gates.network, gates.roundId, gates.gateIndex], set: values });
  return state.roundId;
}

/** The price a settle used: message S + 1 (the strike) and the first message at or after T_close (the close). */
async function settledPrices(q: Query, round: Round) {
  const priceOf = async (feed: FeedId, query: "strike" | "close") => {
    const sequence = feed === "XAU/BCH" ? round.xauLockSequence : round.lockSequence;
    const [row] = await q
      .select({ price: oracleMessages.price })
      .from(oracleMessages)
      .where(
        query === "strike"
          ? and(eq(oracleMessages.feed, feed), eq(oracleMessages.dataSequence, (sequence ?? 0) + 1))
          : and(eq(oracleMessages.feed, feed), gte(oracleMessages.timestamp, round.closeTime)),
      )
      .orderBy(asc(oracleMessages.dataSequence))
      .limit(1);
    return row?.price;
  };
  const combine = async (query: "strike" | "close") => {
    const [main, xau] = feedsOf(round.asset);
    const price = main ? await priceOf(main, query) : undefined;
    if (price === undefined || !xau) return price ?? null;
    const xauPrice = await priceOf(xau, query);
    return xauPrice ? Math.floor((price * GOLD_FACTOR) / xauPrice) : null;
  };
  return { strikePrice: await combine("strike"), closePrice: await combine("close") };
}

function lockVoidReason(round: Round, locktime: number): VoidReason {
  if (locktime > 0) return "lock-timeout";
  if (round.entrants === 0) return "no-entries";
  if (round.totals.filter((total) => total > 0).length < 2) return "one-sided";
  return "below-minimum";
}

async function applyOpen(q: Query, network: Network, tx: DecodedTx, master: DecodedOutput): Promise<Applied> {
  const open = decodeOpen(master.commitment ?? "");
  const thread = open.roundId & THREAD_MASK;
  await q
    .insert(rounds)
    .values({
      network,
      roundId: open.roundId,
      thread,
      laneSeconds: laneSecondsOf(thread),
      title:
        tx.outputs.map((output) => titleFromOutput(output.lockingBytecode)).find((title) => title !== null) ?? null,
      asset: open.asset,
      mode: open.mode,
      outcomes: open.outcomes,
      gates: open.gates,
      lockTime: open.lockTime,
      closeTime: open.closeTime,
      creatorFeeBps: open.creatorFeeBps,
      creatorPkh: binToHex(open.creatorPkh),
      minPot: Number(open.minPot),
      minEntrants: open.minEntrants,
      boundaries: open.boundaries,
      state: "open",
      totals: Array.from({ length: open.outcomes }, () => 0),
      masterOutpoint: outpointOf(tx.txid, master.vout),
      masterValue: master.value,
      openTxid: tx.txid,
    })
    .onConflictDoNothing();
  // A dollar event's sidecars are made beside its gates, each seeded: every gate starts with one seed.
  const seed = outputsAt(tx, "dollarSide")[0]?.dollars;
  for (const output of outputsAt(tx, ...GATE_CONTRACTS)) await upsertGate(q, network, tx, output, seed);
  await refreshRoundFromGates(q, network, open.roundId);
  return {
    kind: outputsAt(tx, "laneThread").length > 0 ? "lane-open" : "create",
    roundId: open.roundId,
    state: "open",
  };
}

async function applyLock(q: Query, network: Network, tx: DecodedTx, round: Round): Promise<Applied> {
  const kind: TxKind = tx.locktime > 0 ? "lock-timeout" : "lock";
  const where = and(eq(rounds.network, network), eq(rounds.roundId, round.roundId));
  await q
    .update(gates)
    .set({ outpoint: null })
    .where(and(eq(gates.network, network), eq(gates.roundId, round.roundId)));
  const [locked] = outputsAt(tx, "masterLocked", "dollarMasterLocked");
  if (locked) {
    const record = decodeLocked(locked.commitment ?? "");
    await q
      .update(rounds)
      .set({
        state: "locked",
        lockSequence: record.lockSequence,
        xauLockSequence: record.xauLockSequence || null,
        pot: Number(record.pot),
        entrants: record.entrants,
        totals: numbers(record.totals),
        masterOutpoint: outpointOf(tx.txid, locked.vout),
        masterValue: locked.value,
        lockTxid: tx.txid,
      })
      .where(where);
    return { kind, roundId: round.roundId, state: "locked" };
  }
  const [voided] = outputsAt(tx, "masterSweep", "dollarMasterSweep");
  const record = decodeSweep(voided?.commitment ?? "");
  await q
    .update(rounds)
    .set({
      state: "void",
      voidReason: lockVoidReason(round, tx.locktime),
      netPot: 0,
      winnerTotal: 0,
      remaining: record.remaining,
      masterOutpoint: voided ? outpointOf(tx.txid, voided.vout) : null,
      masterValue: voided?.value ?? null,
      lockTxid: tx.txid,
    })
    .where(where);
  return { kind, roundId: round.roundId, state: "void" };
}

async function applySettle(q: Query, network: Network, tx: DecodedTx, round: Round): Promise<Applied> {
  const [swept] = outputsAt(tx, "masterSweep", "dollarMasterSweep");
  const record = decodeSweep(swept?.commitment ?? "");
  const prices = await settledPrices(q, round);
  const state: RoundState = record.state === "void" ? "void" : "settled";
  let voidReason: VoidReason | null = null;
  if (state === "void") {
    if (tx.locktime > 0) voidReason = "settle-timeout";
    else voidReason = prices.strikePrice === prices.closePrice ? "tie" : "no-winner";
  }
  await q
    .update(rounds)
    .set({
      state,
      voidReason,
      winner: record.winner,
      netPot: Number(record.pot),
      winnerTotal: Number(record.winnerTotal),
      remaining: record.remaining,
      ...prices,
      masterOutpoint: swept ? outpointOf(tx.txid, swept.vout) : null,
      masterValue: swept?.value ?? null,
      settleTxid: tx.txid,
    })
    .where(and(eq(rounds.network, network), eq(rounds.roundId, round.roundId)));
  return { kind: tx.locktime > 0 ? "settle-timeout" : "settle", roundId: round.roundId, state };
}

/**
 * A sweep spends the master (input 0) and tickets and pays ticket i at output i (a dollar sweep's input 1 is the pot
 * sidecar). A dollar event's payout is recorded in cents (`payoutSats` then holds dollar-token units).
 */
async function applySweep(q: Query, network: Network, tx: DecodedTx, round: Round): Promise<Applied> {
  const dollar = round.stakeClass === "dollar";
  for (const [index, outpoint] of tx.inputs.entries()) {
    if (index === 0) continue;
    const [ticket] = await q
      .select()
      .from(tickets)
      .where(and(eq(tickets.network, network), eq(tickets.outpoint, outpoint)));
    if (!ticket) continue;
    let status: TicketStatus = "lost";
    if (round.state === "void") status = "refunded";
    else if (round.winner === ticket.outcome) status = "won";
    await q
      .update(tickets)
      .set({
        status,
        payoutTxid: tx.txid,
        payoutSats: dollar ? (tx.outputs[index]?.dollars ?? 0) : (tx.outputs[index]?.value ?? 0),
      })
      .where(and(eq(tickets.network, network), eq(tickets.outpoint, outpoint)));
  }
  const [next] = outputsAt(tx, "masterSweep", "dollarMasterSweep");
  await q
    .update(rounds)
    .set(
      next
        ? {
            remaining: decodeSweep(next.commitment ?? "").remaining,
            masterOutpoint: outpointOf(tx.txid, next.vout),
            masterValue: next.value,
          }
        : { remaining: 0, masterOutpoint: null, masterValue: null, finalTxid: tx.txid },
    )
    .where(and(eq(rounds.network, network), eq(rounds.roundId, round.roundId)));
  return { kind: "sweep", roundId: round.roundId, state: round.state };
}

async function applyEntry(q: Query, network: Network, tx: DecodedTx, spentTickets: string[]): Promise<Applied> {
  let roundId: number | null = null;
  const side = outputsAt(tx, "dollarSide")[0]?.dollars;
  const dollarGate = outputsAt(tx, "dollarGate").length > 0;
  for (const output of outputsAt(tx, ...GATE_CONTRACTS)) roundId = await upsertGate(q, network, tx, output, side);
  for (const output of outputsAt(tx, "ticket")) {
    const ticket = decodeTicket(output.commitment ?? "");
    roundId = ticket.roundId;
    await q
      .insert(tickets)
      .values({
        network,
        outpoint: outpointOf(tx.txid, output.vout),
        roundId: ticket.roundId,
        gateIndex: ticket.gateIndex,
        outcome: ticket.outcome,
        stake: Number(ticket.stake),
        payoutPkh: binToHex(ticket.payoutPkh),
        value: output.value,
        enterTxid: tx.txid,
        status: "live",
      })
      .onConflictDoNothing();
  }
  // An event exit refunds the ticket's owner at output 1 (satoshis), or at output 2 in dollars (cents).
  for (const outpoint of spentTickets) {
    const payoutSats = dollarGate ? (tx.outputs[2]?.dollars ?? 0) : (tx.outputs[1]?.value ?? 0);
    await q
      .update(tickets)
      .set({ status: "exited", payoutTxid: tx.txid, payoutSats })
      .where(and(eq(tickets.network, network), eq(tickets.outpoint, outpoint)));
  }
  if (roundId !== null) await refreshRoundFromGates(q, network, roundId);
  return { kind: spentTickets.length > 0 ? "exit" : "enter", roundId, state: "open" };
}

/**
 * Applies one category-K transaction to the read model. What it was is decided by what it spent: an open master is
 * a lock, a locked master a settle, a settled master a sweep, a gate an entry or exit; a new master is an opening.
 */
export async function applyTransaction(q: Query, network: Network, tx: DecodedTx): Promise<Applied> {
  const [master] = await q
    .select()
    .from(rounds)
    .where(and(eq(rounds.network, network), inArray(rounds.masterOutpoint, tx.inputs)));
  const spentGates = await q
    .select({ roundId: gates.roundId })
    .from(gates)
    .where(and(eq(gates.network, network), inArray(gates.outpoint, tx.inputs)));
  const spentTickets = await q
    .select({ outpoint: tickets.outpoint })
    .from(tickets)
    .where(and(eq(tickets.network, network), inArray(tickets.outpoint, tx.inputs)));
  const [opened] = outputsAt(tx, "masterOpen", "dollarMasterOpen");

  if (opened) return applyOpen(q, network, tx, opened);
  if (master?.state === "open") return applyLock(q, network, tx, master);
  if (master?.state === "locked") return applySettle(q, network, tx, master);
  if (master) return applySweep(q, network, tx, master);
  if (spentGates.length > 0) {
    return applyEntry(
      q,
      network,
      tx,
      spentTickets.map((ticket) => ticket.outpoint),
    );
  }
  const minted = tx.outputs.some((output) => output.contract === "laneThread" || output.contract === "factory");
  return { kind: minted ? "genesis" : "other", roundId: null };
}
