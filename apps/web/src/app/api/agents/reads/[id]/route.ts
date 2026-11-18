import { agentById, agentReadById, setProposal } from "@joge/db";
import { z } from "zod";
import { sessionPkh } from "@/server/auth";
import { database, networkOf } from "@/server/db";

const NOT_FOUND = 404;
const FORBIDDEN = 403;
const BAD_REQUEST = 400;

/** The owner answers an ask-me-first proposal: taken (they signed the entry in the app) or passed. */
export async function PATCH(request: Request, { params }: RouteContext<"/api/agents/reads/[id]">) {
  const network = networkOf(request);
  const parsed = z.object({ proposal: z.enum(["taken", "passed"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Say taken or passed." }, { status: BAD_REQUEST });
  const read = await agentReadById(database.db, network, Number((await params).id));
  if (read?.proposal !== "open") return Response.json({ error: "No open proposal." }, { status: NOT_FOUND });
  const agent = await agentById(database.db, network, read.agentId);
  if (!agent || sessionPkh(request) !== agent.ownerPkh) {
    return Response.json({ error: "Only the agent's owner answers its proposals." }, { status: FORBIDDEN });
  }
  await setProposal(database.db, read.id, parsed.data.proposal);
  return Response.json({ ok: true });
}
