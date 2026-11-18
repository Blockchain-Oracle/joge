"use client";

import { useQuery } from "@tanstack/react-query";
import { Bot, Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState, Skeleton } from "@/kit";
import { useWorld } from "../shell/world.tsx";
import { useWallet } from "../wallet/wallet-context.tsx";
import { AgentTile } from "./agent-card.tsx";
import { agentsQuery } from "./api.ts";
import { DecisionFeed } from "./decision-feed.tsx";

/**
 * Agents (F13, D21): characters, not a form. Yours first, then everyone's, ranked by the money their owners entrusted
 * (never by wins). Building one is one pill away.
 */
export function AgentsPage() {
  const network = useWorld();
  const wallet = useWallet();
  const owners = wallet.keys.map((key) => key.pkh);
  const all = useQuery(agentsQuery(network));
  const mine = useQuery({ ...agentsQuery(network, owners), enabled: owners.length > 0 });
  const yours = owners.length > 0 ? (mine.data ?? []) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 pt-2">
        <h1 className="nx-display text-[clamp(36px,5vw,56px)]">Agents</h1>
        <Link
          href="/agents/studio"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--ink)] pr-5 pl-4 font-semibold text-[15px] text-[var(--ink-inverse)]"
        >
          <Plus size={18} aria-hidden /> Build one
        </Link>
      </div>
      {yours.length > 0 ? (
        <section className="flex flex-col gap-3" aria-label="Yours">
          <p className="nx-eyebrow">Yours</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {yours.map((agent) => (
              <AgentTile key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      ) : null}
      <DecisionFeed />
      <section className="flex flex-col gap-3" aria-label="Every agent">
        <p className="nx-eyebrow">By money entrusted</p>
        {all.isPending ? <Skeleton className="h-[110px] rounded-[24px]" label="Loading agents" /> : null}
        {all.isSuccess && all.data.length === 0 ? (
          <EmptyState icon={Bot} title="No agents yet" action={{ label: "Build one", href: "/agents/studio" }} />
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(all.data ?? []).map((agent, index) => (
            <AgentTile key={agent.id} agent={agent} rank={index + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}
