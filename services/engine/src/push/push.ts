import {
  type AgentNotice,
  agentReads,
  agents,
  CHANNEL,
  claimPush,
  type Database,
  deletePushSubscription,
  listen,
  type Network,
  type PushSubscriptionRow,
  priceSeries,
  pushSubscriptionsFor,
  type RoundNotice,
  releasePush,
  rounds,
  tickets,
} from "@joge/db";
import { and, eq } from "drizzle-orm";
import webpush from "web-push";
import { errorText, logger } from "../log.ts";

const log = logger("push");
const SATS_PER_BCH = 100_000_000;
const SECOND_MS = 1_000;
const HOUR_SECONDS = 3_600;
const MINUTE_SECONDS = 60;
const PRICE_LOOKBACK_MS = 120_000;
/** A push service answering one of these has forgotten the browser: drop its subscription. */
const NOT_FOUND = 404;
const GONE_FOREVER = 410;
const GONE = new Set([NOT_FOUND, GONE_FOREVER]);
/** A notice nobody could read for a day is dropped by the push service, not stored. */
const TTL_SECONDS = 24 * HOUR_SECONDS;
const NAMES = { BTC: "BTC", ETH: "ETH", BCH: "BCH", GOLD: "Gold" } as const;
const CENT = 0.01;
const UTC_TIME = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });

interface Notice {
  title: string;
  body: string;
  url: string;
  tag: string;
}

const laneOf = (asset: keyof typeof NAMES, seconds: number | null) =>
  `${NAMES[asset]}${seconds ? ` ${seconds >= HOUR_SECONDS ? `${seconds / HOUR_SECONDS} h` : `${seconds / MINUTE_SECONDS} min`}` : ""}`;

/**
 * Web Push: the engine tells the browsers that signed up (apps/web /api/push) about their own rounds, the moment
 * a round pays out, and tells an agent's owner when it proposes a bet. One notice per browser per item (push_sent),
 * nothing from before the browser signed up, and subscriptions a push service has forgotten are dropped.
 */
export async function runPush(
  database: Database,
  network: Network,
  vapid: { publicKey: string; privateKey: string; subject: string } | null,
  signal: AbortSignal,
) {
  if (!vapid) {
    log.info("off: set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT to send round alerts");
    return;
  }
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  const { db } = database;

  const bchUsd = async () => {
    const ticks = await priceSeries(db, "BCH", new Date(Date.now() - PRICE_LOOKBACK_MS));
    return ticks.at(-1)?.price ?? 0;
  };
  const dollars = (sats: number, price: number) => {
    const value = Math.abs((sats / SATS_PER_BCH) * price);
    return value < CENT ? "<$0.01" : `$${value.toFixed(2)}`;
  };

  const send = async (subscription: PushSubscriptionRow, item: string, notice: Notice) => {
    if (!(await claimPush(db, subscription.endpoint, item))) return;
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        JSON.stringify(notice),
        { TTL: TTL_SECONDS },
      );
      log.info("sent", { item });
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status !== undefined && GONE.has(status)) {
        await deletePushSubscription(db, subscription.endpoint);
        log.info("dropped a forgotten subscription", { status });
      } else {
        await releasePush(db, subscription.endpoint, item);
        log.warn("send failed", { item, error: errorText(error) });
      }
    }
  };

  /** A round paid out: each listening browser hears how its own tickets ended, once. */
  const announceRound = async (roundId: number) => {
    const [round] = await db
      .select()
      .from(rounds)
      .where(and(eq(rounds.network, network), eq(rounds.roundId, roundId)));
    if (!round || (round.state !== "settled" && round.state !== "void")) return;
    const entered = await db
      .select()
      .from(tickets)
      .where(and(eq(tickets.network, network), eq(tickets.roundId, roundId)));
    if (entered.length === 0) return;
    const listeners = await pushSubscriptionsFor(db, network, [...new Set(entered.map((ticket) => ticket.payoutPkh))]);
    if (listeners.length === 0) return;
    const price = await bchUsd();
    const lane = laneOf(round.asset, round.laneSeconds);
    for (const subscription of listeners) {
      if (subscription.since.getTime() > round.closeTime * SECOND_MS) continue;
      const mine = entered.filter((ticket) => subscription.pkhs.includes(ticket.payoutPkh));
      if (mine.length === 0) continue;
      const voided = round.state === "void";
      const won = !voided && mine.some((ticket) => ticket.outcome === round.winner);
      const back = mine.reduce((sum, ticket) => sum + (ticket.payoutSats ?? 0), 0);
      const paidIn = mine.reduce((sum, ticket) => sum + ticket.stake + ticket.value, 0);
      const net = back - paidIn;
      const winner = round.winner === 0 ? "Up" : "Down";
      await send(subscription, `round:${roundId}`, {
        title: voided ? `${lane}: refunded` : won ? `${lane}: you were right` : `${lane}: not this time`,
        body: voided
          ? `Your stake is back · #${roundId}`
          : won
            ? `${winner} won · ${net >= 0 ? "+" : "−"}${dollars(net, price)} · #${roundId}`
            : `${winner} won · #${roundId}`,
        url: `/r/${roundId}`,
        tag: `round-${roundId}`,
      });
    }
  };

  /** An ask-me-first agent wants to bet: its owner hears what and until when. */
  const announceProposal = async (notice: AgentNotice) => {
    const [read] = await db
      .select()
      .from(agentReads)
      .where(and(eq(agentReads.agentId, notice.agentId), eq(agentReads.roundId, notice.roundId)));
    if (read?.proposal !== "open" || !read.side || read.side === "hold") return;
    const [agent] = await db.select().from(agents).where(eq(agents.id, notice.agentId));
    const [round] = await db
      .select()
      .from(rounds)
      .where(and(eq(rounds.network, network), eq(rounds.roundId, notice.roundId)));
    if (!agent || !round) return;
    const listeners = await pushSubscriptionsFor(db, network, [agent.ownerPkh]);
    for (const subscription of listeners) {
      await send(subscription, `proposal:${read.id}`, {
        title: `${agent.name} wants ${read.side === "up" ? "Up" : "Down"} · ${laneOf(round.asset, round.laneSeconds)}`,
        body: `Take it before ${UTC_TIME.format(round.lockTime * SECOND_MS)} UTC`,
        url: `/agents/${agent.id}`,
        tag: `proposal-${read.id}`,
      });
    }
  };

  const stopRounds = await listen(database.sql, CHANNEL.round, (notice: RoundNotice) => {
    if (notice.network !== network || notice.kind !== "sweep") return;
    announceRound(notice.roundId).catch((error) => log.warn("round notice failed", { error: errorText(error) }));
  });
  const stopAgents = await listen(database.sql, CHANNEL.agent, (notice: AgentNotice) => {
    if (notice.network !== network || notice.verdict !== "enter") return;
    announceProposal(notice).catch((error) => log.warn("proposal notice failed", { error: errorText(error) }));
  });
  log.info("listening", { network });
  // Listen until the engine stops.
  if (!signal.aborted)
    await new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve(), { once: true }));
  await stopRounds.unlisten();
  await stopAgents.unlisten();
}
