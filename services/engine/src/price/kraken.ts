import { CHANNEL, type Database, listen, notify, oracleMessages, priceTicks } from "@joge/db";
import { type AssetId, FEEDS, type FeedId } from "@joge/sdk";
import { desc, eq, lt } from "drizzle-orm";
import { PRICE_COALESCE_MS, PRICE_KEEP_MS, PRICE_PRUNE_EVERY_MS, PRICE_STALE_MS, SECOND_MS } from "../constants.ts";
import { errorText, logger } from "../log.ts";
import { backoff, beat, every, sleep } from "../runtime.ts";
import { OracleAnchor } from "./anchor.ts";

const log = logger("price");
const KRAKEN_WS = "wss://ws.kraken.com/v2";
/** Kraken's pairs for each asset's indicative line. Gold uses PAXG (one token per troy ounce, redeemable for gold). */
const SYMBOL: Record<string, AssetId> = { "BTC/USD": "BTC", "ETH/USD": "ETH", "BCH/USD": "BCH", "PAXG/USD": "GOLD" };
const HALF = 2;

interface TickerUpdate {
  channel?: string;
  type?: string;
  data?: Array<{ symbol: string; bid: number; ask: number; last: number }>;
}

/** One connection: resolves when the socket closes or goes stale. */
function connect(onTick: (asset: AssetId, price: number) => void, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const socket = new WebSocket(KRAKEN_WS);
    let lastMessage = Date.now();
    const watchdog = setInterval(() => {
      if (Date.now() - lastMessage > PRICE_STALE_MS) socket.close();
    }, PRICE_STALE_MS / HALF);
    const finish = () => {
      clearInterval(watchdog);
      resolve();
    };
    signal.addEventListener("abort", () => socket.close(), { once: true });
    socket.addEventListener("open", () => {
      log.info("connected", { symbols: Object.keys(SYMBOL).length });
      socket.send(
        JSON.stringify({
          method: "subscribe",
          params: { channel: "ticker", symbol: Object.keys(SYMBOL), event_trigger: "bbo" },
        }),
      );
    });
    socket.addEventListener("message", (event) => {
      lastMessage = Date.now();
      const update = JSON.parse(String(event.data)) as TickerUpdate;
      if (update.channel !== "ticker" || !update.data) return;
      for (const row of update.data) {
        const asset = SYMBOL[row.symbol];
        // The mid of the best bid and offer moves smoothly; fall back to the last trade.
        const price = row.bid > 0 && row.ask > 0 ? (row.bid + row.ask) / HALF : row.last;
        if (asset && price > 0) onTick(asset, price);
      }
    });
    socket.addEventListener("close", finish);
    socket.addEventListener("error", () => {
      clearInterval(watchdog);
      reject(new Error("Kraken socket error"));
    });
  });
}

/**
 * The indicative live line: Kraken's public ticker, re-based to the oracle's last signed price (see OracleAnchor),
 * coalesced to one tick per second per asset, stored for the chart's first paint and announced over NOTIFY. Labelled
 * "live (indicative)" in the app; settlement only ever uses the oracle.
 */
export async function runPriceRelay(database: Database, signal: AbortSignal) {
  const pending = new Map<AssetId, number>();
  const latest = new Map<AssetId, number>();
  // Anchor the line to the oracle: seed from the newest stored print of each feed, then follow new ones.
  const anchor = new OracleAnchor();
  for (const feed of Object.keys(FEEDS) as FeedId[]) {
    const [newest] = await database.db
      .select({ price: oracleMessages.price })
      .from(oracleMessages)
      .where(eq(oracleMessages.feed, feed))
      .orderBy(desc(oracleMessages.dataSequence))
      .limit(1);
    if (newest) anchor.onSigned(feed, newest.price);
  }
  const prints = await listen(database.sql, CHANNEL.oracle, (notice) => anchor.onSigned(notice.feed, notice.price));
  const flush = setInterval(() => {
    const at = new Date();
    const rows = [...pending].map(([asset, price]) => ({ asset, price, at }));
    pending.clear();
    if (rows.length === 0) return;
    database.db
      .insert(priceTicks)
      .values(rows)
      .onConflictDoNothing()
      .then(() => Promise.all(rows.map((row) => notify(database.sql, CHANNEL.price, { ...row, at: row.at.getTime() }))))
      .catch((error) => log.warn("tick write failed", { error: errorText(error) }));
  }, PRICE_COALESCE_MS);
  const prune = every(
    PRICE_PRUNE_EVERY_MS,
    signal,
    async () => {
      await database.db.delete(priceTicks).where(lt(priceTicks.at, new Date(Date.now() - PRICE_KEEP_MS)));
      await beat(database, "price", { latest: Object.fromEntries(latest), at: Math.floor(Date.now() / SECOND_MS) });
    },
    (error) => log.warn("prune failed", { error: errorText(error) }),
  );
  let attempt = 0;
  while (!signal.aborted) {
    try {
      await connect((asset, raw) => {
        const price = anchor.rebase(asset, raw);
        pending.set(asset, price);
        latest.set(asset, price);
        attempt = 0;
      }, signal);
    } catch (error) {
      log.warn("socket failed", { error: errorText(error), attempt });
    }
    if (signal.aborted) break;
    await sleep(backoff(attempt), signal);
    attempt += 1;
  }
  clearInterval(flush);
  await prints.unlisten();
  await prune;
}
