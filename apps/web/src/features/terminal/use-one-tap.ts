"use client";

import type { RoundCard } from "@joge/db";
import { MAX_STAKE, MIN_STAKE, type StakeClass } from "@joge/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useSyncExternalStore } from "react";
import { useSpot } from "@/features/chart/use-spot";
import { cue, toast } from "@/kit";
import { errorText } from "@/lib/error-text";
import { useFaucet } from "../guide/faucet.ts";
import { openGuide } from "../guide/store.ts";
import { limitProblem, useLimits } from "../limits/limits.ts";
import { roundName, usd } from "../rounds/format.ts";
import { OPEN_MORE_EVENT } from "../shell/places.ts";
import { useWorld } from "../shell/world.tsx";
import { buildEntry, ENTRY_OVERHEAD, lostRace, sendEntry, txidOf } from "../ticket/entry.ts";
import { recordEntry, updateEntry, useJournal } from "../ticket/journal.ts";
import { estimatePayout } from "../ticket/payout.ts";
import { markSpent, useWalletCoins } from "../wallet/coins.ts";
import { useWallet } from "../wallet/wallet-context.tsx";
import { CLOSE_LEAD_SECONDS, STAKE_LADDER_USD, STAKE_SHARE } from "./constants.ts";

const SATS_PER_BCH = 100_000_000;
const CENTS = 100;
const SECOND_MS = 1_000;
const STAKE_KEY = "joge:stake-usd";
const LIMIT_WHEN = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" });

