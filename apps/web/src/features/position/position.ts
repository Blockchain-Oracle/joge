import type { RoundCard } from "@joge/db";
import { BPS, MIN_FEE_OUTPUT, PROTOCOL_FEE_BPS, SWEEP_FEE_PER_TICKET, TICKET_DUST, toDollars } from "@joge/sdk";
import { estimatePayout } from "../ticket/payout.ts";

/** Your stake on one side of one round, in satoshis. */
export interface Holding {
  side: 0 | 1;
  stake: number;
  /** What came back once the round is decided, when the chain says (the round page knows; the terminal estimates). */
  paid?: number | null;
}

/** Where your call stands, in the words a player needs (his feedback: "am I winning or losing right now?"). */
export type PositionStatus =
  /** Taking entries. `alone`: nobody is on the other side yet, so it refunds unless someone joins. */
  | { kind: "open"; alone: boolean }
  /** Locked; the line to beat is the oracle's next signed price, a minute away at most. */
  | { kind: "starting" }
  /** Running against the line: `gap` is the price now minus the line (dollars). */
  | { kind: "live"; gap: number; winning: boolean | null }
  | { kind: "won" }
  | { kind: "lost" }
  | { kind: "refunded" };

export interface Position {
  roundId: number;
  side: 0 | 1;
  stake: number;
  /** What it pays if your side wins (sats), or what came back once decided. */
  pays: number;
  status: PositionStatus;
  /** The next moment that matters (seconds): entries close while open, the close while running. */
  endsAt: number | null;
}

/** Fees the settle takes from a pot (a fee under the dust floor stays in the pot). */
function fees(round: RoundCard, pot: bigint) {
  const protocol = (pot * PROTOCOL_FEE_BPS) / BPS;
  const creator = (pot * BigInt(round.creatorFeeBps)) / BPS;
  return (protocol >= MIN_FEE_OUTPUT ? protocol : 0n) + (creator >= MIN_FEE_OUTPUT ? creator : 0n);
}

/**
 * What a stake pays if its side wins at today's pot. A stake the indexer has already counted is part of the side's
 * total; one it has not seen yet (just sent) is added the way the ticket sheet estimates it.
 */
export function paysIfRight(round: RoundCard, side: 0 | 1, stake: number) {
  const sideTotal = BigInt(round.totals[side] ?? 0);
  if (sideTotal < BigInt(stake)) return Number(estimatePayout(round, side, BigInt(stake)).pays);
  const pot = BigInt(round.pot);
  return Number((BigInt(stake) * (pot - fees(round, pot))) / sideTotal + TICKET_DUST - SWEEP_FEE_PER_TICKET);
}

/** Where a holding stands right now, from the round, the live price and the clock (seconds). */
export function positionOf(round: RoundCard, holding: Holding, priceNow: number | null, now: number): Position {
  const { side, stake } = holding;
  const base = { roundId: round.roundId, side, stake };
  const decided = round.state === "settled" || round.state === "void";
  if (decided) {
    const status: PositionStatus =
      round.state === "void" ? { kind: "refunded" } : round.winner === side ? { kind: "won" } : { kind: "lost" };
    const estimate = status.kind === "won" ? paysIfRight(round, side, stake) : status.kind === "refunded" ? stake : 0;
    return { ...base, status, pays: holding.paid ?? estimate, endsAt: null };
  }
  const pays = paysIfRight(round, side, stake);
  if (round.state === "open" && round.lockTime > now) {
    const other = round.totals[side === 0 ? 1 : 0] ?? 0;
    return { ...base, pays, status: { kind: "open", alone: other === 0 }, endsAt: round.lockTime };
  }
  const strike = round.liveStrike === null ? null : toDollars(round.asset, round.liveStrike);
  if (strike === null || priceNow === null)
    return { ...base, pays, status: { kind: "starting" }, endsAt: round.closeTime };
  const gap = priceNow - strike;
  const winning = gap === 0 ? null : side === 0 ? gap > 0 : gap < 0;
  return { ...base, pays, status: { kind: "live", gap, winning }, endsAt: round.closeTime };
}
