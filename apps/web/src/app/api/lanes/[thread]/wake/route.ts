import { wakeLane } from "@joge/db";
import { LANES } from "@joge/sdk";
import { LANE_WAKE_MS, WAKE_PER_IP } from "@/server/constants";
import { database, networkOf } from "@/server/db";
import { allow, clientIp } from "@/server/rate";

const BAD_REQUEST = 400;
const TOO_MANY = 429;

/**
 * Someone has this lane on screen: keep it opening rounds for a while (the keeper's on-demand mode, KEEPER_DEMAND=on;
 * lanes in its always-open set ignore this). The page repeats it while the lane stays on screen.
 */
export async function POST(request: Request, { params }: RouteContext<"/api/lanes/[thread]/wake">) {
  const thread = Number((await params).thread);
  if (!LANES.some((lane) => lane.thread === thread))
    return Response.json({ error: "no such lane" }, { status: BAD_REQUEST });
  if (!allow("wake", clientIp(request), WAKE_PER_IP))
    return Response.json({ error: "Slow down." }, { status: TOO_MANY });
  await wakeLane(database.db, networkOf(request), thread, new Date(Date.now() + LANE_WAKE_MS));
  return Response.json({ ok: true });
}
