import { FEEDS, type FeedId, GOLD_PRICE_SCALING } from "../oracle/constants.ts";
import type { AssetId } from "./constants.ts";

/** The feed each asset settles on. Gold settles on USD/BCH and XAU/BCH together (see `feedsOf`). */
export const ASSET_FEED: Record<AssetId, FeedId> = {
  BTC: "USD/BTC",
  ETH: "USD/ETH",
  BCH: "USD/BCH",
  GOLD: "USD/BCH",
};

/** Every feed an asset's lock and settle read: one, or two for gold. */
export const feedsOf = (asset: AssetId): FeedId[] => (asset === "GOLD" ? ["USD/BCH", "XAU/BCH"] : [ASSET_FEED[asset]]);

/** Feed id by oracle public key. */
export const FEED_BY_KEY: Record<string, FeedId> = Object.fromEntries(
  Object.values(FEEDS).map((feed) => [feed.publicKey, feed.id]),
);

const scalingOf = (asset: AssetId) => (asset === "GOLD" ? GOLD_PRICE_SCALING : FEEDS[ASSET_FEED[asset]].scaling);

/** A settled or signed price as dollars (gold prices are already combined, in ten-thousandths of a dollar). */
export const toDollars = (asset: AssetId, price: number): number => price / scalingOf(asset);

/** Dollars in the units the oracle signs (and a range boundary is written in): the inverse of `toDollars`. */
export const fromDollars = (asset: AssetId, dollars: number): number => Math.round(dollars * scalingOf(asset));
