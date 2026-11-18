import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { Db } from "./client.ts";

/** Kept out of the main entry: only the engine migrates, and bundlers must not try to package the SQL folder. */
const MIGRATIONS = fileURLToPath(new URL("../drizzle", import.meta.url));

/** Applies every pending migration (run by the engine at boot). */
export const runMigrations = (db: Db) => migrate(db, { migrationsFolder: MIGRATIONS });
