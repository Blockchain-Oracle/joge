import { attachHover, watchBox } from "../input.ts";
import { HALF, type Palette, readPalette, TAU, TIME, TWO, USD } from "../round/paint.ts";
import {
  AREA_ALPHA,
  AXIS_FONT,
  AXIS_W,
  BODY_SHARE,
  CARD_FONT,
  CARD_LINE,
  CARD_PAD,
  CARD_RADIUS,
  COLOR_POLL_MS,
  CROSS_ALPHA,
  DASH,
  DOT_ALPHA,
  DOT_RADIUS,
  DOT_SPACING,
  FADE_MS,
  GRID_ALPHA,
  GRID_LINES,
  LABEL_GAP,
  LINE_WIDTH,
  LIVE_LINE_ALPHA,
  MAX_DPR,
  MIN_BODY_H,
  MIN_SPAN_SHARE,
  PAD_BOTTOM,
  PAD_TOP,
  PILL_FONT,
  PILL_H,
  PILL_PAD,
  PILL_RADIUS,
  RANGE_PAD,
  TIME_LABELS,
  WATERMARK,
  WATERMARK_ALPHA,
  WATERMARK_HEIGHT_SHARE,
  WATERMARK_WIDTH_SHARE,
  WICK_W,
} from "./constants.ts";

/** One bucket of prices: its start (Unix ms) and open, high, low, close. */
export interface CandlePoint {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

export type CandleStyle = "candles" | "line";

/**
 * Price history on a canvas (Kakure's candle view, Mitoshi-ZEC's line mode): candles or a line of closes over the same
 * dot grid, axis and pill as the live round chart. The last candle keeps moving with the live price; hovering shows a
 * crosshair and that bucket's open, high, low and close. Switching style crossfades.
 */
export class CandleChart {
  private readonly box: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly cleanups: Array<() => void> = [];
  private palette: Palette;
  private candles: CandlePoint[] = [];
  private bucketMs = 0;
  private style: CandleStyle = "candles";
  private fadeFrom = 0;
  private hover: { x: number; y: number } | null = null;
  private w = 0;
  private h = 0;
  private raf = 0;
  private visible = true;

  constructor(box: HTMLElement) {
    this.box = box;
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y;";
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
      attachHover(this.canvas, (at) => {
        this.hover = at;
      }),
    );
    const poll = setInterval(() => {
      this.palette = readPalette(box);
    }, COLOR_POLL_MS);
    this.cleanups.push(() => clearInterval(poll));
    this.resize();
    this.raf = requestAnimationFrame(this.frame);
  }

  setCandles(candles: CandlePoint[], bucketMs: number) {
    this.candles = [...candles].sort((a, b) => a.t - b.t);
    this.bucketMs = bucketMs;
  }

  setStyle(style: CandleStyle) {
    if (style === this.style) return;
    this.style = style;
    this.fadeFrom = performance.now();
  }

