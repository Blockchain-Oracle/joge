"use client";

import type { LaneView } from "@joge/db";
import { toDollars } from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { lobbyQuery } from "../rounds/api.ts";
import { useWorld } from "../shell/world.tsx";
import { useJournal } from "../ticket/journal.ts";
import { inFlight, withEntries } from "../ticket/pending.ts";
import { DEFAULT_THREAD, MARKET_THREADS } from "./constants.ts";

const LANE_KEY = "joge:lane";
/** While a market is on screen the page asks for its rounds this often (the server keeps them opening 10 minutes). */
const WAKE_EVERY_MS = 120_000;
const listeners = new Set<() => void>();
const stored = () => {
  try {
    return Number(localStorage.getItem(LANE_KEY)) || DEFAULT_THREAD;
  } catch {
    return DEFAULT_THREAD;
  }
};

/**
 * Someone is looking at this market: ask the keeper to keep its rounds opening (mainnet runs rounds only while someone
 * looks; chipnet's markets run nonstop and ignore it). Repeats while the tab is visible.
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
    document.addEventListener("visibilitychange", wake);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [thread, network]);
}

/** The lane on screen survives a reload (pinned ticker). */
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
  const journal = useJournal();
  // The four markets, in their order (BTC, ETH, BCH every 5 minutes; gold every hour). Your entries on the wire count
  // at once: the chain has them, the server lists them a few seconds later.
  const lanes: LaneView[] = useMemo(() => {
    const all = lobby.data?.lanes ?? [];
    const mine = (round: LaneView["next"]) =>
      round?.entryTxids === undefined
        ? round
        : withEntries(round, inFlight(journal, network, round.roundId, round.entryTxids));
    return MARKET_THREADS.flatMap((thread) => all.filter((lane) => lane.thread === thread)).map((lane) => ({
      ...lane,
      next: mine(lane.next),
      live: mine(lane.live),
    }));
  }, [lobby.data, journal, network]);
  const lane = lanes.find((candidate) => candidate.thread === thread) ?? lanes[0];
  const live = lane?.live ?? null;
  const strike =
    lane && live?.liveStrike !== null && live?.liveStrike !== undefined ? toDollars(lane.asset, live.liveStrike) : null;
  return { lane, lanes, live, next: lane?.next ?? null, strike, loading: lobby.isPending };
}
