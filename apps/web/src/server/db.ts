import "server-only";
import { createDb, type Database, type Network } from "@joge/db";
import { DB_POOL, SECOND_MS } from "./constants.ts";
import { serverEnv } from "./env.ts";

const store = globalThis as typeof globalThis & { jogeDatabase?: Database };

/** One pool per server process (kept across dev reloads). */
export const database: Database = store.jogeDatabase ?? createDb(serverEnv.DATABASE_URL, { max: DB_POOL });
store.jogeDatabase = database;

/** `?network=` picks the world; mainnet and chipnet never mix. */
export function networkOf(request: Request): Network {
  const value = new URL(request.url).searchParams.get("network");
  return value === "mainnet" || value === "chipnet" ? value : serverEnv.JOGE_DEFAULT_NETWORK;
}

export const nowSeconds = () => Math.floor(Date.now() / SECOND_MS);
