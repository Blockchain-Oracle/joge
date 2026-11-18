import type { StakeClass } from "@joge/sdk";

/**
 * Stake chips in dollars, per stake class (converted to sats at the live BCH price and capped by the contract's
 * class limits: short ≈ $1, hourly ≈ $10, events ≈ $50; dollar events stake the dollar token directly, up to $50).
 */
export const STAKE_CHIPS_USD: Record<StakeClass, number[]> = {
  short: [0.05, 0.1, 0.25, 0.5, 1],
  hourly: [0.25, 1, 2.5, 5, 10],
  event: [1, 5, 10, 25, 50],
  // Dollar events stake ParyonUSD itself: these are dollars of the token, not of BCH.
  dollar: [0.25, 1, 5, 10, 50],
};

/** The network fee an entry may need (≈1 sat per byte with a couple of wallet inputs). */
export const ENTRY_FEE_ALLOWANCE = 1_800n;
