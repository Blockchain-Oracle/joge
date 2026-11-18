"use client";

import type { FeedDecision } from "@joge/db";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { cx } from "@/kit";
import { clockTime, laneLabel } from "../rounds/format.ts";
import { useWorld } from "../shell/world.tsx";
import type { Wire } from "./api.ts";
import { PERCENT } from "./constants.ts";
import { Portrait } from "./portrait.tsx";

type Decision = Wire<FeedDecision>;
const REFRESH_MS = 20_000;
const FACE = 40;
const MS_PER_SECOND = 1_000;

const ENDING: Record<string, { text: string; tone: string }> & { skipped: { text: string; tone: string } } = {
  won: { text: "Right", tone: "text-[var(--up-text)]" },
  lost: { text: "Wrong", tone: "text-[var(--down-text)]" },
  refunded: { text: "Refunded", tone: "text-[var(--gold-text)]" },
  pending: { text: "Live", tone: "text-[var(--ink)]" },
  skipped: { text: "Sat out", tone: "text-[var(--muted)]" },
};

/**
 * What the agents are deciding right now, all of them (his feedback: be able to see every decision): each row is the
 * agent's face and name, its call and how sure, the round, its one-line reason, and how it ended. Tap to the agent.
 */
export function DecisionFeed() {
  const network = useWorld();
  const feed = useQuery({
    queryKey: ["agent-decisions", network],
    queryFn: async (): Promise<Decision[]> => (await fetch(`/api/agents/decisions?network=${network}`)).json(),
    refetchInterval: REFRESH_MS,
  });
  if (!feed.data || feed.data.length === 0) return null;
  return (
    <section className="flex flex-col gap-3" aria-label="Latest decisions">
      <p className="nx-eyebrow">Latest decisions</p>
      <ol className="grid gap-1.5 lg:grid-cols-2">
        {feed.data.map((entry) => {
          const ending = ENDING[entry.outcome] ?? ENDING.skipped;
          const call = entry.side === "up" ? "上 Up" : entry.side === "down" ? "下 Down" : "— No call";
          return (
            <li key={entry.id}>
              <Link
                href={`/agents/${entry.agentId}`}
                className="flex items-center gap-3 rounded-[20px] bg-[var(--surface-1)] p-2.5 pr-4 hover:bg-[var(--surface-2)]"
              >
                <Portrait seed={entry.agentFace} name={entry.agentName} size={FACE} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-baseline gap-2 truncate">
                    <span className="truncate font-semibold text-[14px]">{entry.agentName}</span>
                    <span
                      className={cx(
                        "nx-jp shrink-0 text-[13px] font-semibold",
                        entry.side === "up"
                          ? "text-[var(--up-text)]"
                          : entry.side === "down"
                            ? "text-[var(--down-text)]"
                            : "text-[var(--muted)]",
                      )}
                    >
                      {call}
                      {entry.confidence === null ? "" : ` · ${Math.round(entry.confidence * PERCENT)}%`}
                    </span>
                    <span className="nx-num shrink-0 text-[12px] text-[var(--muted)]">
                      {entry.asset ?? ""} {entry.laneSeconds ? laneLabel(entry.laneSeconds) : ""} ·{" "}
                      {clockTime(Date.parse(entry.createdAt) / MS_PER_SECOND)}
                    </span>
                  </span>
                  {(entry.why ?? entry.reason) ? (
                    <span className="truncate text-[13px] text-[var(--ink-2)]">{entry.why ?? entry.reason}</span>
                  ) : null}
                </span>
                <span className={cx("nx-num shrink-0 text-[13px] font-semibold", ending.tone)}>{ending.text}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
