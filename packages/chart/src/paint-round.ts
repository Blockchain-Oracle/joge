import { alpha, type Colors } from "./colors.ts";
import { chipWidth, paintChip } from "./paint.ts";

/**
 * The round's own layers, drawn the way real markets draw a price against a target ("price to beat"):
 * one 2 px line, grey until the round has its opening price, then green above it and red below. A soft wash between
 * the line and the target shows who is ahead. Signed oracle prices (what settles the round) are small hollow dots. The
 * lock and the close are hairlines with their times. Nothing glows.
 */

const LINE_W = 2.5;
const WASH_ALPHA = 0.26;
const NEUTRAL_WASH_ALPHA = 0.07;
const HEAD_R = 4;
const PULSE_GROW = 10;
const PULSE_ALPHA = 0.3;
const GUIDE_DOT = 2;
const GUIDE_GAP = 3;
const GUIDE_DASH = [GUIDE_DOT, GUIDE_GAP];
const GUIDE_ALPHA = 0.45;
const TARGET_ON = 5;
const TARGET_OFF = 4;
const TARGET_DASH = [TARGET_ON, TARGET_OFF];
const TARGET_W = 1;
const TARGET_ALPHA = 0.7;
const BOUNDARY_ALPHA = 0.5;
const CHIP_X = 8;
const CHIP_GAP = 6;
const MARKER_ALPHA = 0.22;
const MARKER_CHIP_Y = 14;
const PRINT_R = 2.6;
const PRINT_RING = 1.4;
const READOUT_X = 10;
const READOUT_Y = 34;
const READOUT_FONT = 10;
const TIME_FONT = 9.5;
/** Hairlines sit on the half pixel so they stay one pixel wide. */
const HALF_PX = 0.5;

export interface XY {
  x: number;
  y: number;
}

export type Side = "up" | "down" | null;

export interface Scene {
  ctx: CanvasRenderingContext2D;
  colors: Colors;
  plotW: number;
  plotH: number;
  yOf: (price: number) => number;
  format: (price: number) => string;
}

export const sideOf = (price: number, strike: number | null | undefined): Side =>
  strike === null || strike === undefined || !Number.isFinite(price) || price === strike
    ? null
    : price > strike
      ? "up"
      : "down";

/** The line's colour: its side against the opening price, or neutral grey before there is one. */
export const lineColor = (colors: Colors, side: Side) =>
  side === "up" ? colors.upLine : side === "down" ? colors.downLine : colors.neutral;

/**
 * The wash between the line and the target: green where the price is above it, red where below, fading toward the
 * target. Before the round has a target, a faint grey wash under the line.
 */
export function paintWash(scene: Scene, points: XY[], strike: number | null | undefined) {
  const { ctx, colors, plotW, plotH, yOf } = scene;
  const first = points[0];
  const head = points.at(-1);
  if (!first || !head) return;
  const path = new Path2D();
  for (const [index, point] of points.entries()) {
    if (index === 0) path.moveTo(point.x, point.y);
    else path.lineTo(point.x, point.y);
  }
  const hasTarget = strike !== null && strike !== undefined;
  const base = hasTarget ? Math.min(plotH, Math.max(0, yOf(strike))) : plotH;
  if (!Number.isFinite(base)) return;
  const area = new Path2D(path);
  area.lineTo(head.x, base);
  area.lineTo(first.x, base);
  area.closePath();
  if (!hasTarget) {
    const gradient = ctx.createLinearGradient(0, 0, 0, plotH);
    gradient.addColorStop(0, alpha(colors.neutral, NEUTRAL_WASH_ALPHA));
    gradient.addColorStop(1, alpha(colors.neutral, 0));
    ctx.fillStyle = gradient;
    ctx.fill(area);
    return;
  }
  const halves = [
    { top: 0, height: base, color: colors.upLine, from: base, to: 0 },
    { top: base, height: plotH - base, color: colors.downLine, from: base, to: plotH },
  ];
  for (const half of halves) {
    if (half.height <= 0) continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, half.top, plotW, half.height);
    ctx.clip();
    const gradient = ctx.createLinearGradient(0, half.to, 0, half.from);
    gradient.addColorStop(0, alpha(half.color, WASH_ALPHA));
    gradient.addColorStop(1, alpha(half.color, 0));
    ctx.fillStyle = gradient;
    ctx.fill(area);
    ctx.restore();
  }
}

/** The price line: 2 px, round joins, coloured by its side. */
export function paintLine(scene: Scene, points: XY[], color: string) {
  const { ctx } = scene;
  if (points.length < 2) return;
  const path = new Path2D();
  for (const [index, point] of points.entries()) {
    if (index === 0) path.moveTo(point.x, point.y);
    else path.lineTo(point.x, point.y);
  }
  ctx.save();
  ctx.lineWidth = LINE_W;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.stroke(path);
  ctx.restore();
}

/** Fades the oldest part of a rolling window into the card. */
export function paintTail(ctx: CanvasRenderingContext2D, plotW: number, height: number, fraction: number) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  const fade = ctx.createLinearGradient(0, 0, plotW * fraction, 0);
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, plotW * fraction, height);
  ctx.restore();
}

