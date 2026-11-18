"use client";

import { useQuery } from "@tanstack/react-query";
import { Bot, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, Ring, Skeleton } from "@/kit";
import { profileHref } from "../players/api.ts";
import { EXPLORER } from "../round/api.ts";
import { useWorld } from "../shell/world.tsx";
import { useWallet } from "../wallet/wallet-context.tsx";
import { LaneCubes, useNextCall } from "./agent-card.tsx";
import { agentQuery } from "./api.ts";
import { Decisions } from "./decisions.tsx";
import { MODE_COPY, ownerAddress, POSTURE_COPY, shortAddress, useSatsUsd } from "./format.ts";
import { Proposal } from "./memory.tsx";
import { faceOf } from "./names.ts";
import { OwnerPanel } from "./owner-panel.tsx";
import { Portrait } from "./portrait.tsx";
import { useVault } from "./vault.ts";

const FACE = 112;
const NEXT_RING = 64;

/**
 * One agent: its face and name, the money in its vault (read live from the chain) as the one big figure, a
 * ring to its next call, the owner's four buttons, its brief, open proposals and every call it made.
 */
export function AgentView({ id }: { id: number }) {
  const network = useWorld();
  const wallet = useWallet();
  const money = useSatsUsd();
  const view = useQuery(agentQuery(network, id));
  const vault = useVault(network, view.data?.agent.vaultLockingBytecode);
  const next = useNextCall(view.data?.agent.lanes ?? []);
  const [briefOpen, setBriefOpen] = useState(false);

  if (view.isPending) return <Skeleton className="h-[480px] rounded-[32px]" label="Loading the agent" />;
  if (!view.data) {
    return <EmptyState icon={Bot} title="No such agent" action={{ label: "Agents", href: "/agents" }} />;
  }
  const { agent, memory, vaultAddress } = view.data;
  const owner = wallet.keys.some((key) => key.pkh === agent.ownerPkh);
  const held = vault.data?.sats ?? BigInt(agent.vaultSats);
  const proposals = memory.filter((entry) => entry.proposal === "open");
  const addressPage = EXPLORER[network].replace("/tx/", "/address/");

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-6 rounded-[32px] bg-[var(--stage)] p-6 shadow-[inset_0_0_0_1px_var(--hairline)] md:p-8">
        <div className="flex items-start gap-5">
          <Portrait seed={faceOf(agent)} name={agent.name} size={FACE} />
          <div className="min-w-0 flex-1">
            <h1 className="nx-display truncate text-[clamp(30px,4.6vw,48px)]">{agent.name}</h1>
            <p className="nx-eyebrow mt-2">
              {POSTURE_COPY[agent.posture].label} · {MODE_COPY[agent.mode].tag}
              {agent.status === "active" ? "" : " · paused"}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <LaneCubes lanes={agent.lanes} size={26} />
              <Link
                href={profileHref(network, agent.ownerPkh) as never}
                className="nx-num text-[12px] text-[var(--muted)] hover:text-[var(--ink)]"
              >
                {shortAddress(ownerAddress(network, agent.ownerPkh))}
                {owner ? " · you" : ""}
              </Link>
            </div>
          </div>
          {next && agent.status === "active" ? (
            <Ring leftMs={next.left} spanMs={next.span} size={NEXT_RING} label="Next call in" className="text-[15px]" />
          ) : null}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <span>
            <span className="nx-eyebrow block">In its vault</span>
            <span className="nx-num mt-1 block text-[clamp(44px,7vw,72px)] font-semibold leading-none tracking-[-0.05em]">
              {money.format(held)}
            </span>
          </span>
          <a
            href={`${addressPage}${vaultAddress}`}
            target="_blank"
            rel="noreferrer"
            className="nx-glass inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold"
          >
            Vault <ExternalLink size={13} aria-hidden />
          </a>
        </div>
        {owner ? <OwnerPanel agent={agent} vaultSats={held} /> : null}
        <button
          type="button"
          onClick={() => setBriefOpen((open) => !open)}
          className="rounded-[18px] bg-[var(--surface-1)] p-4 text-left text-[15px] leading-relaxed text-[var(--ink-2)]"
        >
          <span className={briefOpen ? "" : "line-clamp-2"}>“{agent.persona}”</span>
        </button>
        <Link
          href={`/agents/studio?copy=${agent.id}`}
          className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-[var(--ink)] px-5 font-semibold text-[14px] text-[var(--ink-inverse)]"
        >
          <Copy size={16} aria-hidden /> Copy this agent
        </Link>
      </section>
      {proposals.length > 0 ? (
        <section className="flex flex-col gap-2" aria-label="Proposals">
          {proposals.map((entry) => (
            <Proposal key={entry.id} entry={entry} owner={owner} />
          ))}
        </section>
      ) : null}
      <Decisions memory={memory} />
    </div>
  );
}
