import { agentById, agentMemory, updateAgent } from "@joge/db";
import { z } from "zod";
import { agentDraftSchema, draftProblem, vaultOf } from "@/server/agents";
import { sessionPkh } from "@/server/auth";
import { database, networkOf } from "@/server/db";

const NOT_FOUND = 404;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;
const MEMORY_SHOWN = 60;

/** One agent: its terms, its vault's address and its memory. */
export async function GET(request: Request, { params }: RouteContext<"/api/agents/[id]">) {
  const network = networkOf(request);
  const agent = await agentById(database.db, network, Number((await params).id));
  if (!agent) return Response.json({ error: "No such agent." }, { status: NOT_FOUND });
  const [memory, vault] = await Promise.all([
    agentMemory(database.db, network, agent, MEMORY_SHOWN),
    vaultOf(network, agent),
  ]);
  return Response.json({ agent, memory, vaultAddress: vault.address });
}

/**
 * The owner changes an agent: pause or resume, the mode, or its persona, posture, lanes and daily cap. The per-bet cap
 * is part of the vault's address, so it stays (a different cap is a new agent).
 */
const patchSchema = agentDraftSchema
  .pick({ name: true, persona: true, posture: true, lanes: true, dailyCap: true, mode: true })
  .partial()
  .extend({ status: z.enum(["active", "paused"]).optional() });

export async function PATCH(request: Request, { params }: RouteContext<"/api/agents/[id]">) {
  const network = networkOf(request);
  const agent = await agentById(database.db, network, Number((await params).id));
  if (!agent) return Response.json({ error: "No such agent." }, { status: NOT_FOUND });
  if (sessionPkh(request) !== agent.ownerPkh) {
    return Response.json(
      { error: "Only the agent's owner can change it. Sign in with that wallet." },
      { status: FORBIDDEN },
    );
  }
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Nothing to change." }, { status: BAD_REQUEST });
  const patch = Object.fromEntries(Object.entries(parsed.data).filter(([, value]) => value !== undefined));
  const next = { ...agent, ...patch };
  const problem = draftProblem(next);
  if (problem) return Response.json({ error: problem }, { status: BAD_REQUEST });
  return Response.json({ agent: await updateAgent(database.db, agent.id, patch) });
}
