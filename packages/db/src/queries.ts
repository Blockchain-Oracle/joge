import { FEEDS, type FeedId, feedsOf, GOLD_FACTOR, LANES } from "@joge/sdk";
import { and, asc, desc, eq, gte, inArray, isNull, lte, notInArray, or, sql } from "drizzle-orm";
import type { Db } from "./client.ts";
import {
  CHART_POINTS,
  ENTRIES_PAGE,
  LAST_ROUND_WINDOW_SECONDS,
  PAIR_WINDOW_SECONDS,
  RECENT_RESULTS,
} from "./constants.ts";
import {
  gates,
  heartbeats,
  laneDemand,
  type Network,
  oracleMessages,
  priceTicks,
  rounds,
  tickets,
  transactions,
} from "./schema.ts";

/**
 * The read side the app's API serves: lists, history and proofs. Nothing here is used to build a transaction (the
 * browser builds those from live chain reads), so a stale row can only ever mislead a list, never a signature.
 */

export type RoundRow = typeof rounds.$inferSelect;
type OracleRow = typeof oracleMessages.$inferSelect;

const FIRST_LANE_THREAD = Math.min(...LANES.map((lane) => lane.thread));

export interface RoundCard extends RoundRow {
  /** The strike (message S + 1) as soon as the oracle signs it, before the settle writes it on chain. */
  liveStrike: number | null;
}

/** Strike prices for locked rounds that have not settled yet: message S + 1 of their feed (gold combines two). */
async function liveStrikes(db: Db, list: RoundRow[]): Promise<Map<number, number>> {
  const locked = list.filter((round) => round.state === "locked" && round.lockSequence !== null);
  const wanted = locked.flatMap((round) =>
    feedsOf(round.asset).map((feed) => ({
      feed,
      sequence: (feed === "XAU/BCH" ? (round.xauLockSequence ?? 0) : (round.lockSequence ?? 0)) + 1,
    })),
  );
  if (wanted.length === 0) return new Map();
  const rows = await db
    .select()
    .from(oracleMessages)
    .where(
      or(
        ...wanted.map((item) =>
          and(eq(oracleMessages.feed, item.feed), eq(oracleMessages.dataSequence, item.sequence)),
        ),
      ),
    );
  const priceOf = (feed: FeedId, sequence: number) =>
    rows.find((row) => row.feed === feed && row.dataSequence === sequence)?.price;
  const strikes = new Map<number, number>();
  for (const round of locked) {
    const main = priceOf(feedsOf(round.asset)[0] as FeedId, (round.lockSequence ?? 0) + 1);
    if (main === undefined) continue;
    if (round.asset !== "GOLD") {
      strikes.set(round.roundId, main);
      continue;
    }
    const xau = priceOf("XAU/BCH", (round.xauLockSequence ?? 0) + 1);
    if (xau) strikes.set(round.roundId, Math.floor((main * GOLD_FACTOR) / xau));
  }
  return strikes;
}

const withStrikes = async (db: Db, list: RoundRow[]): Promise<RoundCard[]> => {
  const strikes = await liveStrikes(db, list);
  return list.map((round) => ({ ...round, liveStrike: round.strikePrice ?? strikes.get(round.roundId) ?? null }));
};

export interface LaneView {
  thread: number;
  asset: RoundRow["asset"];
  seconds: number;
  /** Taking entries. */
  next: RoundCard | null;
  /** Past its lock: locked and counting down (or about to lock). */
  live: RoundCard | null;
  /** The most recent finished round. */
  last: RoundCard | null;
  /** How the lane's last rounds ended, newest first (for the results strip). */
  recent: Array<Pick<RoundCard, "roundId" | "state" | "winner" | "voidReason" | "closeTime">>;
}

/** Every lane's Next, Live and last finished round, PancakeSwap-style. */
export async function lobby(db: Db, network: Network, now: number): Promise<LaneView[]> {
  const recent = await db
    .select()
    .from(rounds)
    .where(
      and(
        eq(rounds.network, network),
        gte(rounds.thread, FIRST_LANE_THREAD),
        or(inArray(rounds.state, ["open", "locked"]), gte(rounds.closeTime, now - LAST_ROUND_WINDOW_SECONDS)),
      ),
    )
    .orderBy(desc(rounds.lockTime));
  const cards = await withStrikes(db, recent);
  return LANES.map((lane) => {
    const ofLane = cards.filter((round) => round.thread === lane.thread);
    return {
      thread: lane.thread,
      asset: lane.asset,
      seconds: lane.seconds,
      next: ofLane.find((round) => round.state === "open" && round.lockTime > now) ?? null,
      live:
        ofLane.find((round) => round.state === "locked" || (round.state === "open" && round.lockTime <= now)) ?? null,
      last: ofLane.find((round) => round.state === "settled" || round.state === "void") ?? null,
      recent: ofLane
        .filter((round) => round.state === "settled" || round.state === "void")
        .slice(0, RECENT_RESULTS)
        .map(({ roundId, state, winner, voidReason, closeTime }) => ({
          roundId,
          state,
          winner,
          voidReason,
          closeTime,
        })),
    };
  });
}

