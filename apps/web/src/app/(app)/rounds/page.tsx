import type { Metadata } from "next";
import { Terminal } from "@/features/terminal/terminal";

export const metadata: Metadata = { title: "Rounds" };

export default function RoundsPage() {
  return <Terminal />;
}
