import { decodeMessage, isPriceMessage, type PriceMessage, type SignedMessage } from "./message.ts";

/**
 * The canonical proof that `first` is the oracle's first price message at or after `boundary`:
 * `previous.timestamp < boundary <= first.timestamp` and the data sequences are consecutive (AnyHedge v0.12 l.73–94).
 * Every client that sees the same feed picks the same pair, which keeps lifecycle transactions byte-identical.
 */
export interface BoundaryPair {
  previous: PriceMessage;
  first: PriceMessage;
}

const byDataSequence = (a: PriceMessage, b: PriceMessage): number => a.dataSequence - b.dataSequence;

export function sortPrices(signed: readonly SignedMessage[]): PriceMessage[] {
  return signed.map(decodeMessage).filter(isPriceMessage).sort(byDataSequence);
}

/** Returns the canonical pair for `boundary`, or `undefined` while the oracle has not yet signed past it. */
export function findBoundaryPair(prices: readonly PriceMessage[], boundary: number): BoundaryPair | undefined {
  for (let index = 1; index < prices.length; index += 1) {
    const previous = prices[index - 1];
    const first = prices[index];
    if (previous === undefined || first === undefined) continue;
    if (first.dataSequence !== previous.dataSequence + 1) continue;
    if (previous.timestamp < boundary && first.timestamp >= boundary) return { previous, first };
  }
  return undefined;
}

/** The strike is the oracle's next message after the lock message: data sequence S + 1 (decision D3). */
export function findBySequence(prices: readonly PriceMessage[], dataSequence: number): PriceMessage | undefined {
  return prices.find((message) => message.dataSequence === dataSequence);
}
