"use client";

import { createAvatar } from "@dicebear/core";
import * as notionists from "@dicebear/notionists";
import type { CSSProperties } from "react";
import { cx } from "@/kit";

/** Faces: notionists on a paper tile, drawn here from the MIT library (no network call). */
const DRAWN_CAP = 256;
const drawn = new Map<string, string>();
/** Each face breathes on its own beat: a phase from the seed, so a row of them never bobs in unison. */
const PHASE_STEP = 0.45;
const PHASE_CYCLE = 3.6;
const HASH_MULTIPLIER = 31;

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (Math.imul(h, HASH_MULTIPLIER) + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function face(seed: string): string {
  const known = drawn.get(seed);
  if (known) return known;
  const svg = createAvatar(notionists, { seed, backgroundColor: ["transparent"] }).toString();
  if (drawn.size >= DRAWN_CAP) drawn.clear();
  drawn.set(seed, svg);
  return svg;
}

/**
 * An agent's face, the same everywhere it appears (seeded by the agent): a DiceBear notionists portrait on a paper tile
 * that breathes out of phase with its neighbours and nods when hovered.
 */
export function Portrait({
  seed,
  name,
  size = 56,
  className,
}: {
  seed: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const style = {
    width: size,
    height: size,
    "--phase": `${((hash(seed) * PHASE_STEP) % PHASE_CYCLE).toFixed(2)}s`,
  } as CSSProperties;
  return (
    <span
      role="img"
      aria-label={`${name}'s face`}
      style={style}
      className={cx("nx-face shrink-0", className)}
      dangerouslySetInnerHTML={{ __html: face(seed) }}
    />
  );
}
