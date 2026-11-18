"use client";

import type { AssetId, FeedId } from "@joge/sdk";
import { useEffect, useSyncExternalStore } from "react";
import { isLive, type LiveEvents, subscribe, subscribeStatus, type Topic } from "./stream.ts";

/** Calls `onEvent` for every live event of `topic` while mounted. */
export function useLiveEvent<T extends Topic>(topic: T, onEvent: (event: LiveEvents[T]) => void) {
  useEffect(() => subscribe(topic, onEvent), [topic, onEvent]);
}

/** Whether the tab's live stream is connected. */
export const useStreamLive = () => useSyncExternalStore(subscribeStatus, isLive, () => false);

const latestPrice = new Map<AssetId, LiveEvents["price"]>();
const latestPrint = new Map<FeedId, LiveEvents["oracle"]>();
const priceWatchers = new Set<() => void>();
const printWatchers = new Set<() => void>();
let unsubscribe: (() => void) | null = null;

function watch(watchers: Set<() => void>) {
  return (listener: () => void) => {
    watchers.add(listener);
    unsubscribe ??= (() => {
      const stopPrices = subscribe("price", (event) => {
        latestPrice.set(event.asset, event);
        for (const watcher of priceWatchers) watcher();
      });
      const stopPrints = subscribe("oracle", (event) => {
        latestPrint.set(event.feed, event);
        for (const watcher of printWatchers) watcher();
      });
      return () => {
        stopPrices();
        stopPrints();
      };
    })();
    return () => {
      watchers.delete(listener);
      if (priceWatchers.size + printWatchers.size > 0) return;
      unsubscribe?.();
      unsubscribe = null;
    };
  };
}

const watchPrices = watch(priceWatchers);
const watchPrints = watch(printWatchers);

/** The latest indicative price for an asset (≤ 1 update per second), or undefined until the first tick. */
export const useLivePrice = (asset: AssetId) =>
  useSyncExternalStore(
    watchPrices,
    () => latestPrice.get(asset),
    () => undefined,
  );

/** The latest signed oracle print for a feed. */
export const useOraclePrint = (feed: FeedId) =>
  useSyncExternalStore(
    watchPrints,
    () => latestPrint.get(feed),
    () => undefined,
  );
