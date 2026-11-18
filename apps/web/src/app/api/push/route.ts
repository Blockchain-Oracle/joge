import { deletePushSubscription, savePushSubscription } from "@joge/db";
import { z } from "zod";
import { PUSH_ENDPOINT_MAX, PUSH_MAX_ADDRESSES, PUSH_PER_IP } from "@/server/constants";
import { database } from "@/server/db";
import { allow, clientIp } from "@/server/rate";

const BAD_REQUEST = 400;
const TOO_MANY = 429;
const KEY_MAX = 200;

const subscribeSchema = z.object({
  network: z.enum(["mainnet", "chipnet"]),
  pkhs: z
    .array(z.string().regex(/^[0-9a-f]{40}$/))
    .min(1)
    .max(PUSH_MAX_ADDRESSES),
  subscription: z.object({
    endpoint: z.url().startsWith("https://").max(PUSH_ENDPOINT_MAX),
    keys: z.object({ p256dh: z.string().min(1).max(KEY_MAX), auth: z.string().min(1).max(KEY_MAX) }),
  }),
});
const unsubscribeSchema = z.object({ endpoint: z.url().max(PUSH_ENDPOINT_MAX) });

/**
 * Web Push sign-up (F20): this browser wants to hear about rounds paid to these addresses (results are public on
 * chain, so no signature is asked). The engine sends; this route only stores the subscription.
 */
export async function POST(request: Request) {
  if (!allow("push", clientIp(request), PUSH_PER_IP))
    return Response.json({ error: "Slow down." }, { status: TOO_MANY });
  const parsed = subscribeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "Send a push subscription and your addresses." }, { status: BAD_REQUEST });
  const { network, pkhs, subscription } = parsed.data;
  await savePushSubscription(database.db, {
    endpoint: subscription.endpoint,
    network,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    pkhs: [...new Set(pkhs)],
  });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const parsed = unsubscribeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Send the endpoint to forget." }, { status: BAD_REQUEST });
  await deletePushSubscription(database.db, parsed.data.endpoint);
  return Response.json({ ok: true });
}
