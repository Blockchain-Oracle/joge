import type { Metadata } from "next";
import { Profile } from "@/features/players/profile";

const HEAD = 6;
const TAIL = 4;

export async function generateMetadata({ params }: PageProps<"/u/[address]">): Promise<Metadata> {
  const { address } = await params;
  const bare = decodeURIComponent(address).split(":").pop() ?? address;
  return { title: `Player ${bare.slice(0, HEAD)}…${bare.slice(-TAIL)}`, description: "A Jōge player's record." };
}

export default async function PlayerPage({ params, searchParams }: PageProps<"/u/[address]">) {
  const { address } = await params;
  // A shared run names its world (`?w=chipnet`): the same address has a record in each.
  const w = (await searchParams).w;
  return <Profile address={address} world={w === "chipnet" || w === "mainnet" ? w : undefined} />;
}
