"use client";

import { useSyncExternalStore } from "react";

/** The guide's steps, in order (five-step tour). */
export const GUIDE_STEPS = ["intro", "wallet", "pair", "fund", "play"] as const;
export type GuideStep = (typeof GUIDE_STEPS)[number];

const SEEN_KEY = "joge-guide-seen";
const listeners = new Set<() => void>();
let state: { open: boolean; step: GuideStep } = { open: false, step: "intro" };
const CLOSED = { open: false, step: "intro" as GuideStep };

const emit = () => {
  for (const listener of listeners) listener();
};

/** Opens the guide (anywhere can: a blocker, More, ⌘K's `?guide=1`), at a step. */
export function openGuide(step: GuideStep = "intro") {
  state = { open: true, step };
  emit();
}

export function setGuideStep(step: GuideStep) {
  state = { ...state, step };
  emit();
}

/** Closes it; once closed it never opens by itself again on this device. */
export function closeGuide() {
  state = { ...state, open: false };
  try {
    localStorage.setItem(SEEN_KEY, "seen");
  } catch {
    // Private windows may refuse storage: the guide may then open again next visit.
  }
  emit();
}

export function guideSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "seen";
  } catch {
    return true;
  }
}

export function useGuide() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => CLOSED,
  );
}
