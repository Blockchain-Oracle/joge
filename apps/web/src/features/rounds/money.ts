"use client";

import { useSpot } from "../chart/use-spot.ts";
import { sats, usd } from "./format.ts";

const SATS_PER_BCH = 100_000_000;

/**
 * Sats in US dollars at the BCH price (the last minute's price from the first paint, then live); "1,200 sats" only
 * until that first price arrives. Money reads in dollars.
 */
export function useMoney() {
  const bchUsd = useSpot("BCH") ?? undefined;
  return {
    bchUsd,
    format: (value: number | bigint) => (bchUsd ? usd((Number(value) / SATS_PER_BCH) * bchUsd) : sats(Number(value))),
    toSats: (dollars: number) => (bchUsd ? Math.round((dollars / bchUsd) * SATS_PER_BCH) : null),
  };
}
