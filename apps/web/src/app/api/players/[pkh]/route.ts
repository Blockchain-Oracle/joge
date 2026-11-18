import { playerProfile, ticketsOf } from "@joge/db";
import { database, networkOf, nowSeconds } from "@/server/db";

const PKH = /^[0-9a-f]{40}$/;
/** Enough tickets for the story film (it groups longer histories itself). */
const RECENT_TICKETS = 200;
const BAD_REQUEST = 400;

/** One player's record (totals, place, streaks, twelve weeks of days) and their latest tickets. */
export async function GET(request: Request, { params }: RouteContext<"/api/players/[pkh]">) {
  const { pkh } = await params;
  if (!PKH.test(pkh)) return Response.json({ error: "give a 40-hex payout key hash" }, { status: BAD_REQUEST });
  const network = networkOf(request);
  const [profile, tickets] = await Promise.all([
    playerProfile(database.db, network, pkh, nowSeconds()),
    ticketsOf(database.db, network, pkh, RECENT_TICKETS),
  ]);
  return Response.json({ network, pkh, ...profile, tickets });
}
