import type { LaneView, Network, RoundCard } from "@joge/db";
import type { AssetId } from "@joge/sdk";
import { queryOptions } from "@tanstack/react-query";

async function json<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return (await response.json()) as T;
}

export interface LobbyResponse {
  network: Network;
  now: number;
  lanes: LaneView[];
  /** The newest custom rounds (posted by anyone through the factory). */
  custom: RoundCard[];
  /** Events still taking entries or running, soonest to lock first (featured on the lobby). */
  events: RoundCard[];
}

export const lobbyQuery = (network: Network) =>
  queryOptions({ queryKey: ["lobby", network], queryFn: () => json<LobbyResponse>(`/api/lobby?network=${network}`) });

export interface PricesResponse {
  asset: AssetId;
  prints: Array<{ timestamp: number; price: number; dataSequence: number }>;
  live: Array<{ at: number; price: number }>;
}

/** A rolling window (the last `seconds`) or a round's own window (`from`–`to`, Unix seconds). */
export type PriceSpan = { seconds: number } | { from: number; to: number };

export const pricesQuery = (asset: AssetId, span: PriceSpan) =>
  queryOptions({
    queryKey: ["prices", asset, span],
    queryFn: () =>
      json<PricesResponse>(
        "seconds" in span
          ? `/api/prices/${asset}?seconds=${span.seconds}`
          : `/api/prices/${asset}?from=${span.from}&to=${span.to}`,
      ),
    // The chart keeps itself live from the stream; history is only for the first paint.
    staleTime: Number.POSITIVE_INFINITY,
  });
