import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Channel, NoticeOf } from "./channels.ts";
import * as schema from "./schema.ts";

const DEFAULT_POOL = 10;

export interface DbOptions {
  /** Connection pool size. */
  max?: number;
}

/** One Postgres pool (postgres.js) and its Drizzle handle. `sql` is kept for LISTEN/NOTIFY. */
export function createDb(url: string, { max = DEFAULT_POOL }: DbOptions = {}) {
  const sql = postgres(url, { max, onnotice: () => {} });
  const db = drizzle({ client: sql, schema, casing: "snake_case" });
  return { sql, db };
}

export type Database = ReturnType<typeof createDb>;
export type Db = Database["db"];

export const notify = <C extends Channel>(sql: Database["sql"], channel: C, notice: NoticeOf[C]) =>
  sql.notify(channel, JSON.stringify(notice));

export function listen<C extends Channel>(sql: Database["sql"], channel: C, onNotice: (notice: NoticeOf[C]) => void) {
  return sql.listen(channel, (payload) => onNotice(JSON.parse(payload) as NoticeOf[C]));
}