/* The stake is a standing setting: chosen once in the stack, used by every tap. */
const listeners = new Set<() => void>();
function chosenStake(): number | null {
  try {
    const raw = localStorage.getItem(STAKE_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}
export function setChosenStake(dollars: number) {
  try {
    localStorage.setItem(STAKE_KEY, String(dollars));
  } catch {
    // It still holds for this page.
  }
  for (const listener of listeners) listener();
}
const useChosenStake = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    chosenStake,
    () => null,
  );

export type Side = 0 | 1;

/**
 * One tap from intent to the wallet: the stake is
 * a standing choice (5 % of the balance snapped to a ladder until the player picks one), Up or Down builds the entry
 * from live chain reads and asks the wallet to sign it. Whatever blocks the tap is named on the button itself.
 */
export function useOneTap(round: RoundCard | null, stakeClass: StakeClass, stakeOverride?: number | null) {
  const network = useWorld();
  const wallet = useWallet();
  const coins = useWalletCoins();
  const faucet = useFaucet();
  const client = useQueryClient();
  const limits = useLimits();
  const journal = useJournal();
  const bchUsd = useSpot("BCH") ?? undefined;
  const chosen = useChosenStake();
  const [busy, setBusy] = useState<Side | null>(null);

  const cap = MAX_STAKE[stakeClass];
  const ladder = STAKE_LADDER_USD.filter((dollars) => !bchUsd || (dollars / bchUsd) * SATS_PER_BCH <= Number(cap));
  const balanceUsd = bchUsd && coins.data ? (Number(coins.balance) / SATS_PER_BCH) * bchUsd : null;
  const minUsd = bchUsd ? Math.ceil((Number(MIN_STAKE) / SATS_PER_BCH) * bchUsd * CENTS) / CENTS : 0;
  const overheadUsd = bchUsd ? (Number(ENTRY_OVERHEAD) / SATS_PER_BCH) * bchUsd : 0;
  // 5 % of the balance on the ladder; a small wallet gets the smallest step it can pay, then the contract's minimum,
  // so a wallet the guide calls ready can always make a call.
  const preset =
    balanceUsd === null
      ? (ladder[1] ?? ladder[0] ?? 0)
      : (ladder.filter((dollars) => dollars <= balanceUsd * STAKE_SHARE).at(-1) ??
        ladder.find((dollars) => dollars + overheadUsd <= balanceUsd) ??
        minUsd);
  // Any amount the player typed stands, held inside this lane's bounds (a $5 choice reads $1 on a 5-minute lane).
  const capUsd = bchUsd ? Math.floor((Number(cap) / SATS_PER_BCH) * bchUsd * CENTS) / CENTS : null;
  const stakeUsd = chosen !== null && chosen > 0 ? Math.min(capUsd ?? chosen, Math.max(minUsd, chosen)) : preset;
  // An agent's proposal carries its own stake (sats); everything else uses the standing choice.
  const stake = stakeOverride
    ? BigInt(Math.min(Number(cap), Math.max(Number(MIN_STAKE), stakeOverride)))
    : bchUsd
      ? BigInt(Math.max(Number(MIN_STAKE), Math.round((stakeUsd / bchUsd) * SATS_PER_BCH)))
      : MIN_STAKE;
  /**
   * What a call pays per dollar at today's pot, or `"alone"` while nobody is on the other side: a shared pot with one
   * side refunds, so a multiple (0.98× after fees) would mislead.
   */
  const pays = (side: Side): number | "alone" | null => {
    if (!round) return null;
    if ((round.totals[side === 0 ? 1 : 0] ?? 0) === 0) return "alone";
    const { pays: back } = estimatePayout(round, side, stake);
    return Number(back) / Number(stake);
  };

  const now = Math.floor(Date.now() / SECOND_MS);
  const limited = limitProblem({
    limits,
    journal,
    network,
    stakeSats: Number(stake),
    stakeUsd: undefined,
    bchUsd,
    nowMs: now * SECOND_MS,
    formatTime: (ms) => LIMIT_WHEN.format(ms),
  });

  let blocker: { label: string; onClick: () => void } | null = null;
  if (limited) {
    blocker = {
      label: limited,
      // Your own limit: the tap opens More, where the limits are.
      onClick: () => window.dispatchEvent(new Event(OPEN_MORE_EVENT)),
    };
  } else if (!round || round.lockTime - now < CLOSE_LEAD_SECONDS) {
    blocker = { label: "Next round opening", onClick: () => undefined };
  } else if (wallet.state !== "connected")
    blocker = {
      label: wallet.state === "reconnecting" ? "Reconnecting · open your wallet" : "Pair a wallet",
      onClick: wallet.openConnect,
    };
  // A tap never does nothing: before the wallet's coins are read, the button says so (his report: Up did nothing).
  else if (!coins.data)
    blocker = coins.isError
      ? { label: "Couldn't read your wallet · Try again", onClick: () => void coins.refetch() }
      : { label: "Reading your wallet…", onClick: () => undefined };
  else if (coins.balance < stake + ENTRY_OVERHEAD) {
    // Mainnet: what the wallet holds and needs (the guide's funding step). Chipnet: the free test coins in this one
    // tap, then where they are (his report: at zero on chipnet it should just offer the faucet).
    const faucetState = faucet.view?.state;
    if (network === "mainnet") blocker = { label: "Top up your wallet", onClick: () => openGuide("fund") };
    else if (faucet.asking || faucetState === "pending")
      blocker = { label: "Free test BCH on its way…", onClick: () => undefined };
    else if (faucetState === "sent") blocker = { label: "Test BCH landing in your wallet…", onClick: () => undefined };
    else if (faucetState === "dry" || faucet.view?.nextAt)
      blocker = { label: "Get test BCH", onClick: () => openGuide("fund") };
    else blocker = { label: "試 Get free test BCH", onClick: faucet.claim };
  }

  const enter = async (side: Side): Promise<boolean> => {
    const payout = wallet.payout;
    const change = wallet.keys.find((key) => key.path === "change" && key.index === 0) ?? payout;
    if (blocker || !round || !payout || !change || !coins.data || busy !== null) return false;
    setBusy(side);
    cue("tap");
    const entry = recordEntry({
      network,
      roundId: round.roundId,
      outcome: side,
      stake: stake.toString(),
      usd: stakeUsd,
    });
    try {
      const request = await buildEntry({
        network,
        roundId: round.roundId,
        eventRound: false,
        outcome: side,
        stake,
        coins: coins.data,
        payout,
        change,
        prompt: `Jōge: ${side === 0 ? "Up" : "Down"} ${usd(stakeUsd)} · ${roundName(round)}`,
      });
      const signed = await wallet.sign(request.transaction, request.inputPaths);
      updateEntry(entry.id, { state: "signed", txid: txidOf(signed) });
      await sendEntry(network, signed);
      markSpent(signed);
      updateEntry(entry.id, { state: "sent" });
      cue("send");
      toast({
        tone: "up",
        title: `${side === 0 ? "上 Up" : "下 Down"} ${usd(stakeUsd)}`,
        body: roundName(round),
        href: `/r/${round.roundId}`,
      });
      void client.invalidateQueries({ queryKey: ["coins", network] });
      void client.invalidateQueries({ queryKey: ["lobby", network] });
      void client.invalidateQueries({ queryKey: ["round", network, round.roundId] });
      return true;
    } catch (error) {
      const message = errorText(error);
      const raced = lostRace(message);
      // Whatever failed, the next tap builds from a fresh read of the wallet.
      void client.invalidateQueries({ queryKey: ["coins", network] });
      updateEntry(entry.id, { state: raced ? "lost" : "failed", error: message });
      cue("error");
      toast(
        raced
          ? { tone: "info", title: "Someone entered at the same moment", body: "Tap again" }
          : { tone: "down", title: "Not entered", body: message },
      );
      return false;
    } finally {
      setBusy(null);
    }
  };

  return { enter, busy, blocker, stake, stakeUsd, ladder, pays, minUsd, capUsd };
}
