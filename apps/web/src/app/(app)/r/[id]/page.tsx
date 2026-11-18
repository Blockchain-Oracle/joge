import { roundView } from "@joge/db";
import type { Metadata } from "next";
import { RoundView } from "@/features/round/round-view";
import { database } from "@/server/db";
import { serverEnv } from "@/server/env";

const NAMES = { BTC: "Bitcoin", ETH: "Ether", BCH: "Bitcoin Cash", GOLD: "Gold" } as const;

const load = async (id: string) => {
  const roundId = Number(id);
  const view = Number.isSafeInteger(roundId)
    ? await roundView(database.db, serverEnv.JOGE_DEFAULT_NETWORK, roundId).catch(() => null)
    : null;
  return { roundId, round: view?.round ?? null };
};

/** A shared round link unfurls with the round's own question (its on-chain title, or "Bitcoin: up or down?"). */
export async function generateMetadata({ params }: PageProps<"/r/[id]">): Promise<Metadata> {
  const { roundId, round } = await load((await params).id);
  if (!round) return { title: `Round #${roundId}` };
  const question = round.title ?? `${NAMES[round.asset]}: up or down?`;
  return {
    title: `${question} · Round #${round.roundId}`,
    description:
      round.state === "open"
        ? "Taking entries now. Pick a side; the winners split the pot, paid straight to their wallets."
        : "Decided by General Protocols' signed prices, paid out by a covenant. Nobody runs the house.",
  };
}

export default async function RoundPage({ params, searchParams }: PageProps<"/r/[id]">) {
  const { roundId } = await load((await params).id);
  // ?play=1 starts the replay at once (from a result notice or a ticket's play button).
  const play = (await searchParams).play === "1";
  return <RoundView roundId={Number.isSafeInteger(roundId) ? roundId : -1} autoplay={play} />;
}
