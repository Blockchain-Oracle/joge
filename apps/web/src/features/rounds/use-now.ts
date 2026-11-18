"use client";

import { useSyncExternalStore } from "react";
import { clockTime, UNKNOWN_TIME } from "./format.ts";

const SECOND_MS = 1_000;
const listeners = new Set<() => void>();
let now = Math.floor(Date.now() / SECOND_MS);
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => {
    now = Math.floor(Date.now() / SECOND_MS);
    for (const each of listeners) each();
  }, SECOND_MS);
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0 || !timer) return;
    clearInterval(timer);
    timer = null;
  };
}

/**
 * The current Unix second, ticking once a second for every countdown on the page (one shared timer). On the server
 * and during hydration it is 0, "not known yet": the server's clock and timezone are not the reader's, and a module
 * loaded an hour ago would render an hour-old countdown. Times render as "--:--" until the browser takes over.
 */
export const useNow = () =>
  useSyncExternalStore(
    subscribe,
    () => now,
    () => 0,
  );

/** Formats a moment as the reader's wall-clock time, or "--:--" until the browser's clock is known (see useNow). */
export function useClockTime() {
  const known = useNow() !== 0;
  return (seconds: number) => (known ? clockTime(seconds) : UNKNOWN_TIME);
}
