"use client";

import { ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cx, Segmented } from "@/kit";
import { clockTime, laneLabel } from "../rounds/format.ts";
import type { Memory } from "./api.ts";
import { PERCENT } from "./constants.ts";
import { useSatsUsd } from "./format.ts";

type Filter = "all" | "bets" | "held";
const PAGE = 15;
const MS_PER_SECOND = 1_000;
const RING_R = 22;
const RING_W = 3;
const RING_BOX = (RING_R + RING_W) * 2;
const CIRCLE = 2 * Math.PI * RING_R;
const DECIDED = new Set(["won", "lost", "refunded"]);

const isBet = (entry: Memory) => entry.outcome !== "skipped";

/**
 * Every decision an agent made (his feedback: "decisions", all of them, designed well): what it adds up to in four
 * figures, a filter, then each decision as the call it made (its side, ringed by how sure it was), the round, the
 * agent's own one-line reason in plain view, and how it ended — the replay one tap away. Fifteen at a time.
 */
export function Decisions({ memory }: { memory: Memory[] }) {
  const money = useSatsUsd();
  const [filter, setFilter] = useState<Filter>("all");
  const [shown, setShown] = useState(PAGE);
  const bets = memory.filter(isBet);
  const decided = bets.filter((entry) => entry.outcome === "won" || entry.outcome === "lost");
  const right = decided.filter((entry) => entry.outcome === "won").length;
  const net = bets
    .filter((entry) => DECIDED.has(entry.outcome))
    .reduce((sum, entry) => sum + (entry.payout ?? 0) - (entry.stake ?? 0), 0);
  const list = memory.filter((entry) => (filter === "all" ? true : filter === "bets" ? isBet(entry) : !isBet(entry)));
  const figures: Array<[string, string, string | undefined]> = [
    ["Decisions", String(memory.length), undefined],
    ["Bets", String(bets.length), undefined],
    ["Right", decided.length > 0 ? `${Math.round((right / decided.length) * PERCENT)}%` : "—", undefined],
    [
      "Net",
      net === 0 ? "$0.00" : `${net > 0 ? "+" : "−"}${money.format(Math.abs(net))}`,
      net > 0 ? "text-[var(--up-text)]" : net < 0 ? "text-[var(--down-text)]" : undefined,
    ],
  ];

  return (
    <section className="flex flex-col gap-3" aria-label="Decisions">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <h2 className="nx-display text-[24px]">Decisions</h2>
        <Segmented
          label="Show"
          size="sm"
          value={filter}
          onChange={(next) => {
            setFilter(next);
            setShown(PAGE);
          }}
          options={[
            { value: "all", label: "All" },
            { value: "bets", label: "Bets" },
            { value: "held", label: "Sat out" },
          ]}
        />
      </div>
      <dl className="grid grid-cols-4 gap-2">
        {figures.map(([label, value, tone]) => (
          <div key={label} className="rounded-[18px] bg-[var(--surface-1)] px-3 py-3">
            <dt className="nx-eyebrow">{label}</dt>
            <dd className={cx("nx-num mt-1 text-[20px] font-semibold", tone)}>{value}</dd>
          </div>
        ))}
      </dl>
      {list.length === 0 ? (
        <p className="rounded-[18px] bg-[var(--surface-1)] p-4 text-[14px] text-[var(--muted)]">
          {memory.length === 0 ? "No decisions yet: it reads each round it plays before entries close." : "None here"}
        </p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {list.slice(0, shown).map((entry) => (
            <DecisionRow key={entry.id} entry={entry} />
          ))}
        </ol>
      )}
      {list.length > shown ? (
        <button
          type="button"
          onClick={() => setShown((count) => count + PAGE)}
          className="self-center rounded-full bg-[var(--surface-1)] px-5 py-2.5 font-semibold text-[13px] hover:bg-[var(--surface-2)]"
        >
          Older · {list.length - shown} more
        </button>
      ) : null}
    </section>
  );
}

