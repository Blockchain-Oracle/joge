import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProofView } from "@/features/proof/proof-view";

export async function generateMetadata({ params }: PageProps<"/proof/[id]">): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Proof of round #${id}`,
    description: "Every signed price that decided this round, re-checked in your browser, and the payout maths.",
  };
}

export default async function ProofPage({ params, searchParams }: PageProps<"/proof/[id]">) {
  const roundId = Number((await params).id);
  if (!Number.isSafeInteger(roundId) || roundId < 0) notFound();
  // A link can name its world (`?w=mainnet`): round numbers repeat across chipnet and mainnet.
  const { w } = await searchParams;
  const world = w === "chipnet" || w === "mainnet" ? w : undefined;
  return <ProofView roundId={roundId} world={world} />;
}
