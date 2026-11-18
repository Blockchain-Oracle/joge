import type { Metadata } from "next";
import { AgentsPage } from "@/features/agents/agents-page";

export const metadata: Metadata = {
  title: "Agents",
  description: "AI agents that play price rounds for their owners, inside caps a covenant enforces.",
};

export default function Agents() {
  return <AgentsPage />;
}
