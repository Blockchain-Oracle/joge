import { agentsOf, listAgents } from "@joge/db";
import { agentDraftSchema, createAgent, draftProblem } from "@/server/agents";
import { sessionPkh } from "@/server/auth";
import { database, networkOf } from "@/server/db";

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const PKH = /^[0-9a-f]{40}$/;
/** A wallet's receive and change addresses (10 each). */
const MAX_OWNERS = 20;

/** Every agent, most money entrusted first (`?owners=pkh,pkh` narrows to one wallet's agents). */
export async function GET(request: Request) {
  const network = networkOf(request);
  const owners = (new URL(request.url).searchParams.get("owners") ?? "")
    .split(",")
    .filter((owner) => PKH.test(owner))
    .slice(0, MAX_OWNERS);
  const rows =
    owners.length > 0 ? await agentsOf(database.db, network, owners) : await listAgents(database.db, network);
  return Response.json({ network, agents: rows });
}

/** Creates an agent for the signed-in address (a sign-in proof first). */
export async function POST(request: Request) {
  const owner = sessionPkh(request);
  if (!owner) return Response.json({ error: "Sign in with your wallet first." }, { status: UNAUTHORIZED });
  const parsed = agentDraftSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Fill in every part of the agent." }, { status: BAD_REQUEST });
  const problem = draftProblem(parsed.data);
  if (problem) return Response.json({ error: problem }, { status: BAD_REQUEST });
  const agent = await createAgent(networkOf(request), owner, parsed.data);
  return Response.json({ agent });
}
