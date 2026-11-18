import { createHash } from "node:crypto";
import { decodeCashAddress } from "@bitauth/libauth";
import {
  cooldownClaim,
  FAUCET_ADDRESS_COOLDOWN_MS,
  FAUCET_DAY_MS,
  FAUCET_VISITOR_PER_DAY,
  type FaucetClaim,
  faucetClaimsByVisitor,
  latestFaucetClaim,
  requestFaucet,
} from "@joge/db";
import { FAUCET_PER_IP } from "@/server/constants";
import { database, networkOf } from "@/server/db";
import { serverEnv } from "@/server/env";
import { allow, clientIp } from "@/server/rate";

const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const ACCEPTED = 202;
const TOO_MANY = 429;
const VISITOR_HEX = 32;
const NO_STORE = { "Cache-Control": "no-store" };

/** What the page sees of a claim. */
const view = (claim: FaucetClaim | null, nextAt?: number) => ({
  state: claim?.state ?? null,
  sats: claim?.satoshis === null || claim?.satoshis === undefined ? null : Number(claim.satoshis),
  txid: claim?.state === "sent" ? claim.txid : null,
  nextAt: nextAt ?? null,
});

/** A chipnet cash address (bchtest:), or null. */
function chipnetAddress(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const decoded = decodeCashAddress(value);
  return typeof decoded === "string" || decoded.prefix !== "bchtest" ? null : value;
}

/** There are no test coins on mainnet (Tempo's guard): the route does not exist there. */
const noFaucet = () => Response.json({ error: "No test coins on mainnet." }, { status: NOT_FOUND, headers: NO_STORE });

/** The latest claim for an address: the page polls this while the engine pays. */
export async function GET(request: Request) {
  if (networkOf(request) !== "chipnet") return noFaucet();
  const address = chipnetAddress(new URL(request.url).searchParams.get("address"));
  if (!address) return Response.json({ error: "Not a chipnet address." }, { status: BAD_REQUEST });
  return Response.json(view(await latestFaucetClaim(database.db, "chipnet", address)), { headers: NO_STORE });
}

/**
 * Asks for test coins for a paired wallet (Agari's rules): one top-up per address per 12 hours, five asks a day per
 * visitor (by a one-way hash of the IP), and the engine pays only up to the target balance. Nothing is signed here.
 */
export async function POST(request: Request) {
  if (networkOf(request) !== "chipnet") return noFaucet();
  const body = (await request.json().catch(() => null)) as { address?: unknown } | null;
  const address = chipnetAddress(body?.address);
  if (!address) return Response.json({ error: "Not a chipnet address." }, { status: BAD_REQUEST });
  const ip = clientIp(request);
  if (!allow("faucet", ip, FAUCET_PER_IP)) return Response.json({ error: "Slow down." }, { status: TOO_MANY });

  const now = Date.now();
  const held = await cooldownClaim(database.db, "chipnet", address, new Date(now - FAUCET_ADDRESS_COOLDOWN_MS));
  if (held?.state === "pending") return Response.json(view(held), { status: ACCEPTED, headers: NO_STORE });
  if (held) {
    const nextAt = held.createdAt.getTime() + FAUCET_ADDRESS_COOLDOWN_MS;
    return Response.json(view(held, nextAt), { status: TOO_MANY, headers: NO_STORE });
  }
  const visitor = createHash("sha256")
    .update(`${serverEnv.AUTH_SECRET ?? "joge"}:${ip}`)
    .digest("hex")
    .slice(0, VISITOR_HEX);
  if (
    (await faucetClaimsByVisitor(database.db, "chipnet", visitor, new Date(now - FAUCET_DAY_MS))) >=
    FAUCET_VISITOR_PER_DAY
  )
    return Response.json({ ...view(null), error: "That's today's test coins for this device." }, { status: TOO_MANY });
  const claim = await requestFaucet(database.db, "chipnet", address, visitor);
  return Response.json(view(claim), { status: ACCEPTED, headers: NO_STORE });
}
