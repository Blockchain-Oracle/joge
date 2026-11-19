"use client";

import type { Network, RoundCard } from "@joge/db";
import { useMemo } from "react";
import { useWorld } from "../shell/world.tsx";
import { type JournalEntry, useJournal } from "./journal.ts";

/** A sent entry the server has not listed yet is shown for at most this long (it confirms in seconds). */
const PENDING_MS = 600_000;
const IN_FLIGHT = new Set(["signed", "sent"]);

/** This browser's entries on the wire: signed or sent, recent, not yet in the round's own list. */
export function inFlight(
  journal: JournalEntry[],
  network: Network,
  roundId: number,
  known: Iterable<string> | undefined,
) {
  const seen = new Set(known ?? []);
  const now = Date.now();
  return journal.filter(
    (entry) =>
      entry.network === network &&
      entry.roundId === roundId &&
      IN_FLIGHT.has(entry.state) &&
      entry.txid !== undefined &&
      !seen.has(entry.txid) &&
      now - entry.at < PENDING_MS,
  );
}

/**
 * The round as it will read once the indexer counts your entry: your stake in its side's total, the pot and the
 * entry count. The chain already has it; this only spares the seconds before the server lists it.
 */
export function withEntries<T extends Pick<RoundCard, "totals" | "pot" | "entrants">>(
  round: T,
  entries: JournalEntry[],
): T {
  if (entries.length === 0) return round;
  const totals = [...round.totals];
  let pot = Number(round.pot);
  for (const entry of entries) {
    const stake = Number(entry.stake);
    totals[entry.outcome] = (totals[entry.outcome] ?? 0) + stake;
    pot += stake;
  }
  return { ...round, totals, pot, entrants: round.entrants + entries.length };
}

/** Lobby rounds with your in-flight entries folded in (only open and running rounds carry their entry list). */
export function usePendingRound(round: RoundCard | null): RoundCard | null {
  const network = useWorld();
  const journal = useJournal();
  return useMemo(() => {
    if (!round || round.entryTxids === undefined) return round;
    return withEntries(round, inFlight(journal, network, round.roundId, round.entryTxids));
  }, [round, journal, network]);
}
