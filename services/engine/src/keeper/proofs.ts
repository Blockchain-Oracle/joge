import { type Db, oracleMessages } from "@joge/db";
import { type BoundaryPair, type FeedId, findBoundaryPair, type PriceMessage } from "@joge/sdk";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { PAIR_WINDOW_SECONDS } from "../constants.ts";

const asPrice = (row: typeof oracleMessages.$inferSelect): PriceMessage => ({
  message: row.message,
  signature: row.signature,
  timestamp: row.timestamp,
  messageSequence: row.messageSequence,
  dataSequence: row.dataSequence,
  price: row.price,
});

/** The canonical pair proving the first message at or after `boundary`, once the oracle has signed past it. */
export async function boundaryPair(db: Db, feed: FeedId, boundary: number): Promise<BoundaryPair | undefined> {
  const rows = await db
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
  return findBoundaryPair(rows.map(asPrice), boundary);
}

export async function bySequence(db: Db, feed: FeedId, dataSequence: number): Promise<PriceMessage | undefined> {
  const [row] = await db
    .select()
    .from(oracleMessages)
    .where(and(eq(oracleMessages.feed, feed), eq(oracleMessages.dataSequence, dataSequence)));
  return row ? asPrice(row) : undefined;
}

/** The newest signed message of a feed (the lane thread's clock reads USD/BCH). */
export async function latest(db: Db, feed: FeedId): Promise<PriceMessage | undefined> {
  const [row] = await db
    .select()
    .from(oracleMessages)
    .where(eq(oracleMessages.feed, feed))
    .orderBy(desc(oracleMessages.dataSequence))
    .limit(1);
  return row ? asPrice(row) : undefined;
}
