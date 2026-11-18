/**
 * The history chart's numbers (Kakure's candle view and Mitoshi-ZEC's `line` mode, carried onto Jōge's round chart
 * look): same dot grid, watermark, axis and pill as the live round chart, so switching views reads as one chart.
 */

/** Layout, CSS pixels. */
export const AXIS_W = 104;
export const PAD_TOP = 22;
export const PAD_BOTTOM = 28;
export const DOT_SPACING = 22;
export const DOT_RADIUS = 1;
export const GRID_LINES = 4;
export const LABEL_GAP = 8;
export const TIME_LABELS = 5;
/** A candle's body takes this share of its slot; the wick is a hairline. */
export const BODY_SHARE = 0.62;
export const MIN_BODY_H = 1.5;
export const WICK_W = 1.25;
export const LINE_WIDTH = 2.25;
export const PILL_H = 26;
export const PILL_RADIUS = 13;
export const PILL_PAD = 9;
export const DASH = [3, 3] as const;
/** The hover card: its padding, line height and gap from the top-left corner. */
export const CARD_PAD = 10;
export const CARD_LINE = 16;
export const CARD_RADIUS = 12;

/** Type, CSS pixels. */
export const AXIS_FONT = 11;
export const PILL_FONT = 13;
export const CARD_FONT = 12;
export const WATERMARK = "上下";
export const WATERMARK_HEIGHT_SHARE = 0.62;
export const WATERMARK_WIDTH_SHARE = 0.5;

/** Opacities. */
export const DOT_ALPHA = 0.16;
export const GRID_ALPHA = 0.55;
export const WATERMARK_ALPHA = 0.05;
export const AREA_ALPHA = 0.16;
export const LIVE_LINE_ALPHA = 0.45;
export const CROSS_ALPHA = 0.5;

/** Headroom above and below the candles, as a share of their span (a flat hour still spans 0.05 % of the price). */
export const RANGE_PAD = 0.08;
export const MIN_SPAN_SHARE = 0.0005;
/** Switching between candles and line crossfades over this long (Kakure). */
export const FADE_MS = 220;
export const COLOR_POLL_MS = 1_500;
export const MAX_DPR = 2;
