"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cx, Segmented } from "@/kit";
import { clockTime, laneLabel } from "../rounds/format.ts";
import type { Memory } from "./api.ts";
import { PERCENT } from "./constants.ts";
import { DecisionTile, ENDING_WORD, TileKey } from "./decision-tile.tsx";
import { useSatsUsd } from "./format.ts";

type Filter = "all" | "bets" | "held";
const PAGE = 40;
const MS_PER_SECOND = 1_000;
const DECIDED = new Set(["won", "lost", "refunded"]);
const CALL = { up: "Up", down: "Down", hold: "Sat out" } as const;
const isBet = (entry: Memory) => entry.outcome !== "skipped";

/**
 * Every decision an agent made, as tiles: one line of figures, a filter,
 * then a grid — coin, arrow, time, its ground how it ended. Tap a tile and one panel says it in words: the market and
 * time, the call and how sure, the agent's reason in a few words, and the replay.
 */
export function Decisions({ memory }: { memory: Memory[] }) {
  const money = useSatsUsd();
  const [filter, setFilter] = useState<Filter>("all");
  const [shown, setShown] = useState(PAGE);
  const [picked, setPicked] = useState<number | null>(null);
  const bets = memory.filter(isBet);
  const decided = bets.filter((entry) => entry.outcome === "won" || entry.outcome === "lost");
  const right = decided.filter((entry) => entry.outcome === "won").length;
  const net = bets
    .filter((entry) => DECIDED.has(entry.outcome))
    .reduce((sum, entry) => sum + (entry.payout ?? 0) - (entry.stake ?? 0), 0);
  const list = memory.filter((entry) => (filter === "all" ? true : filter === "bets" ? isBet(entry) : !isBet(entry)));
  const current = list.find((entry) => entry.id === picked) ?? list[0] ?? null;

  return (
    <section className="flex flex-col gap-3" aria-label="Decisions">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="nx-display text-[24px]">Decisions</h2>
          <p className="nx-num text-[13px] text-[var(--muted)]">
            {memory.length} · {bets.length} bets
            {decided.length > 0 ? ` · ${Math.round((right / decided.length) * PERCENT)}% right` : ""}
            {net !== 0 ? (
              <span className={net > 0 ? "text-[var(--up-text)]" : "text-[var(--down-text)]"}>
                {" "}
                · {net > 0 ? "+" : "−"}
                {money.format(Math.abs(net))}
              </span>
            ) : null}
          </p>
        </div>
        <Segmented
          label="Show"
          size="sm"
          value={filter}
          onChange={(next) => {
            setFilter(next);
            setShown(PAGE);
            setPicked(null);
          }}
          options={[
            { value: "all", label: "All" },
            { value: "bets", label: "Bets" },
            { value: "held", label: "Sat out" },
          ]}
        />
      </div>
      {list.length === 0 ? (
        <p className="rounded-[18px] bg-[var(--surface-1)] p-4 text-[14px] text-[var(--muted)]">
          {memory.length === 0 ? "No decisions yet" : "None here"}
        </p>
      ) : (
        <>
          <ol className="flex flex-wrap gap-1.5">
            {list.slice(0, shown).map((entry) => (
              <li key={entry.id}>
                <DecisionTile
                  decision={entry}
                  selected={current?.id === entry.id}
                  onSelect={() => setPicked(entry.id)}
                />
              </li>
            ))}
            {list.length > shown ? (
              <li>
                <button
                  type="button"
                  onClick={() => setShown((count) => count + PAGE)}
                  className="nx-num grid size-[60px] place-items-center rounded-[12px] bg-[var(--surface-1)] text-[12px] text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                >
                  +{list.length - shown}
                </button>
              </li>
            ) : null}
          </ol>
          <TileKey />
          {current ? <DecisionPanel entry={current} /> : null}
        </>
      )}
    </section>
  );
}

/** The picked decision in words: which round, the call and how sure, why in a few words, how it ended, the replay. */
function DecisionPanel({ entry }: { entry: Memory }) {
  const money = useSatsUsd();
  const reason = entry.why ?? entry.reason;
  const decided = DECIDED.has(entry.outcome);
  const net = (entry.payout ?? 0) - (entry.stake ?? 0);
  const sure = entry.confidence === null ? "" : ` · ${Math.round(entry.confidence * PERCENT)}% sure`;
  const ending =
    entry.outcome === "won"
      ? `+${money.format(Math.max(0, net))}`
      : entry.outcome === "lost"
        ? `−${money.format(entry.stake ?? 0)}`
        : ENDING_WORD[entry.outcome];
  return (
    <div className="flex items-center gap-3 rounded-[20px] bg-[var(--surface-1)] p-3 pl-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="nx-num truncate text-[12px] text-[var(--muted)]">
          {entry.asset ?? ""} {entry.laneSeconds ? laneLabel(entry.laneSeconds) : ""} ·{" "}
          {clockTime(Date.parse(entry.createdAt) / MS_PER_SECOND)}
        </p>
        <p className="font-semibold text-[15px]">
          {CALL[entry.side ?? "hold"]}
          <span className="font-normal text-[var(--muted)]">{sure}</span>
          <span
            className={cx(
              "ml-2",
              entry.outcome === "won"
                ? "text-[var(--up-text)]"
                : entry.outcome === "lost"
                  ? "text-[var(--down-text)]"
                  : "text-[var(--muted)]",
            )}
          >
            {ending}
          </span>
        </p>
        {reason ? <p className="line-clamp-2 text-[14px] text-[var(--ink-2)]">“{reason}”</p> : null}
      </div>
      <Link
        href={decided ? `/r/${entry.roundId}?play=1` : `/r/${entry.roundId}`}
        aria-label={decided ? "Replay the round" : "Open the round"}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--vermilion)] hover:text-white"
      >
        <Play aria-hidden className="size-4 translate-x-px" fill="currentColor" />
      </Link>
    </div>
  );
}
