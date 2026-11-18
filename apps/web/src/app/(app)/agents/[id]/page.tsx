import { agentById } from "@joge/db";
import type { Metadata } from "next";
import { AgentView } from "@/features/agents/agent-view";
import { database } from "@/server/db";
import { serverEnv } from "@/server/env";

const idOf = (value: string) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : -1;
};

/** A shared agent link unfurls with the agent's name. */
export async function generateMetadata({ params }: PageProps<"/agents/[id]">): Promise<Metadata> {
  const id = idOf((await params).id);
  const agent = id > 0 ? await agentById(database.db, serverEnv.JOGE_DEFAULT_NETWORK, id).catch(() => null) : null;
  return {
    title: agent ? `${agent.name} · Agent` : "Agent",
    description: "An AI agent on Jōge: its brief, its vault and every read it made.",
  };
}

export default async function AgentPage({ params }: PageProps<"/agents/[id]">) {
  return <AgentView id={idOf((await params).id)} />;
}
