import type { RoundCard } from "@joge/db";
import { BPS, MIN_DOLLAR_FEE, MIN_FEE_OUTPUT, PROTOCOL_FEE_BPS, SWEEP_FEE_PER_TICKET, TICKET_DUST } from "@joge/sdk";

const PERCENT = 100;
const DIGITS = 1;

/**
 * What a ticket pays if its side wins, at today's pot: its share of the pot after fees (a fee under 1,000 sats stays
 * in the pot), plus its own ticket dust back minus its share of the payout transaction. Estimated: later entries move it.
 */
export function estimatePayout(round: RoundCard, outcome: number, stake: bigint) {
  const pot = BigInt(round.pot) + stake;
  const side = BigInt(round.totals[outcome] ?? 0) + stake;
  const protocol = (pot * PROTOCOL_FEE_BPS) / BPS;
  const creator = (pot * BigInt(round.creatorFeeBps)) / BPS;
  const fees = (protocol >= MIN_FEE_OUTPUT ? protocol : 0n) + (creator >= MIN_FEE_OUTPUT ? creator : 0n);
  const pays = (stake * (pot - fees)) / side + TICKET_DUST - SWEEP_FEE_PER_TICKET;
  const share = `${((Number(stake) / Number(side)) * PERCENT).toFixed(DIGITS)}%`;
  return { pays, share };
}

/** What a dollar-event ticket pays if its call wins, at today's pot, in cents (fees from one cent; no dust in dollars). */
export function estimateDollarPayout(round: RoundCard, outcome: number, stake: bigint) {
  const pot = BigInt(round.pot) + stake;
  const side = BigInt(round.totals[outcome] ?? 0) + stake;
  const fee = (bps: bigint) => {
    const amount = (pot * bps) / BPS;
    return amount < MIN_DOLLAR_FEE ? 0n : amount;
  };
  const pays = (stake * (pot - fee(PROTOCOL_FEE_BPS) - fee(BigInt(round.creatorFeeBps)))) / side;
  const share = `${((Number(stake) / Number(side)) * PERCENT).toFixed(DIGITS)}%`;
  return { pays, share };
}
