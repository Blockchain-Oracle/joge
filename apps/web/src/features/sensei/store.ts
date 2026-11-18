"use client";

import { useSyncExternalStore } from "react";

/** Sensei's panel: open or shut, and a question to ask on open (a page can open Sensei with a question). */
interface SenseiState {
  open: boolean;
  ask: string | null;
}

let state: SenseiState = { open: false, ask: null };
const listeners = new Set<() => void>();
const emit = (next: SenseiState) => {
  state = next;
  for (const listener of listeners) listener();
};

export const openSensei = (ask: string | null = null) => emit({ open: true, ask });
export const closeSensei = () => emit({ open: false, ask: null });
/** The page took the question it was opened with. */
export const takeAsk = () => emit({ ...state, ask: null });

const SERVER: SenseiState = { open: false, ask: null };
export const useSensei = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => SERVER,
  );
