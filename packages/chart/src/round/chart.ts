import { watchBox } from "../input.ts";
import type { ChartWindow, Point, RoundLevels } from "../types.ts";
import {
  AXIS_FONT,
  AXIS_W,
  COLOR_POLL_MS,
  DASH,
  DEFAULT_ROLLING_MS,
  DOT_ALPHA,
  DOT_RADIUS,
  DOT_SPACING,
  EASE_RANGE,
  EASE_TAU_MIN_MS,
  EASE_TAU_SHARE,
  FRAME_MS,
  FUTURE_ALPHA,
  GRID_ALPHA,
  GRID_LINES,
  HEAD_RADIUS,
  LABEL_GAP,
  LEAD_MAX_MS,
  LEAD_MIN_MS,
  LEAD_SHARE,
  MAX_DPR,
  MAX_POINTS,
  MIN_SPAN_SHARE,
  PAD_BOTTOM,
  PAD_TOP,
  PULSE_ALPHA,
  PULSE_MS,
  PULSE_RADIUS,
  RANGE_PAD,
  ROLLING_FUTURE_SHARE,
  SAMPLE_MS,
  TICK_GAP_EASE,
  TICK_GAP_MAX_MS,
  WATERMARK,
  WATERMARK_ALPHA,
  WATERMARK_HEIGHT_SHARE,
  WATERMARK_WIDTH_SHARE,
} from "./constants.ts";
import {
  type Frame,
  HALF,
  type Palette,
  paintHolding,
  paintLine,
  paintPill,
  paintPrints,
  paintStatus,
  paintStrike,
  type Roll,
  readPalette,
  TAU,
  TIME,
  TWO,
  USD,
} from "./paint.ts";

/**
 * A round on a canvas, drawn every frame from data held outside React. The axis runs from a lead-in before the lock to the close; the time still to come is shaded; the line is up
 * above the price to beat and down below it, filled toward it; signed oracle prices sit on the line as small squares;
 * the head pulses and the price pill's digits roll in the direction of the move. Same API as `PriceChart`.
 */
export class RoundChart {
  private readonly box: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly cleanups: Array<() => void> = [];
  private palette: Palette;
  private window: ChartWindow = { kind: "rolling", spanMs: DEFAULT_ROLLING_MS };
  private levels: RoundLevels = {};
  private points: Point[] = [];
  private prints: Point[] = [];
  private target = Number.NaN;
  private shown = Number.NaN;
  private lastSample = 0;
  /** The feed's measured pace (ms between ticks) and the clocks the glide needs. */
  private tickGap = 0;
  private lastTick = 0;
  private lastFrame = 0;
  private yMin = Number.NaN;
  private yMax = Number.NaN;
  private w = 0;
  private h = 0;
  private raf = 0;
  private visible = true;
  private roll: Roll | null = null;

  constructor(box: HTMLElement) {
    this.box = box;
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
    box.appendChild(this.canvas);
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("no 2D canvas");
    this.ctx = ctx;
    this.palette = readPalette(box);
    this.cleanups.push(
      watchBox(box, {
        onResize: () => this.resize(),
        onVisible: (visible) => {
          this.visible = visible;
        },
        onRepaint: () => {
          this.palette = readPalette(box);
        },
      }),
    );
    // A world switch on an ancestor announces nothing, so the colours are re-read now and then.
    const poll = setInterval(() => {
      this.palette = readPalette(box);
    }, COLOR_POLL_MS);
    this.cleanups.push(() => clearInterval(poll));
    this.resize();
    this.raf = requestAnimationFrame(this.frame);
  }

  setWindow(window: ChartWindow) {
    this.window = window;
    this.yMin = Number.NaN;
  }

  setLevels(levels: RoundLevels) {
    this.levels = levels;
  }

  setHistory(points: Point[]) {
    const live = this.points.filter((point) => point.t > (points.at(-1)?.t ?? 0));
    this.points = [...points, ...live].filter((point) => Number.isFinite(point.p)).sort((a, b) => a.t - b.t);
    if (this.points.length > MAX_POINTS) this.points = this.points.slice(-MAX_POINTS);
    const last = this.points.at(-1);
    if (last && Number.isNaN(this.shown)) {
      this.shown = last.p;
      this.target = last.p;
    }
  }

  setPrints(prints: Point[]) {
    this.prints = [...prints].sort((a, b) => a.t - b.t);
  }

  pushPrint(print: Point) {
    if (!this.prints.some((known) => known.t === print.t)) this.prints.push(print);
  }

