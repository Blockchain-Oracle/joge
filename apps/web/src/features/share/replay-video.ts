import { drawFrame, type Palette as FilmPalette } from "../replay/draw.ts";
import { type Film, HOLD_MS, marketAt, priceAt, resultAt, satsToUsd } from "../replay/film.ts";
import { drawMark, drawQr, drawSeal, type Fonts, fit, HALF, NIGHT, shortUrl, WEIGHT } from "./paint-kit.ts";
import type { ShareWords } from "./receipt.ts";

/**
 * The replay as a video: every frame drawn from the
 * round film at t = i / 30 — the preview and the file are the same drawing, never a screen recording — and encoded
 * with Mediabunny (WebCodecs): H.264 about 6 Mbps at 1080 × 1350 with the film's own sounds as AAC. Where the browser
 * cannot encode H.264 it says so instead of handing over a file other apps refuse.
 */

export const SCENE = {
  frame: { w: 1080, h: 1350 },
  card: { x: 12, y: 12, w: 1056, h: 1154, radius: 60 },
  coin: { x: 48, y: 48, size: 96 },
  name: { x: 168, base: 102, size: 50, min: 36, maxW: 520 },
  sub: { base: 148, size: 26 },
  call: { right: 1032, labelBase: 90, labelSize: 22, base: 142, size: 40 },
  plot: { x: 48, y: 196, w: 984, h: 492 },
  rule: { y: 720 },
  result: { labelBase: 790, labelSize: 26, base: 912, size: 120, min: 80, maxW: 600 },
  price: { right: 1032, labelBase: 790, labelSize: 26, base: 852, size: 40, lineBase: 900, lineSize: 26 },
  stats: { top: 990, labelSize: 24, valueBase: 1046, valueSize: 36, columns: 3 },
  seal: { size: 230, popMs: 220 },
  band: {
    markSize: 64,
    markY: 1216,
    wordX: 132,
    wordBase: 1262,
    wordSize: 54,
    tagBase: 1308,
    tagSize: 26,
    minSize: 16,
    qrGap: 24,
  },
  qr: { x: 888, y: 1188, size: 144, radius: 16 },
} as const;

const SEAL_WORD = { hit: "的中", miss: "外れ", void: "無効" } as const;
const SIGNED = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", signDisplay: "always" });
const PRICE = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const PERCENT = 100;
const PLOT_SCALE = 2;
/** The seal lands slightly large and settles (stamp press). */
const TWO_POP = 1.25;

/** The film's chart in the night colours, whatever the page's world. */
export const FILM_PALETTE: FilmPalette = {
  ink: NIGHT.ink,
  ink2: NIGHT.ink2,
  muted: NIGHT.muted,
  hairline: NIGHT.hairline,
  up: NIGHT.up,
  down: NIGHT.down,
  upLine: NIGHT.up,
  downLine: NIGHT.down,
  vermilion: NIGHT.vermilion,
  stage: NIGHT.card,
};

export interface SceneParts {
  fonts: Fonts;
  coin: CanvasImageSource;
  /** A canvas the size of the plot, reused for every frame's chart. */
  plot: HTMLCanvasElement;
  hidden: boolean;
  stakeSats: number;
}

