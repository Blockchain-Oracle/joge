import type { TicketRow } from "../portfolio/ticket-row.tsx";
import { progressAt, type Story, storyOf } from "../replay/story.ts";
import { drawStory } from "../replay/story-film.tsx";
import { drawMark, drawQr, type Fonts, fit, HALF, NIGHT, PAPER, shortUrl, TAU, TWO, WEIGHT } from "./paint-kit.ts";
import { FILM_PALETTE } from "./replay-video.ts";

/** A player's run over a period, in words (amounts masked when hidden). */
export interface RunWords {
  url: string;
  period: string;
  dates: string;
  net: string;
  /** The net's sign, for its colour: 1 up, -1 down, 0 even. */
  sign: number;
  sub: string;
  rounds: string;
  right: string;
  best: string;
  /** The running net part-way through the film (sats in, words out). */
  netAt: (sats: number) => string;
}

const DAY_MS = 86_400_000;
const WEEK_DAYS = 7;

export const RUN_PERIODS = {
  today: { label: "Today", ms: DAY_MS },
  week: { label: "Last 7 days", ms: WEEK_DAYS * DAY_MS },
  all: { label: "All time", ms: Number.POSITIVE_INFINITY },
} as const;
export type RunPeriod = keyof typeof RUN_PERIODS;

/** Decided tickets inside the period (today = since local midnight). */
export function runRows(rows: TicketRow[], period: RunPeriod, nowMs: number): TicketRow[] {
  const decided = rows.filter((row) => ["won", "lost", "refunded"].includes(row.ticket.status));
  if (period === "all") return decided;
  const midnight = new Date(nowMs);
  midnight.setHours(0, 0, 0, 0);
  const from = period === "today" ? midnight.getTime() : nowMs - RUN_PERIODS[period].ms;
  return decided.filter((row) => row.round.closeTime * MS_PER_SECOND >= from);
}

const MS_PER_SECOND = 1_000;

export const RUN = {
  frame: { w: 1080, h: 1350 },
  card: { x: 72, y: 72, w: 936, h: 1206, radius: 40, pad: 64, edge: 2 },
  brand: { mark: 60, wordSize: 46, base: 112, markDrop: 8, gap: 16 },
  period: { size: 24, base: 98, datesBase: 132 },
  label: { size: 26, base: 236 },
  net: { size: 168, min: 96, base: 400, maxW: 808 },
  sub: { size: 30, base: 456 },
  stats: { top: 540, labelSize: 22, valueSize: 40, valueBase: 596, columns: 3 },
  chart: { top: 650, h: 330 },
  perforation: { y: 1030, notch: 26, dash: 14, width: 3 },
  stub: {
    headSize: 34,
    headBase: 1110,
    lineSize: 24,
    lineBase: 1152,
    urlBase: 1196,
    qr: 168,
    qrTop: 1068,
    qrRadius: 12,
    qrGap: 32,
    minSize: 16,
  },
} as const;

const GROUND_STEP = 36;
const GROUND_DOT = 2;
const DOT_ALPHA = 0.08;
const NET_TONE = (sign: number) => (sign > 0 ? PAPER.up : sign < 0 ? PAPER.down : PAPER.ink);

/** The story behind a run's chart (null when it has no decided round). */
export const runStory = (rows: TicketRow[]): Story | null => storyOf(rows);

/** Draws the run's chart (the portfolio's story film at film time `t`) into a box on the card. */
function chartInto(
  ctx: CanvasRenderingContext2D,
  story: Story,
  t: number,
  box: { x: number; y: number; w: number; h: number },
) {
  const plot = document.createElement("canvas");
  plot.width = box.w;
  plot.height = box.h;
  const plotCtx = plot.getContext("2d");
  if (!plotCtx) return;
  plotCtx.setTransform(TWO, 0, 0, TWO, 0, 0);
  drawStory(plotCtx, story, t, box.w / TWO, box.h / TWO, FILM_PALETTE);
  ctx.drawImage(plot, box.x, box.y, box.w, box.h);
}

/**
 * The run card (a PnL snapshot in the receipt's dark ticket): the period, the net as one big
 * figure in its colour, the return on what was staked, rounds · right · best, the running net round by round, and a
 * stub with a QR to the player's record. `t` draws the chart part-way (the video); the image passes the end.
 */