/** The price to beat (dashed, with its chip) and event range boundaries. */
export function paintLevels(scene: Scene, strike: number | null | undefined, boundaries: number[]) {
  const { ctx, colors, plotW, plotH, yOf, format } = scene;
  for (const boundary of boundaries) {
    const y = yOf(boundary);
    if (y < 0 || y > plotH) continue;
    ctx.save();
    ctx.globalAlpha = BOUNDARY_ALPHA;
    ctx.strokeStyle = colors.muted;
    ctx.setLineDash(GUIDE_DASH);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(plotW, y);
    ctx.stroke();
    ctx.restore();
    paintChip(ctx, colors, CHIP_X, y, format(boundary), colors.surface, colors.muted);
  }
  if (strike === null || strike === undefined) return;
  const y = Math.round(yOf(strike)) + TARGET_W / 2;
  if (y < 0 || y > plotH) return;
  ctx.save();
  ctx.globalAlpha = TARGET_ALPHA;
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = TARGET_W;
  ctx.setLineDash(TARGET_DASH);
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(plotW, y);
  ctx.stroke();
  ctx.restore();
  paintChip(ctx, colors, CHIP_X, y, `To beat ${format(strike)}`, colors.ink, colors.ground);
}

/** A moment (lock or close) as a hairline down the plot with its chip; `align` puts the chip left or right of it. */
export function paintMarker(scene: Scene, x: number, text: string, align: "left" | "right") {
  const { ctx, colors, plotW, plotH } = scene;
  if (x < 0 || x > plotW + 1) return;
  const at = Math.round(Math.min(x, plotW - 1)) + HALF_PX;
  ctx.save();
  ctx.globalAlpha = MARKER_ALPHA;
  ctx.strokeStyle = colors.ink;
  ctx.beginPath();
  ctx.moveTo(at, 0);
  ctx.lineTo(at, plotH);
  ctx.stroke();
  ctx.restore();
  const width = chipWidth(ctx, colors, text);
  const left = align === "right" ? at + CHIP_GAP : at - width - CHIP_GAP;
  if (left < 0 || left + width > plotW) return;
  paintChip(ctx, colors, left, MARKER_CHIP_Y, text, colors.surface, colors.ink);
}

/** Signed oracle prices (what settlement uses) as small, quiet hollow dots: the line is indicative, these are signed. */
export function paintPrints(scene: Scene, prints: XY[]) {
  const { ctx, colors } = scene;
  ctx.save();
  ctx.lineWidth = PRINT_RING;
  for (const print of prints) {
    ctx.beginPath();
    ctx.arc(print.x, print.y, PRINT_R, 0, Math.PI * 2);
    ctx.fillStyle = colors.ground;
    ctx.fill();
    ctx.strokeStyle = colors.muted;
    ctx.stroke();
  }
  ctx.restore();
}

/** The head: a dot with a slow pulse while live, and a dotted guide to its price on the axis. */
export function paintHead(scene: Scene, head: XY, color: string, phase: number) {
  const { ctx, plotW } = scene;
  if (phase > 0) {
    ctx.beginPath();
    ctx.arc(head.x, head.y, HEAD_R + phase * PULSE_GROW, 0, Math.PI * 2);
    ctx.fillStyle = alpha(color, (1 - phase) * PULSE_ALPHA);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(head.x, head.y, HEAD_R, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.save();
  ctx.setLineDash(GUIDE_DASH);
  ctx.strokeStyle = color;
  ctx.globalAlpha = GUIDE_ALPHA;
  ctx.beginPath();
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(plotW, head.y);
  ctx.stroke();
  ctx.restore();
}

/** Time labels along the bottom row, about every `everyPx`. */
export function paintTimes(
  scene: Scene,
  from: number,
  to: number,
  timeH: number,
  everyPx: number,
  formatTime: (ms: number, spanMs: number) => string,
) {
  const { ctx, colors, plotW, plotH } = scene;
  const span = to - from;
  const count = Math.max(1, Math.floor(plotW / everyPx));
  ctx.font = `400 ${TIME_FONT}px ${colors.mono}`;
  ctx.fillStyle = colors.muted;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let index = 1; index <= count; index += 1) {
    const x = (plotW * index) / (count + 1);
    ctx.fillText(formatTime(from + (span * x) / plotW, span), x, plotH + timeH / 2);
  }
}

/** A dotted cross at the pointer and the time and price under it. */
export function paintReadout(scene: Scene, at: XY, text: string) {
  const { ctx, colors, plotW, plotH } = scene;
  ctx.save();
  ctx.setLineDash(GUIDE_DASH);
  ctx.strokeStyle = colors.faint;
  ctx.beginPath();
  ctx.moveTo(at.x, 0);
  ctx.lineTo(at.x, plotH);
  ctx.moveTo(0, at.y);
  ctx.lineTo(plotW, at.y);
  ctx.stroke();
  ctx.restore();
  ctx.font = `500 ${READOUT_FONT}px ${colors.mono}`;
  ctx.fillStyle = colors.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(text.toUpperCase(), READOUT_X, READOUT_Y);
}
