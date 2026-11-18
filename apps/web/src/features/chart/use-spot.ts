"use client";

import type { AssetId } from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useLiveEvent } from "@/live/hooks";
import type { LiveEvents } from "@/live/stream";
import { pricesQuery } from "../rounds/api.ts";

/** The first paint reads the last minute of ticks; the tab's stream keeps it live after that. */
const FIRST_SPAN = { seconds: 60 } as const;

/** One asset's live price in dollars (the indicative line the chart draws), or null until the first tick. */
export function useSpot(asset: AssetId | undefined): number | null {
  const history = useQuery({ ...pricesQuery(asset ?? "BTC", FIRST_SPAN), enabled: asset !== undefined });
  const [live, setLive] = useState<{ asset: AssetId; price: number } | null>(null);
  useLiveEvent(
    "price",
    useCallback(
      (event: LiveEvents["price"]) => {
        if (event.asset === asset) setLive({ asset: event.asset, price: event.price });
      },
      [asset],
    ),
  );
  if (live && live.asset === asset) return live.price;
  const ticks = history.data?.live;
  return ticks && ticks.length > 0 ? (ticks.at(-1)?.price ?? null) : null;
}
