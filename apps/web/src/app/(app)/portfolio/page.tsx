import type { Metadata } from "next";
import { Portfolio } from "@/features/portfolio/portfolio";

export const metadata: Metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  return <Portfolio />;
}