  /** The live price moves the last candle, or opens the next bucket once its time has come. */
  pushPrice(price: number) {
    if (!Number.isFinite(price) || this.bucketMs === 0) return;
    const bucket = Math.floor(Date.now() / this.bucketMs) * this.bucketMs;
    const last = this.candles.at(-1);
    if (last && last.t === bucket) {
      last.c = price;
      last.h = Math.max(last.h, price);
      last.l = Math.min(last.l, price);
    } else if (!last || bucket > last.t) {
      this.candles.push({ t: bucket, o: last?.c ?? price, h: price, l: price, c: price });
    }
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

  private readonly frame = (clock: number) => {
    this.raf = requestAnimationFrame(this.frame);
    if (!this.visible || document.hidden) return;
    this.draw(clock);
  };

  private draw(clock: number) {
    const { ctx, w, h, candles } = this;
    ctx.clearRect(0, 0, w, h);
    const right = w - AXIS_W;
    const bottom = h - PAD_BOTTOM;
    this.paintDots(right, bottom);
    this.paintWatermark(right, bottom);
    const last = candles.at(-1);
    if (!last) return;

    let lo = Number.POSITIVE_INFINITY;
    let hi = Number.NEGATIVE_INFINITY;
    for (const candle of candles) {
      lo = Math.min(lo, this.style === "line" ? candle.c : candle.l);
      hi = Math.max(hi, this.style === "line" ? candle.c : candle.h);
    }
    const span = Math.max(hi - lo, hi * MIN_SPAN_SHARE);
    const mid = (hi + lo) * HALF;
    const yMin = mid - span * (HALF + RANGE_PAD);
    const yMax = mid + span * (HALF + RANGE_PAD);
    const y = (p: number) => PAD_TOP + ((yMax - p) / (yMax - yMin)) * (bottom - PAD_TOP);
    const slot = right / candles.length;
    const x = (index: number) => slot * (index + HALF);

    this.paintGrid(right, bottom, y, yMin, yMax);
    this.paintTimes(x, bottom);
    ctx.save();
    ctx.globalAlpha = Math.min(1, (clock - this.fadeFrom) / FADE_MS);
    if (this.style === "candles") this.paintCandles(x, y, slot);
    else this.paintCloses(x, y, bottom);
    ctx.restore();
    this.paintLive(last.c, y(last.c), right);
    this.paintHover(x, y, slot, right, bottom);
  }

  private paintCandles(x: (index: number) => number, y: (p: number) => number, slot: number) {
    const { ctx, palette } = this;
    const body = Math.max(1, slot * BODY_SHARE);
    for (const [index, candle] of this.candles.entries()) {
      const rose = candle.c >= candle.o;
      const color = rose ? palette.upLine : palette.downLine;
      const cx = x(index);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = WICK_W;
      ctx.beginPath();
      ctx.moveTo(cx, y(candle.h));
      ctx.lineTo(cx, y(candle.l));
      ctx.stroke();
      const top = y(Math.max(candle.o, candle.c));
      const height = Math.max(MIN_BODY_H, Math.abs(y(candle.o) - y(candle.c)));
      ctx.fillRect(cx - body * HALF, top, body, height);
    }
  }

  private paintCloses(x: (index: number) => number, y: (p: number) => number, bottom: number) {
    const { ctx, palette, candles } = this;
    const first = candles[0];
    const last = candles.at(-1);
    if (!first || !last) return;
    const color = last.c >= first.o ? palette.upLine : palette.downLine;
    const path = new Path2D();
    for (const [index, candle] of candles.entries()) {
      if (index === 0) path.moveTo(x(index), y(candle.c));
      else path.lineTo(x(index), y(candle.c));
    }
    const area = new Path2D(path);
    area.lineTo(x(candles.length - 1), bottom);
    area.lineTo(x(0), bottom);
    area.closePath();
    ctx.save();
    ctx.globalAlpha *= AREA_ALPHA;
    ctx.fillStyle = color;
    ctx.fill(area);
    ctx.restore();
    ctx.strokeStyle = color;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineJoin = "round";
    ctx.stroke(path);
  }

  /** The live price: a dashed line across and its figure in a pill on the axis. */
  private paintLive(price: number, py: number, right: number) {
    const { ctx, palette } = this;
    ctx.save();
    ctx.globalAlpha = LIVE_LINE_ALPHA;
    ctx.strokeStyle = palette.ink;
    ctx.setLineDash([...DASH]);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(right, py);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.font = `700 ${PILL_FONT}px ${palette.mono}`;
    const text = USD.format(price);
    const width = ctx.measureText(text).width + PILL_PAD * TWO;
    const top = Math.max(0, Math.min(this.h - PILL_H, py - PILL_H * HALF));
    ctx.fillStyle = palette.ink;
    ctx.beginPath();
    ctx.roundRect(right, top, width, PILL_H, PILL_RADIUS);
    ctx.fill();
    ctx.fillStyle = palette.ground;
    ctx.textBaseline = "middle";
    ctx.fillText(text, right + PILL_PAD, top + PILL_H * HALF);
    ctx.restore();
  }

  /** Over a candle: a crosshair and a card with its time and prices. */
  private paintHover(
    x: (index: number) => number,
    y: (p: number) => number,
    slot: number,
    right: number,
    bottom: number,
  ) {
    const { ctx, palette, hover, candles } = this;
    if (!hover || hover.x > right) return;
    const index = Math.min(candles.length - 1, Math.max(0, Math.floor(hover.x / slot)));
    const candle = candles[index];
    if (!candle) return;
    const cx = x(index);
    ctx.save();
    ctx.globalAlpha = CROSS_ALPHA;
    ctx.strokeStyle = palette.ink;
    ctx.setLineDash([...DASH]);
    ctx.beginPath();
    ctx.moveTo(cx, PAD_TOP);
    ctx.lineTo(cx, bottom);
    ctx.moveTo(0, y(candle.c));
    ctx.lineTo(right, y(candle.c));
    ctx.stroke();
    ctx.restore();
    const lines =
      this.style === "candles"
        ? [
            TIME.format(candle.t),
            `O ${USD.format(candle.o)}`,
            `H ${USD.format(candle.h)}`,
            `L ${USD.format(candle.l)}`,
            `C ${USD.format(candle.c)}`,
          ]
        : [TIME.format(candle.t), USD.format(candle.c)];
    ctx.save();
    ctx.font = `600 ${CARD_FONT}px ${palette.mono}`;
    const width = Math.max(...lines.map((line) => ctx.measureText(line).width)) + CARD_PAD * TWO;
    const height = lines.length * CARD_LINE + CARD_PAD * TWO - (CARD_LINE - CARD_FONT);
    const left = cx + CARD_PAD + width < right ? cx + CARD_PAD : cx - CARD_PAD - width;
    ctx.fillStyle = palette.ground;
    ctx.strokeStyle = palette.hairline;
    ctx.beginPath();
    ctx.roundRect(left, PAD_TOP, width, height, CARD_RADIUS);
    ctx.fill();
    ctx.stroke();
    ctx.textBaseline = "top";
    for (const [i, line] of lines.entries()) {
      ctx.fillStyle = i === 0 ? palette.muted : palette.ink;
      ctx.fillText(line, left + CARD_PAD, PAD_TOP + CARD_PAD + i * CARD_LINE);
    }
    ctx.restore();
  }

  private paintTimes(x: (index: number) => number, bottom: number) {
    const { ctx, palette, candles } = this;
    const every = Math.max(1, Math.ceil(candles.length / TIME_LABELS));
    ctx.save();
    ctx.font = `500 ${AXIS_FONT}px ${palette.mono}`;
    ctx.fillStyle = palette.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let index = every - 1; index < candles.length; index += every) {
      const candle = candles[index];
      if (candle) ctx.fillText(TIME.format(candle.t), x(index), bottom + LABEL_GAP);
    }
    ctx.restore();
  }

  private paintGrid(right: number, bottom: number, y: (p: number) => number, yMin: number, yMax: number) {
    const { ctx, palette } = this;
    ctx.save();
    ctx.font = `500 ${AXIS_FONT}px ${palette.mono}`;
    ctx.textBaseline = "middle";
    for (let i = 0; i <= GRID_LINES; i += 1) {
      const price = yMax - ((yMax - yMin) * i) / GRID_LINES;
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
}
