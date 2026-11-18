"use client";

import { HOUR_SECONDS } from "@joge/sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, ChevronDown, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cx, toast } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { roundQuery } from "../round/api.ts";
import { clockTime, countdown, laneLabel } from "../rounds/format.ts";
import { useNow } from "../rounds/use-now.ts";
import { useWorld } from "../shell/world.tsx";
import { CLOSE_LEAD_SECONDS } from "../terminal/constants.ts";
import { useOneTap } from "../terminal/use-one-tap.ts";
import { answerProposal, type Memory } from "./api.ts";
import { PERCENT } from "./constants.ts";
import { useSatsUsd } from "./format.ts";

const MS_PER_SECOND = 1_000;

function SideTile({ side, confidence }: { side: Memory["side"]; confidence: number | null }) {
  return (
    <span className="flex w-12 shrink-0 flex-col items-center gap-1">
      <span
        aria-hidden
        className={cx(
          "nx-jp grid size-11 place-items-center rounded-[12px] text-[19px]",
          side === "up"
            ? "bg-[var(--up)] text-[var(--up-ink)]"
            : side === "down"
              ? "bg-[var(--down)] text-[var(--down-ink)]"
              : "bg-[var(--surface-2)] text-[var(--muted)]",
        )}
      >
        {side === "up" ? "上" : side === "down" ? "下" : "—"}
      </span>
      {confidence !== null ? (
        <span className="nx-num text-[11px] text-[var(--muted)]">{Math.round(confidence * PERCENT)}%</span>
      ) : null}
    </span>
  );
}

/** How a read ended, in a word or a figure. */
function Ending({ entry }: { entry: Memory }) {
  const money = useSatsUsd();
  if (entry.outcome === "won") {
    return (
      <span className="nx-num text-[14px] font-semibold text-[var(--up-text)]">+{money.format(entry.payout ?? 0)}</span>
    );
  }
  const word = {
    lost: "lost",
    refunded: "refunded",
    pending: "live",
    skipped: entry.verdict === "hold" ? "sat out" : "—",
  }[entry.outcome];
  return <span className={cx("nx-eyebrow", entry.outcome === "lost" && "text-[var(--down-text)]")}>{word}</span>;
}

/**
 * The agent's memory, newest first: its call and how sure it was, its one-line reason, when and on which round, and
 * how it ended. The model and prompt behind each read are on the row's title for anyone auditing it.
 */
export function MemoryList({ memory }: { memory: Memory[] }) {
  if (memory.length === 0) {
    return <p className="rounded-[18px] bg-[var(--surface-1)] p-4 text-[14px] text-[var(--muted)]">No calls yet</p>;
  }
  return (
    <ol className="flex flex-col gap-1.5">
      {memory.map((entry) => (
        <MemoryRow key={entry.id} entry={entry} />
      ))}
    </ol>
  );
}

/**
 * One call as icons and figures: the side and how sure, the round, when, how it ended, and its round's film. The
 * agent's reason waits behind a tap (the row opens to show it), so the list reads at a glance.
 */
