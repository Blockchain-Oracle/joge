import type { Metadata } from "next";
import { Leaderboard } from "@/features/players/leaderboard";

export const metadata: Metadata = {
  title: "Leaders",
  description: "Players ranked by what they won on Jōge's rounds, read from the chain.",
};

export default function LeaderboardPage() {
  return <Leaderboard />;
}
