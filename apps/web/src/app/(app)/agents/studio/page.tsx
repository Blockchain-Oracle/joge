import type { Metadata } from "next";
import { Studio } from "@/features/agents/studio";

export const metadata: Metadata = { title: "Agent studio" };

export default async function StudioPage({ searchParams }: PageProps<"/agents/studio">) {
  const copy = Number((await searchParams).copy);
  return <Studio copyFrom={Number.isSafeInteger(copy) && copy > 0 ? copy : null} />;
}
