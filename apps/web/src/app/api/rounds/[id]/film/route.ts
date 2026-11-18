import { roundFilm } from "@joge/db";
import { database, networkOf } from "@/server/db";

const BAD_REQUEST = 400;
const NOT_FOUND = 404;

/** One round's film: its price path, signed prices and every entry with its moment (the replay). */
export async function GET(request: Request, { params }: RouteContext<"/api/rounds/[id]/film">) {
  const roundId = Number((await params).id);
  if (!Number.isSafeInteger(roundId) || roundId < 0)
    return Response.json({ error: "bad round id" }, { status: BAD_REQUEST });
  const film = await roundFilm(database.db, networkOf(request), roundId);
  if (!film) return Response.json({ error: "no such round" }, { status: NOT_FOUND });
  return Response.json(film);
}
