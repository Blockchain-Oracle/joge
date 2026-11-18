/** The chart's public shapes. */

/** A price at a time (ms since the epoch). */
export interface Point {
  t: number;
  p: number;
}

/**
 * What the x axis spans. `rolling`: the last `spanMs`, moving with the clock (a round taking entries). `fixed`: a
 * round's own lock → close, so the line travels toward the close marker (a live round), then stops (a settled one).
 */
export type ChartWindow = { kind: "rolling"; spanMs: number } | { kind: "fixed"; from: number; to: number };

export interface RoundLevels {
  /** The opening line (the strike): the line is up-coloured above it and down-coloured below. */
  strike?: number | null;
  /** Event ranges: the boundaries between outcomes. */
  boundaries?: number[];
  /** Vertical markers (ms). */
  lockAt?: number | null;
  closeAt?: number | null;
  /**
   * Your call in the round on screen (Entry level and PnL band, for a shared pot): a "YOU" tag where your
   * line to beat starts, your side's half washed stronger, and the price pill saying whether you are winning.
   */
  position?: { side: 0 | 1 } | null;
}

export type TimeFormat = (ms: number, spanMs: number) => string;

export interface ChartOptions {
  /** How a price is written on the axis, the pill and the levels. */
  format?: (price: number) => string;
  formatTime?: TimeFormat;
  window?: ChartWindow;
  /** Where the colour tokens are read from (default: the document). */
  colorsFrom?: Element;
}
