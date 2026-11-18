"use client";

import type { ReactNode } from "react";
import { cx } from "./cx.ts";

const VIEW = 100;
const CENTRE = 50;
/** The arc's length in path units (pathLength), so the dash maths stays in 0–100. */
const LENGTH = 100;
/** Stroke width as a share of the box (ring: radius 46, stroke 6 in a 100 box). */
const STROKE = 6;
const RADIUS = 46;
/** The phases: near at a third left, last in the final tenth or ten seconds. */
const NEAR_SHARE = 0.33;
const LAST_SHARE = 0.1;
const LAST_FLOOR_MS = 10_000;
const MS_PER_SECOND = 1_000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3_600;
const COMPACT_FROM_SECONDS = 600;
/** Rings smaller than this say minutes as "21m". */
const COMPACT_BELOW_PX = 56;
/** The time inside is sized from the ring, so "4:46" fits a 40 px ring and fills a 120 px one. */
const TEXT_SHARE = 0.24;

export type RingPhase = "calm" | "near" | "last";

export function ringPhase(leftMs: number, spanMs: number): RingPhase {
  if (leftMs <= Math.max(LAST_FLOOR_MS, spanMs * LAST_SHARE)) return "last";
  if (leftMs <= spanMs * NEAR_SHARE) return "near";
  return "calm";
}

/**
 * "42" under a minute, "4:05" under an hour, "2h" beyond; a small ring says "21m" from ten minutes up, so the time
 * always fits inside it.
 */
export function ringTime(leftMs: number, compact = false): string {
  const s = Math.max(0, Math.ceil(leftMs / MS_PER_SECOND));
  if (s >= SECONDS_PER_HOUR) return `${Math.floor(s / SECONDS_PER_HOUR)}h`;
  if (compact && s >= COMPACT_FROM_SECONDS) return `${Math.ceil(s / SECONDS_PER_MINUTE)}m`;
  if (s >= SECONDS_PER_MINUTE) {
    return `${Math.floor(s / SECONDS_PER_MINUTE)}:${String(s % SECONDS_PER_MINUTE).padStart(2, "0")}`;
  }
  return String(s);
}

/**
 * Time as a draining ring. It drains toward
 * the end, turns lime when near and vermilion and pulsing in the last tenth. `children` replaces the time inside.
 */
export function Ring({
  leftMs,
  spanMs,
  size = 64,
  label,
  className,
  children,
}: {
  leftMs: number;
  spanMs: number;
  size?: number;
  /** For screen readers: what the time counts down to. */
  label: string;
  className?: string;
  children?: ReactNode;
}) {
  const span = Math.max(1, spanMs);
  const left = Math.min(span, Math.max(0, leftMs));
  const phase = ringPhase(left, span);
  const text = ringTime(left, size < COMPACT_BELOW_PX);
  return (
    <span
      role="timer"
      aria-label={`${label}: ${text}`}
      data-phase={phase}
      className={cx("nx-ring relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} aria-hidden className="absolute inset-0 -rotate-90">
        <circle cx={CENTRE} cy={CENTRE} r={RADIUS} pathLength={LENGTH} strokeWidth={STROKE} className="nx-ring-track" />
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={RADIUS}
          pathLength={LENGTH}
          strokeWidth={STROKE}
          strokeDasharray={LENGTH}
          strokeDashoffset={LENGTH - (left / span) * LENGTH}
          className="nx-ring-arc"
        />
      </svg>
      <span
        aria-hidden
        className="nx-ring-time nx-num relative font-semibold leading-none"
        style={{ fontSize: size * TEXT_SHARE }}
      >
        {children ?? text}
      </span>
    </span>
  );
}
