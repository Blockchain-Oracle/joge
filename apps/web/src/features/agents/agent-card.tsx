"use client";

import Link from "next/link";
import { cx, Ring } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { useNow } from "../rounds/use-now.ts";
import { useLane } from "../terminal/use-lane.ts";
import type { Agent } from "./api.ts";
import { laneOf, useSatsUsd } from "./format.ts";
import { faceOf } from "./names.ts";
import { Portrait } from "./portrait.tsx";

const SECOND_MS = 1_000;
const TILE_RING = 40;

/** When an agent makes its next call: the soonest round taking entries in its lanes, and that lane's length. */
export function useNextCall(lanes: number[]) {
  const { lanes: views } = useLane();
  const now = useNow();
  const due = views
    .filter((view) => lanes.includes(view.thread) && view.next)
    .map((view) => ({ left: ((view.next?.lockTime ?? 0) - now) * SECOND_MS, span: view.seconds * SECOND_MS }))
    .sort((a, b) => a.left - b.left)[0];
  return now > 0 ? (due ?? null) : null;
}

/** The lanes an agent plays, as small asset cubes. */
export function LaneCubes({ lanes, size = 22 }: { lanes: number[]; size?: number }) {
  return (
    <span className="flex -space-x-1.5">
      {lanes.map((thread) => {
        const lane = laneOf(thread);
        return lane ? (
          <AssetCube key={thread} asset={lane.asset} size={size} className="ring-2 ring-[var(--surface-1)]" />
        ) : null;
      })}
    </span>
  );
}

/**
 * An agent as a character: its face breathing on its own beat, its name, the money its owner
 * entrusted (the ranking), its lanes, and a ring to its next call. Nothing else.
 */
export function AgentTile({ agent, rank }: { agent: Agent; rank?: number }) {
  const money = useSatsUsd();
  const next = useNextCall(agent.lanes);
  const paused = agent.status !== "active";
  return (
    <Link
      href={`/agents/${agent.id}`}
      className={cx(
        "group flex items-center gap-4 rounded-[24px] bg-[var(--surface-1)] p-4 transition-transform hover:-translate-y-0.5",
        paused && "opacity-60",
      )}
    >
      <Portrait seed={faceOf(agent)} name={agent.name} size={68} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {rank ? (
            <span className="nx-num text-[12px] text-[var(--muted)]">{String(rank).padStart(2, "0")}</span>
          ) : null}
          <span className="nx-display truncate text-[18px]">{agent.name}</span>
        </span>
        <span className="nx-num mt-1 block text-[24px] font-semibold leading-none tracking-[-0.04em]">
          {money.format(agent.vaultSats)}
        </span>
        <span className="mt-2 flex items-center gap-2">
          <LaneCubes lanes={agent.lanes} />
          {paused ? <span className="nx-eyebrow">paused</span> : null}
        </span>
      </span>
      {next && !paused ? <Ring leftMs={next.left} spanMs={next.span} size={TILE_RING} label="Next call in" /> : null}
    </Link>
  );
}
