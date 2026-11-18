import { roundProof } from "@joge/db";
import { database, networkOf } from "@/server/db";

/** The signed oracle messages behind a round's lock, strike and close, raw, for in-browser verification. */
export async function GET(request: Request, context: RouteContext<"/api/rounds/[id]/proof">) {
  const roundId = Number((await context.params).id);
  if (!Number.isSafeInteger(roundId) || roundId < 0) return Response.json({ error: "bad round id" }, { status: 400 });
  const proof = await roundProof(database.db, networkOf(request), roundId);
  return proof ? Response.json(proof) : Response.json({ error: "no such round" }, { status: 404 });
}
