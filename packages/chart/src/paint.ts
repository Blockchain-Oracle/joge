import type { Colors } from "./colors.ts";

/** Drawing primitives the chart composes (each draws on a context already scaled to CSS pixels). */

const DOT_SIZE = 1.2;
const AXIS_FONT = 10;
const AXIS_GAP = 8;
const PILL_GAP = 4;
const PILL_H = 22;
const PILL_PAD = 7;
const PILL_RADIUS = 5;
const PILL_FONT = 11;
const CHIP_H = 18;
const CHIP_PAD = 6;
const CHIP_RADIUS = 4;
const CHIP_FONT = 9.5;
const HALF_PX = 0.5;

/** A faint dot grid (kept for callers that want texture; the round chart uses gridlines). */
export function paintDots(
  ctx: CanvasRenderingContext2D,
  colors: Colors,
  width: number,
  height: number,
  spacing: number,
  drift: number,
) {
  ctx.fillStyle = colors.hairline;
  for (let x = spacing - drift; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) ctx.fillRect(x, y, DOT_SIZE, DOT_SIZE);
  }
}

/** Price labels down the axis column, each with a hairline across the plot. */
export function paintAxis(
  ctx: CanvasRenderingContext2D,
  colors: Colors,
  plotW: number,
  lo: number,
  hi: number,
  lines: number,
  yOf: (p: number) => number,
  format: (p: number) => string,
) {
  ctx.font = `400 ${AXIS_FONT}px ${colors.mono}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= lines; i++) {
    const p = lo + ((hi - lo) * i) / lines;
    const y = Math.round(yOf(p)) + HALF_PX;
    ctx.fillStyle = colors.hairline;
    ctx.fillRect(0, y, plotW, 1);
    ctx.fillStyle = colors.muted;
    ctx.fillText(format(p), plotW + AXIS_GAP, y);
  }
}

/** How wide the axis must be for a price pill. */
export function axisWidthFor(ctx: CanvasRenderingContext2D, colors: Colors, text: string): number {
  ctx.font = `500 ${PILL_FONT}px ${colors.mono}`;
  return Math.ceil(ctx.measureText(text).width + 2 * PILL_PAD + PILL_GAP + AXIS_GAP);
}

/** A price riding the axis on a small tag. */
export function paintPill(
  ctx: CanvasRenderingContext2D,
  colors: Colors,
  plotW: number,
  axisW: number,
  y: number,
  text: string,
  fill: string,
  ink: string,
) {
  ctx.font = `500 ${PILL_FONT}px ${colors.mono}`;
  const tw = ctx.measureText(text).width;
  const x = plotW + PILL_GAP;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y - PILL_H / 2, Math.min(axisW - PILL_GAP, tw + 2 * PILL_PAD), PILL_H, PILL_RADIUS);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + PILL_PAD, y + HALF_PX);
}

/** A chip in mono caps (TO BEAT, LOCK, CLOSE). Returns its width. */
export function paintChip(
  ctx: CanvasRenderingContext2D,
  colors: Colors,
  x: number,
  y: number,
  text: string,
  fill: string,
  ink: string,
): number {
  ctx.font = `500 ${CHIP_FONT}px ${colors.mono}`;
  const label = text.toUpperCase();
  const width = Math.ceil(ctx.measureText(label).width) + 2 * CHIP_PAD;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y - CHIP_H / 2, width, CHIP_H, CHIP_RADIUS);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + CHIP_PAD, y + 1);
  return width;
}

/** How wide a chip will be (to right-align one). */
export function chipWidth(ctx: CanvasRenderingContext2D, colors: Colors, text: string): number {
  ctx.font = `500 ${CHIP_FONT}px ${colors.mono}`;
  return Math.ceil(ctx.measureText(text.toUpperCase()).width) + 2 * CHIP_PAD;
}
