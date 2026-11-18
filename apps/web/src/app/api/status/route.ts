import { resolveModel } from "@joge/brain";
import { engineHealth, freshness, lobby } from "@joge/db";
import { database, networkOf, nowSeconds } from "@/server/db";

/**
 * What /status shows from the server's side: every engine part's last heartbeat, how fresh the signed and live prices
 * are, how many lanes are taking entries, and which model Sensei and the agents use (never a key).
 */
export async function GET(request: Request) {
  const network = networkOf(request);
  const now = nowSeconds();
  const [beats, fresh, lanes] = await Promise.all([
    engineHealth(database.db),
    freshness(database.db),
    lobby(database.db, network, now),
  ]);
  const model = resolveModel();
  return Response.json({
    network,
    now,
    components: beats.map((beat) => ({ component: beat.component, detail: beat.detail, at: beat.at })),
    feeds: fresh.feeds,
    ticks: fresh.ticks,
    // A lane runs when it has a round in play (chipnet runs a few lanes on purpose; mainnet all of them).
    lanes: {
      running: lanes.filter((lane) => lane.next !== null || lane.live !== null).length,
      open: lanes.filter((lane) => lane.next !== null).length,
    },
    ai: model ? { id: model.id, via: model.via } : null,
  });
}