/** The call as a tile, ringed by how sure the agent was (a full ring is certain). */
function CallTile({ side, confidence }: { side: Memory["side"]; confidence: number | null }) {
  const sure = confidence ?? 0;
  const tone = side === "up" ? "var(--up)" : side === "down" ? "var(--down)" : "var(--muted)";
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: RING_BOX, height: RING_BOX }}>
      <svg width={RING_BOX} height={RING_BOX} className="-rotate-90 absolute inset-0" aria-hidden>
        <circle
          cx={RING_BOX / 2}
          cy={RING_BOX / 2}
          r={RING_R}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth={RING_W}
        />
        <circle
          cx={RING_BOX / 2}
          cy={RING_BOX / 2}
          r={RING_R}
          fill="none"
          stroke={tone}
          strokeWidth={RING_W}
          strokeLinecap="round"
          strokeDasharray={`${CIRCLE * sure} ${CIRCLE}`}
        />
      </svg>
      <span
        className={cx(
          "nx-jp grid size-9 place-items-center rounded-[11px] text-[17px]",
          side === "up"
            ? "bg-[var(--up)] text-[var(--up-ink)]"
            : side === "down"
              ? "bg-[var(--down)] text-[var(--down-ink)]"
              : "bg-[var(--surface-2)] text-[var(--muted)]",
        )}
      >
        {side === "up" ? "上" : side === "down" ? "下" : "—"}
      </span>
    </span>
  );
}

function DecisionRow({ entry }: { entry: Memory }) {
  const money = useSatsUsd();
  const [open, setOpen] = useState(false);
  const decided = DECIDED.has(entry.outcome);
  const reason = entry.why ?? entry.reason;
  const call = entry.side === "up" ? "Up" : entry.side === "down" ? "Down" : "No call";
  const sure = entry.confidence === null ? "" : ` · ${Math.round(entry.confidence * PERCENT)}% sure`;
  const net = (entry.payout ?? 0) - (entry.stake ?? 0);
  const ending =
    entry.outcome === "won"
      ? { text: `+${money.format(Math.max(0, net))}`, tone: "text-[var(--up-text)]" }
      : entry.outcome === "lost"
        ? { text: `−${money.format(entry.stake ?? 0)}`, tone: "text-[var(--down-text)]" }
        : entry.outcome === "refunded"
          ? { text: "Refunded", tone: "text-[var(--gold-text)]" }
          : entry.outcome === "pending"
            ? { text: "Live", tone: "text-[var(--ink)]" }
            : { text: "Sat out", tone: "text-[var(--muted)]" };
  return (
    <li
      title={entry.model ? `${entry.model} · prompt ${entry.promptHash ?? ""}` : undefined}
      className="flex items-start gap-3 rounded-[20px] bg-[var(--surface-1)] p-3"
    >
      <CallTile side={entry.side} confidence={entry.confidence} />
      <button
        type="button"
        onClick={() => setOpen((shown) => !shown)}
        aria-expanded={open}
        className="flex min-w-0 flex-1 flex-col gap-1 text-left"
      >
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold text-[15px]">
            {call}
            <span className="font-normal text-[var(--muted)]">{sure}</span>
          </span>
          <span className="nx-num text-[12px] text-[var(--muted)]">
            {entry.asset ?? ""} {entry.laneSeconds ? laneLabel(entry.laneSeconds) : ""} ·{" "}
            {clockTime(Date.parse(entry.createdAt) / MS_PER_SECOND)}
          </span>
        </span>
        {reason ? (
          <span className={cx("text-[14px] text-[var(--ink-2)] leading-snug", open ? "" : "line-clamp-1")}>
            {reason}
          </span>
        ) : null}
        {open && entry.reason && entry.why && entry.reason !== entry.why ? (
          <span className="nx-num text-[12px] text-[var(--muted)]">Rule check: {entry.reason}</span>
        ) : null}
      </button>
      <span className="flex shrink-0 flex-col items-end gap-2">
        <span className={cx("nx-num text-[14px] font-semibold", ending.tone)}>{ending.text}</span>
        <Link
          href={decided ? `/r/${entry.roundId}?play=1` : `/r/${entry.roundId}`}
          aria-label={decided ? "Replay the round" : "Open the round"}
          className="grid size-8 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--vermilion)] hover:text-white"
        >
          {decided ? (
            <Play aria-hidden className="size-3.5 translate-x-px" fill="currentColor" />
          ) : (
            <ArrowUpRight aria-hidden className="size-3.5" />
          )}
        </Link>
      </span>
    </li>
  );
}
