import { HOUR_SECONDS } from "@joge/sdk";

const MINUTE_SECONDS = 60;
const HOURS_PER_DAY = 24;
const QUARTER_HOUR_MINUTES = 15;

/** The terminal's chart views (interval pill): the live round, then history as candles or a line. */
export const CANDLE_RANGES = {
  "1h": { label: "1H", seconds: HOUR_SECONDS, bucketSeconds: MINUTE_SECONDS },
  "1d": { label: "1D", seconds: HOURS_PER_DAY * HOUR_SECONDS, bucketSeconds: QUARTER_HOUR_MINUTES * MINUTE_SECONDS },
} as const;
export type CandleRange = keyof typeof CANDLE_RANGES;
export type ChartView = "live" | CandleRange;
