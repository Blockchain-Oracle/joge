/**
 * Jōge's chart: one canvas, one price against one price to beat.
 *
 * The price is eased toward each live tick at 60 Hz and sampled into a time series; the x axis is either a rolling
 * window (a round taking entries) or the round's own lock → close (a live round: the line travels toward the close,
 * then stops). One 2 px line, grey until the round has its opening price, then green above it and red below, with a
 * soft wash between line and target. Signed oracle prices are hollow dots, event range boundaries dotted levels.
 * Colours and type come from the page's tokens and follow the world; the loop runs only while the canvas is on screen
 * and the tab is visible.
 */

import { type Colors, defaultFormat, readColors } from "./colors.ts";
import {
  AXIS_W,
  DEFAULT_SPAN_MS,
  EASE_PRICE,
  EASE_RANGE,
  GRID_LINES,
  HALF_STEPS,
  MAX_POINTS,
  MIN_SAMPLE_MS,
  PAD_TOP,
  PULSE_MS,
  RANGE_MARGIN,
  STEP_FRACTION,
  TAIL_FRACTION,
  TIME_H,
  TIME_LABEL_EVERY_PX,
} from "./constants.ts";
import { attachHover, watchBox } from "./input.ts";
import { axisWidthFor, paintAxis, paintPill } from "./paint.ts";
import {
  lineColor,
  paintHead,
  paintLevels,
  paintLine,
  paintMarker,
  paintPrints,
  paintReadout,
  paintTail,
  paintTimes,
  paintWash,
  type Scene,
  sideOf,
  type XY,
} from "./paint-round.ts";
import { defaultTime } from "./time.ts";
import type { ChartOptions, ChartWindow, Point, RoundLevels, TimeFormat } from "./types.ts";

const DEFAULT_WINDOW: ChartWindow = { kind: "rolling", spanMs: DEFAULT_SPAN_MS };

export class PriceChart {
  private readonly box: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly colorRoot: Element | undefined;
  private readonly format: (price: number) => string;
  private readonly formatTime: TimeFormat;
  private readonly cleanups: (() => void)[] = [];
  private colors: Colors;
  private window: ChartWindow;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private visible = true;
  private frame = 0;
  private axisW = AXIS_W;

  private samples: Point[] = [];
  private prints: Point[] = [];
  private target = Number.NaN;
  private shown = Number.NaN;
  private lastSampleAt = 0;
  private center = Number.NaN;
  private half = 0;
  private levels: RoundLevels = {};
  private hover: XY | null = null;

  constructor(box: HTMLElement, options: ChartOptions = {}) {
    this.box = box;
    this.format = options.format ?? defaultFormat;
    this.formatTime = options.formatTime ?? defaultTime;
    this.window = options.window ?? DEFAULT_WINDOW;
    this.colorRoot = options.colorsFrom;
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y;";
    box.appendChild(this.canvas);
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("no 2D canvas");
    this.ctx = ctx;
    this.colors = readColors(this.colorRoot);
    this.cleanups.push(
      watchBox(box, {
        onResize: () => this.resize(),
        onVisible: (visible) => {
          this.visible = visible;
        },
        onRepaint: (themeChanged) => {
          if (themeChanged) this.colors = readColors(this.colorRoot);
        },
      }),
      attachHover(this.canvas, (at) => {
        this.hover = at;
      }),
    );
    this.resize();
    this.loop();
  }

  // ── public API ──

  setWindow(window: ChartWindow) {
    this.window = window;
  }

  /** Replaces the line's past (indicative ticks or oracle prints) and starts the live line from its last point. */
  setHistory(points: Point[]) {
    const sorted = [...points].filter((point) => Number.isFinite(point.p)).sort((a, b) => a.t - b.t);
    const step = this.sampleMs();
    this.samples = [];
    for (const point of sorted) {
      const last = this.samples.at(-1);
      if (last && point.t - last.t < step) last.p = point.p;
      else this.samples.push({ ...point });
    }
    const last = this.samples.at(-1);
    if (last) {
      this.shown = last.p;
      this.target = Number.isNaN(this.target) ? last.p : this.target;
      this.lastSampleAt = last.t;
    }
  }

