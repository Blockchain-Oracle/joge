import {
  BPS,
  EVENT_EXIT_FEE_BPS,
  EVENT_LOCK_FEE_PER_GATE,
  GATE_DUST,
  LOCK_FEE_BASE,
  LOCK_FEE_PER_GATE,
  MAX_CREATOR_FEE_BPS,
  MIN_FEE_OUTPUT,
  PROTOCOL_FEE_BPS,
  SETTLE_FEE,
  type StakeClass,
  SWEEP_FEE_BASE,
  SWEEP_FEE_PER_TICKET,
} from "./constants.ts";
import type { LockedRound, SweepRound, TicketState } from "./layout.ts";

/**
 * Mirrors MasterOpen's closeGates: a round is void at lock with stakes on fewer than two outcomes or below minimums.
 * `pot` is what the gates hold beyond their creation dust (stakes plus any event exit fees).
 */
export function voidAtLock(
  totals: bigint[],
  pot: bigint,
  entrants: number,
  minPot: bigint,
  minEntrants: number,
): boolean {
  return totals.filter((total) => total > 0n).length < 2 || pot < minPot || entrants < minEntrants;
}

/** Mirrors closeGates: the pot is the gates' value beyond their creation dust. */
export const potFromGates = (gateValues: bigint[]): bigint =>
  gateValues.reduce((sum, value) => sum + value - GATE_DUST, 0n);

/** Mirrors EventGate.exit: what an event entrant leaving before the lock gets back, and what stays behind. */
export function exitSplit(stake: bigint, ticketValue: bigint) {
  const fee = (stake * EVENT_EXIT_FEE_BPS) / BPS;
  return { fee, refund: stake - fee + ticketValue };
}

/** Mirrors MasterOpen's closeGates: a fixed fee per merged gate, higher for event gates. */
export const lockFee = (gates: number, stakeClass: StakeClass = "short"): bigint =>
  LOCK_FEE_BASE + (stakeClass === "event" ? EVENT_LOCK_FEE_PER_GATE : LOCK_FEE_PER_GATE) * BigInt(gates);

/** Mirrors MasterLocked's payOut: the winning outcome, or null for a tie or frozen feed. */
export function winningOutcome(
  round: Pick<LockedRound, "mode" | "boundaries">,
  strike: bigint,
  close: bigint,
): number | null {
  if (close === strike) return null;
  if (round.mode === "updown") return close > strike ? 0 : 1;
  return round.boundaries.filter((boundary) => close >= BigInt(boundary)).length;
}

export interface Settlement {
  winner: number | null;
  winnerTotal: bigint;
  protocolFee: bigint;
  creatorFee: bigint;
  /** The pot after the fees actually paid. */
  pot: bigint;
}

const paidFee = (pot: bigint, bps: bigint): bigint => {
  const fee = (pot * bps) / BPS;
  return fee < MIN_FEE_OUTPUT ? 0n : fee;
};

/** Mirrors writeSettlement: fees only on a decided round and only when at least MIN_FEE_OUTPUT each. */
export function settle(round: LockedRound, strike: bigint, close: bigint): Settlement {
  if (BigInt(round.creatorFeeBps) > MAX_CREATOR_FEE_BPS) throw new RangeError("creator fee above the cap");
  const winner = winningOutcome(round, strike, close);
  const winnerTotal = winner === null ? 0n : (round.totals[winner] ?? 0n);
  if (winnerTotal === 0n) return { winner: null, winnerTotal: 0n, protocolFee: 0n, creatorFee: 0n, pot: 0n };
  const protocolFee = paidFee(round.pot, PROTOCOL_FEE_BPS);
  const creatorFee = paidFee(round.pot, BigInt(round.creatorFeeBps));
  return { winner, winnerTotal, protocolFee, creatorFee, pot: round.pot - protocolFee - creatorFee };
}

export const settleFee = (): bigint => SETTLE_FEE;

/** Mirrors MasterSweep: what output i pays the owner of the ticket at input i. */
export function ticketPayout(round: SweepRound, ticket: TicketState, ticketValue: bigint): bigint {
  let share = 0n;
  if (round.state === "void") share = ticket.stake;
  else if (ticket.outcome === round.winner) share = (ticket.stake * round.pot) / round.winnerTotal;
  return share + ticketValue - SWEEP_FEE_PER_TICKET;
}

/** Mirrors MasterSweep: the master's value after a batch (or what its creator gets back after the last ticket). */
export function masterAfterSweep(masterValue: bigint, ticketValues: bigint[], payouts: bigint[]): bigint {
  const tickets = BigInt(ticketValues.length);
  const ticketsIn = ticketValues.reduce((sum, value) => sum + value, 0n);
  const paid = payouts.reduce((sum, value) => sum + value, 0n);
  return masterValue + ticketsIn - paid - SWEEP_FEE_BASE - tickets * SWEEP_FEE_PER_TICKET;
}