function MemoryRow({ entry }: { entry: Memory }) {
  const [open, setOpen] = useState(false);
  const reason = entry.why ?? entry.reason;
  const decided = entry.outcome === "won" || entry.outcome === "lost" || entry.outcome === "refunded";
  return (
    <li
      title={entry.model ? `${entry.model} · prompt ${entry.promptHash ?? ""}` : undefined}
      className="flex flex-col rounded-[18px] bg-[var(--surface-1)]"
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setOpen((shown) => !shown)}
          aria-expanded={open}
          aria-label={open ? "Hide the reason" : "Show the reason"}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <SideTile side={entry.side} confidence={entry.confidence} />
          <span className="nx-num min-w-0 flex-1 truncate text-[13px] text-[var(--ink-2)]">
            {entry.asset && entry.laneSeconds ? `${entry.asset} ${laneLabel(entry.laneSeconds)} ` : ""}#{entry.roundId}
            <span className="text-[var(--muted)]"> · {clockTime(Date.parse(entry.createdAt) / MS_PER_SECOND)}</span>
          </span>
          {reason ? (
            <ChevronDown
              aria-hidden
              className={cx("size-4 shrink-0 text-[var(--muted)] transition-transform", open && "rotate-180")}
            />
          ) : null}
        </button>
        <Ending entry={entry} />
        <Link
          href={decided ? `/r/${entry.roundId}?play=1` : `/r/${entry.roundId}`}
          aria-label={decided ? `Replay round ${entry.roundId}` : `Round ${entry.roundId}`}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--vermilion)] hover:text-white"
        >
          {decided ? (
            <Play aria-hidden className="size-3.5 translate-x-px" fill="currentColor" />
          ) : (
            <ArrowUpRight aria-hidden className="size-3.5" />
          )}
        </Link>
      </div>
      {open && reason ? <p className="px-3 pb-3 text-[14px] text-[var(--ink-2)] leading-snug">{reason}</p> : null}
    </li>
  );
}

/**
 * An ask-me-first proposal while its round takes entries: the side on its plate, the stake and how sure the agent is.
 * Take it enters in one tap (at the proposal's stake, signed in the owner's wallet); Pass lets it go.
 */
export function Proposal({ entry, owner }: { entry: Memory; owner: boolean }) {
  const network = useWorld();
  const now = useNow();
  const client = useQueryClient();
  const money = useSatsUsd();
  const view = useQuery(roundQuery(network, entry.roundId));
  const round = view.data?.round ?? null;
  const tap = useOneTap(
    round?.state === "open" ? round : null,
    round?.laneSeconds && round.laneSeconds >= HOUR_SECONDS ? "hourly" : "short",
    entry.stake,
  );
  if (round?.state !== "open" || round.lockTime - now < CLOSE_LEAD_SECONDS) return null;
  const side = entry.side === "down" ? 1 : 0;
  const answer = async (proposal: "taken" | "passed") => {
    try {
      await answerProposal(network, entry.id, proposal);
      void client.invalidateQueries({ queryKey: ["agent", network, entry.agentId] });
    } catch (error) {
      toast({ tone: "down", title: "Not saved", body: error instanceof Error ? error.message : "" });
    }
  };
  const take = async () => {
    if (tap.blocker) {
      tap.blocker.onClick();
      return;
    }
    if (await tap.enter(side)) await answer("taken");
  };
  return (
    <div data-side={side === 0 ? "up" : "down"} className="nx-plate h-auto flex-col items-stretch gap-3 p-4 text-left">
      <div className="flex items-center gap-3">
        <AssetCube asset={round.asset} size={36} />
        <span className="min-w-0 flex-1">
          <span className="block text-[19px] leading-tight">
            <span className="nx-jp">{side === 0 ? "上" : "下"}</span> {side === 0 ? "Up" : "Down"} ·{" "}
            {money.format(entry.stake ?? 0)}
          </span>
          <span className="nx-num block text-[12px] font-semibold opacity-75">
            {Math.round((entry.confidence ?? 0) * PERCENT)}% · {countdown(round.lockTime, now)}
          </span>
        </span>
      </div>
      {entry.why ? <p className="line-clamp-2 font-sans text-[14px] font-medium leading-snug">{entry.why}</p> : null}
      {owner ? (
        <div className="flex gap-2 font-sans">
          <button
            type="button"
            disabled={tap.busy !== null}
            onClick={() => void take()}
            className="h-11 flex-1 rounded-full bg-[#0b0b0b] font-semibold text-[15px] text-white disabled:opacity-60"
          >
            {tap.busy !== null ? "Signing…" : tap.blocker ? tap.blocker.label : "Take it"}
          </button>
          <button
            type="button"
            onClick={() => void answer("passed")}
            className="h-11 rounded-full bg-black/10 px-5 font-semibold text-[15px]"
          >
            Pass
          </button>
        </div>
      ) : null}
    </div>
  );
}
