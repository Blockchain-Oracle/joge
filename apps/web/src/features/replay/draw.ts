import { ENTRIES_MS, type Film, LOCK_MS, marketAt, priceAt } from "./film.ts";

/**
 * Draws one frame of a round film on a 2D canvas (a pure function of film time, so scrubbing is exact). The entry
 * window is the left part, the round itself the right; the line to beat draws across at the lock; the price runs in
 * the side's colour against it with a soft wash; every signed price is a small square on the line; entries are discs on
 * the rail below (yours ringed in vermilion).
 */
export interface Palette {
  ink: string;
  ink2: string;
  muted: string;
  hairline: string;
  up: string;
  down: string;
  upLine: string;
  downLine: string;
  vermilion: string;
  stage: string;
}

const AXIS_W = 92;
const RAIL_H = 34;
const TOP_PAD = 18;
const RANGE_PAD = 0.16;
const GRID_STEP = 22;
const GRID_DOT = 1;
const LINE_W = 2.6;
const WASH_ALPHA = 0.16;
const PRINT_SIZE = 5;
const HEAD_R = 5;
const HALO_R = 13;
const DISC_R = 4.5;
const MINE_R = 8;
const PILL_H = 24;
const PILL_R = 8;
const FONT = "600 12px 'JetBrains Mono', ui-monospace, monospace";
const LABEL_FONT = "600 10px 'JetBrains Mono', ui-monospace, monospace";
const POP_MS = 220;
const DASH_LEN = 6;
const DASH: [number, number] = [DASH_LEN, DASH_LEN];
/** Text inside a pill sits this far from its left edge; the pill is twice that wider than its text. */
const PILL_PAD = 8;
/** Labels and pills keep this gap from the plot's edges. */
const EDGE = 8;
const LABEL_TOP = 2;
const PILL_GAP = 4;
const PRINT_STROKE = 1.2;
const HALO_ALPHA = 0.25;
/** The entry window sits a shade under the round (a hint, not a box). */
const ENTRY_SHADE = 0.22;
const MIN_SPAN_SHARE = 0.0004;
const HALF = 0.5;

