import type { Metadata } from "next";
import { JudgeGate } from "@/features/judge/gate";

export const metadata: Metadata = {
  title: "Judge wallet",
  description: "BCH BLAZE judges: the link in our submission opens a funded wallet here.",
  robots: { index: false },
};

export default function JudgePage() {
  return <JudgeGate />;
}
