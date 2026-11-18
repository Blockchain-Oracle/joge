"use client";

import type { AssetId } from "@joge/sdk";
import { cx } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { clockTime, laneLabel } from "../rounds/format.ts";

/** What a tile needs from a decision (an agent's memory row or a feed row). */
export interface TileDecision {
  id: number;
  side: "up" | "down" | "hold" | null;
  outcome: "won" | "lost" | "refunded" | "pending" | "skipped";
  asset: string | null;
  laneSeconds: number | null;
  createdAt: string;
}

const MS_PER_SECOND = 1_000;
const GLYPH = { up: "▲", down: "▼", hold: "–" } as const;
const CALL = { up: "Up", down: "Down", hold: "Sat out" } as const;
const COIN = { md: 16, sm: 12 } as const;
export const ENDING_WORD = {
  won: "won",
  lost: "lost",
  refunded: "refunded",
  pending: "live",
  skipped: "sat out",
} as const;

/** The tile's ground says how it ended: lime won, coral lost, gold refunded, a ring while live, plain when it sat out. */
const GROUND = {
  won: "bg-[color-mix(in_srgb,var(--up)_24%,transparent)]",
  lost: "bg-[color-mix(in_srgb,var(--down)_24%,transparent)]",
  refunded: "bg-[color-mix(in_srgb,var(--gold)_22%,transparent)]",
  pending: "bg-[var(--surface-1)] ring-2 ring-[var(--vermilion)] ring-inset",
  skipped: "bg-[var(--surface-1)]",
} as const;

export const tileLabel = (decision: TileDecision) =>
  `${decision.asset ?? ""} ${decision.laneSeconds ? laneLabel(decision.laneSeconds) : ""} · ${clockTime(Date.parse(decision.createdAt) / MS_PER_SECOND)} · ${CALL[decision.side ?? "hold"]} · ${ENDING_WORD[decision.outcome]}`;

/**
 * One decision as a tile (his feedback: too much text): the market's coin, the call as an arrow, the time; the ground
 * says how it ended. The words live in its label and in the panel a tap opens.
 */
export function DecisionTile({
  decision,
  size = "md",
  selected = false,
  onSelect,
}: {
  decision: TileDecision;
  size?: "sm" | "md";
  selected?: boolean;
  onSelect?: () => void;
}) {
  const md = size === "md";
  const body = (
    <>
      {decision.asset ? (
        <AssetCube asset={decision.asset as AssetId} size={COIN[size]} className="absolute top-1.5 left-1.5" />
      ) : null}
      <span
        aria-hidden
        className={cx(
          "font-bold leading-none",
          md ? "text-[20px]" : "text-[13px]",
          decision.side === "up"
            ? "text-[var(--up-text)]"
            : decision.side === "down"
              ? "text-[var(--down-text)]"
              : "text-[var(--muted)]",
        )}
      >
        {GLYPH[decision.side ?? "hold"]}
      </span>
      {md ? (
        <span className="nx-num absolute bottom-1 text-[10px] text-[var(--muted)]">
          {clockTime(Date.parse(decision.createdAt) / MS_PER_SECOND)}
        </span>
      ) : null}
    </>
  );
  const frame = cx(
    "relative grid shrink-0 place-items-center rounded-[12px]",
    md ? "size-[60px]" : "size-9",
    GROUND[decision.outcome],
    selected && "outline outline-2 outline-offset-2 outline-[var(--ink)]",
  );
  if (!onSelect) {
    return (
      <span role="img" aria-label={tileLabel(decision)} title={tileLabel(decision)} className={frame}>
        {body}
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-label={tileLabel(decision)}
      aria-pressed={selected}
      title={tileLabel(decision)}
      onClick={onSelect}
      className={cx(frame, "transition-transform hover:scale-105")}
    >
      {body}
    </button>
  );
}

/** The tiles' key in one line: what the arrows and grounds mean. */
export function TileKey() {
  const swatch = (ground: string, word: string) => (
    <span className="inline-flex items-center gap-1.5">
      <span className={cx("size-3 rounded-[4px]", ground)} /> {word}
    </span>
  );
  return (
    <p className="nx-num flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--muted)]">
      <span>
        <span className="text-[var(--up-text)]">▲</span> Up <span className="text-[var(--down-text)]">▼</span> Down –
        sat out
      </span>
      {swatch(GROUND.won, "won")}
      {swatch(GROUND.lost, "lost")}
      {swatch(GROUND.refunded, "refunded")}
    </p>
  );
}