/**
 * The newest signed message of a feed. The factory's create reads a USD/BCH message as its clock (it proves a round
 * does not lock more than 30 days ahead); the message itself is verified on chain, so a stale row only fails a build.
 */
export async function latestMessage(db: Db, feed: FeedId) {
  const [row] = await db
    .select()
    .from(oracleMessages)
    .where(eq(oracleMessages.feed, feed))
    .orderBy(desc(oracleMessages.dataSequence))
    .limit(1);
  return row
    ? {
        message: row.message,
        signature: row.signature,
        timestamp: row.timestamp,
        messageSequence: row.messageSequence,
        dataSequence: row.dataSequence,
        price: row.price,
      }
    : undefined;
}

/** Custom rounds players posted through the factory (not events), newest first. */
export async function customRounds(db: Db, network: Network, limit: number) {
  const list = await db
    .select()
    .from(rounds)
    .where(
      and(
        eq(rounds.network, network),
        lte(rounds.thread, FIRST_LANE_THREAD - 1),
        or(isNull(rounds.stakeClass), notInArray(rounds.stakeClass, ["event", "dollar"])),
      ),
    )
    .orderBy(desc(rounds.lockTime))
    .limit(limit);
  return withStrikes(db, list);
}

/**
 * Events (factory rounds in the event stake class): every one still taking entries or running, soonest to lock first,
 * then the most recently finished.
 */
export async function eventRounds(db: Db, network: Network, finishedLimit: number) {
  const isEvent = and(eq(rounds.network, network), inArray(rounds.stakeClass, ["event", "dollar"]));
  const [running, finished] = await Promise.all([
    db
      .select()
      .from(rounds)
      .where(and(isEvent, inArray(rounds.state, ["open", "locked"])))
      .orderBy(asc(rounds.lockTime)),
    db
      .select()
      .from(rounds)
      .where(and(isEvent, inArray(rounds.state, ["settled", "void"])))
      .orderBy(desc(rounds.closeTime))
      .limit(finishedLimit),
  ]);
  return withStrikes(db, [...running, ...finished]);
}

export async function roundView(db: Db, network: Network, roundId: number) {
  const [round] = await db
    .select()
    .from(rounds)
    .where(and(eq(rounds.network, network), eq(rounds.roundId, roundId)));
  if (!round) return null;
  const [card] = await withStrikes(db, [round]);
  const [gateRows, entries, txs] = await Promise.all([
    db
      .select()
      .from(gates)
      .where(and(eq(gates.network, network), eq(gates.roundId, roundId)))
      .orderBy(asc(gates.gateIndex)),
    db
      .select({
        outpoint: tickets.outpoint,
        gateIndex: tickets.gateIndex,
        outcome: tickets.outcome,
        stake: tickets.stake,
        payoutPkh: tickets.payoutPkh,
        status: tickets.status,
        payoutSats: tickets.payoutSats,
        payoutTxid: tickets.payoutTxid,
        enterTxid: tickets.enterTxid,
        enteredAt: tickets.enteredAt,
        confirmed: sql<boolean>`${transactions.height} is not null`,
      })
      .from(tickets)
      .leftJoin(transactions, and(eq(transactions.network, tickets.network), eq(transactions.txid, tickets.enterTxid)))
      .where(and(eq(tickets.network, network), eq(tickets.roundId, roundId)))
      .orderBy(desc(tickets.enteredAt))
      .limit(ENTRIES_PAGE),
    db
      .select({ txid: transactions.txid, kind: transactions.kind, height: transactions.height, seq: transactions.seq })
      .from(transactions)
      .where(and(eq(transactions.network, network), eq(transactions.roundId, roundId), eq(transactions.dropped, false)))
      .orderBy(asc(transactions.seq)),
  ]);
  return { round: card as RoundCard, gates: gateRows, entries, transactions: txs };
}

