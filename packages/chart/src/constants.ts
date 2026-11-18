/** The chart's numbers (values from Mitoshi's engine where they carry over). */

/** Per frame, the shown price closes this share of the gap to the latest tick. */
export const EASE_PRICE = 0.18;
export const EASE_RANGE = 0.08;
/** One step is 0.01 % of the price; the view never spans less than ±7.5 steps. */
export const STEP_FRACTION = 0.0001;
export const HALF_STEPS = 7.5;
export const RANGE_MARGIN = 1.25;
/** Most samples kept for a window (the line is resampled to this on screen). */
export const MAX_POINTS = 1_500;
/** The finest sampling of the eased price (ms). */
export const MIN_SAMPLE_MS = 50;
/** A rolling window's default span: five minutes. */
export const DEFAULT_SPAN_MS = 5 * 60_000;
export const AXIS_W = 72;
export const TIME_H = 22;
export const PAD_TOP = 34;
export const TAIL_FRACTION = 0.22;
export const PULSE_MS = 2_000;
export const GRID_LINES = 4;
export const TIME_LABEL_EVERY_PX = 110;
export const HEX_RADIX = 16;
export const HEX6 = 6;
export const HEX3 = 3;
