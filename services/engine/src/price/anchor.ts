import { type AssetId, FEEDS, type FeedId, feedsOf, GOLD_FACTOR, GOLD_PRICE_SCALING } from "@joge/sdk";
import { PRICE_BASIS_EASE, PRICE_GAP_WEIGHT } from "../constants.ts";

const ASSETS: AssetId[] = ["BTC", "ETH", "BCH", "GOLD"];

/**
 * Keeps the moving line honest. An exchange's ticker and the oracle's signed price for the same asset differ by a
 * steady gap (measured 2026-11-16: Kraken BTC/USD ran $300–600 above General Protocols' USD/BTC), and rounds settle on
 * the oracle only. So every exchange tick is re-based: at each signed oracle price we note the gap between it and the
 * exchange at that moment, and add that gap to the ticks that follow. The line then shows the exchange's second-by-
 * second movement around the oracle's level, and "who is winning" compares like with like.
 */
export class OracleAnchor {
  readonly #signed = new Map<FeedId, number>();
  readonly #raw = new Map<AssetId, number>();
  readonly #target = new Map<AssetId, number>();
  readonly #applied = new Map<AssetId, number>();

  /** The oracle's price for an asset in dollars, from its latest signed message(s). */
  #oracleDollars(asset: AssetId): number | undefined {
    const [main, xau] = feedsOf(asset) as [FeedId, FeedId | undefined];
    const price = this.#signed.get(main);
    if (price === undefined) return undefined;
    if (!xau) return price / FEEDS[main].scaling;
    const ounce = this.#signed.get(xau);
    return ounce ? (price * GOLD_FACTOR) / ounce / GOLD_PRICE_SCALING : undefined;
  }

  /** A signed oracle price arrived: re-measure the gap for every asset that reads this feed and fold it in. */
  onSigned(feed: FeedId, price: number) {
    this.#signed.set(feed, price);
    for (const asset of ASSETS) {
      if (!feedsOf(asset).includes(feed)) continue;
      const dollars = this.#oracleDollars(asset);
      const raw = this.#raw.get(asset);
      if (dollars === undefined || raw === undefined) continue;
      const measured = dollars - raw;
      const estimate = this.#target.get(asset);
      this.#target.set(asset, estimate === undefined ? measured : estimate + (measured - estimate) * PRICE_GAP_WEIGHT);
    }
  }

  /** An exchange tick: remembered raw, returned re-based (the gap glides in, so a new anchor never steps the line). */
  rebase(asset: AssetId, raw: number): number {
    const first = !this.#raw.has(asset);
    this.#raw.set(asset, raw);
    if (first) {
      const dollars = this.#oracleDollars(asset);
      if (dollars !== undefined) this.#target.set(asset, dollars - raw);
    }
    const target = this.#target.get(asset);
    if (target === undefined) return raw;
    const applied = this.#applied.get(asset) ?? target;
    const next = applied + (target - applied) * PRICE_BASIS_EASE;
    this.#applied.set(asset, next);
    return raw + next;
  }
}
