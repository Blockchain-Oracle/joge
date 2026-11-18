import { type Database, keepPaths, type Network } from "@joge/db";
import { PRICE_KEEP_MS } from "./constants.ts";
import { errorText, logger } from "./log.ts";
import { every, MS, nowSeconds } from "./runtime.ts";

const log = logger("paths");
/** How often decided rounds are checked for a path to keep. */
const PATHS_EVERY_MS = 60 * MS;

/**
 * Keeps each decided round's price path (the round film's line) while the live ticks still cover it: they are pruned
 * after PRICE_KEEP_MS, the kept path is not.
 */
export async function runPaths(database: Database, network: Network, signal: AbortSignal) {
  await every(
    PATHS_EVERY_MS,
    signal,
    async () => {
      const kept = await keepPaths(database.db, network, nowSeconds(), PRICE_KEEP_MS / MS);
      if (kept > 0) log.info("kept", { rounds: kept });
    },
    (error) => log.warn("pass failed", { error: errorText(error) }),
  );
}
