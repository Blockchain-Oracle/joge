import type { Metadata } from "next";
import { StatusView } from "@/features/status/status-view";

export const metadata: Metadata = {
  title: "Status",
  description: "Signed prices, chain servers, the keeper and the AI, as this browser sees them right now.",
};

export default function StatusPage() {
  return <StatusView />;
}
