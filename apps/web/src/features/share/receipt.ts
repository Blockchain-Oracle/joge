import type { Film } from "../replay/film.ts";
import {
  drawMark,
  drawQr,
  drawSeal,
  type Fonts,
  fit,
  HALF,
  NIGHT,
  PAPER,
  shortUrl,
  TAU,
  TWO,
  WEIGHT,
} from "./paint-kit.ts";

/** Everything a receipt or a replay says, already in words (amounts masked when hidden). */
export interface ShareWords {
  url: string;
  assetName: string;
  lane: string;
  window: string;
  date: string;
  side: 0 | 1;
  verdict: "hit" | "miss" | "void";
  /** The headline figure: the net in dollars, or the return when amounts are hidden. */
  headline: string;
  /** Under it: the return and what came back, or nothing when hidden. */
  subline: string;
  stake: string;
  back: string;
  pot: string;
  entrants: number;
  line: string | null;
  close: string | null;
}

export const RECEIPT = {
  frame: { w: 1080, h: 1350 },
  paper: { x: 72, y: 72, w: 936, h: 1206, radius: 40, pad: 64, edge: 2 },
  brand: { mark: 60, wordSize: 46, base: 112, markDrop: 8, gap: 16 },
  folio: { size: 24, base: 104 },
  market: { coin: 72, top: 176, nameSize: 40, nameBase: 210, subSize: 26, subBase: 248 },
  verdict: { labelSize: 26, labelBase: 342, size: 150, min: 96, base: 486, subSize: 30, subBase: 540, maxW: 560 },
  seal: { cx: 790, cy: 420, size: 196 },
  chart: {
    top: 590,
    h: 250,
    line: 4,
    dash: 12,
    dot: 9,
    tagSize: 22,
    tagGap: 12,
    closeAbove: 18,
    closeBelow: 34,
    pad: 0.18,
    flat: 0.001,
  },
  facts: { top: 892, labelSize: 22, valueSize: 34, valueBase: 962, gutter: 16 },
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

const SEAL_WORD = { hit: "的中", miss: "外れ", void: "無効" } as const;
const VERDICT_LABEL = { hit: "WON", miss: "NOT THIS TIME", void: "REFUNDED · NOBODY TOOK THE OTHER SIDE" } as const;
const PAPER_TONE = { hit: PAPER.up, miss: PAPER.down, void: PAPER.gold } as const;
const FACT_COLUMNS = 3;
const GROUND_DOT = 2;
const GROUND_STEP = 36;
const DOT_ALPHA = 0.08;

/**
 * The receipt (Senryo's slip, Kakure's stub, Mitoshi's ticket, in the app's night): a fixed object in either world — the brand and the
 * round's folio, the market, the result as one big figure with its seal pressed in, the round's line against the price
 * to beat, three facts, a perforation, and a stub that says where it settled with a QR to the round.
 */
export function drawReceipt(
  ctx: CanvasRenderingContext2D,
  film: Film,
  words: ShareWords,
  fonts: Fonts,
  coin: CanvasImageSource,
) {
  const { frame, paper } = RECEIPT;
  ctx.fillStyle = NIGHT.ground;
  ctx.fillRect(0, 0, frame.w, frame.h);
  ctx.save();
  ctx.globalAlpha = DOT_ALPHA;
  ctx.fillStyle = NIGHT.ink;
  for (let x = GROUND_STEP * HALF; x < frame.w; x += GROUND_STEP)
    for (let y = GROUND_STEP * HALF; y < frame.h; y += GROUND_STEP) ctx.fillRect(x, y, GROUND_DOT, GROUND_DOT);
  ctx.restore();

  ctx.save();
  ctx.translate(paper.x, paper.y);
  ctx.fillStyle = PAPER.paper;
  ctx.beginPath();
  ctx.roundRect(0, 0, paper.w, paper.h, paper.radius);
  ctx.fill();
  ctx.strokeStyle = PAPER.edge;
  ctx.lineWidth = paper.edge;
  ctx.stroke();
  const left = paper.pad;
  const right = paper.w - paper.pad;
  const width = right - left;

  // Brand and folio.
  const { brand, folio } = RECEIPT;
  drawMark(ctx, left, brand.base - brand.mark + brand.markDrop, brand.mark);
  ctx.fillStyle = PAPER.ink;
  ctx.font = `800 ${brand.wordSize}px ${fonts.display}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Jōge", left + brand.mark + brand.gap, brand.base);
  ctx.font = `600 ${folio.size}px ${fonts.mono}`;
  ctx.fillStyle = PAPER.muted;
  ctx.textAlign = "right";
  ctx.fillText(words.date, right, folio.base);
  ctx.textAlign = "left";

  // Market.
  const { market } = RECEIPT;
  ctx.drawImage(coin, left, market.top, market.coin, market.coin);
  ctx.fillStyle = PAPER.ink;
  ctx.font = `700 ${market.nameSize}px ${fonts.display}`;
  ctx.fillText(`${words.assetName} · ${words.lane}`, left + market.coin + 24, market.nameBase);
  ctx.font = `600 ${market.subSize}px ${fonts.mono}`;
  ctx.fillStyle = PAPER.muted;
  ctx.fillText(
    `${words.window} · ${words.side === 0 ? "▲ Up" : "▼ Down"} call`,
    left + market.coin + 24,
    market.subBase,
  );

  // The result.
  const { verdict } = RECEIPT;
  const tone = PAPER_TONE[words.verdict];
  ctx.font = `600 ${verdict.labelSize}px ${fonts.mono}`;
  ctx.fillStyle = tone;
  ctx.fillText(VERDICT_LABEL[words.verdict], left, verdict.labelBase);
  fit(ctx, words.headline, WEIGHT.bold, verdict.size, verdict.min, fonts.display, verdict.maxW);
  ctx.fillText(words.headline, left, verdict.base);
  if (words.subline) {
    ctx.font = `600 ${verdict.subSize}px ${fonts.mono}`;
    ctx.fillStyle = PAPER.muted;
    ctx.fillText(words.subline, left, verdict.subBase);
  }
  const { seal } = RECEIPT;
  drawSeal(ctx, SEAL_WORD[words.verdict], seal.cx, seal.cy, seal.size, PAPER.vermilion, fonts.serif);

  paperChart(ctx, film, words, fonts, { x: left, y: RECEIPT.chart.top, w: width, h: RECEIPT.chart.h });

  // Three facts.
  const { facts } = RECEIPT;
  const column = width / FACT_COLUMNS;
  const rows: Array<[string, string]> = [
    ["YOUR CALL", `${words.side === 0 ? "Up" : "Down"} ${words.stake}`],
    ["CAME BACK", words.back],
    ["POT", `${words.pot} · ${words.entrants} in`],
  ];
  for (const [index, [label, value]] of rows.entries()) {
    const x = left + column * index;
    ctx.font = `600 ${facts.labelSize}px ${fonts.mono}`;
    ctx.fillStyle = PAPER.muted;
    ctx.fillText(label, x, facts.top);
    fit(ctx, value, WEIGHT.strong, facts.valueSize, facts.labelSize, fonts.display, column - facts.gutter);
    ctx.fillStyle = PAPER.ink;
    ctx.fillText(value, x, facts.valueBase);
  }

  // Perforation, with notches cut from both edges.
  const { perforation } = RECEIPT;
  ctx.strokeStyle = PAPER.hairline;
  ctx.lineWidth = perforation.width;
  ctx.setLineDash([perforation.dash, perforation.dash]);
  ctx.beginPath();
  ctx.moveTo(perforation.notch * TWO, perforation.y);
  ctx.lineTo(paper.w - perforation.notch * TWO, perforation.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = NIGHT.ground;
  for (const x of [0, paper.w]) {
    ctx.beginPath();
    ctx.arc(x, perforation.y, perforation.notch, 0, TAU);
    ctx.fill();
  }

  // The stub.
  const { stub } = RECEIPT;
  ctx.fillStyle = PAPER.ink;
  ctx.font = `700 ${stub.headSize}px ${fonts.display}`;
  ctx.fillText("Settled on Bitcoin Cash", left, stub.headBase);
  ctx.font = `600 ${stub.lineSize}px ${fonts.mono}`;
  ctx.fillStyle = PAPER.muted;
  ctx.fillText("No house. Anyone can check the proof.", left, stub.lineBase);
  ctx.fillStyle = PAPER.ink;
  fit(ctx, shortUrl(words.url), WEIGHT.mono, stub.lineSize, stub.minSize, fonts.mono, width - stub.qr - stub.qrGap);
  ctx.fillText(shortUrl(words.url), left, stub.urlBase);
  drawQr(ctx, words.url, right - stub.qr, stub.qrTop, stub.qr, stub.qrRadius);
  ctx.restore();
}

/** The round on the card: the price against the line to beat, in Up's lime above it and Down's coral below. */
function paperChart(
  ctx: CanvasRenderingContext2D,
  film: Film,
  words: ShareWords,
  fonts: Fonts,
  box: { x: number; y: number; w: number; h: number },
) {
  const { chart } = RECEIPT;
  const points = film.times.map((t, i) => [t, film.prices[i] ?? 0] as const).filter(([t]) => t >= film.lockMs);
  if (points.length < TWO) return;
  const strike = film.strike ?? points[0]?.[1] ?? 0;
  const values = [...points.map(([, p]) => p), strike];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = (hi - lo || hi * chart.flat) * chart.pad;
  const x = (t: number) => box.x + ((t - film.lockMs) / Math.max(1, film.closeMs - film.lockMs)) * box.w;
  const y = (p: number) => box.y + (1 - (p - (lo - pad)) / (hi - lo + pad * TWO)) * box.h;
  const sy = y(strike);

  ctx.save();
  ctx.strokeStyle = PAPER.muted;
  ctx.lineWidth = 2;
  ctx.setLineDash([chart.dash, chart.dash]);
  ctx.beginPath();
  ctx.moveTo(box.x, sy);
  ctx.lineTo(box.x + box.w, sy);
  ctx.stroke();
  ctx.setLineDash([]);
  const path = new Path2D();
  for (const [i, [t, p]] of points.entries()) {
    if (i === 0) path.moveTo(x(t), y(p));
    else path.lineTo(x(t), y(p));
  }
  ctx.lineWidth = chart.line;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (const [top, height, color] of [
    [box.y - chart.line, sy - box.y + chart.line, PAPER.up],
    [sy, box.y + box.h - sy + chart.line, PAPER.down],
  ] as const) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x - chart.dot, top, box.w + chart.dot * TWO, height);
    ctx.clip();
    ctx.strokeStyle = color;
    ctx.stroke(path);
    ctx.restore();
  }
  const last = points.at(-1);
  if (last) {
    ctx.fillStyle = last[1] >= strike ? PAPER.up : PAPER.down;
    ctx.beginPath();
    ctx.arc(x(last[0]), y(last[1]), chart.dot, 0, TAU);
    ctx.fill();
  }
  ctx.font = `600 ${chart.tagSize}px ${fonts.mono}`;
  ctx.fillStyle = PAPER.muted;
  if (words.line) ctx.fillText(`LINE ${words.line}`, box.x, sy - chart.tagGap);
  if (words.close && last) {
    ctx.textAlign = "right";
    ctx.fillStyle = PAPER.ink;
    const above = last[1] >= strike;
    ctx.fillText(`CLOSE ${words.close}`, box.x + box.w, y(last[1]) + (above ? -chart.closeAbove : chart.closeBelow));
  }
  ctx.restore();
}
