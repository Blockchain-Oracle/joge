/** Entries close this long before a round locks (the ticket's rule, so a signature never lands too late). */
export const CLOSE_LEAD_SECONDS = 15;
/** The stake ladder in dollars (1-2-5 snapping); each lane class caps it in the contract. */
export const STAKE_LADDER_USD = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10];
/** Until the player picks a stake, a tap stakes about this share of the balance (5 %). */
export const STAKE_SHARE = 0.05;
/** The lane the screen opens on: BTC 5 min (lane thread 0x11). */
export const DEFAULT_THREAD = 17;
/**
 * The four markets the app plays:
 * BTC, ETH and BCH every 5 minutes, gold every hour. The chain still has all thirteen lane threads.
 */
export const MARKETS = [
  { asset: "BTC", thread: 17 },
  { asset: "ETH", thread: 20 },
  { asset: "BCH", thread: 23 },
  { asset: "GOLD", thread: 28 },
] as const;
export const MARKET_THREADS: readonly number[] = MARKETS.map((market) => market.thread);
/** The last seconds that tick. */
export const TICK_SECONDS = 5;
