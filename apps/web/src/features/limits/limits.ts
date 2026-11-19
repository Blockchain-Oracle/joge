"use client";

import type { Network } from "@joge/db";
import { useSyncExternalStore } from "react";
import type { JournalEntry } from "../ticket/journal.ts";

const HALF_CENT_USD = 0.005;

/**
 * Play limits you set for yourself: a daily stake limit in dollars and a cool-off. They live in
 * this browser and the ticket wears them as its blocker. Lowering a limit or starting a cool-off takes effect at once;
 * raising or removing a limit waits a day, and a cool-off cannot be lifted early, so neither can be undone in the
 * heat of a losing streak.
 */
export interface Limits {
  dailyUsd: number | null;
  coolOffUntil: number | null;
  /** A raised or removed limit, waiting for its day to pass. */
  pending: { dailyUsd: number | null; from: number } | null;
}

const KEY = "joge:limits";
const DAY_MS = 86_400_000;
const SATS_PER_BCH = 100_000_000;
const DEFAULT: Limits = { dailyUsd: null, coolOffUntil: null, pending: null };
/** Entries that spent money (a recorded entry the wallet never signed spent nothing). */
const SPENT = new Set(["signed", "sent", "confirmed"]);

const listeners = new Set<() => void>();
let cache: Limits | null = null;

function load(): Limits {
  if (cache) return cache;
  try {
    cache = { ...DEFAULT, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Limits>) };
  } catch {
    cache = DEFAULT;
  }
  return cache;
}

function save(next: Limits) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Kept for this page only.
  }
  for (const listener of listeners) listener();
}

export function useLimits(): Limits {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    () => DEFAULT,
  );
}

/** The limits in force now: a pending change counts once its day has passed. */
export function effective(limits: Limits, nowMs: number): { dailyUsd: number | null; coolOffUntil: number | null } {
  const dailyUsd = limits.pending && limits.pending.from <= nowMs ? limits.pending.dailyUsd : limits.dailyUsd;
  return { dailyUsd, coolOffUntil: limits.coolOffUntil && limits.coolOffUntil > nowMs ? limits.coolOffUntil : null };
}

/** A lower limit (or a first one) applies now; a higher one, or none, applies in a day. */
export function setDailyLimit(next: number | null) {
  const current = effective(load(), Date.now()).dailyUsd;
  const tighter = next !== null && (current === null || next <= current);
  save(
    tighter
      ? { ...load(), dailyUsd: next, pending: null }
      : { ...load(), dailyUsd: current, pending: { dailyUsd: next, from: Date.now() + DAY_MS } },
  );
}

export function startCoolOff(durationMs: number) {
  const until = Date.now() + durationMs;
  const current = load().coolOffUntil ?? 0;
  save({ ...load(), coolOffUntil: Math.max(current, until) });
}

const startOfToday = () => {
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  return day.getTime();
};

/** What this browser staked today on this network, in US dollars (entries the wallet signed). */
export const stakedTodayUsd = (journal: JournalEntry[], network: Network, bchUsd: number): number =>
  journal
    .filter((entry) => entry.network === network && SPENT.has(entry.state) && entry.at >= startOfToday())
    .reduce((sum, entry) => sum + (entry.usd ?? (Number(entry.stake) / SATS_PER_BCH) * bchUsd), 0);

/** Why a ticket of `stakeSats` may not be bought now under your own limits, or null. */
export function limitProblem({
  limits,
  journal,
  network,
  stakeSats,
  bchUsd,
  nowMs,
  formatTime,
  stakeUsd: dollarStake,
}: {
  limits: Limits;
  journal: JournalEntry[];
  network: Network;
  stakeSats: number;
  bchUsd: number | undefined;
  nowMs: number;
  formatTime: (ms: number) => string;
  /** The stake in US dollars when it is not in satoshis (a dollar event). */
  stakeUsd?: number | undefined;
}): string | null {
  const now = effective(limits, nowMs);
  if (now.coolOffUntil) return `Cooling off until ${formatTime(now.coolOffUntil)}`;
  if (now.dailyUsd === null || !bchUsd) return null;
  const spentUsd = stakedTodayUsd(journal, network, bchUsd);
  const stakeUsd = dollarStake ?? (stakeSats / SATS_PER_BCH) * bchUsd;
  // Stakes are whole satoshis, so a $0.50 stake can read a hair over $0.50: half a cent of slack.
  if (spentUsd + stakeUsd <= now.dailyUsd + HALF_CENT_USD) return null;
  const left = Math.max(0, now.dailyUsd - spentUsd);
  return left > 0 ? `Over your daily limit · $${left.toFixed(2)} left today` : "Daily limit reached · back tomorrow";
}