/** One frame of the replay at film time `t` (ms). */
export function drawScene(ctx: CanvasRenderingContext2D, film: Film, t: number, words: ShareWords, parts: SceneParts) {
  const { frame, card, coin, name, sub, call, plot, rule, result, price, stats, seal, band, qr } = SCENE;
  const { fonts } = parts;
  ctx.fillStyle = NIGHT.vermilion;
  ctx.fillRect(0, 0, frame.w, frame.h);
  ctx.fillStyle = NIGHT.ground;
  ctx.beginPath();
  ctx.roundRect(card.x, card.y, card.w, card.h, card.radius);
  ctx.fill();

  // Who and when, and your call.
  ctx.drawImage(parts.coin, coin.x, coin.y, coin.size, coin.size);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = NIGHT.ink;
  fit(ctx, `${words.assetName} · ${words.lane}`, WEIGHT.bold, name.size, name.min, fonts.display, name.maxW);
  ctx.fillText(`${words.assetName} · ${words.lane}`, name.x, name.base);
  ctx.font = `600 ${sub.size}px ${fonts.mono}`;
  ctx.fillStyle = NIGHT.muted;
  ctx.fillText(`${words.window} · ${words.date}`, name.x, sub.base);
  ctx.textAlign = "right";
  ctx.font = `600 ${call.labelSize}px ${fonts.mono}`;
  ctx.fillText("YOUR CALL", call.right, call.labelBase);
  ctx.font = `800 ${call.size}px ${fonts.display}`;
  ctx.fillStyle = words.side === 0 ? NIGHT.up : NIGHT.down;
  ctx.fillText(`${words.side === 0 ? "▲ UP" : "▼ DOWN"} ${words.stake}`, call.right, call.base);
  ctx.textAlign = "left";

  // The round, drawn by the film itself.
  const plotCtx = parts.plot.getContext("2d");
  if (plotCtx) {
    // The film draws for a screen half this wide: twice the scale keeps its type and lines readable at 1080 px.
    plotCtx.setTransform(PLOT_SCALE, 0, 0, PLOT_SCALE, 0, 0);
    drawFrame(plotCtx, film, t, plot.w / PLOT_SCALE, plot.h / PLOT_SCALE, FILM_PALETTE, (value) => PRICE.format(value));
    ctx.drawImage(parts.plot, plot.x, plot.y, plot.w, plot.h);
  }
  const end = film.totalMs - HOLD_MS;
  if (t >= end) {
    const grow = Math.min(1, (t - end) / seal.popMs);
    const size = seal.size * (TWO_POP - grow);
    const tone = words.verdict === "hit" ? NIGHT.up : words.verdict === "miss" ? NIGHT.down : NIGHT.gold;
    drawSeal(ctx, SEAL_WORD[words.verdict], plot.x + plot.w * HALF, plot.y + plot.h * HALF, size, tone, fonts.serif);
  }
  ctx.fillStyle = NIGHT.hairline;
  ctx.fillRect(plot.x, rule.y, plot.w, 2);

  // The result as it stood at this moment, then what came back.
  const net = resultAt(film, t);
  const decided = t >= end;
  const label = decided
    ? words.verdict === "hit"
      ? "WON"
      : words.verdict === "miss"
        ? "NOT THIS TIME"
        : "REFUNDED"
    : net === null
      ? "ENTRIES"
      : net >= 0
        ? "WINNING"
        : "BEHIND";
  const tone = net === null || net === 0 ? NIGHT.ink : net > 0 ? NIGHT.up : NIGHT.down;
  ctx.font = `600 ${result.labelSize}px ${fonts.mono}`;
  ctx.fillStyle = decided && words.verdict === "void" ? NIGHT.gold : tone;
  ctx.fillText(label, plot.x, result.labelBase);
  const figure =
    net === null
      ? "—"
      : parts.hidden
        ? `${net >= 0 ? "+" : "−"}${Math.round((Math.abs(net) / Math.max(1, parts.stakeSats)) * PERCENT)}%`
        : SIGNED.format(satsToUsd(film, net));
  fit(ctx, figure, WEIGHT.bold, result.size, result.min, fonts.display, result.maxW);
  ctx.fillText(figure, plot.x, result.base);

  const now = priceAt(film, marketAt(film, t));
  ctx.textAlign = "right";
  ctx.font = `600 ${price.labelSize}px ${fonts.mono}`;
  ctx.fillStyle = NIGHT.muted;
  ctx.fillText("PRICE", price.right, price.labelBase);
  ctx.font = `700 ${price.size}px ${fonts.mono}`;
  ctx.fillStyle = NIGHT.ink;
  ctx.fillText(now === null ? "—" : PRICE.format(now), price.right, price.base);
  if (words.line) {
    ctx.font = `600 ${price.lineSize}px ${fonts.mono}`;
    ctx.fillStyle = NIGHT.muted;
    ctx.fillText(`line ${words.line}`, price.right, price.lineBase);
  }
  ctx.textAlign = "left";

  const column = plot.w / stats.columns;
  const rows: Array<[string, string]> = [
    ["POT", words.pot],
    ["ENTRIES", String(words.entrants)],
    ["CAME BACK", decided ? words.back : "…"],
  ];
  for (const [index, [title, value]] of rows.entries()) {
    const x = plot.x + column * index;
    ctx.font = `600 ${stats.labelSize}px ${fonts.mono}`;
    ctx.fillStyle = NIGHT.muted;
    ctx.fillText(title, x, stats.top);
    ctx.font = `700 ${stats.valueSize}px ${fonts.display}`;
    ctx.fillStyle = NIGHT.ink;
    ctx.fillText(value, x, stats.valueBase);
  }

  // The band: the mark, where to play, and a QR to this round.
  drawMark(ctx, plot.x, band.markY, band.markSize, NIGHT.ink);
  ctx.fillStyle = NIGHT.ink;
  ctx.font = `800 ${band.wordSize}px ${fonts.display}`;
  ctx.fillText("Jōge", band.wordX, band.wordBase);
  ctx.font = `600 ${band.tagSize}px ${fonts.mono}`;
  fit(
    ctx,
    `Up or down · ${shortUrl(words.url)}`,
    WEIGHT.mono,
    band.tagSize,
    band.minSize,
    fonts.mono,
    qr.x - plot.x - band.qrGap,
  );
  ctx.fillText(`Up or down · ${shortUrl(words.url)}`, plot.x, band.tagBase);
  drawQr(ctx, words.url, qr.x, qr.y, qr.size, qr.radius);
}
