/**
 * The round chart's numbers: the Window chart of Abu's own products (Mitoshi's window chart and Owarine's terminal, as
 * Kakure carried them in `packages/chart/src/{constants,window-chart}.ts`), tuned for Jōge's lock → close rounds.
 */

export const MS_PER_SECOND = 1_000;
const MS_PER_MINUTE = 60_000;

/** Before a round locks the axis shows this share of its length as lead-in, between 2 and 30 minutes. */
export const LEAD_SHARE = 0.3;
export const LEAD_MIN_MS = MS_PER_MINUTE;
export const LEAD_MAX_MS = 30 * MS_PER_MINUTE;
/** With no round live, the axis spans this long by default. */
export const DEFAULT_ROLLING_MS = 5 * MS_PER_MINUTE;
/** With no round live, the axis is the last few minutes plus a sliver of future. */
export const ROLLING_FUTURE_SHARE = 0.08;

/** Per frame the shown price closes this share of the gap to the latest tick (τ ≈ 84 ms at 60 Hz). */
export const EASE_PRICE = 0.18;
/** The y-range eases toward its target by this share each frame, so new highs glide in. */
export const EASE_RANGE = 0.08;
/** Headroom above and below the data, as a share of its span; a flat series still spans 0.05 % of the price. */
export const RANGE_PAD = 0.22;
export const MIN_SPAN_SHARE = 0.0005;
/** The eased price is written into the series this often. */
export const SAMPLE_MS = 250;
export const MAX_POINTS = 6_000;

/** Layout, CSS pixels. */
export const AXIS_W = 104;
export const PAD_TOP = 22;
export const PAD_BOTTOM = 28;
export const PAD_LEFT = 0;
export const DOT_SPACING = 22;
export const DOT_RADIUS = 1;
export const GRID_LINES = 4;
export const LINE_WIDTH = 2.25;
export const GLOW_WIDTH = 8;
export const HEAD_RADIUS = 4.5;
export const PULSE_RADIUS = 16;
export const PULSE_MS = 1_600;
export const PILL_H = 26;
export const PILL_RADIUS = 13;
export const PILL_PAD = 9;
export const TAG_H = 20;
export const TAG_PAD = 8;
export const DASH = [5, 5] as const;
export const LABEL_GAP = 8;
export const PRINT_SIZE = 6;
export const PRINT_LINE = 1.5;
/** The left share of the plot fades out, so the line reads as arriving from the past. */
export const FADE_SHARE = 0.14;

/** Type, CSS pixels. */
export const AXIS_FONT = 11;
export const PILL_FONT = 13;
export const TAG_FONT = 10;
/** The 上下 watermark: at most this share of the plot's height, and never wider than its width share. */
export const WATERMARK = "上下";
export const WATERMARK_HEIGHT_SHARE = 0.62;
export const WATERMARK_WIDTH_SHARE = 0.5;

/** Opacities. */
export const DOT_ALPHA = 0.16;
export const GRID_ALPHA = 0.55;
export const FILL_ALPHA = 0.16;
export const GLOW_ALPHA = 0.22;
export const FUTURE_ALPHA = 0.05;
export const WATERMARK_ALPHA = 0.05;
export const PULSE_ALPHA = 0.38;
export const PRINT_ALPHA = 0.85;

/** Each changed digit of the price pill rolls in this long (up on a rise, down on a fall). */
export const ROLL_MS = 260;
/** Colours are re-read this often (a world switch on an ancestor announces nothing). */
export const COLOR_POLL_MS = 1_500;
export const MAX_DPR = 2;
