import { BPS, MAX_CREATOR_FEE_BPS, PROTOCOL_FEE_BPS } from "./constants.ts";
import type { LockedRound, SweepRound, TicketState } from "./layout.ts";
import { type Settlement, winningOutcome } from "./payout.ts";

/**
 * Dollar events (F11): stakes and payouts in a dollar token, held in sidecars beside a round's gates and master.
 * Mirrors packages/contracts/cashscript/dollar.cash; change both together. Amounts are token units (cents).
 */
export const DOLLAR_MIN_STAKE = 10n;
export const DOLLAR_MAX_STAKE = 5_000n;
export const DOLLAR_GATE_CAP = 100_000n;
/** Every sidecar is made holding this much (a token output cannot be empty); it goes back to the creator at the end. */
export const SIDE_SEED = 1n;
/** Satoshis every sidecar, and every dollar fee output, carries. */
export const TOKEN_DUST = 1_000n;
/** A dollar lock: ~2,160 bytes plus ~920 per gate (gate and sidecar), gold ~300 more; mirrors dollar.cash. */
export const DOLLAR_LOCK_FEE_BASE = 2_800n;
export const DOLLAR_LOCK_FEE_PER_GATE = 1_100n;
/** Settle and sweep spend the pot sidecar too. */
export const SIDE_FEE = 300n;
export const MIN_DOLLAR_FEE = 1n;
/** ParyonUSD has two decimals, so one token unit is a cent. */
export const DOLLAR_DECIMALS = 2;
export const CENTS_PER_DOLLAR = 100;

/** ParyonUSD (PUSD) on mainnet, in display order. Chipnet uses a test token of the same shape (see deployments). */
export const PUSD_CATEGORY = "2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544";

export const dollarLockFee = (gates: number): bigint => DOLLAR_LOCK_FEE_BASE + DOLLAR_LOCK_FEE_PER_GATE * BigInt(gates);

/** Mirrors DollarMasterOpen: the pot is what the sidecars hold beyond their seeds. */
export const potFromSides = (sideAmounts: bigint[]): bigint =>
  sideAmounts.reduce((sum, amount) => sum + amount - SIDE_SEED, 0n);

const paidDollarFee = (pot: bigint, bps: bigint): bigint => {
  const fee = (pot * bps) / BPS;
  return fee < MIN_DOLLAR_FEE ? 0n : fee;
};

/** Mirrors DollarMasterLocked's writeDollarSettlement: fees in dollars, each from one cent. */
export function dollarSettle(round: LockedRound, strike: bigint, close: bigint): Settlement {
  if (BigInt(round.creatorFeeBps) > MAX_CREATOR_FEE_BPS) throw new RangeError("creator fee above the cap");
  const winner = winningOutcome(round, strike, close);
  const winnerTotal = winner === null ? 0n : (round.totals[winner] ?? 0n);
  if (winnerTotal === 0n) return { winner: null, winnerTotal: 0n, protocolFee: 0n, creatorFee: 0n, pot: 0n };
  const protocolFee = paidDollarFee(round.pot, PROTOCOL_FEE_BPS);
  const creatorFee = paidDollarFee(round.pot, BigInt(round.creatorFeeBps));
  return { winner, winnerTotal, protocolFee, creatorFee, pot: round.pot - protocolFee - creatorFee };
}

/** Mirrors DollarMasterSweep: the dollars the ticket at input i is paid (its satoshi dust comes back separately). */
export function dollarShare(round: SweepRound, ticket: TicketState): bigint {
  if (round.state === "void") return ticket.stake;
  if (ticket.outcome === round.winner) return (ticket.stake * round.pot) / round.winnerTotal;
  return 0n;
}
