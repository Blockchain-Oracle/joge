import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og.js";
import { createElement as h } from "react";
import { MARK_STROKE, markSvg } from "../src/brand/geometry.ts";

/**
 * Draws Jōge's app icons from the mark (src/brand/geometry.ts): the favicon, the Apple touch icon, the manifest's
 * 192 / 512 / maskable icons and the notification badge. Run from apps/web: `node scripts/icons.ts`.
 */
const TILE = "#0f0f0f";
/** Rounded-square corner as a share of the side (an app-icon squircle). */
const CORNER = 0.23;
/** How much of the icon the mark fills: launchers crop maskable icons to the centre 80 %. */
const FILL = { any: 0.82, maskable: 0.62, apple: 0.72, favicon: 1 } as const;
/** Small icons draw heavier strokes so the mark holds at 16 px. */
const HEAVY_SHARE = 1.35;
const HEAVY_STROKE = MARK_STROKE * HEAVY_SHARE;
/** Pixel sizes: the manifest's two, a notification badge, Apple's touch icon and the favicon. */
const SIZE = { small: 192, large: 512, badge: 96, apple: 180, favicon: 64 } as const;

/** Android draws a notification badge from its alpha only: the mark in white, nothing behind it. */
const WHITE = { up: "#ffffff", down: "#ffffff", line: "#ffffff" };

function icon(size: number, fill: number, rounded: boolean, stroke = MARK_STROKE, badge = false) {
  const mark = Math.round(size * fill);
  const svg = badge ? markSvg(WHITE, stroke) : markSvg(undefined, stroke);
  const source = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  return new ImageResponse(
    h(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: badge ? "transparent" : TILE,
          borderRadius: rounded ? size * CORNER : 0,
        },
      },
      h("img", { src: source, width: mark, height: mark, alt: "" }),
    ),
    { width: size, height: size },
  );
}

const outputs: Array<[string, ImageResponse]> = [
  ["public/icons/icon-192.png", icon(SIZE.small, FILL.any, true)],
  ["public/icons/icon-512.png", icon(SIZE.large, FILL.any, true)],
  ["public/icons/maskable-512.png", icon(SIZE.large, FILL.maskable, false)],
  ["public/icons/badge-96.png", icon(SIZE.badge, FILL.favicon, false, HEAVY_STROKE, true)],
  ["src/app/apple-icon.png", icon(SIZE.apple, FILL.apple, false)],
  ["src/app/icon.png", icon(SIZE.favicon, FILL.favicon, true, HEAVY_STROKE)],
];
for (const [path, image] of outputs) {
  await writeFile(join(process.cwd(), path), Buffer.from(await image.arrayBuffer()));
  console.log("wrote", path);
}
