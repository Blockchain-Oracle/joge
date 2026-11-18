import type { Metadata } from "next";
import { Landing } from "@/features/landing/landing";

export const metadata: Metadata = {
  title: { absolute: "Jōge 上下 · Up or down, in minutes" },
};

/** The home page: the landing, opening on the live round. */
export default function Home() {
  return <Landing />;
}
