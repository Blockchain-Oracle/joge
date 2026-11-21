"use client";

import { useSyncExternalStore } from "react";

/**
 * The round screen's walkthrough: open or not, and whether this device has seen it. It starts by itself on the first
 * visit to the rounds, and again from How to play (the button on the round screen, More and ⌘K's `?tour=1`).
 */
const SEEN_KEY = "joge-tour-seen";
const listeners = new Set<() => void>();
let open = false;

const emit = () => {
  for (const listener of listeners) listener();
};

export function startTour() {
  open = true;
  emit();
}

/** Ends it; once ended it never starts by itself again on this device. */
export function endTour() {
  open = false;
  try {
    localStorage.setItem(SEEN_KEY, "seen");
  } catch {
    // Private windows may refuse storage: the walkthrough may then start again next visit.
  }
  emit();
}

export function tourSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "seen";
  } catch {
    return true;
  }
}

export function useTourOpen(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => open,
    () => false,
  );
}
