"use client";

import type { LaneView } from "@joge/db";
import { toDollars } from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { lobbyQuery } from "../rounds/api.ts";
import { useWorld } from "../shell/world.tsx";
import { DEFAULT_THREAD, MARKET_THREADS } from "./constants.ts";

const LANE_KEY = "joge:lane";
const listeners = new Set<() => void>();
const stored = () => {
  try {
    return Number(localStorage.getItem(LANE_KEY)) || DEFAULT_THREAD;
  } catch {
    return DEFAULT_THREAD;
  }
};

/** The lane on screen survives a reload (Agari's pinned ticker). */
export function pickLane(thread: number) {
  try {
    localStorage.setItem(LANE_KEY, String(thread));
  } catch {
    // It still holds for this page.
  }
  for (const listener of listeners) listener();
}

/** The lane on screen, every lane of the lobby, and the live round's price to beat in dollars. */
export function useLane() {
  const network = useWorld();
  const lobby = useQuery(lobbyQuery(network));
  const thread = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    stored,
    () => DEFAULT_THREAD,
  );
  // The four markets, in their order (BTC, ETH, BCH every 5 minutes; gold every hour).
  const all = lobby.data?.lanes ?? [];
  const lanes: LaneView[] = MARKET_THREADS.flatMap((thread) => all.filter((lane) => lane.thread === thread));
  const lane = lanes.find((candidate) => candidate.thread === thread) ?? lanes[0];
  const live = lane?.live ?? null;
  const strike =
    lane && live?.liveStrike !== null && live?.liveStrike !== undefined ? toDollars(lane.asset, live.liveStrike) : null;
  return { lane, lanes, live, next: lane?.next ?? null, strike, loading: lobby.isPending };
}
