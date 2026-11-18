/** Round page and Finish-this-round numbers. */

export const SECOND_MS = 1_000;
/** A round taking entries is charted over the last five minutes. */
export const ROLLING_SPAN_MS = 5 * 60 * SECOND_MS;
/** Signed messages within this window of a boundary are enough to find its pair. */
export const ORACLE_WINDOW_SECONDS = 15 * 60;
export const NOT_FOUND = 404;
