import { bigint, bigserial, index, pgTable, primaryKey, smallint, text, timestamp } from "drizzle-orm/pg-core";
import { createdAt, network, updatedAt } from "./columns.ts";

/**
 * Lanes woken on demand (S09): when the keeper runs with KEEPER_DEMAND=on, a lane outside its always-open set keeps
 * opening rounds until `until`, which a viewer's browser pushes forward while the lane is on screen.
 */
export const laneDemand = pgTable(
  "lane_demand",
  {
    network: network(),
    thread: smallint().notNull(),
    until: timestamp({ withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.network, t.thread] })],
);

export type FaucetState = "pending" | "sent" | "full" | "dry" | "failed";

/** Chipnet test coins on request (S09R): the engine's faucet tops a paired wallet up to a target. Never on mainnet. */
export const faucetClaims = pgTable(
  "faucet_claims",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    network: network(),
    /** The cash address that receives the coins (the wallet's payout address). */
    address: text().notNull(),
    /** A one-way hash of the asker's IP, only to cap claims per visitor. */
    visitor: text().notNull(),
    state: text().$type<FaucetState>().notNull().default("pending"),
    /** What was sent, once sent. */
    satoshis: bigint({ mode: "bigint" }),
    txid: text(),
    /** The signed transaction, written before it is broadcast so a retry re-sends the same bytes (never pays twice). */
    hex: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("faucet_address").on(t.network, t.address, t.createdAt), index("faucet_state").on(t.state)],
);