export function drawRun(ctx: CanvasRenderingContext2D, story: Story, words: RunWords, fonts: Fonts, t = story.totalMs) {
  const { frame, card } = RUN;
  ctx.fillStyle = NIGHT.ground;
  ctx.fillRect(0, 0, frame.w, frame.h);
  ctx.save();
  ctx.globalAlpha = DOT_ALPHA;
  ctx.fillStyle = NIGHT.ink;
  for (let x = GROUND_STEP * HALF; x < frame.w; x += GROUND_STEP)
    for (let y = GROUND_STEP * HALF; y < frame.h; y += GROUND_STEP) ctx.fillRect(x, y, GROUND_DOT, GROUND_DOT);
  ctx.restore();

  ctx.save();
  ctx.translate(card.x, card.y);
  ctx.fillStyle = PAPER.paper;
  ctx.beginPath();
  ctx.roundRect(0, 0, card.w, card.h, card.radius);
  ctx.fill();
  ctx.strokeStyle = PAPER.edge;
  ctx.lineWidth = card.edge;
  ctx.stroke();
  const left = card.pad;
  const right = card.w - card.pad;
  const width = right - left;

  const { brand, period, label, net, sub, stats, chart, perforation, stub } = RUN;
  drawMark(ctx, left, brand.base - brand.mark + brand.markDrop, brand.mark);
  ctx.fillStyle = PAPER.ink;
  ctx.textBaseline = "alphabetic";
  ctx.font = `${WEIGHT.bold} ${brand.wordSize}px ${fonts.display}`;
  ctx.fillText("Jōge", left + brand.mark + brand.gap, brand.base);
  ctx.textAlign = "right";
  ctx.font = `${WEIGHT.mono} ${period.size}px ${fonts.mono}`;
  ctx.fillText(words.period.toUpperCase(), right, period.base);
  ctx.fillStyle = PAPER.muted;
  ctx.fillText(words.dates, right, period.datesBase);
  ctx.textAlign = "left";

  // The net counts with the film: the running total of the beats landed so far.
  const landed = progressAt(story, t).landed;
  const done = landed >= story.beats.length;
  ctx.font = `${WEIGHT.mono} ${label.size}px ${fonts.mono}`;
  ctx.fillStyle = PAPER.muted;
  ctx.fillText(done ? "MY RUN" : `ROUND ${landed} OF ${story.beats.length}`, left, label.base);
  const running = story.beats[landed - 1]?.total ?? 0;
  const shown = done ? words.net : words.netAt(running);
  ctx.fillStyle = NET_TONE(done ? words.sign : Math.sign(running));
  fit(ctx, shown, WEIGHT.bold, net.size, net.min, fonts.display, net.maxW);
  ctx.fillText(shown, left, net.base);
  ctx.font = `${WEIGHT.mono} ${sub.size}px ${fonts.mono}`;
  ctx.fillStyle = PAPER.muted;
  if (words.sub) ctx.fillText(words.sub, left, sub.base);

  const column = width / stats.columns;
  const rows: Array<[string, string]> = [
    ["ROUNDS", words.rounds],
    ["RIGHT", words.right],
    ["BEST", words.best],
  ];
  for (const [index, [title, value]] of rows.entries()) {
    const x = left + column * index;
    ctx.font = `${WEIGHT.mono} ${stats.labelSize}px ${fonts.mono}`;
    ctx.fillStyle = PAPER.muted;
    ctx.fillText(title, x, stats.top);
    ctx.font = `${WEIGHT.strong} ${stats.valueSize}px ${fonts.display}`;
    ctx.fillStyle = PAPER.ink;
    ctx.fillText(value, x, stats.valueBase);
  }

  chartInto(ctx, story, t, { x: left, y: chart.top, w: width, h: chart.h });

  ctx.strokeStyle = PAPER.hairline;
  ctx.lineWidth = perforation.width;
  ctx.setLineDash([perforation.dash, perforation.dash]);
  ctx.beginPath();
  ctx.moveTo(perforation.notch * TWO, perforation.y);
  ctx.lineTo(card.w - perforation.notch * TWO, perforation.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = NIGHT.ground;
  for (const x of [0, card.w]) {
    ctx.beginPath();
    ctx.arc(x, perforation.y, perforation.notch, 0, TAU);
    ctx.fill();
  }

  ctx.fillStyle = PAPER.ink;
  ctx.font = `${WEIGHT.strong} ${stub.headSize}px ${fonts.display}`;
  ctx.fillText("Up or down, every 5 minutes", left, stub.headBase);
  ctx.font = `${WEIGHT.mono} ${stub.lineSize}px ${fonts.mono}`;
  ctx.fillStyle = PAPER.muted;
  ctx.fillText("No house. Settled on Bitcoin Cash.", left, stub.lineBase);
  ctx.fillStyle = PAPER.ink;
  fit(ctx, shortUrl(words.url), WEIGHT.mono, stub.lineSize, stub.minSize, fonts.mono, width - stub.qr - stub.qrGap);
  ctx.fillText(shortUrl(words.url), left, stub.urlBase);
  drawQr(ctx, words.url, right - stub.qr, stub.qrTop, stub.qr, stub.qrRadius);
  ctx.restore();
}
