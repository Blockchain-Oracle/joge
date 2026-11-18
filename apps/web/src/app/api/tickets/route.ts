import { ticketsOf } from "@joge/db";
import { database, networkOf } from "@/server/db";

const PKH = /^[0-9a-f]{40}$/;
const MOST = 200;

/** A player's tickets (by payout key hashes, comma-separated), newest first, with each round's record. */
export async function GET(request: Request) {
  const keys = (new URL(request.url).searchParams.get("pkh") ?? "").split(",").filter((key) => PKH.test(key));
  if (keys.length === 0) return Response.json({ error: "give pkh=<40 hex>[,…]" }, { status: 400 });
  const network = networkOf(request);
  const rows = (await Promise.all(keys.map((key) => ticketsOf(database.db, network, key, MOST)))).flat();
  rows.sort((a, b) => b.ticket.enteredAt.getTime() - a.ticket.enteredAt.getTime());
  return Response.json({ network, tickets: rows.slice(0, MOST) });
}
