"use client";

import { TICKET_DUST, toDollars } from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ASSET_TONE } from "@/marks/asset";
import { filmOf } from "../replay/film.ts";
import { filmQuery } from "../replay/round-film.tsx";
import { roundQuery } from "../round/api.ts";
import { clockTime, laneLabel, usd } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import { useWorld } from "../shell/world.tsx";
import { useWallet } from "../wallet/wallet-context.tsx";
import type { ShareWords } from "./receipt.ts";

const HIDDEN = "••••";
const PERCENT = 100;
const DAY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const SIGNED = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", signDisplay: "always" });
const SECOND_MS = 1_000;
const HALF_CENT = 0.005;
const SATS_PER_BCH = 100_000_000;

/**
 * What a share image says about a decided round of yours: the film (path, entries, cues) with your tickets marked, and
 * the words (amounts masked when `hidden`). Null until both are loaded, or when you had no ticket in it.
 */
export function useShare(roundId: number, hidden: boolean, focus?: string) {
  const network = useWorld();
  const wallet = useWallet();
  const money = useMoney();
  const view = useQuery(roundQuery(network, roundId));
  const filmData = useQuery(filmQuery(network, roundId));
  return useMemo(() => {
    const round = view.data?.round;
    if (!round || !filmData.data || !money.bchUsd) return null;
    // `focus` (the design gallery only) looks at someone else's tickets as if they were yours.
    const mine = new Set(focus ? [focus] : wallet.keys.map((key) => key.pkh));
    const tickets = view.data?.entries.filter((entry) => mine.has(entry.payoutPkh)) ?? [];
    if (tickets.length === 0) return null;
    const film = filmOf(filmData.data, mine, money.bchUsd);
    if (!film) return null;
    const side = (tickets[0]?.outcome === 0 ? 0 : 1) as 0 | 1;
    const stake = tickets.reduce((sum, ticket) => sum + ticket.stake, 0);
    const back = tickets.reduce((sum, ticket) => sum + Math.max(0, (ticket.payoutSats ?? 0) - Number(TICKET_DUST)), 0);
    // A win the fees ate to under half a cent reads as even, not "−$0.00".
    const raw = back - stake;
    const net = Math.abs((raw / SATS_PER_BCH) * money.bchUsd) < HALF_CENT ? 0 : raw;
    const verdict: ShareWords["verdict"] =
      round.state === "void" ? "void" : tickets.some((ticket) => ticket.outcome === round.winner) ? "hit" : "miss";
    const roiValue = Math.round((Math.abs(net) / Math.max(1, stake)) * PERCENT);
    const roi = roiValue === 0 ? "0%" : `${net > 0 ? "+" : "−"}${roiValue}%`;
    const strike = round.strikePrice === null ? null : toDollars(round.asset, round.strikePrice);
    const close = round.closePrice === null ? null : toDollars(round.asset, round.closePrice);
    const toUsd = (sats: number) => (sats / SATS_PER_BCH) * (money.bchUsd ?? 0);
    const words: ShareWords = {
      // The world rides along: round numbers repeat across chipnet and mainnet.
      url: new URL(`/r/${roundId}?w=${network}`, window.location.origin).toString(),
      assetName: ASSET_TONE[round.asset].name,
      lane: round.laneSeconds ? laneLabel(round.laneSeconds) : "",
      window: `${clockTime(round.lockTime)} → ${clockTime(round.closeTime)}`,
      date: DAY.format(round.closeTime * SECOND_MS),
      side,
      verdict,
      headline:
        verdict === "void"
          ? hidden
            ? "0%"
            : `${money.format(back)} back`
          : hidden
            ? roi
            : net === 0
              ? "$0.00"
              : SIGNED.format(toUsd(net)),
      subline: hidden || verdict === "void" ? "" : `${roi} · ${money.format(back)} back`,
      stake: hidden ? HIDDEN : money.format(stake),
      back: hidden ? HIDDEN : money.format(back),
      pot: money.format(round.pot),
      entrants: round.entrants,
      line: strike === null ? null : usd(strike),
      close: close === null ? null : usd(close),
    };
    return { film, words, stakeSats: stake, round, net, roi };
  }, [view.data, filmData.data, money, wallet.keys, roundId, hidden, focus]);
}
