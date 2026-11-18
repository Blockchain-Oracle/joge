/** The engine's timings and limits, in one place. */

export const SECOND_MS = 1_000;
export const MINUTE_SECONDS = 60;
export const MINUTE_MS = MINUTE_SECONDS * SECOND_MS;
export const HOUR_SECONDS = 60 * MINUTE_SECONDS;
export const HOUR_MS = HOUR_SECONDS * SECOND_MS;

// Oracle relay
/** How far back a cold start reads (covers any round that could still need a lock or settle proof). */
export const ORACLE_COLD_START_SECONDS = 6 * HOUR_SECONDS;
/** Messages per REST page (the API serves at least 500). */
export const ORACLE_PAGE = 500;
/** A safety sweep re-reads this much recent history, catching anything the stream missed. */
export const ORACLE_SAFETY_WINDOW_SECONDS = 15 * MINUTE_SECONDS;
export const ORACLE_SAFETY_EVERY_MS = 5 * MINUTE_MS;
/** A boundary pair sits within a few minutes of its boundary (the oracle signs every minute). */
export const PAIR_WINDOW_SECONDS = 15 * MINUTE_SECONDS;

// Price relay
/** At most one stored and announced tick per asset per this interval (the chart eases between them at 60 Hz). */
export const PRICE_COALESCE_MS = SECOND_MS;
export const PRICE_KEEP_MS = 3 * HOUR_MS;
export const PRICE_PRUNE_EVERY_MS = 10 * MINUTE_MS;
/**
 * Weight of each newly measured exchange-to-oracle gap in the running estimate. One minute's measurement is noisy (the
 * oracle samples other venues at another instant), so it nudges the estimate instead of replacing it.
 */
export const PRICE_GAP_WEIGHT = 0.3;
/**
 * Each tick (one a second) closes this share of the distance to the estimated gap: a time constant of about 20 s, so a
 * re-base spreads over the minute instead of stepping the line by tens of dollars at once (measured: −$55 in 3 s).
 */
export const PRICE_BASIS_EASE = 0.05;
/** No message for this long means the socket is stale: reconnect. */
export const PRICE_STALE_MS = 30 * SECOND_MS;

// Indexer
/** Each sync re-reads this many blocks below the last tip, so a shallow reorg is seen. */
export const REORG_DEPTH = 10;
/** The safety net: a full sync this often even without notifications. */
export const INDEXER_SAFETY_EVERY_MS = 30 * SECOND_MS;
/** An unconfirmed transaction missing from every history this long is checked, then marked dropped. */
export const DROP_GRACE_MS = 90 * SECOND_MS;
export const FETCH_PARALLEL = 8;
/** Rows per `IN (…)` lookup. */
export const LOOKUP_CHUNK = 500;

// Keeper
export const KEEPER_TICK_MS = 5 * SECOND_MS;
export const KEEPER_LEASE_MS = MINUTE_MS;
/** A timeout spend is non-final until the chain's median time passes its deadline (about an hour late): retry slowly. */
export const KEEPER_TIMEOUT_LEASE_MS = 10 * MINUTE_MS;
/** On top of a lane's budget: two gates' dust and the fee. */
export const OPEN_COIN_EXTRA = 10_000n;
/** A coin the keeper just spent stays reserved this long, so a lagging server view never hands it out twice. */
export const COIN_RESERVE_MS = 10 * MINUTE_MS;
/** Most coins one lane opening spends (folds small returned budgets back together). */
export const MAX_FUNDING_INPUTS = 12;

// Logs
export const LOG_TIME_END = 19;
export const LOG_COMPONENT_WIDTH = 8;

// Faucet (chipnet only)
/** How often the faucet looks for new claims. */
export const FAUCET_TICK_MS = 3 * SECOND_MS;
/** Claims served per pass. */
export const FAUCET_BATCH = 10;
/** Picked on top of a top-up for the fee (the change comes back). */
export const FAUCET_FEE_MARGIN = 5_000n;
