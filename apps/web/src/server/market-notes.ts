import "server-only";
import type { MarketNotes, NoteRound } from "@joge/brain";
import { lobby, type Network, priceSeries, type RoundCard } from "@joge/db";
import { type AssetId, MIN_STAKE } from "@joge/sdk";
import { estimatePayout } from "@/features/ticket/payout";
import { SECOND_MS } from "./constants";
import { database, nowSeconds } from "./db";

const ASSETS: AssetId[] = ["BTC", "ETH", "BCH", "GOLD"];
const NAMES: Record<AssetId, string> = { BTC: "Bitcoin", ETH: "Ether", BCH: "Bitcoin Cash", GOLD: "Gold" };
const SATS_PER_BCH = 100_000_000;
const PRICE_LOOKBACK_MS = 120_000;
const HOUR_SECONDS = 3_600;
const MINUTE_SECONDS = 60;
const RECENT_SHOWN = 5;
const MULTIPLE_DIGITS = 2;
const UTC = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", hour: "2-digit", minute: "2-digit" });

const lengthOf = (seconds: number) =>
  seconds >= HOUR_SECONDS ? `${seconds / HOUR_SECONDS} h` : `${seconds / MINUTE_SECONDS} min`;

/** The latest indicative price of each asset (the line the app draws), in dollars. */
async function pricesNow(): Promise<Map<AssetId, number>> {
  const since = new Date(Date.now() - PRICE_LOOKBACK_MS);
  const entries = await Promise.all(
    ASSETS.map(async (asset) => [asset, (await priceSeries(database.db, asset, since)).at(-1)?.price] as const),
  );
  return new Map(entries.filter((entry): entry is readonly [AssetId, number] => entry[1] !== undefined));
}

/**
 * One round as Sensei reads it. Each side's "pays" is what the player's own stake would return on a win after fees,
 * computed exactly as their Up and Down plates compute it, so the two never disagree.
 */
function noteOf(round: RoundCard, length: string, bchUsd: number, stake: bigint, now: number): NoteRound {
  const total = round.totals.reduce((sum, value) => sum + value, 0);
  return {
    roundId: round.roundId,
    asset: NAMES[round.asset],
    length,
    question: `${NAMES[round.asset]}, up or down?`,
    locksInSeconds: round.lockTime - now,
    closesAt: `${UTC.format(round.closeTime * SECOND_MS)} UTC`,
    potUsd: (round.pot / SATS_PER_BCH) * bchUsd,
    sides: ["Up", "Down"].map((name, index) => {
      const side = round.totals[index] ?? 0;
      const back = Number(estimatePayout(round, index, stake).pays) / Number(stake);
      return { name, share: total > 0 ? side / total : 0, pays: `${back.toFixed(MULTIPLE_DIGITS)}x` };
    }),
  };
}

/** What Sensei knows about the market this turn: prices, every lane round taking entries, recent results. */
export async function buildMarketNotes(
  network: Network,
  stakeUsd: number,
): Promise<{ notes: MarketNotes; open: RoundCard[] }> {
  const now = nowSeconds();
  const [lanes, prices] = await Promise.all([lobby(database.db, network, now), pricesNow()]);
  const bchUsd = prices.get("BCH") ?? 0;
  const stake =
    bchUsd > 0
      ? BigInt(Math.max(Number(MIN_STAKE), Math.round((stakeUsd / bchUsd) * SATS_PER_BCH)))
      : BigInt(MIN_STAKE);
  const laneRounds = lanes.flatMap((lane) => (lane.next ? [{ round: lane.next, length: lengthOf(lane.seconds) }] : []));
  return {
    open: laneRounds.map((entry) => entry.round),
    notes: {
      nowUtc: UTC.format(now * SECOND_MS),
      prices: [...prices].map(([asset, usd]) => ({ asset: NAMES[asset], usd })),
      open: laneRounds.map((entry) => noteOf(entry.round, entry.length, bchUsd, stake, now)),
      recent: lanes
        .filter((lane) => lane.recent.length > 0)
        .map(
          (lane) =>
            `${NAMES[lane.asset]} ${lengthOf(lane.seconds)}: ${lane.recent
              .slice(0, RECENT_SHOWN)
              .map((result) => (result.state === "void" ? "refunded" : result.winner === 0 ? "Up" : "Down"))
              .join(", ")}`,
        ),
    },
  };
}
