import "server-only";
import { priceSeries } from "@joge/db";
import type { AssetId } from "@joge/sdk";
import { PRICE_POINTS, PRICE_WINDOW_MS } from "./constants";
import { database } from "./db";

/** The indicative price line over the last few minutes, thinned to a dozen points (oldest first), as agents see it. */
export async function recentPrices(asset: AssetId): Promise<number[]> {
  const ticks = await priceSeries(database.db, asset, new Date(Date.now() - PRICE_WINDOW_MS));
  if (ticks.length <= PRICE_POINTS) return ticks.map((tick) => tick.price);
  const step = ticks.length / PRICE_POINTS;
  return Array.from({ length: PRICE_POINTS }, (_, index) => ticks[Math.floor(index * step)]?.price ?? 0);
}
