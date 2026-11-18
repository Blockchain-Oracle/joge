import { roundView } from "@joge/db";
import { database, networkOf } from "@/server/db";

/** One round: its record, gates, entries and every transaction it has made. */
export async function GET(request: Request, context: RouteContext<"/api/rounds/[id]">) {
  const roundId = Number((await context.params).id);
  if (!Number.isSafeInteger(roundId) || roundId < 0) return Response.json({ error: "bad round id" }, { status: 400 });
  const view = await roundView(database.db, networkOf(request), roundId);
  return view ? Response.json(view) : Response.json({ error: "no such round" }, { status: 404 });
}
