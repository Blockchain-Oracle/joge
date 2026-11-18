"use client";

import type { LaneView } from "@joge/db";
import { toDollars } from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";
import { lobbyQuery } from "../rounds/api.ts";
import { useWorld } from "../shell/world.tsx";
import { DEFAULT_THREAD } from "./constants.ts";

const LANE_KEY = "joge:lane";
const listeners = new Set<() => void>();
const stored = () => {
  try {
    return Number(localStorage.getItem(LANE_KEY)) || DEFAULT_THREAD;
  } catch {
    return DEFAULT_THREAD;
  }
};

const running = (lane: LaneView) => lane.next !== null || lane.live !== null;
/** How often a lane on screen asks to stay awake (the server keeps it 30 minutes per ask). */
const MINUTE_MS = 60_000;
const WAKE_EVERY_MINUTES = 5;
const WAKE_EVERY_MS = WAKE_EVERY_MINUTES * MINUTE_MS;

/**
 * Keeps the lane on screen awake: asks once when it appears and every few minutes while it stays (the keeper's
 * on-demand mode opens rounds only on lanes someone is looking at; always-open lanes ignore it).
 */
export function useWakeLane(thread: number | undefined) {
  const network = useWorld();
  useEffect(() => {
    if (thread === undefined) return;
    const wake = () => {
      if (document.visibilityState !== "visible") return;
      void fetch(`/api/lanes/${thread}/wake?network=${network}`, { method: "POST" }).catch(() => undefined);
    };
    wake();
    const timer = setInterval(wake, WAKE_EVERY_MS);
    return () => clearInterval(timer);
  }, [thread, network]);
}

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
  // Every lane: the running ones first, then the sleeping ones (on-demand lanes wake when picked).
  const all = lobby.data?.lanes ?? [];
  const lanes: LaneView[] = [...all.filter(running), ...all.filter((lane) => !running(lane))];
  const lane = lanes.find((candidate) => candidate.thread === thread) ?? lanes[0];
  const live = lane?.live ?? null;
  const strike =
    lane && live?.liveStrike !== null && live?.liveStrike !== undefined ? toDollars(lane.asset, live.liveStrike) : null;
  return { lane, lanes, live, next: lane?.next ?? null, strike, loading: lobby.isPending };
}
