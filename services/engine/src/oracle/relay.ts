import { CHANNEL, type Database, notify, oracleMessages } from "@joge/db";
import {
  decodeMessage,
  FEED_BY_KEY,
  FEEDS,
  type FeedId,
  fetchMessages,
  isPriceMessage,
  ORACLE_API_BASE,
  ORACLE_SSE_PATH,
  type SignedMessage,
  verifyMessageSignature,
} from "@joge/sdk";
import { desc, eq } from "drizzle-orm";
import { EventSourceParserStream } from "eventsource-parser/stream";
import {
  ORACLE_COLD_START_SECONDS,
  ORACLE_PAGE,
  ORACLE_SAFETY_EVERY_MS,
  ORACLE_SAFETY_WINDOW_SECONDS,
} from "../constants.ts";
import { errorText, logger } from "../log.ts";
import { backoff, beat, every, nowSeconds, sleep } from "../runtime.ts";

const log = logger("oracle");

const verified = (signed: SignedMessage, publicKey: string): boolean => verifyMessageSignature(signed, publicKey);

/** Stores signed price messages (verified first), then announces each new one. Returns how many were new. */
async function store(database: Database, feed: FeedId, signed: SignedMessage[]): Promise<number> {
  const { publicKey } = FEEDS[feed];
  const rows = signed
    .map(decodeMessage)
    .filter((message) => isPriceMessage(message) && verified(message, publicKey))
    .map(({ message, signature, timestamp, messageSequence, dataSequence, price }) => ({
      feed,
      message,
      signature,
      timestamp,
      messageSequence,
      dataSequence,
      price,
    }));
  if (rows.length === 0) return 0;
  const fresh = await database.db.insert(oracleMessages).values(rows).onConflictDoNothing().returning();
  for (const row of fresh.sort((a, b) => a.dataSequence - b.dataSequence)) {
    await notify(database.sql, CHANNEL.oracle, {
      feed,
      dataSequence: row.dataSequence,
      timestamp: row.timestamp,
      price: row.price,
    });
  }
  return fresh.length;
}

/** Reads [from, to] from the REST API, newest page first, until the window is covered. */
async function backfill(database: Database, feed: FeedId, from: number, to: number) {
  let upper = to;
  let added = 0;
  for (;;) {
    const page = await fetchMessages({
      publicKey: FEEDS[feed].publicKey,
      minMessageTimestamp: from,
      maxMessageTimestamp: upper,
      count: ORACLE_PAGE,
    });
    added += await store(database, feed, page);
    if (page.length < ORACLE_PAGE) break;
    const oldest = Math.min(...page.map((signed) => decodeMessage(signed).timestamp));
    if (oldest <= from) break;
    upper = oldest - 1;
  }
  return added;
}

async function latestStored(database: Database, feed: FeedId): Promise<number | undefined> {
  const [row] = await database.db
    .select({ timestamp: oracleMessages.timestamp })
    .from(oracleMessages)
    .where(eq(oracleMessages.feed, feed))
    .orderBy(desc(oracleMessages.timestamp))
    .limit(1);
  return row?.timestamp;
}

/** Fills every feed from its last stored message (or the cold-start window) up to now. */
async function catchUp(database: Database, windowSeconds?: number) {
  const now = nowSeconds();
  for (const feed of Object.keys(FEEDS) as FeedId[]) {
    const latest = await latestStored(database, feed);
    const from = windowSeconds ? now - windowSeconds : (latest ?? now - ORACLE_COLD_START_SECONDS);
    const added = await backfill(database, feed, from, now);
    if (added > 0) log.info("backfilled", { feed, added });
  }
}

/** One live connection to General Protocols' stream; resolves when it ends. */
async function stream(database: Database, signal: AbortSignal, onMessage: () => void) {
  const response = await fetch(new URL(ORACLE_SSE_PATH, ORACLE_API_BASE), {
    headers: { accept: "text/event-stream" },
    signal,
  });
  if (!response.ok || !response.body) throw new Error(`oracle stream answered ${response.status}`);
  log.info("stream connected");
  const events = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream());
  for await (const event of events) {
    const feed = event.event ? FEED_BY_KEY[event.event] : undefined;
    if (!feed) continue;
    const signed = JSON.parse(event.data) as SignedMessage;
    if ((await store(database, feed, [signed])) > 0) onMessage();
  }
}

/**
 * The oracle relay: General Protocols' live stream into Postgres (and NOTIFY), with a REST catch-up at start, after
 * every reconnect, and every few minutes as a safety net. Settlement proofs are read from this table.
 */
export async function runOracleRelay(database: Database, signal: AbortSignal) {
  await catchUp(database);
  let received = 0;
  const safety = every(
    ORACLE_SAFETY_EVERY_MS,
    signal,
    async () => {
      await catchUp(database, ORACLE_SAFETY_WINDOW_SECONDS);
      await beat(database, "oracle", { received, at: nowSeconds() });
    },
    (error) => log.warn("safety catch-up failed", { error: errorText(error) }),
  );
  let attempt = 0;
  while (!signal.aborted) {
    try {
      await stream(database, signal, () => {
        received += 1;
        attempt = 0;
      });
    } catch (error) {
      if (signal.aborted) break;
      log.warn("stream dropped", { error: errorText(error), attempt });
    }
    await sleep(backoff(attempt), signal);
    attempt += 1;
    if (!signal.aborted)
      await catchUp(database).catch((error) => log.warn("catch-up failed", { error: errorText(error) }));
  }
  await safety;
}
