"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/kit";
import { clockTime, usd } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";

/** One decided round as a candle (prices in dollars; null when nothing was kept). */
export interface RoundCandle {
  roundId: number;
  lockTime: number;
  closeTime: number;
  state: "settled" | "void";
  winner: number | null;
  entrants: number;
  pot: number;
  open: number | null;
  close: number | null;
  high: number | null;
  low: number | null;
}

const SLOT_PX = 18;
const MIN_SLOTS = 12;
const HEIGHT = 210;
const PAD_Y = 22;
const BODY_SHARE = 0.56;
const MIN_BODY = 2;
const DOT_R = 3.5;
const DOT_GAP = 8;
const WICK = 1.5;
const LABELS = 6;
const RANGE_PAD = 0.08;
const EMPTY_TICK = 6;
/** A slot's centre, as a share of its width. */
const MID = 0.5;
/** Empty rounds are drawn this faint. */
const EMPTY_OPACITY = 0.32;
/** The hover card stays this far inside the strip's edges. */
const CARD_HALF = 80;

/** What a round came to, in words. */
export function resultOf(candle: Pick<RoundCandle, "state" | "winner" | "entrants">) {
  if (candle.state === "settled" && candle.winner === 0) return { text: "Up won", glyph: "上", tone: "up" as const };
  if (candle.state === "settled" && candle.winner === 1)
    return { text: "Down won", glyph: "下", tone: "down" as const };
  return candle.entrants > 0
    ? { text: "Refunded", glyph: "無", tone: "void" as const }
    : { text: "Nobody played", glyph: "無", tone: "void" as const };
}

/**
 * A market's previous rounds as a candle chart: one candle per round, lime when the price rose over it, coral when it
 * fell; rounds people played carry a vermilion dot, empty ones are faint (they happened on chain, nobody played). As
 * many as fit; tap one to replay it and check its proof.
 */
export function CandleStrip({ candles }: { candles: RoundCandle[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const money = useMoney();

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const slots = Math.max(MIN_SLOTS, Math.floor(width / SLOT_PX));
  const shown = candles.slice(-slots);
  const slot = shown.length > 0 ? width / shown.length : 0;
  const priced = shown.filter((candle) => candle.high !== null && candle.low !== null);
  const lowest = Math.min(...priced.map((candle) => candle.low ?? 0));
  const highest = Math.max(...priced.map((candle) => candle.high ?? 0));
  const pad = (highest - lowest || 1) * RANGE_PAD;
  const [low, high] = [lowest - pad, highest + pad];
  const y = (price: number) => PAD_Y + (1 - (price - low) / (high - low || 1)) * (HEIGHT - 2 * PAD_Y);
  const every = Math.max(1, Math.ceil(shown.length / LABELS));
  const hovered = hover === null ? null : shown[hover];

  return (
    <div ref={box} className="relative w-full">
      {width > 0 ? (
        <svg width={width} height={HEIGHT} role="img" aria-label={`${shown.length} previous rounds`}>
          {shown.map((candle, index) => {
            const x = slot * (index + MID);
            const played = candle.entrants > 0;
            const priceKnown =
              candle.open !== null && candle.close !== null && candle.high !== null && candle.low !== null;
            const rose = priceKnown && (candle.close ?? 0) >= (candle.open ?? 0);
            const color = !priceKnown ? "var(--muted)" : rose ? "var(--up)" : "var(--down)";
            const top = priceKnown ? y(Math.max(candle.open ?? 0, candle.close ?? 0)) : HEIGHT / 2 - EMPTY_TICK / 2;
            const bottom = priceKnown ? y(Math.min(candle.open ?? 0, candle.close ?? 0)) : HEIGHT / 2 + EMPTY_TICK / 2;
            const body = slot * BODY_SHARE;
            return (
              <Link
                key={candle.roundId}
                href={`/r/${candle.roundId}?play=1`}
                aria-label={`${clockTime(candle.lockTime)}–${clockTime(candle.closeTime)}: ${resultOf(candle).text}`}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(index)}
                onBlur={() => setHover(null)}
              >
                <rect x={x - slot / 2} y={0} width={slot} height={HEIGHT} fill="transparent" />
                {hover === index ? (
                  <rect x={x - slot / 2} y={0} width={slot} height={HEIGHT} rx={6} fill="var(--surface-2)" />
                ) : null}
                {priceKnown ? (
                  <g opacity={played ? 1 : EMPTY_OPACITY}>
                    <line
                      x1={x}
                      x2={x}
                      y1={y(candle.high ?? 0)}
                      y2={y(candle.low ?? 0)}
                      stroke={color}
                      strokeWidth={WICK}
                    />
                    <rect
                      x={x - body / 2}
                      y={top}
                      width={body}
                      height={Math.max(MIN_BODY, bottom - top)}
                      rx={2}
                      fill={color}
                    />
                  </g>
                ) : (
                  // No price was kept for this round: a faint dot on the floor says it happened, nothing more.
                  <circle cx={x} cy={HEIGHT - PAD_Y / 2} r={MIN_BODY} fill="var(--muted)" opacity={EMPTY_OPACITY} />
                )}
                {played ? (
                  <circle
                    cx={x}
                    cy={(priceKnown ? y(candle.high ?? 0) : top) - DOT_GAP}
                    r={DOT_R}
                    fill="var(--vermilion)"
                  />
                ) : null}
              </Link>
            );
          })}
        </svg>
      ) : (
        <div style={{ height: HEIGHT }} />
      )}
      <div className="relative h-5">
        {shown.map((candle, index) =>
          index % every === every - 1 ? (
            <span
              key={candle.roundId}
              className="nx-num absolute -translate-x-1/2 text-[11px] text-[var(--muted)]"
              style={{ left: slot * (index + MID) }}
            >
              {clockTime(candle.closeTime)}
            </span>
          ) : null,
        )}
      </div>
      {hovered && hover !== null ? (
        <div
          className="pointer-events-none absolute top-1 z-10 flex -translate-x-1/2 flex-col gap-0.5 rounded-[14px] bg-[var(--surface-1)] px-3 py-2 text-[12px] shadow-[0_12px_32px_-12px_rgb(0_0_0/0.6),inset_0_0_0_1px_var(--hairline)]"
          style={{ left: Math.min(Math.max(slot * (hover + MID), CARD_HALF), width - CARD_HALF) }}
        >
          <span className="nx-num text-[var(--muted)]">
            {clockTime(hovered.lockTime)}–{clockTime(hovered.closeTime)}
          </span>
          <span
            className={cx(
              "font-semibold",
              resultOf(hovered).tone === "up"
                ? "text-[var(--up-text)]"
                : resultOf(hovered).tone === "down"
                  ? "text-[var(--down-text)]"
                  : "text-[var(--ink-2)]",
            )}
          >
            <span className="nx-jp">{resultOf(hovered).glyph}</span> {resultOf(hovered).text}
          </span>
          {hovered.open !== null && hovered.close !== null ? (
            <span className="nx-num">
              {hovered.close >= hovered.open ? "▲" : "▼"} {usd(Math.abs(hovered.close - hovered.open))}
            </span>
          ) : null}
          {hovered.entrants > 0 ? (
            <span className="nx-num text-[var(--ink-2)]">
              {hovered.entrants} in · {money.format(hovered.pot)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
