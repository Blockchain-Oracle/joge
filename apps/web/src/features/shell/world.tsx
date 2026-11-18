"use client";

import type { Network } from "@joge/db";
import { useSyncExternalStore } from "react";
import { setStreamNetwork } from "@/live/stream";
import { applyNetwork, DEFAULT_NETWORK } from "../theme/theme.ts";

/**
 * Which world the app is in: mainnet (本番, real money) or chipnet (試, test coins, a yellow tag). Read from the
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
  mainnet: { glyph: "本番", label: "Mainnet" },
  chipnet: { glyph: "試", label: "Chipnet" },
};

/** The world's stamp: 本番 or 試, with its name. */
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
