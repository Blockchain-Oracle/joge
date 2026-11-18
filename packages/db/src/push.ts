import { and, eq, sql } from "drizzle-orm";
import type { Db } from "./client.ts";
import { type Network, pushSent, pushSubscriptions } from "./schema.ts";

export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;

export interface PushSubscriptionInput {
  endpoint: string;
  network: Network;
  p256dh: string;
  auth: string;
  pkhs: string[];
}

/** Saves a browser's subscription, or updates its keys and addresses (its `since` stays where it began). */
export const savePushSubscription = (db: Db, input: PushSubscriptionInput) =>
  db
    .insert(pushSubscriptions)
    .values(input)
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { network: input.network, p256dh: input.p256dh, auth: input.auth, pkhs: input.pkhs, updatedAt: new Date() },
    });

export const deletePushSubscription = (db: Db, endpoint: string) =>
  db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));

/** Every browser listening for any of these payout addresses in a world. */
export const pushSubscriptionsFor = (db: Db, network: Network, pkhs: string[]) =>
  pkhs.length === 0
    ? Promise.resolve([])
    : db
        .select()
        .from(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.network, network),
            sql`${pushSubscriptions.pkhs} && ARRAY[${sql.join(
              pkhs.map((pkh) => sql`${pkh}`),
              sql`, `,
            )}]::text[]`,
          ),
        );

/** Claims one notice for one browser; false when it was already sent (so each goes out exactly once). */
export async function claimPush(db: Db, endpoint: string, item: string): Promise<boolean> {
  const rows = await db
    .insert(pushSent)
    .values({ endpoint, item })
    .onConflictDoNothing()
    .returning({ item: pushSent.item });
  return rows.length > 0;
}

/** Gives a claim back after a failed send, so the next notice of the same item can try again. */
export const releasePush = (db: Db, endpoint: string, item: string) =>
  db.delete(pushSent).where(and(eq(pushSent.endpoint, endpoint), eq(pushSent.item, item)));
