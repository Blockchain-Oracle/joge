import type { Point } from "../types.ts";
import {
  AXIS_FONT,
  BAND_ALPHA,
  DASH,
  FADE_SHARE,
  FILL_ALPHA,
  GLOW_ALPHA,
  GLOW_WIDTH,
  LABEL_GAP,
  LINE_WIDTH,
  PAD_TOP,
  PILL_FONT,
  PILL_H,
  PILL_PAD,
  PILL_RADIUS,
  PRINT_ALPHA,
  PRINT_LINE,
  PRINT_SIZE,
  ROLL_MS,
  STATUS_GAP,
  TAG_FONT,
  TAG_H,
  TAG_PAD,
} from "./constants.ts";

export const HALF = 0.5;
export const TWO = 2;
export const TAU = Math.PI * TWO;

/** Everything the round chart reads from the page: the world's colours and two faces. */
export interface Palette {
  ink: string;
  muted: string;
  hairline: string;
  up: string;
  upInk: string;
  /** Line colours that read on this world's ground (the bright plates are too light on cream). */
  upLine: string;
  down: string;
  downInk: string;
  downLine: string;
  brand: string;
  ground: string;
  mono: string;
  serif: string;
}

export function readPalette(from: Element): Palette {
  const css = getComputedStyle(from);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    ink: v("--ink", "#ffffff"),
    muted: v("--muted", "#7a7a7a"),
    hairline: v("--hairline", "rgba(255,255,255,0.08)"),
    up: v("--up", "#b5f543"),
    upInk: v("--up-ink", "#0b0f02"),
    upLine: v("--up-text", "#b5f543"),
    down: v("--down", "#ff647c"),
    downInk: v("--down-ink", "#1a0307"),
    downLine: v("--down-text", "#ff647c"),
    brand: v("--vermilion", "#e04d26"),
    ground: v("--bg", "#050505"),
    mono: v("--font-jetbrains", "ui-monospace, monospace"),
    serif: v("--font-serif-jp", "serif"),
  };
}

export const USD = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const TIME = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

export interface Frame {
  ctx: CanvasRenderingContext2D;
  palette: Palette;
  w: number;
  h: number;
}

/** Up above the line to beat and down below it, each filled toward it, with a soft glow; the left edge fades. */
export function paintLine(
  { ctx, palette, w, h }: Frame,
  series: Point[],
  x: (t: number) => number,
  y: (p: number) => number,
  strikeY: number | null,
  bottom: number,
  head: { x: number; y: number },
) {
  const path = new Path2D();
  for (const [i, point] of series.entries()) {
    if (i === 0) path.moveTo(x(point.t), y(point.p));
    else path.lineTo(x(point.t), y(point.p));
  }
  path.lineTo(head.x, head.y);
  const split = strikeY ?? bottom;
  const fill = new Path2D(path);
  fill.lineTo(head.x, split);
  fill.lineTo(x(series[0]?.t ?? 0), split);
  fill.closePath();
  const bands: ReadonlyArray<readonly [string, string, number, number]> =
    strikeY === null
      ? [[palette.ink, palette.ink, 0, h]]
      : [
          [palette.up, palette.upLine, 0, split],
          [palette.down, palette.downLine, split, h - split],
        ];
  for (const [color, line, top, height] of bands) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, w, height);
    ctx.clip();
    ctx.globalAlpha = strikeY === null ? FILL_ALPHA * HALF : FILL_ALPHA;
    ctx.fillStyle = color;
    ctx.fill(fill);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = line;
    ctx.globalAlpha = GLOW_ALPHA;
    ctx.lineWidth = GLOW_WIDTH;
    ctx.stroke(path);
    ctx.globalAlpha = 1;
    ctx.lineWidth = LINE_WIDTH;
    ctx.stroke(path);
    ctx.restore();
  }
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  const erase = ctx.createLinearGradient(0, 0, w * FADE_SHARE, 0);
  erase.addColorStop(0, "rgba(0,0,0,1)");
  erase.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = erase;
  ctx.fillRect(0, 0, w * FADE_SHARE, h);
  ctx.restore();
}

/** Signed oracle prices, the only prices a round settles by: small squares on the line. */
export function paintPrints(
  { ctx, palette }: Frame,
  prints: Point[],
  x: (t: number) => number,
  y: (p: number) => number,
  t0: number,
) {
  ctx.save();
  ctx.globalAlpha = PRINT_ALPHA;
  ctx.strokeStyle = palette.ink;
  ctx.fillStyle = palette.ground;
  ctx.lineWidth = PRINT_LINE;
  const half = PRINT_SIZE * HALF;
  for (const print of prints) {
    if (print.t < t0) continue;
    ctx.fillRect(x(print.t) - half, y(print.p) - half, PRINT_SIZE, PRINT_SIZE);
    ctx.strokeRect(x(print.t) - half, y(print.p) - half, PRINT_SIZE, PRINT_SIZE);
  }
  ctx.restore();
}

