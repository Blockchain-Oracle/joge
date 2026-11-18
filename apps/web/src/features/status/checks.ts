import type { Network } from "@joge/db";
import { queryOptions } from "@tanstack/react-query";

/** A check's state (CWF's board): live, behind, or not answering; "wait" while a probe is still running. */
export type Tone = "good" | "warn" | "bad" | "wait";

export interface Check {
  key: string;
  name: string;
  /** What it sees, in a few words. */
  sees: string;
  /** The figure on the right ("12 s ago", "84 ms"). */
  detail: string;
  tone: Tone;
  /** Where the row leads (lanes to the rounds, agents to the agents). */
  href?: string;
}

export interface StatusReport {
  network: Network;
  now: number;
  components: Array<{ component: string; detail: Record<string, unknown>; at: string }>;
  feeds: Array<{ feed: string; timestamp: number }>;
  ticks: Array<{ asset: string; at: number }>;
  lanes: { running: number; open: number };
  ai: { id: string; via: string } | null;
}

/** /status re-reads every 30 s while the tab is visible (TanStack pauses background refetches). */
export const STATUS_EVERY_MS = 30_000;

export const statusQuery = (network: Network) =>
  queryOptions({
    queryKey: ["status", network],
    queryFn: async () => {
      const response = await fetch(`/api/status?network=${network}`);
      if (!response.ok) throw new Error(`status answered ${response.status}`);
      return (await response.json()) as StatusReport;
    },
    refetchInterval: STATUS_EVERY_MS,
  });

/** How old a thing may get, in seconds, before it is behind, and before it is down. */
export const LIMITS = {
  feed: { good: 150, warn: 600 },
  tick: { good: 30, warn: 300 },
  /** A pass reads every watched address's history, which can take minutes on a busy chain. */
  indexer: { good: 300, warn: 900 },
  keeper: { good: 60, warn: 300 },
  agents: { good: 90, warn: 600 },
} as const;
/** The keeper wallet pays each lane round's fees (~4,600 sats): this much is comfortable, this much is low. */
export const KEEPER_SATS = { good: 100_000, warn: 20_000 } as const;
/** A Fulcrum server slower than this is "slow". */
export const SLOW_MS = 2_500;
export const PROBE_TIMEOUT_MS = 8_000;

const MINUTE = 60;
const HOUR = 3_600;

export const ago = (seconds: number) =>
  seconds < MINUTE
    ? `${Math.max(0, Math.round(seconds))} s ago`
    : seconds < HOUR
      ? `${Math.round(seconds / MINUTE)} min ago`
      : `${Math.round(seconds / HOUR)} h ago`;

export const toneOfAge = (age: number | null, limit: { good: number; warn: number }): Tone =>
  age === null ? "bad" : age <= limit.good ? "good" : age <= limit.warn ? "warn" : "bad";

const WORST: Tone[] = ["bad", "warn", "wait", "good"];
export const worst = (tones: Tone[]): Tone => WORST.find((tone) => tones.includes(tone)) ?? "good";
