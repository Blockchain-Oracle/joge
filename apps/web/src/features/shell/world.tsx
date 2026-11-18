"use client";

import type { Network } from "@joge/db";
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { cue } from "@/kit";
import { setStreamNetwork } from "@/live/stream";
import { applyNetwork, DEFAULT_NETWORK } from "../theme/theme.ts";

/**
 * Which world the app is in: mainnet (本, real money) or chipnet (試, test coins, a yellow tag). Read from the
 * <html data-network> the pre-paint script set; changing it re-points the live stream.
 */
const listeners = new Set<() => void>();

function read(): Network {
  return document.documentElement.dataset.network === "mainnet" ? "mainnet" : "chipnet";
}

export function setWorld(network: Network) {
  applyNetwork(network);
  setStreamNetwork(network);
  for (const listener of listeners) listener();
}

/**
 * Switches the world with Kakure's flood: a view transition whose new state is revealed by a circle spreading from the
 * control that made the change (520 ms, `html[data-flooding]` in shell.css). Reduced motion, or a browser without view
 * transitions, switches at once.
 */
export function switchWorld(next: Network, origin?: { x: number; y: number }) {
  if (next === read()) return;
  cue("tap");
  const root = document.documentElement;
  const paint = () => flushSync(() => setWorld(next));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof document.startViewTransition !== "function") {
    paint();
    return;
  }
  root.style.setProperty("--flood-x", `${Math.round(origin?.x ?? window.innerWidth / 2)}px`);
  root.style.setProperty("--flood-y", `${Math.round(origin?.y ?? 0)}px`);
  root.dataset.flooding = "";
  void document.startViewTransition(paint).finished.finally(() => {
    delete root.dataset.flooding;
  });
}

/** The centre of an element on screen: where a flood starts. */
export function centreOf(element: Element | null): { x: number; y: number } | undefined {
  const rect = element?.getBoundingClientRect();
  return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined;
}

export function useWorld(): Network {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => DEFAULT_NETWORK,
  );
}

export const WORLD_STAMP: Record<Network, { glyph: string; label: string }> = {
  mainnet: { glyph: "本", label: "Mainnet" },
  chipnet: { glyph: "試", label: "Chipnet" },
};

/** The world's stamp: 本 or 試, with its name. */
export function WorldStamp({ compact = false }: { compact?: boolean }) {
  const world = useWorld();
  const stamp = WORLD_STAMP[world];
  return (
    <span
      className="jg-tag"
      data-tone={world === "chipnet" ? "gold" : "accent"}
      title={world === "chipnet" ? "Chipnet: test coins, no real money" : "Mainnet: real money"}
    >
      <span className="font-stamp text-[11px]">{stamp.glyph}</span>
      {compact ? null : stamp.label}
    </span>
  );
}
