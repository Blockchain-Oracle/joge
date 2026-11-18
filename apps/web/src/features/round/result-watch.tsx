"use client";

import { useCallback, useRef } from "react";
import { confetti, cue, toast } from "@/kit";
import { useLiveEvent } from "@/live/hooks";
import type { LiveEvents } from "@/live/stream";
import { roundName } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import { useJournal } from "../ticket/journal.ts";
import { useWallet } from "../wallet/wallet-context.tsx";
import type { RoundViewResponse } from "./api.ts";

/** The win or loss chord follows the stamp's thud. */
const AFTER_STAMP_MS = 240;

/**
 * The money moment (verdict toast, seal): when a round this browser entered settles, the toast wears
 * its hanko (的中 / 外れ / 無効), thuds in, plays the win or loss chord and, on a win, throws confetti from both corners;
 * the payout follows as its own toast. Everything lands in the notices bell; a tap opens the round. Nobody has to keep
 * the round open.
 */
export function ResultWatch() {
  const journal = useJournal();
  const wallet = useWallet();
  const money = useMoney();
  const format = useRef(money.format);
  format.current = money.format;
  const onRound = useCallback(
    async (event: LiveEvents["round"]) => {
      if (
        event.kind !== "settle" &&
        event.kind !== "settle-timeout" &&
        event.kind !== "lock" &&
        event.kind !== "sweep"
      ) {
        return;
      }
      if (event.kind === "lock" && event.state !== "void") return;
      const entered = journal.some((entry) => entry.network === event.network && entry.roundId === event.roundId);
      if (!entered) return;
      const response = await fetch(`/api/rounds/${event.roundId}?network=${event.network}`);
      if (!response.ok) return;
      const view = (await response.json()) as RoundViewResponse;
      const mine = new Set(wallet.keys.map((key) => key.pkh));
      const tickets = view.entries.filter((entry) => mine.has(entry.payoutPkh));
      if (tickets.length === 0) return;
      // A result opens its round already playing (the round film).
      const href = `/r/${event.roundId}?play=1`;
      if (event.kind === "sweep") {
        const paid = tickets.reduce((sum, ticket) => sum + (ticket.payoutSats ?? 0), 0);
        if (paid > 0) toast({ tone: "up", title: `Paid ${format.current(paid)}`, body: roundName(view.round), href });
        return;
      }
      if (view.round.state === "void") {
        toast({ tone: "info", seal: "無効", title: "Refunded", body: roundName(view.round), href });
        return;
      }
      const hit = tickets.some((ticket) => ticket.outcome === view.round.winner);
      toast({
        tone: hit ? "up" : "info",
        seal: hit ? "的中" : "外れ",
        title: hit ? "You were right" : "Not this time",
        body: `${view.round.winner === 0 ? "Up" : "Down"} won · ${roundName(view.round)}`,
        href,
      });
      setTimeout(() => cue(hit ? "win" : "loss"), AFTER_STAMP_MS);
      if (hit) confetti();
    },
    [journal, wallet.keys],
  );
  useLiveEvent(
    "round",
    useCallback((event: LiveEvents["round"]) => void onRound(event), [onRound]),
  );
  return null;
}
