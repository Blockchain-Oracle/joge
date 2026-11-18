import type { AssetId } from "@joge/sdk";
import { sql } from "drizzle-orm";
import type { Db } from "./client.ts";

/** One candle of the live price: its bucket's start (Unix ms) and open, high, low, close in dollars. */
export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

/**
 * The live price as candles (candle view): ticks bucketed by `bucketSeconds` since `from` (Unix seconds),
 * oldest first. The same indicative line the live chart draws, so the views agree.
 */
export async function candleSeries(db: Db, asset: AssetId, from: number, bucketSeconds: number): Promise<Candle[]> {
  const rows = await db.execute<{ t: string; o: number; h: number; l: number; c: number }>(sql`
    select
      (extract(epoch from date_bin(make_interval(secs => ${bucketSeconds}), at, timestamptz 'epoch')) * 1000)::bigint as t,
      (array_agg(price order by at asc))[1] as o,
      max(price) as h,
      min(price) as l,
      (array_agg(price order by at desc))[1] as c
    from price_ticks
    where asset = ${asset} and at >= to_timestamp(${from})
    group by 1
    order by 1`);
  return rows.map((row) => ({ t: Number(row.t), o: row.o, h: row.h, l: row.l, c: row.c }));
}

/**
 * Candles from the oracle's signed prices (one a minute, kept for good): the day view's history even where the live
 * ticks have not been kept that long. `scaling` turns a signed price into dollars.
 */
export async function oracleCandles(
  db: Db,
  feed: string,
  from: number,
  bucketSeconds: number,
  scaling: number,
): Promise<Candle[]> {
  const rows = await db.execute<{ t: string; o: number; h: number; l: number; c: number }>(sql`
    select
      (extract(epoch from date_bin(make_interval(secs => ${bucketSeconds}), to_timestamp(timestamp), timestamptz 'epoch')) * 1000)::bigint as t,
      (array_agg(price order by timestamp asc))[1]::float8 / ${scaling} as o,
      max(price)::float8 / ${scaling} as h,
      min(price)::float8 / ${scaling} as l,
      (array_agg(price order by timestamp desc))[1]::float8 / ${scaling} as c
    from oracle_messages
    where feed = ${feed} and timestamp >= ${from}
    group by 1
    order by 1`);
  return rows.map((row) => ({ t: Number(row.t), o: row.o, h: row.h, l: row.l, c: row.c }));
}
