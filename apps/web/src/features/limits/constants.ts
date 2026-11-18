/** The choices in More → Play limits. */
export const HOUR_MS = 3_600_000;
export const DAY_MS = 24 * HOUR_MS;
/** Daily stake limits in dollars; null is no limit. */
export const DAILY_OPTIONS: Array<number | null> = [null, 1, 5, 10, 25];
export const COOL_OFFS = [
  { label: "1h", ms: HOUR_MS },
  { label: "24h", ms: DAY_MS },
  { label: "7d", ms: 7 * DAY_MS },
];
