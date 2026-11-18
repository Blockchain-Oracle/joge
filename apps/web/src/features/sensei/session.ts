"use client";

import type { SenseiSession } from "@joge/brain";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { effective, useLimits } from "../limits/limits.ts";
import { useWorld } from "../shell/world.tsx";
import { useJournal } from "../ticket/journal.ts";
import { useWallet } from "../wallet/wallet-context.tsx";

const RESULTS = 20;
const STAKES = 10;
const SETTLED = new Set(["won", "lost", "refunded"]);
/** Tilt: this many asks inside this window (mirrors @joge/brain's TILT_ASKS / TILT_WINDOW_MS, kept client-side). */
const TILT_ASKS = 4;
const TILT_WINDOW_MS = 180_000;

interface TicketRow {
  ticket: { status: string; enteredAt: string };
}

/**
 * What Sensei hears about the player, from this browser only: settled results (from the tickets of the paired wallet),
 * the last stakes (from the journal), their own play limits and the tilt flag. The address itself is never sent.
 */
export function useSenseiSession(stakeUsd: number) {
  const network = useWorld();
  const wallet = useWallet();
  const journal = useJournal();
  const limits = useLimits();
  const [asks, setAsks] = useState<number[]>([]);
  const receive = wallet.keys.filter((key) => key.path === "receive").map((key) => key.pkh);
  const tickets = useQuery({
    queryKey: ["tickets", network, receive.join(",")],
    enabled: receive.length > 0,
    queryFn: async () => {
      const response = await fetch(`/api/tickets?network=${network}&pkh=${receive.join(",")}`);
      return ((await response.json()) as { tickets: TicketRow[] }).tickets;
    },
  });
  const now = Date.now();
  const recentAsks = asks.filter((at) => now - at < TILT_WINDOW_MS);
  const tilt = recentAsks.length >= TILT_ASKS;
  const inForce = effective(limits, now);
  const session: SenseiSession = {
    network,
    tilt,
    results: (tickets.data ?? [])
      .filter((row) => SETTLED.has(row.ticket.status))
      .slice(0, RESULTS)
      .map((row) => row.ticket.status as SenseiSession["results"][number]),
    stakesUsd: journal
      .filter((entry) => entry.network === network && entry.usd !== undefined)
      .slice(0, STAKES)
      .map((entry) => entry.usd ?? 0),
    stakeUsd,
    dailyLimitUsd: inForce.dailyUsd,
    onBreak: inForce.coolOffUntil !== null,
  };
  return {
    session,
    tilt,
    recordAsk: () => setAsks((previous) => [...previous.filter((at) => now - at < TILT_WINDOW_MS), Date.now()]),
  };
}
