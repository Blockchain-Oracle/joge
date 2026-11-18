import { type AssetId, FEEDS, type FeedId, toDollars } from "@joge/sdk";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** A dollar price as people read it ("$64,677.07"). */
export const usd = (dollars: number) => USD.format(dollars);

/** A signed price (as the oracle or a settlement wrote it) in dollars. */
export const signedToDollars = (asset: AssetId, price: number) => toDollars(asset, price);

/** An oracle print in dollars for its own feed (gold's two feeds are combined elsewhere). */
export const printToDollars = (feed: FeedId, price: number) => price / FEEDS[feed].scaling;

const SATS_PER_BCH = 100_000_000;
const BCH_DECIMALS = 8;
const SATS = new Intl.NumberFormat("en-US");

export const sats = (value: number) => `${SATS.format(value)} sats`;
export const bch = (value: number) =>
  `${(value / SATS_PER_BCH).toFixed(BCH_DECIMALS).replace(/0+$/, "").replace(/\.$/, "")} BCH`;

export const ASSET_NAME: Record<AssetId, string> = { BTC: "Bitcoin", ETH: "Ether", BCH: "Bitcoin Cash", GOLD: "Gold" };

const MINUTE = 60;
const HOUR = 3_600;
const MS_PER_SECOND = 1_000;
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

/** A moment (seconds) as a local wall-clock time, the way the chart's axis reads it ("22:05"). */
export const clockTime = (seconds: number) => TIME.format(seconds * MS_PER_SECOND);

/** "3 min", "1 h". */
export const laneLabel = (seconds: number) => (seconds >= HOUR ? `${seconds / HOUR} h` : `${seconds / MINUTE} min`);

/** Shown wherever a time or countdown is not known yet (server render, before hydration). */
export const UNKNOWN_TIME = "--:--";

/** "2:05" or "1:02:05" until a moment (seconds); "--:--" while `now` is not known yet (0). */
export function countdown(until: number, now: number) {
  if (now === 0) return UNKNOWN_TIME;
  const left = Math.max(0, until - now);
  const hours = Math.floor(left / HOUR);
  const minutes = Math.floor((left % HOUR) / MINUTE);
  const seconds = left % MINUTE;
  const two = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${two(minutes)}:${two(seconds)}` : `${minutes}:${two(seconds)}`;
}

/** A round as people name it, by market and time, never by its number: "BTC 5 min · 14:05–14:10". */
export const roundName = (round: { asset: AssetId; laneSeconds: number | null; lockTime: number; closeTime: number }) =>
  `${round.asset === "GOLD" ? "Gold" : round.asset}${round.laneSeconds ? ` ${laneLabel(round.laneSeconds)}` : ""} · ${clockTime(round.lockTime)}–${clockTime(round.closeTime)}`;
