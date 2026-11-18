"use client";

import type { AgentRow, MemoryEntry, Network, ReadOutcome } from "@joge/db";
import { queryOptions } from "@tanstack/react-query";
import { fromWire } from "@/lib/wire";

/** What JSON makes of a database row: dates arrive as ISO strings. */
export type Wire<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] extends Date | null ? string | null : T[K] };

export type Agent = Wire<AgentRow>;
export type Memory = Wire<MemoryEntry>;
export type { ReadOutcome };

/** What the studio sends: an agent before it exists. */
export interface AgentDraft {
  name: string;
  persona: string;
  posture: "guarded" | "balanced" | "active" | "partner";
  lanes: number[];
  perBetCap: number;
  dailyCap: number;
  mode: "ask" | "auto";
  copiedFrom?: number | null;
  /** The face picked in the studio (a DiceBear seed). */
  face?: string;
}

export interface DryRead {
  round: { roundId: number; asset: string; laneSeconds: number; lockTime: number };
  read: { side: "up" | "down" | "hold"; confidence: number; why: string };
  gate: { enter: boolean; stake: string; reason: string };
  model: string;
  promptHash: string;
}

async function json<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? `The server answered ${response.status}`);
  return body;
}

/** Every agent, most money entrusted first; with `owners`, one wallet's agents. */
export const agentsQuery = (network: Network, owners: string[] = []) =>
  queryOptions({
    // "all" and a wallet's list never share a cache entry (an empty owner list would otherwise read as "all").
    queryKey: ["agents", network, owners.length > 0 ? `owners:${owners.join(",")}` : "all"],
    queryFn: async () => {
      const filter = owners.length > 0 ? `&owners=${owners.join(",")}` : "";
      return (await json<{ agents: Agent[] }>(await fetch(`/api/agents?network=${network}${filter}`))).agents;
    },
  });

export const agentQuery = (network: Network, id: number) =>
  queryOptions({
    queryKey: ["agent", network, id],
    queryFn: async () =>
      json<{ agent: Agent; memory: Memory[]; vaultAddress: string }>(
        await fetch(`/api/agents/${id}?network=${network}`),
      ),
  });

const send = (url: string, method: "POST" | "PATCH", body: unknown) =>
  fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export const createAgent = async (network: Network, draft: AgentDraft) =>
  (await json<{ agent: Agent }>(await send(`/api/agents?network=${network}`, "POST", draft))).agent;

export const patchAgent = async (
  network: Network,
  id: number,
  patch: Partial<Omit<AgentDraft, "perBetCap" | "copiedFrom">> & { status?: "active" | "paused" },
) => (await json<{ agent: Agent }>(await send(`/api/agents/${id}?network=${network}`, "PATCH", patch))).agent;

export const dryRead = async (network: Network, draft: AgentDraft) =>
  json<DryRead>(await send(`/api/agents/dry-read?network=${network}`, "POST", draft));

export const answerProposal = async (network: Network, readId: number, proposal: "taken" | "passed") =>
  json<{ ok: true }>(await send(`/api/agents/reads/${readId}?network=${network}`, "PATCH", { proposal }));

/** The server builds the owner's withdrawal (the vault is SolidCash, so it never ships to a page); the wallet signs. */
export async function requestWithdraw(
  network: Network,
  id: number,
  coin: { txid: string; vout: number; satoshis: bigint; address: string },
) {
  const body = await json<{ transaction: string; amount: string }>(
    await send(`/api/agents/${id}/withdraw?network=${network}`, "POST", {
      coin: { ...coin, satoshis: coin.satoshis.toString() },
    }),
  );
  return { transaction: fromWire(body.transaction), amount: BigInt(body.amount) };
}