  pushPrice(price: number) {
    if (!Number.isFinite(price)) return;
    const at = performance.now();
    if (this.lastTick > 0) {
      const gap = Math.min(TICK_GAP_MAX_MS, at - this.lastTick);
      this.tickGap = this.tickGap > 0 ? this.tickGap + (gap - this.tickGap) * TICK_GAP_EASE : gap;
    }
    this.lastTick = at;
    this.target = price;
    if (Number.isNaN(this.shown)) this.shown = price;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    for (const cleanup of this.cleanups) cleanup();
    this.canvas.remove();
  }

  private resize() {
    const rect = this.box.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private span(now: number): { t0: number; t1: number } {
    if (this.window.kind === "fixed") {
      const lead = Math.min(LEAD_MAX_MS, Math.max(LEAD_MIN_MS, (this.window.to - this.window.from) * LEAD_SHARE));
      return { t0: this.window.from - lead, t1: this.window.to };
    }
    return { t0: now - this.window.spanMs, t1: now + this.window.spanMs * ROLLING_FUTURE_SHARE };
  }

  private readonly frame = (clock: number) => {
    this.raf = requestAnimationFrame(this.frame);
    if (!this.visible || document.hidden) return;
    const now = Date.now();
    const elapsed = this.lastFrame > 0 ? clock - this.lastFrame : FRAME_MS;
    this.lastFrame = clock;
    if (!Number.isNaN(this.target)) {
      const tau = Math.max(EASE_TAU_MIN_MS, this.tickGap * EASE_TAU_SHARE);
      this.shown += (this.target - this.shown) * (1 - Math.exp(-elapsed / tau));
      if (now - this.lastSample >= SAMPLE_MS) {
        this.points.push({ t: now, p: this.shown });
        if (this.points.length > MAX_POINTS) this.points.shift();
        this.lastSample = now;
      }
    }
    this.draw(now, clock);
  };

  private draw(now: number, clock: number) {
    const { ctx, w, h, palette } = this;
    const frame: Frame = { ctx, palette, w, h };
    ctx.clearRect(0, 0, w, h);
    const right = w - AXIS_W;
    const bottom = h - PAD_BOTTOM;
    this.paintDots(right, bottom);
    this.paintWatermark(right, bottom);
    if (Number.isNaN(this.shown)) return;

    const { t0, t1 } = this.span(now);
    const series = this.points.filter((point) => point.t >= t0 && point.t <= now);
    if (series.length === 0) return;
    const strike = this.levels.strike ?? null;
    this.easeRange(series, strike);
    const x = (t: number) => ((t - t0) / (t1 - t0)) * right;
    const y = (p: number) => PAD_TOP + ((this.yMax - p) / (this.yMax - this.yMin)) * (bottom - PAD_TOP);
    const head = { x: Math.min(right, x(now)), y: y(this.shown) };

    this.paintGrid(right, bottom, y);
    this.paintFuture(head.x, right, bottom);
    this.paintMarkers(x, bottom);
    const strikeY = strike === null ? null : y(strike);
    const position = this.levels.position ?? null;
    if (position && strikeY !== null) {
      const fromX = Math.max(0, x(this.levels.lockAt ?? t0));
      paintHolding(frame, { side: position.side, strikeY, fromX, headX: head.x, bottom });
    }
    paintLine(frame, series, x, y, strikeY, bottom, head);
    paintPrints(frame, this.prints, x, y, t0);
    if (strikeY !== null && strike !== null) paintStrike(frame, strikeY, right, strike);
    const up = strike === null ? null : this.shown >= strike;
    const fill = up === null ? palette.ink : up ? palette.up : palette.down;
    const ink = up === null ? palette.ground : up ? palette.upInk : palette.downInk;
    this.paintHead(head.x, head.y, up === null ? palette.ink : up ? palette.upLine : palette.downLine, clock);
    const text = USD.format(this.shown);
    if (!this.roll || this.roll.to !== text) this.roll = { from: this.roll?.to ?? text, to: text, at: clock };
    paintPill(frame, this.roll, head.y, right, { fill, ink }, clock);
    if (position && strike !== null) {
      const level = this.shown === strike;
      const winning = position.side === 0 ? this.shown > strike : this.shown < strike;
      const mine = position.side === 0 ? palette.up : palette.down;
      const mineInk = position.side === 0 ? palette.upInk : palette.downInk;
      paintStatus(
        frame,
        level
          ? { text: "LEVEL", fill: palette.muted, ink: palette.ground }
          : winning
            ? { text: "YOU'RE WINNING", fill: mine, ink: mineInk }
            : { text: "YOU'RE BEHIND", fill: palette.hairline, ink: palette.ink },
        head.y,
        right,
      );
    }
  }

  private easeRange(series: Point[], strike: number | null) {
    let lo = Number.POSITIVE_INFINITY;
    let hi = Number.NEGATIVE_INFINITY;
    for (const point of series) {
      lo = Math.min(lo, point.p);
      hi = Math.max(hi, point.p);
    }
    if (strike !== null) {
      lo = Math.min(lo, strike);
      hi = Math.max(hi, strike);
    }
    const span = Math.max(hi - lo, hi * MIN_SPAN_SHARE);
    const mid = (hi + lo) * HALF;
    const wantMin = mid - span * (HALF + RANGE_PAD);
    const wantMax = mid + span * (HALF + RANGE_PAD);
    if (Number.isNaN(this.yMin)) {
      this.yMin = wantMin;
      this.yMax = wantMax;
      return;
    }
    this.yMin += (wantMin - this.yMin) * EASE_RANGE;
    this.yMax += (wantMax - this.yMax) * EASE_RANGE;
  }

  private paintDots(right: number, bottom: number) {
    const { ctx, palette } = this;
    ctx.save();
    ctx.globalAlpha = DOT_ALPHA;
    ctx.fillStyle = palette.ink;
    for (let gx = DOT_SPACING * HALF; gx < right; gx += DOT_SPACING) {
      for (let gy = DOT_SPACING * HALF; gy < bottom; gy += DOT_SPACING) {
        ctx.beginPath();
        ctx.arc(gx, gy, DOT_RADIUS, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private paintWatermark(right: number, bottom: number) {
    const { ctx, palette } = this;
    const size = Math.min((bottom - PAD_TOP) * WATERMARK_HEIGHT_SHARE, (right * WATERMARK_WIDTH_SHARE) / TWO);
    ctx.save();
    ctx.globalAlpha = WATERMARK_ALPHA;
    ctx.fillStyle = palette.ink;
    ctx.font = `700 ${size}px ${palette.serif}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(WATERMARK, right * HALF, (PAD_TOP + bottom) * HALF);
    ctx.restore();
  }

  private paintGrid(right: number, bottom: number, y: (p: number) => number) {
    const { ctx, palette } = this;
    ctx.save();
    ctx.font = `500 ${AXIS_FONT}px ${palette.mono}`;
    ctx.textBaseline = "middle";
    for (let i = 0; i <= GRID_LINES; i += 1) {
      const price = this.yMax - ((this.yMax - this.yMin) * i) / GRID_LINES;
      const gy = y(price);
      ctx.globalAlpha = GRID_ALPHA;
      ctx.strokeStyle = palette.hairline;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(right, gy);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = palette.muted;
      if (gy > PAD_TOP && gy < bottom) ctx.fillText(USD.format(price), right + LABEL_GAP, gy);
    }
    ctx.restore();
  }

  /** The time still to come, shaded: what the round hasn't decided yet. */
  private paintFuture(headX: number, right: number, bottom: number) {
    if (headX >= right) return;
    const { ctx, palette } = this;
    ctx.save();
    ctx.globalAlpha = FUTURE_ALPHA;
    ctx.fillStyle = palette.ink;
    ctx.fillRect(headX, PAD_TOP, right - headX, bottom - PAD_TOP);
    ctx.restore();
  }

  /** Lock and close: hairline verticals with their times under the plot. */
  private paintMarkers(x: (t: number) => number, bottom: number) {
    const { ctx, palette } = this;
    const marks = [this.levels.lockAt, this.levels.closeAt].filter((at): at is number => typeof at === "number");
    ctx.save();
    ctx.font = `500 ${AXIS_FONT}px ${palette.mono}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (const at of marks) {
      const mx = x(at);
      ctx.strokeStyle = palette.hairline;
      ctx.setLineDash([...DASH]);
      ctx.beginPath();
      ctx.moveTo(mx, PAD_TOP);
      ctx.lineTo(mx, bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = palette.muted;
      ctx.fillText(TIME.format(at), mx, bottom + LABEL_GAP);
    }
    ctx.restore();
  }

  private paintHead(hx: number, hy: number, color: string, clock: number) {
    const { ctx } = this;
    const phase = (clock % PULSE_MS) / PULSE_MS;
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = PULSE_ALPHA * (1 - phase);
    ctx.beginPath();
    ctx.arc(hx, hy, HEAD_RADIUS + (PULSE_RADIUS - HEAD_RADIUS) * phase, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(hx, hy, HEAD_RADIUS, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}
