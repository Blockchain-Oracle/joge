"use client";

import type { FeedDecision } from "@joge/db";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useWorld } from "../shell/world.tsx";
import type { Wire } from "./api.ts";
import { DecisionTile, TileKey } from "./decision-tile.tsx";
import { Portrait } from "./portrait.tsx";

type Decision = Wire<FeedDecision>;
const REFRESH_MS = 20_000;
const FACE = 40;
const AGENTS_SHOWN = 6;
const TILES_SHOWN = 10;

/**
 * What the agents are deciding: one row per agent — its
 * face and name, then its latest calls as small tiles, newest on the right. The words are on each tile's label and on
 * the agent's own page.
 */
export function DecisionFeed() {
  const network = useWorld();
  const feed = useQuery({
    queryKey: ["agent-decisions", network],
    queryFn: async (): Promise<Decision[]> => (await fetch(`/api/agents/decisions?network=${network}`)).json(),
    refetchInterval: REFRESH_MS,
  });
  if (!feed.data || feed.data.length === 0) return null;
  const byAgent = new Map<number, Decision[]>();
  for (const decision of feed.data) {
    const list = byAgent.get(decision.agentId) ?? [];
    if (list.length < TILES_SHOWN) list.push(decision);
    byAgent.set(decision.agentId, list);
  }
  const agents = [...byAgent.values()].slice(0, AGENTS_SHOWN);
  return (
    <section className="flex flex-col gap-3" aria-label="Latest decisions">
      <p className="nx-eyebrow">Latest decisions</p>
      <ol className="flex flex-col gap-1.5">
        {agents.map((decisions) => {
          const first = decisions[0];
          if (!first) return null;
          return (
            <li key={first.agentId}>
              <Link
                href={`/agents/${first.agentId}`}
                className="flex items-center gap-3 rounded-[20px] bg-[var(--surface-1)] p-2.5 pr-3 hover:bg-[var(--surface-2)]"
              >
                <Portrait seed={first.agentFace} name={first.agentName} size={FACE} />
                <span className="w-28 shrink-0 truncate font-semibold text-[14px]">{first.agentName}</span>
                <span className="flex min-w-0 flex-1 justify-end gap-1 overflow-hidden">
                  {[...decisions].reverse().map((decision) => (
                    <DecisionTile key={decision.id} decision={decision} size="sm" />
                  ))}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <TileKey />
    </section>
  );
}
