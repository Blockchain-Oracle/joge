import { and, desc, eq, gte, inArray, type SQL, sql } from "drizzle-orm";
import type { Db } from "./client.ts";
import { LEADERBOARD_ROWS, PROFILE_DAYS, STREAK_TICKETS } from "./constants.ts";
import { type Network, rounds, type TicketStatus, tickets } from "./schema.ts";

/**
 * Players: no accounts, a player is a payout address. Money is counted in sats: what came back to the address
 * minus what it put in (stake and the ticket's own dust), over tickets whose round is decided.
 */

const DECIDED: TicketStatus[] = ["won", "lost", "refunded"];
const DAY_SECONDS = 86_400;

const net = sql<number>`sum(coalesce(${tickets.payoutSats}, 0) - ${tickets.stake} - ${tickets.value})`.mapWith(Number);
const roundsPlayed = sql<number>`count(distinct ${tickets.roundId})`.mapWith(Number);
const won = sql<number>`count(*) filter (where ${tickets.status} = 'won')`.mapWith(Number);
const lost = sql<number>`count(*) filter (where ${tickets.status} = 'lost')`.mapWith(Number);
const staked = sql<number>`sum(${tickets.stake})`.mapWith(Number);

export interface PlayerTotals {
  payoutPkh: string;
  /** Sats back minus sats in. */
  net: number;
  rounds: number;
  won: number;
  lost: number;
  staked: number;
}

const decidedSince = (network: Network, since: number | null): SQL | undefined =>
  and(
    eq(tickets.network, network),
    inArray(tickets.status, DECIDED),
    since === null ? undefined : gte(rounds.closeTime, since),
  );

const joinRounds = and(eq(rounds.network, tickets.network), eq(rounds.roundId, tickets.roundId));

/** The best players since a moment (Unix seconds; null for all time), most money won first. */
export const leaderboard = (db: Db, network: Network, since: number | null): Promise<PlayerTotals[]> =>
  db
    .select({ payoutPkh: tickets.payoutPkh, net, rounds: roundsPlayed, won, lost, staked })
    .from(tickets)
    .innerJoin(rounds, joinRounds)
    .where(decidedSince(network, since))
    .groupBy(tickets.payoutPkh)
    .orderBy(desc(net), desc(roundsPlayed))
    .limit(LEADERBOARD_ROWS);

export interface PlayerDay {
  /** Unix seconds at 00:00 UTC. */
  day: number;
  tickets: number;
  net: number;
}

export interface PlayerProfile {
  totals: PlayerTotals | null;
  /** Rank by all-time net among every player of the world (1 is first). */
  rank: number | null;
  /** Wins in a row now, and the best run ever (refunds neither break nor extend a run). */
  streak: number;
  bestStreak: number;
  days: PlayerDay[];
}

/** One player's record: totals, place, streaks and a twelve-week activity grid. */
export async function playerProfile(db: Db, network: Network, payoutPkh: string, now: number): Promise<PlayerProfile> {
  const mine = and(decidedSince(network, null), eq(tickets.payoutPkh, payoutPkh));
  const [totalsRows, results, days] = await Promise.all([
    db
      .select({ payoutPkh: tickets.payoutPkh, net, rounds: roundsPlayed, won, lost, staked })
      .from(tickets)
      .innerJoin(rounds, joinRounds)
      .where(mine)
      .groupBy(tickets.payoutPkh),
    db
      .select({ status: tickets.status })
      .from(tickets)
      .innerJoin(rounds, joinRounds)
      .where(mine)
      .orderBy(desc(rounds.closeTime))
      .limit(STREAK_TICKETS),
    db
      .select({
        day: sql<number>`(floor(${rounds.closeTime} / ${DAY_SECONDS}) * ${DAY_SECONDS})::bigint`.mapWith(Number),
        tickets: sql<number>`count(*)`.mapWith(Number),
        net,
      })
      .from(tickets)
      .innerJoin(rounds, joinRounds)
      .where(and(mine, gte(rounds.closeTime, now - PROFILE_DAYS * DAY_SECONDS)))
      .groupBy(sql`1`),
  ]);
  const totals = totalsRows[0] ?? null;
  let rank: number | null = null;
  if (totals) {
    const ahead = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(
        db
          .select({ payoutPkh: tickets.payoutPkh, total: net.as("total") })
          .from(tickets)
          .innerJoin(rounds, joinRounds)
          .where(decidedSince(network, null))
          .groupBy(tickets.payoutPkh)
          .as("players"),
      )
      .where(sql`"total" > ${totals.net}`);
    rank = (ahead[0]?.count ?? 0) + 1;
  }
  const decided = results.filter((row) => row.status !== "refunded");
  const streak = decided.findIndex((row) => row.status !== "won");
  let best = 0;
  let run = 0;
  for (const row of decided) {
    run = row.status === "won" ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return {
    totals,
    rank,
    streak: streak === -1 ? decided.length : streak,
    bestStreak: best,
    days: days.sort((a, b) => a.day - b.day),
  };
}
