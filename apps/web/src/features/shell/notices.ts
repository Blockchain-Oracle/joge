"use client";

import { useSyncExternalStore } from "react";
import type { Toast } from "@/kit";

export interface Notice extends Omit<Toast, "id"> {
  id: string;
  at: number;
  seen: boolean;
}

const KEY = "joge:notices";
const KEEP = 60;
const listeners = new Set<() => void>();
let cache: Notice[] | null = null;
const EMPTY: Notice[] = [];

function load(): Notice[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]") as Notice[];
  } catch {
    cache = [];
  }
  return cache;
}

function save(next: Notice[]) {
  cache = next.slice(0, KEEP);
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Kept for this page only.
  }
  for (const listener of listeners) listener();
}

/** Every toast lands here too, so the bell keeps what a toast showed for five seconds. */
export function recordNotice(toast: Toast) {
  const { id: _id, ...rest } = toast;
  save([{ ...rest, id: `${Date.now()}-${toast.id}`, at: Date.now(), seen: false }, ...load()]);
}

export const markNoticesSeen = () => save(load().map((notice) => ({ ...notice, seen: true })));
export const clearNotices = () => save([]);

export function useNotices(): Notice[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    () => EMPTY,
  );
}