export function readPalette(element: Element): Palette {
  const style = getComputedStyle(element);
  const v = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    ink: v("--ink", "#fff"),
    ink2: v("--ink-2", "#b5b5b5"),
    muted: v("--muted", "#7a7a7a"),
    hairline: v("--hairline", "rgba(255,255,255,.08)"),
    up: v("--up", "#b5f543"),
    down: v("--down", "#ff647c"),
    upLine: v("--mark-up", "#b5f543"),
    downLine: v("--mark-down", "#ff647c"),
    vermilion: v("--vermilion", "#e04d26"),
    stage: v("--stage", "#0a0a0a"),
  };
}

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, fill: string, ink: string) {
  ctx.font = FONT;
  const w = ctx.measureText(text).width + PILL_PAD * 2;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y - PILL_H / 2, w, PILL_H, PILL_R);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + PILL_PAD, y + 1);
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  film: Film,
  t: number,
  width: number,
  height: number,
  palette: Palette,
  format: (price: number) => string,
) {
  ctx.clearRect(0, 0, width, height);
  const plotW = width - AXIS_W;
  const plotH = height - RAIL_H - TOP_PAD;
  const span = Math.max(film.high - film.low, film.high * MIN_SPAN_SHARE);
  const low = film.low - span * RANGE_PAD;
  const high = film.high + span * RANGE_PAD;
  const x = (ms: number) => ((ms - film.fromMs) / (film.closeMs - film.fromMs)) * plotW;
  const y = (price: number) => TOP_PAD + (1 - (price - low) / (high - low)) * plotH;
  const now = marketAt(film, t);
  const lockX = x(film.lockMs);

  // Dot grid, and the entry window a shade darker.
  ctx.fillStyle = palette.hairline;
  for (let gx = GRID_STEP / 2; gx < plotW; gx += GRID_STEP) {
    for (let gy = TOP_PAD; gy < TOP_PAD + plotH; gy += GRID_STEP) ctx.fillRect(gx, gy, GRID_DOT, GRID_DOT);
  }
  ctx.globalAlpha = ENTRY_SHADE;
  ctx.fillStyle = palette.hairline;
  ctx.fillRect(0, TOP_PAD, lockX, plotH);
  ctx.globalAlpha = 1;
  ctx.font = LABEL_FONT;
  ctx.textBaseline = "top";
  ctx.fillStyle = palette.muted;
  ctx.fillText("ENTRIES", EDGE, LABEL_TOP);
  ctx.fillText("ROUND", lockX + EDGE, LABEL_TOP);
  ctx.strokeStyle = palette.hairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lockX, TOP_PAD);
  ctx.lineTo(lockX, TOP_PAD + plotH);
  ctx.moveTo(x(film.closeMs) - HALF, TOP_PAD);
  ctx.lineTo(x(film.closeMs) - HALF, TOP_PAD + plotH);
  ctx.stroke();

  // The line to beat: draws across during the lock beat.
  const lineProgress = Math.min(1, Math.max(0, (t - ENTRIES_MS) / LOCK_MS));
  if (film.strike !== null && lineProgress > 0) {
    const sy = y(film.strike);
    ctx.save();
    ctx.setLineDash(DASH);
    ctx.strokeStyle = palette.vermilion;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lockX, sy);
    ctx.lineTo(lockX + (plotW - lockX) * lineProgress, sy);
    ctx.stroke();
    ctx.restore();
    pill(ctx, plotW + PILL_GAP, sy, format(film.strike), palette.vermilion, "#fff");
  }

  // The price, up to now: neutral during entries, then the side's colour against the line, with a wash to it.
  const shown: Array<[number, number]> = [];
  for (let i = 0; i < film.times.length; i++) {
    const ms = film.times[i] ?? 0;
    if (ms > now) break;
    shown.push([ms, film.prices[i] ?? 0]);
  }
  const head = priceAt(film, now);
  if (head !== null) shown.push([now, head]);
  for (let i = 1; i < shown.length; i++) {
    const [m0, p0] = shown[i - 1] ?? [0, 0];
    const [m1, p1] = shown[i] ?? [0, 0];
    const live = m1 > film.lockMs && film.strike !== null && t >= ENTRIES_MS;
    const above = live && film.strike !== null && (p0 + p1) / 2 >= film.strike;
    ctx.strokeStyle = live ? (above ? palette.upLine : palette.downLine) : palette.ink2;
    ctx.lineWidth = LINE_W;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x(m0), y(p0));
    ctx.lineTo(x(m1), y(p1));
    ctx.stroke();
    if (live && film.strike !== null) {
      ctx.globalAlpha = WASH_ALPHA;
      ctx.fillStyle = above ? palette.up : palette.down;
      ctx.beginPath();
      ctx.moveTo(x(m0), y(film.strike));
      ctx.lineTo(x(m0), y(p0));
      ctx.lineTo(x(m1), y(p1));
      ctx.lineTo(x(m1), y(film.strike));
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Signed prices (the proof) as small squares.
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = PRINT_STROKE;
  for (const [ms, price] of film.prints) {
    if (ms > now) break;
    ctx.strokeRect(x(ms) - PRINT_SIZE / 2, y(price) - PRINT_SIZE / 2, PRINT_SIZE, PRINT_SIZE);
  }

  // The head and its price.
  if (head !== null) {
    const hx = x(now);
    const hy = y(head);
    const ahead = film.strike === null || t < ENTRIES_MS ? null : head >= film.strike;
    const color = ahead === null ? palette.ink : ahead ? palette.up : palette.down;
    ctx.globalAlpha = HALO_ALPHA;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(hx, hy, HALO_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(hx, hy, HEAD_R, 0, Math.PI * 2);
    ctx.fill();
    pill(
      ctx,
      plotW + PILL_GAP,
      Math.max(PILL_H / 2, Math.min(height - RAIL_H - PILL_H / 2, hy)),
      format(head),
      color,
      palette.stage,
    );
  }

  // Entries on the rail: a disc each as it was made (yours ringed in vermilion).
  const railY = height - RAIL_H / 2;
  ctx.strokeStyle = palette.hairline;
  ctx.beginPath();
  ctx.moveTo(0, railY);
  ctx.lineTo(plotW, railY);
  ctx.stroke();
  for (const entry of film.entries) {
    if (entry.filmAt > t) break;
    const grow = Math.min(1, (t - entry.filmAt) / POP_MS);
    const ex = x(entry.at);
    const ey = railY + (entry.side === 0 ? -DISC_R - 2 : DISC_R + 2);
    ctx.fillStyle = entry.side === 0 ? palette.up : palette.down;
    ctx.beginPath();
    ctx.arc(ex, ey, DISC_R * grow, 0, Math.PI * 2);
    ctx.fill();
    if (entry.mine) {
      ctx.strokeStyle = palette.vermilion;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ex, ey, MINE_R * grow, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
