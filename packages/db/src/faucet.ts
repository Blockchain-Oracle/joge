import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import type { Db } from "./client.ts";
import { type FaucetState, faucetClaims, type Network } from "./schema.ts";

export type FaucetClaim = typeof faucetClaims.$inferSelect;

/** Claims that hold an address's cooldown: one waiting or paid. A "full", "dry" or failed claim can ask again. */
export const FAUCET_COOLDOWN_STATES: FaucetState[] = ["pending", "sent"];
/** Every claim but a failed one counts against a visitor's daily number. */
const VISITOR_STATES: FaucetState[] = ["pending", "sent", "full", "dry"];

/** The newest claim for an address in a world. */
export async function latestFaucetClaim(db: Db, network: Network, address: string): Promise<FaucetClaim | null> {
  const [row] = await db
    .select()
    .from(faucetClaims)
    .where(and(eq(faucetClaims.network, network), eq(faucetClaims.address, address)))
    .orderBy(desc(faucetClaims.id))
    .limit(1);
  return row ?? null;
}

/** The newest claim for an address that holds its cooldown, if any since `since`. */
export async function cooldownClaim(db: Db, network: Network, address: string, since: Date) {
  const [row] = await db
    .select()
    .from(faucetClaims)
    .where(
      and(
        eq(faucetClaims.network, network),
        eq(faucetClaims.address, address),
        gt(faucetClaims.createdAt, since),
        inArray(faucetClaims.state, FAUCET_COOLDOWN_STATES),
      ),
    )
    .orderBy(desc(faucetClaims.id))
    .limit(1);
  return row ?? null;
}

/** How many claims a visitor made since a time. */
export async function faucetClaimsByVisitor(db: Db, network: Network, visitor: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(faucetClaims)
    .where(
      and(
        eq(faucetClaims.network, network),
        eq(faucetClaims.visitor, visitor),
        gt(faucetClaims.createdAt, since),
        inArray(faucetClaims.state, VISITOR_STATES),
      ),
    );
  return row?.count ?? 0;
}

/** Sats the faucet paid since a time (the daily total). */
export async function faucetPaidSince(db: Db, network: Network, since: Date): Promise<bigint> {
  const [row] = await db
    .select({ total: sql<string>`coalesce(sum(${faucetClaims.satoshis}), 0)::text` })
    .from(faucetClaims)
    .where(and(eq(faucetClaims.network, network), eq(faucetClaims.state, "sent"), gt(faucetClaims.createdAt, since)));
  return BigInt(row?.total ?? "0");
}

export async function requestFaucet(db: Db, network: Network, address: string, visitor: string): Promise<FaucetClaim> {
  const [row] = await db.insert(faucetClaims).values({ network, address, visitor }).returning();
  if (!row) throw new Error("faucet claim was not stored");
  return row;
}

/** The oldest waiting claims of a world, for the engine's faucet. */
export const pendingFaucetClaims = (db: Db, network: Network, limit: number) =>
  db
    .select()
    .from(faucetClaims)
    .where(and(eq(faucetClaims.network, network), eq(faucetClaims.state, "pending")))
    .orderBy(asc(faucetClaims.id))
    .limit(limit);

/** Writes the signed transaction before it is broadcast (the claim stays pending until the network takes it). */
export const journalFaucetClaim = (db: Db, id: number, signed: { hex: string; txid: string; satoshis: bigint }) =>
  db
    .update(faucetClaims)
    .set({ hex: signed.hex, txid: signed.txid, satoshis: signed.satoshis, updatedAt: new Date() })
    .where(eq(faucetClaims.id, id));

/** Ends a claim: "sent" keeps its journaled transaction; any other end clears it. */
export const settleFaucetClaim = (db: Db, id: number, state: Exclude<FaucetState, "pending">) =>
  db
    .update(faucetClaims)
    .set(
      state === "sent"
        ? { state, updatedAt: new Date() }
        : { state, hex: null, txid: null, satoshis: null, updatedAt: new Date() },
    )
    .where(eq(faucetClaims.id, id));
