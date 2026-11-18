import { ASSET_FEED, FEEDS } from "@joge/sdk";
import { and, eq, gte, inArray, lte, notExists, sql } from "drizzle-orm";
import type { Db } from "./client.ts";
import { oracleSeries, priceSeries, type RoundRow } from "./queries.ts";
import { type Network, roundPaths, rounds, tickets, transactions } from "./schema.ts";

/**
 * The round film's data (the replay of a decided round): its price path from when entries opened to just past the
 * close, its signed prices, and every entry with the moment it was made. Paths are kept once a round is decided, since
 * live ticks are pruned after three hours; an older round without a kept path falls back to its signed prices.
 */

const SECOND_MS = 1_000;
/** Points a kept path holds (about one every 3 s on a 5-minute lane, one every 30 s on an hour). */
export const PATH_POINTS = 240;
/** A custom round shows this much before its lock (lanes show their whole entry window). */
const CUSTOM_LEAD_SECONDS = 600;
/** The path runs a little past the close, to the settling print. */
const TAIL_SECONDS = 90;
const DECIDED = ["settled", "void"] as const;

/** Where a round's film starts and ends (Unix seconds). */
export const filmWindow = (round: Pick<RoundRow, "lockTime" | "closeTime" | "laneSeconds">) => ({
  from: round.lockTime - (round.laneSeconds ?? CUSTOM_LEAD_SECONDS),
  to: round.closeTime + TAIL_SECONDS,
});

/** Thins a path to at most `most` points, keeping each bucket's last price (so the shape and the end stay true). */
export function thin(points: Array<[number, number]>, most = PATH_POINTS): Array<[number, number]> {
  if (points.length <= most) return points;
  const step = points.length / most;
  const kept: Array<[number, number]> = [];
  for (let i = 1; i <= most; i++) {
    const point = points[Math.min(points.length - 1, Math.round(i * step) - 1)];
    if (point) kept.push(point);
  }
  return kept;
}

/** A gap in the live ticks longer than this is filled from the signed prices (one a minute). */
const GAP_MS = 20_000;

/**
 * The live ticks across a round's film window, with any gap (the relay restarting, a quiet exchange) filled from the
 * signed prices, as Senryo fills a replay's gaps from 1-minute candles; then thinned.
 */
export async function livePath(db: Db, round: RoundRow): Promise<Array<[number, number]>> {
  const { from, to } = filmWindow(round);
  const feed = round.asset === "GOLD" ? null : ASSET_FEED[round.asset];
  const [ticks, signed] = await Promise.all([
    priceSeries(db, round.asset, new Date(from * SECOND_MS), new Date(to * SECOND_MS)),
    feed ? oracleSeries(db, feed, from, to) : Promise.resolve([]),
  ]);
  const points = ticks.map((tick): [number, number] => [tick.at.getTime(), tick.price]);
  if (points.length < 2 || !feed) return thin(points);
  const times = points.map(([ms]) => ms);
  const near = (ms: number) => times.some((at) => Math.abs(at - ms) < GAP_MS / 2);
  const fills = signed
    .map((print): [number, number] => [print.timestamp * SECOND_MS, print.price / FEEDS[feed].scaling])
    .filter(([ms]) => !near(ms));
  return thin([...points, ...fills].sort((a, b) => a[0] - b[0]));
}

/** Keeps the paths of decided rounds whose windows are still covered by live ticks (the engine runs this each minute). */
export async function keepPaths(db: Db, network: Network, now: number, keepSeconds: number): Promise<number> {
  const due = await db
    .select()
    .from(rounds)
    .where(
      and(
        eq(rounds.network, network),
        inArray(rounds.state, [...DECIDED]),
        gte(rounds.closeTime, now - keepSeconds),
        lte(rounds.closeTime, now - TAIL_SECONDS),
        notExists(
          db
            .select({ one: sql`1` })
            .from(roundPaths)
            .where(and(eq(roundPaths.network, rounds.network), eq(roundPaths.roundId, rounds.roundId))),
        ),
      ),
    );
  let kept = 0;
  for (const round of due) {
    const points = await livePath(db, round);
    if (points.length < 2) continue;
    await db.insert(roundPaths).values({ network, roundId: round.roundId, points }).onConflictDoNothing();
    kept += 1;
  }
  return kept;
}

export interface FilmEntry {
  /** Unix ms the entry was seen. */
  at: number;
  outcome: number;
  stake: number;
  payoutPkh: string;
  status: string;
  payoutSats: number | null;
}

export interface RoundFilm {
  round: RoundRow;
  /** [Unix ms, dollars]. */
  path: Array<[number, number]>;
  /** Signed prices in the window, in dollars (none for gold, which combines two feeds). */
  prints: Array<[number, number]>;
  entries: FilmEntry[];
  /** "kept" (stored), "live" (from ticks), or "signed" (signed prices only). */
  source: "kept" | "live" | "signed";
}

/** Everything one round's film needs, or null for an unknown round. */
export async function roundFilm(db: Db, network: Network, roundId: number): Promise<RoundFilm | null> {
  const [round] = await db
    .select()
    .from(rounds)
    .where(and(eq(rounds.network, network), eq(rounds.roundId, roundId)));
  if (!round) return null;
  const { from, to } = filmWindow(round);
  const [kept] = await db
    .select()
    .from(roundPaths)
    .where(and(eq(roundPaths.network, network), eq(roundPaths.roundId, roundId)));
  const feed = round.asset === "GOLD" ? null : ASSET_FEED[round.asset];
  const [live, signed, entered] = await Promise.all([
    kept ? Promise.resolve([]) : livePath(db, round),
    feed ? oracleSeries(db, feed, from, to) : Promise.resolve([]),
    db
      .select({ ticket: tickets, seen: transactions.firstSeen })
      .from(tickets)
      .leftJoin(transactions, and(eq(transactions.network, tickets.network), eq(transactions.txid, tickets.enterTxid)))
      .where(and(eq(tickets.network, network), eq(tickets.roundId, roundId))),
  ]);
  const prints = feed
    ? signed.map((print): [number, number] => [print.timestamp * SECOND_MS, print.price / FEEDS[feed].scaling])
    : [];
  const path = kept ? kept.points : live.length >= 2 ? live : prints;
  return {
    round,
    path,
    prints,
    entries: entered
      .map(({ ticket, seen }) => ({
        // When the entry was first seen on the network (the indexer's row may be newer after a rebuild).
        at: (seen ?? ticket.enteredAt).getTime(),
        outcome: ticket.outcome,
        stake: ticket.stake,
        payoutPkh: ticket.payoutPkh,
        status: ticket.status,
        payoutSats: ticket.payoutSats,
      }))
      .sort((a, b) => a.at - b.at),
    source: kept ? "kept" : live.length >= 2 ? "live" : "signed",
  };
}
