"use client";

import type { LaneView } from "@joge/db";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { cx } from "@/kit";
import { type Agent, agentQuery, agentsQuery } from "../agents/api.ts";
import { useSatsUsd } from "../agents/format.ts";
import { faceOf } from "../agents/names.ts";
import { Portrait } from "../agents/portrait.tsx";
import { useWorld } from "../shell/world.tsx";

const SHOWN = 4;
const PERCENT = 100;

function AgentCall({ agent, roundIds }: { agent: Agent; roundIds: number[] }) {
  const network = useWorld();
  const money = useSatsUsd();
  const view = useQuery(agentQuery(network, agent.id));
  const read = view.data?.memory.find((entry) => roundIds.includes(entry.roundId) && entry.verdict !== "reading");
  const side = read?.side;
  return (
    <Link href={`/agents/${agent.id}`} className="flex items-center gap-3 rounded-[18px] p-2 hover:bg-[var(--glass)]">
      <Portrait seed={faceOf(agent)} name={agent.name} size={44} />
      <span className="min-w-0 flex-1">
        <span className="nx-display block truncate text-[15px]">{agent.name}</span>
        <span className="nx-num block text-[12px] text-[var(--muted)]">{money.format(agent.vaultSats)}</span>
      </span>
      {side === "up" || side === "down" ? (
        <span
          className={cx(
            "flex items-center gap-1.5 rounded-[10px] px-2 py-1",
            side === "up" ? "bg-[var(--up)] text-[var(--up-ink)]" : "bg-[var(--down)] text-[var(--down-ink)]",
          )}
        >
          <span className="nx-jp text-[15px] leading-none">{side === "up" ? "上" : "下"}</span>
          <span className="nx-num text-[12px] font-semibold">{Math.round((read?.confidence ?? 0) * PERCENT)}%</span>
        </span>
      ) : (
        <span className="nx-eyebrow">{side === "hold" ? "sits out" : "reading"}</span>
      )}
    </Link>
  );
}

/** The agents playing this lane, as characters with their call on the round in front of you. */
export function LaneAgents({ lane }: { lane: LaneView }) {
  const network = useWorld();
  const agents = useQuery(agentsQuery(network));
  // Only agents at work: a paused agent reads nothing, so it has no place under "Agents here".
  const here = (agents.data ?? [])
    .filter((agent) => agent.status === "active" && agent.lanes.includes(lane.thread))
    .slice(0, SHOWN);
  if (here.length === 0) return null;
  const roundIds = [lane.next?.roundId, lane.live?.roundId].filter((id): id is number => typeof id === "number");
  return (
    <div className="flex flex-col gap-1">
      <p className="nx-eyebrow px-2 pb-1">Agents here</p>
      {here.map((agent) => (
        <AgentCall key={agent.id} agent={agent} roundIds={roundIds} />
      ))}
    </div>
  );
}