/** The price to beat: a dashed line, a "TO BEAT" tag on its left end and its price on the axis. */
export function paintStrike({ ctx, palette }: Frame, strikeY: number, right: number, strike: number) {
  ctx.save();
  ctx.strokeStyle = palette.muted;
  ctx.setLineDash([...DASH]);
  ctx.beginPath();
  ctx.moveTo(0, strikeY);
  ctx.lineTo(right, strikeY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `600 ${TAG_FONT}px ${palette.mono}`;
  const label = "TO BEAT";
  const width = ctx.measureText(label).width + TAG_PAD * TWO;
  ctx.fillStyle = palette.ground;
  ctx.beginPath();
  ctx.roundRect(LABEL_GAP, strikeY - TAG_H * HALF, width, TAG_H, TAG_H * HALF);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = palette.ink;
  ctx.textBaseline = "middle";
  ctx.fillText(label, LABEL_GAP + TAG_PAD, strikeY);
  ctx.font = `600 ${AXIS_FONT}px ${palette.mono}`;
  ctx.fillText(USD.format(strike), right + LABEL_GAP, strikeY);
  ctx.restore();
}

export interface Roll {
  from: string;
  to: string;
  at: number;
}

/** The price pill on the axis in the side's colour; each changed digit rolls in the direction of the move. */
export function paintPill(
  { ctx, palette, w, h }: Frame,
  roll: Roll,
  py: number,
  right: number,
  colors: { fill: string; ink: string },
  clock: number,
) {
  const text = roll.to;
  const t = Math.min(1, (clock - roll.at) / ROLL_MS);
  const rising = Number(roll.to.replaceAll(",", "")) >= Number(roll.from.replaceAll(",", ""));
  const direction = rising ? 1 : -1;
  ctx.save();
  ctx.font = `700 ${PILL_FONT}px ${palette.mono}`;
  const width = Math.min(ctx.measureText(text).width + PILL_PAD * TWO, w - right);
  const top = Math.max(0, Math.min(h - PILL_H, py - PILL_H * HALF));
  const mid = top + PILL_H * HALF;
  ctx.fillStyle = colors.fill;
  ctx.beginPath();
  ctx.roundRect(right, top, width, PILL_H, PILL_RADIUS);
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = colors.ink;
  ctx.textBaseline = "middle";
  let cx = right + PILL_PAD;
  for (let i = 0; i < text.length; i += 1) {
    const to = text[i] ?? "";
    const from = roll.from[i] ?? to;
    if (from === to || t >= 1) ctx.fillText(to, cx, mid);
    else {
      ctx.fillText(from, cx, mid - PILL_H * t * direction);
      ctx.fillText(to, cx, mid + PILL_H * (1 - t) * direction);
    }
    cx += ctx.measureText(to).width;
  }
  ctx.restore();
}

/** The same colour with no opacity (canvas gradients need both ends in one colour to fade without darkening). */
function clear(ctx: CanvasRenderingContext2D, color: string): string {
  ctx.fillStyle = color;
  const normal = String(ctx.fillStyle);
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(normal);
  if (hex)
    return `rgba(${hex
      .slice(1)
      .map((part) => Number.parseInt(part, 16))
      .join(",")},0)`;
  const rgba = /^rgba?\(([^,]+),([^,]+),([^,)]+)/i.exec(normal.replaceAll(" ", ""));
  return rgba ? `rgba(${rgba[1]},${rgba[2]},${rgba[3]},0)` : "transparent";
}

/**
 * While you hold a side (Kakure's PnL band, for a shared pot): from where your round started to the head, your side's
 * half of the plot washes in its colour, strongest at the line to beat; a "YOU" tag marks where your line begins.
 */
export function paintHolding(
  { ctx, palette }: Frame,
  hold: { side: 0 | 1; strikeY: number; fromX: number; headX: number; bottom: number },
) {
  const { side, strikeY, fromX, headX, bottom } = hold;
  const up = side === 0;
  const color = up ? palette.up : palette.down;
  if (headX > fromX) {
    const edge = up ? PAD_TOP : bottom;
    const wash = ctx.createLinearGradient(0, strikeY, 0, edge);
    wash.addColorStop(0, color);
    wash.addColorStop(1, clear(ctx, color));
    ctx.save();
    ctx.globalAlpha = BAND_ALPHA;
    ctx.fillStyle = wash;
    ctx.fillRect(fromX, Math.min(strikeY, edge), headX - fromX, Math.abs(edge - strikeY));
    ctx.restore();
  }
  ctx.save();
  ctx.font = `700 ${TAG_FONT}px ${palette.mono}`;
  const label = up ? "YOU ▲ UP" : "YOU ▼ DOWN";
  const width = ctx.measureText(label).width + TAG_PAD * TWO;
  const top = up ? strikeY - TAG_H - STATUS_GAP : strikeY + STATUS_GAP;
  const left = Math.max(LABEL_GAP, fromX - width * HALF);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(left, top, width, TAG_H, TAG_H * HALF);
  ctx.fill();
  ctx.fillStyle = up ? palette.upInk : palette.downInk;
  ctx.textBaseline = "middle";
  ctx.fillText(label, left + TAG_PAD, top + TAG_H * HALF);
  ctx.restore();
}

/** Under the price pill while you hold a side: whether the price is on your side of the line right now. */
export function paintStatus(
  { ctx, palette, h }: Frame,
  status: { text: string; fill: string; ink: string },
  py: number,
  right: number,
) {
  ctx.save();
  ctx.font = `700 ${TAG_FONT}px ${palette.mono}`;
  const width = ctx.measureText(status.text).width + TAG_PAD * TWO;
  const pillTop = Math.max(0, Math.min(h - PILL_H, py - PILL_H * HALF));
  const below = pillTop + PILL_H + STATUS_GAP;
  const top = below + TAG_H <= h ? below : pillTop - STATUS_GAP - TAG_H;
  ctx.fillStyle = status.fill;
  ctx.beginPath();
  ctx.roundRect(right, top, width, TAG_H, TAG_H * HALF);
  ctx.fill();
  ctx.fillStyle = status.ink;
  ctx.textBaseline = "middle";
  ctx.fillText(status.text, right + TAG_PAD, top + TAG_H * HALF);
  ctx.restore();
}
