import type { AssetId } from "@joge/sdk";
import { encode } from "uqr";
import { MARK, MARK_BOX, MARK_NIGHT, MARK_STROKE } from "@/brand/geometry";
import { ASSET_MARKUP, ASSET_TONE } from "@/marks/asset";

/**
 * What the share images draw with: fixed colours, the page's own
 * fonts, the mark, the asset logos and a QR code — all on a plain 2D canvas, so the preview and the saved file match.
 */

export const HALF = 0.5;
export const TWO = 2;
export const TAU = Math.PI * TWO;
const QR_QUIET = 2;
/** Font weights the share images use. */
export const WEIGHT = { bold: 800, strong: 700, mono: 600 } as const;
/** The coin's logo fills this share of its disc. */
const LOGO_SHARE = 0.62;
/** The seal's proportions (share of its size): the outer ring's stroke and radius, the inner ring's, the word. */
const SEAL = {
  outerStroke: 0.045,
  outerR: 0.95,
  innerStroke: 0.02,
  innerR: 0.8,
  word2: 0.3,
  word1: 0.46,
  lift: 0.02,
} as const;

/** One look in either world: the share images are objects, not screens. */
export const NIGHT = {
  ground: "#0a0a0a",
  card: "#121212",
  ink: "#ffffff",
  ink2: "#b8b8b8",
  muted: "#7d7d7d",
  hairline: "rgba(255,255,255,0.09)",
  up: "#b5f543",
  upInk: "#0b0f02",
  down: "#ff647c",
  downInk: "#1a0307",
  vermilion: "#e04d26",
  gold: "#e3b45a",
} as const;

/**
 * The receipt's card: the app's own night, the bright Up and Down, the
 * vermilion seal. One look in either world.
 */
export const PAPER = {
  paper: "#151515",
  edge: "rgba(255,255,255,0.10)",
  ink: "#ffffff",
  muted: "#8a8a8a",
  hairline: "rgba(255,255,255,0.16)",
  up: "#b5f543",
  down: "#ff647c",
  gold: "#e3b45a",
  vermilion: "#e04d26",
} as const;

export interface Fonts {
  display: string;
  mono: string;
  serif: string;
}

/** The page's font families (next/font names them), with fallbacks. */
export function readFonts(): Fonts {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => {
    const value = css.getPropertyValue(name).trim();
    return value ? `${value}, ${fallback}` : fallback;
  };
  return {
    display: v("--font-sora", "system-ui, sans-serif"),
    mono: v("--font-jetbrains", "ui-monospace, monospace"),
    serif: v("--font-serif-jp", "serif"),
  };
}

/** Waits for the weights the images use, so the first frame is not drawn in a fallback face. */
export async function loadFonts(fonts: Fonts) {
  const wanted = [
    `800 40px ${fonts.display}`,
    `700 40px ${fonts.display}`,
    `600 20px ${fonts.mono}`,
    `700 40px ${fonts.serif}`,
  ];
  await Promise.all(wanted.map((font) => document.fonts.load(font).catch(() => [])));
}

/** Text shrunk until it fits `maxW` (never below `min` px). */
export function fit(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  size: number,
  min: number,
  family: string,
  maxW: number,
) {
  let px = size;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > min && ctx.measureText(text).width > maxW) {
    px -= 1;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

/** Jōge's mark at `size` px with its top-left at (x, y); `line` recolours the line for a vermilion ground. */
export function drawMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  line: string = MARK_NIGHT.line,
) {
  const scale = size / MARK_BOX;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = MARK_STROKE;
  ctx.strokeStyle = MARK_NIGHT.up;
  ctx.stroke(new Path2D(MARK.up));
  ctx.strokeStyle = MARK_NIGHT.down;
  ctx.stroke(new Path2D(MARK.down));
  ctx.fillStyle = MARK_NIGHT.down;
  ctx.beginPath();
  ctx.arc(MARK.dot.cx, MARK.dot.cy, MARK.dot.r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.stroke(new Path2D(MARK.line));
  ctx.restore();
}

/** A QR code (ECC M) on a light tile: `size` px square including a quiet border, top-left at (x, y). */
export function drawQr(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, radius = 0) {
  const { data } = encode(text, { ecc: "M", border: 0 });
  const modules = data.length + QR_QUIET * TWO;
  const cell = size / modules;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, radius);
  ctx.fill();
  ctx.fillStyle = "#0a0a0a";
  for (const [row, line] of data.entries()) {
    for (const [col, on] of line.entries()) {
      if (on) ctx.fillRect(x + (col + QR_QUIET) * cell, y + (row + QR_QUIET) * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
  ctx.restore();
}

/** The asset's real logo in white on a disc of its colour, as an image ready to draw. */
export async function assetCoin(asset: AssetId, size: number): Promise<HTMLImageElement> {
  const tone = ASSET_TONE[asset].solid;
  const r = size * HALF;
  const logo = size * LOGO_SHARE;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="${tone}"/><svg x="${r - logo * HALF}" y="${r - logo * HALF}" width="${logo}" height="${logo}" viewBox="0 0 24 24" style="color:#ffffff" fill="#ffffff">${ASSET_MARKUP[asset]}</svg></svg>`;
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();
  return image;
}

/** A seal stamp (的中 hit, 外れ miss, 無効 void): a double ring and the word, pressed at an angle. */
export function drawSeal(
  ctx: CanvasRenderingContext2D,
  word: string,
  cx: number,
  cy: number,
  size: number,
  color: string,
  serif: string,
  angle = -0.1,
) {
  const r = size * HALF;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size * SEAL.outerStroke;
  ctx.beginPath();
  ctx.arc(0, 0, r * SEAL.outerR, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = size * SEAL.innerStroke;
  ctx.beginPath();
  ctx.arc(0, 0, r * SEAL.innerR, 0, TAU);
  ctx.stroke();
  ctx.font = `${WEIGHT.strong} ${size * (word.length > 1 ? SEAL.word2 : SEAL.word1)}px ${serif}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(word, 0, size * SEAL.lift);
  ctx.restore();
}

/** The address people type: the host and the round's path, without the scheme. */
export const shortUrl = (url: string) => url.replace(/^https?:\/\//, "");
