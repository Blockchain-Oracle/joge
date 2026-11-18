"use client";

import type { Network } from "@joge/db";
import { useSyncExternalStore } from "react";
import { randomId } from "@/lib/browser";

/**
 * The entry journal: an entry is recorded before the wallet is asked to sign, its txid is kept the
 * moment it is signed (before broadcast), and it is never sent twice. States move recorded → signed → sent →
 * confirmed, or end failed / lost (someone took the same gate first; the player signs a fresh entry).
 */
export type EntryState = "recorded" | "signed" | "sent" | "confirmed" | "failed" | "lost";

export interface JournalEntry {
  id: string;
  network: Network;
  roundId: number;
  outcome: number;
  /** Satoshis, or cents of the dollar token for a dollar event. */
  stake: string;
  /** The stake in US dollars when entered (play limits add these up across BCH and dollar entries). */
  usd?: number;
  state: EntryState;
  txid?: string;
  /** The ticket's outpoint once known (`txid:1`). */
  error?: string;
  at: number;
}

const KEY = "joge:journal";
const KEEP = 200;
const listeners = new Set<() => void>();
let cache: JournalEntry[] | null = null;
const EMPTY: JournalEntry[] = [];

function load(): JournalEntry[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]") as JournalEntry[];
  } catch {
    cache = [];
  }
  return cache;
}

function save(next: JournalEntry[]) {
  cache = next.slice(0, KEEP);
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Kept for this page only.
  }
  for (const listener of listeners) listener();
}

export function recordEntry(entry: Omit<JournalEntry, "id" | "state" | "at">): JournalEntry {
  const created: JournalEntry = { ...entry, id: randomId(), state: "recorded", at: Date.now() };
  save([created, ...load()]);
  return created;
}

export function updateEntry(id: string, patch: Partial<Omit<JournalEntry, "id">>) {
  save(load().map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
}

export function useJournal(): JournalEntry[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    () => EMPTY,
  );
}