/** The signed messages a round's lock and settle used, raw, so the proof page can re-verify every signature. */
export async function roundProof(db: Db, network: Network, roundId: number) {
  const [round] = await db
    .select()
    .from(rounds)
    .where(and(eq(rounds.network, network), eq(rounds.roundId, roundId)));
  if (!round) return null;
  const near = (feed: FeedId, boundary: number) =>
    db
      .select()
      .from(oracleMessages)
      .where(
        and(
          eq(oracleMessages.feed, feed),
          gte(oracleMessages.timestamp, boundary - PAIR_WINDOW_SECONDS),
          lte(oracleMessages.timestamp, boundary + PAIR_WINDOW_SECONDS),
        ),
      )
      .orderBy(asc(oracleMessages.dataSequence));
  const pairAt = (rows: OracleRow[], boundary: number) => {
    const index = rows.findIndex((row, at) => {
      const previous = rows[at - 1];
      return (
        previous &&
        previous.timestamp < boundary &&
        row.timestamp >= boundary &&
        row.dataSequence === previous.dataSequence + 1
      );
    });
    return index > 0 ? { previous: rows[index - 1] as OracleRow, first: rows[index] as OracleRow } : null;
  };
  const feeds = await Promise.all(
    feedsOf(round.asset).map(async (feed) => {
      const atLock = await near(feed, round.lockTime);
      const atClose = await near(feed, round.closeTime);
      const lockPair = pairAt(atLock, round.lockTime);
      const strikeSequence = lockPair ? lockPair.first.dataSequence + 1 : null;
      return {
        feed,
        publicKey: FEEDS[feed].publicKey,
        scaling: FEEDS[feed].scaling,
        lock: lockPair,
        strike: [...atLock, ...atClose].find((row) => row.dataSequence === strikeSequence) ?? null,
        close: pairAt(atClose, round.closeTime),
      };
    }),
  );
  return { round, feeds };
}

/** Signed oracle prints for a chart: up to `CHART_POINTS` from `from` (to `to`, when a round's window is asked for). */
export async function oracleSeries(db: Db, feed: FeedId, from: number, to?: number) {
  return db
    .select({
      timestamp: oracleMessages.timestamp,
      price: oracleMessages.price,
      dataSequence: oracleMessages.dataSequence,
    })
    .from(oracleMessages)
    .where(
      and(
        eq(oracleMessages.feed, feed),
        gte(oracleMessages.timestamp, from),
        to === undefined ? undefined : lte(oracleMessages.timestamp, to),
      ),
    )
    .orderBy(asc(oracleMessages.dataSequence))
    .limit(CHART_POINTS);
}

/** The indicative live line from `from` (to `to`, when a round's window is asked for), for the chart's first paint. */
export async function priceSeries(db: Db, asset: RoundRow["asset"], from: Date, to?: Date) {
  return db
    .select({ at: priceTicks.at, price: priceTicks.price })
    .from(priceTicks)
    .where(and(eq(priceTicks.asset, asset), gte(priceTicks.at, from), to ? lte(priceTicks.at, to) : undefined))
    .orderBy(asc(priceTicks.at));
}

/** A player's tickets by payout key hash, newest first. */
export async function ticketsOf(db: Db, network: Network, payoutPkh: string, limit: number) {
  return db
    .select({ ticket: tickets, round: rounds })
    .from(tickets)
    .innerJoin(rounds, and(eq(rounds.network, tickets.network), eq(rounds.roundId, tickets.roundId)))
    .where(and(eq(tickets.network, network), eq(tickets.payoutPkh, payoutPkh)))
    .orderBy(desc(tickets.enteredAt))
    .limit(limit);
}

/** Every engine component's latest heartbeat (for /status). */
export const engineHealth = (db: Db) => db.select().from(heartbeats);

/** How fresh the data is (for /status): the latest signed price per feed and the latest live tick per asset. */
export async function freshness(db: Db) {
  const [feeds, ticks] = await Promise.all([
    db
      .select({ feed: oracleMessages.feed, timestamp: sql<number>`max(${oracleMessages.timestamp})`.mapWith(Number) })
      .from(oracleMessages)
      .groupBy(oracleMessages.feed),
    db
      .select({ asset: priceTicks.asset, at: sql<number>`extract(epoch from max(${priceTicks.at}))`.mapWith(Number) })
      .from(priceTicks)
      .groupBy(priceTicks.asset),
  ]);
  return { feeds, ticks };
}

/** Keeps a lane opening rounds until `until` (never shortens an earlier, later wake). */
export const wakeLane = (db: Db, network: Network, thread: number, until: Date) =>
  db
    .insert(laneDemand)
    .values({ network, thread, until })
    .onConflictDoUpdate({
      target: [laneDemand.network, laneDemand.thread],
      set: { until: sql`greatest(${laneDemand.until}, excluded.until)` },
    });

/** The lanes someone wants right now. */
export async function wantedLanes(db: Db, network: Network, now: Date): Promise<Set<number>> {
  const rows = await db
    .select({ thread: laneDemand.thread })
    .from(laneDemand)
    .where(and(eq(laneDemand.network, network), gte(laneDemand.until, now)));
  return new Set(rows.map((row) => row.thread));
}