  /** A live tick: the line eases toward it. */
  pushPrice(price: number) {
    if (!Number.isFinite(price)) return;
    this.target = price;
    if (Number.isNaN(this.shown)) this.shown = price;
  }

  /** Signed oracle prints (replaces); each is a dot on the line. */
  setPrints(prints: Point[]) {
    this.prints = [...prints].sort((a, b) => a.t - b.t);
  }

  pushPrint(print: Point) {
    if (!this.prints.some((known) => known.t === print.t)) this.prints.push(print);
  }

  setLevels(levels: RoundLevels) {
    this.levels = levels;
  }

  /** Forgets every price: the next tick starts a new market's line. */
  reset() {
    this.samples = [];
    this.prints = [];
    this.target = Number.NaN;
    this.shown = Number.NaN;
    this.center = Number.NaN;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    for (const cleanup of this.cleanups) cleanup();
    this.canvas.remove();
  }

  // ── plumbing ──

  private resize() {
    const rect = this.box.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
  }

  private span(now: number): { from: number; to: number } {
    return this.window.kind === "rolling"
      ? { from: now - this.window.spanMs, to: now }
      : { from: this.window.from, to: this.window.to };
  }

  private sampleMs() {
    const { from, to } = this.span(Date.now());
    return Math.max(MIN_SAMPLE_MS, (to - from) / MAX_POINTS);
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible || document.hidden) return;
    this.frame += 1;
    this.step(Date.now());
    this.draw(Date.now());
  };

  /** Eases the shown price, samples it into the series (inside the window only), and drops what scrolled away. */
  private step(now: number) {
    if (Number.isNaN(this.target)) return;
    this.shown += (this.target - this.shown) * EASE_PRICE;
    const { from, to } = this.span(now);
    if (now <= to && now - this.lastSampleAt >= this.sampleMs()) {
      this.samples.push({ t: now, p: this.shown });
      this.lastSampleAt = now;
    }
    const keepFrom = from - this.sampleMs();
    const firstKept = this.samples.findIndex((sample) => sample.t >= keepFrom);
    if (firstKept > 0) this.samples.splice(0, firstKept);
  }

  private plotW() {
    return this.w - this.axisW;
  }

  private plotH() {
    return this.h - TIME_H;
  }

  /** The price range follows the line (and always includes the opening line and range boundaries), eased. */
  private easeRange(visible: Point[]) {
    // The price the view is built around: the live price, else a finished round's last point, else its opening line.
    const anchor = [this.shown, visible.at(-1)?.p, this.levels.strike].find(
      (price): price is number => typeof price === "number" && Number.isFinite(price),
    );
    if (anchor === undefined) return false;
    const prices = [...visible.map((point) => point.p), anchor];
    if (this.levels.strike) prices.push(this.levels.strike);
    for (const boundary of this.levels.boundaries ?? []) prices.push(boundary);
    const finite = prices.filter(Number.isFinite);
    const lo = Math.min(...finite);
    const hi = Math.max(...finite);
    const wantHalf = Math.max(anchor * STEP_FRACTION * HALF_STEPS, ((hi - lo) / 2) * RANGE_MARGIN);
    const wantCenter = (hi + lo) / 2;
    if (!Number.isFinite(this.center) || !Number.isFinite(this.half)) {
      this.center = wantCenter;
      this.half = wantHalf;
    }
    this.half += (wantHalf - this.half) * EASE_RANGE;
    this.center += (wantCenter - this.center) * EASE_RANGE;
    return true;
  }

  private draw(now: number) {
    const { ctx, colors } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    if (Number.isFinite(this.shown)) {
      this.axisW = Math.max(AXIS_W, axisWidthFor(ctx, colors, this.format(this.shown)));
    }
    const rolling = this.window.kind === "rolling";
    const plotW = this.plotW();
    const plotH = this.plotH();
    const { from, to } = this.span(now);
    const xOf = (t: number) => ((t - from) / (to - from || 1)) * plotW;
    const sampledAll = this.samples.filter((sample) => sample.t >= from && sample.t <= to);
    const signed = this.prints.filter((print) => print.t >= from && print.t <= to);
    // A finished round settles on the first signed price at or after its close: pin it to the flag so the line ends
    // exactly where the round was decided.
    const settling = this.window.kind === "fixed" && now > to ? this.prints.find((print) => print.t >= to) : undefined;
    if (settling) signed.push({ t: to, p: settling.p });
    // One continuous line: through the signed prices until the live ticks begin, then the ticks; a finished round
    // always ends on its settling price. Without ticks, the signed prices alone draw it: they are what settled it.
    const firstTick = sampledAll[0]?.t ?? Number.POSITIVE_INFINITY;
    const visible = [...signed.filter((print) => print.t < firstTick), ...sampledAll];
    if (settling && visible.at(-1)?.t !== to) visible.push({ t: to, p: settling.p });
    const ready = this.easeRange(visible);
    const yOf = (price: number) =>
      plotH - PAD_TOP - ((price - (this.center - this.half)) / (2 * this.half || 1)) * (plotH - 2 * PAD_TOP);
    const scene: Scene = { ctx, colors, plotW, plotH, yOf, format: this.format };
    const { strike, boundaries = [], lockAt, closeAt } = this.levels;
    const live = now <= to;
    const lastPoint = visible.at(-1)?.p ?? Number.NaN;
    const headPrice = live && Number.isFinite(this.shown) ? this.shown : lastPoint;
    const side = ready ? sideOf(headPrice, strike) : null;

    if (!ready) return;

    // Gridlines and times first, then the moments, then the wash, the line and the target over them.
    paintAxis(ctx, colors, plotW, this.center - this.half, this.center + this.half, GRID_LINES, yOf, this.format);
    paintTimes(scene, from, to, TIME_H, TIME_LABEL_EVERY_PX, this.formatTime);
    // A round's own window starts at its lock, so the lock needs no chip there; the close keeps one (to the minute).
    const minute = (ms: number) => this.formatTime(ms, to - from).replace(/:00$/, "");
    if (lockAt && (rolling || lockAt > from)) paintMarker(scene, xOf(lockAt), `Lock ${minute(lockAt)}`, "right");
    if (closeAt) paintMarker(scene, xOf(closeAt), `Close ${minute(closeAt)}`, "left");

    const points: XY[] = visible.map((sample) => ({ x: xOf(sample.t), y: yOf(sample.p) }));
    if (live && points.length > 0 && Number.isFinite(headPrice)) points.push({ x: xOf(now), y: yOf(headPrice) });
    const color = lineColor(colors, side);
    paintWash(scene, points, strike);
    paintLine(scene, points, color);
    if (rolling) paintTail(ctx, plotW, plotH, TAIL_FRACTION);
    paintLevels(scene, strike, boundaries);
    paintPrints(
      scene,
      signed.map((print) => ({ x: xOf(print.t), y: yOf(print.p) })),
    );
    const head = points.at(-1);
    if (head) {
      paintHead(scene, head, color, live ? (performance.now() % PULSE_MS) / PULSE_MS : 0);
      const face = side === "up" ? colors.up : side === "down" ? colors.down : colors.neutral;
      const ink = side === "up" ? colors.upInk : side === "down" ? colors.downInk : colors.ground;
      paintPill(ctx, colors, plotW, this.axisW, head.y, this.format(headPrice), face, ink);
    }
    this.drawHover(scene, visible, xOf, from, to);
  }

  private drawHover(scene: Scene, visible: Point[], xOf: (t: number) => number, from: number, to: number) {
    if (!this.hover || this.hover.x > scene.plotW || visible.length === 0) return;
    const hoverX = this.hover.x;
    const nearest = visible.reduce((best, sample) =>
      Math.abs(xOf(sample.t) - hoverX) < Math.abs(xOf(best.t) - hoverX) ? sample : best,
    );
    const at = { x: xOf(nearest.t), y: scene.yOf(nearest.p) };
    paintReadout(scene, at, `${this.formatTime(nearest.t, to - from)}  ${this.format(nearest.p)}`);
  }
}
