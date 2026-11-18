"use client";

import type { LaneView, RoundCard } from "@joge/db";
import { useMemo } from "react";
import { useSpot } from "../chart/use-spot.ts";
import { useWorld } from "../shell/world.tsx";
import { useJournal } from "../ticket/journal.ts";
import { type Holding, type Position, positionOf } from "./position.ts";

/** A decided round of yours stays on the stage this long after its close, so the result is seen where it was played. */
const SHOW_DECIDED_SECONDS = 180;
const HELD = new Set(["signed", "sent", "confirmed"]);

/** Your stakes in one round from this browser's journal, one holding per side. */
function holdingsIn(entries: ReturnType<typeof useJournal>, roundId: number): Holding[] {
  const bySide = new Map<0 | 1, number>();
  for (const entry of entries) {
    if (entry.roundId !== roundId || !HELD.has(entry.state)) continue;
    const side = entry.outcome === 0 ? 0 : 1;
    bySide.set(side, (bySide.get(side) ?? 0) + Number(entry.stake));
  }
  return [...bySide].map(([side, stake]) => ({ side, stake }));
}

/**
 * Your positions on the lane on screen: the running round, the one taking entries and, for a few minutes, the one that
 * just decided. Read from this browser's journal, so a call shows the moment it is signed.
 */
export function useLanePositions(lane: LaneView | undefined, now: number) {
  const network = useWorld();
  const journal = useJournal();
  const priceNow = useSpot(lane?.asset);
  return useMemo(() => {
    if (!lane) return { live: null, list: [] as Array<{ round: RoundCard; position: Position }> };
    const mine = journal.filter((entry) => entry.network === network);
    const recent = lane.last && now - lane.last.closeTime < SHOW_DECIDED_SECONDS ? lane.last : null;
    const rounds = [lane.live, lane.next, recent].filter((round): round is RoundCard => round !== null);
    const list = rounds.flatMap((round) =>
      holdingsIn(mine, round.roundId).map((holding) => ({
        round,
        position: positionOf(round, holding, priceNow, now),
      })),
    );
    // The chart shows the running round: mark your side on it when you hold one.
    const live = list.find((item) => item.round.roundId === lane.live?.roundId)?.position ?? null;
    return { live, list };
  }, [lane, journal, network, priceNow, now]);
}
