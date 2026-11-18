import { customRounds, eventRounds, lobby } from "@joge/db";
import { database, networkOf, nowSeconds } from "@/server/db";

/** Custom rounds shown on the lobby: the newest few, live or finished (anyone can post one). */
const CUSTOM_SHOWN = 12;
/** Events featured on the lobby: the ones still taking entries or running, soonest to lock first. */
const FEATURED_EVENTS = 3;

/** Every lane's Next, Live and last round, the newest custom rounds and the featured events. */
export async function GET(request: Request) {
  const network = networkOf(request);
  const [lanes, custom, events] = await Promise.all([
    lobby(database.db, network, nowSeconds()),
    customRounds(database.db, network, CUSTOM_SHOWN),
    eventRounds(database.db, network, 0),
  ]);
  return Response.json({ network, now: nowSeconds(), lanes, custom, events: events.slice(0, FEATURED_EVENTS) });
}
