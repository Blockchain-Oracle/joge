import type { Metadata } from "next";
import { FILM } from "@/features/demo/constants";
import { DemoView } from "@/features/demo/demo-view";

const DESCRIPTION =
  "Watch Jōge on Bitcoin Cash mainnet in three minutes, then open every transaction of the rounds it shows.";

export const metadata: Metadata = {
  title: "Demo",
  description: DESCRIPTION,
  alternates: { canonical: "/demo" },
  openGraph: { title: "Jōge · the demo", description: DESCRIPTION, url: "/demo", type: "video.other" },
};

/** /demo?t=94 opens the film at 1:34 (a chapter link); anything else starts it from the top. */
export default async function DemoPage({ searchParams }: PageProps<"/demo">) {
  const { t } = await searchParams;
  const seconds = Number(t);
  const start = Number.isInteger(seconds) && seconds > 0 && seconds < FILM.seconds ? seconds : null;
  return <DemoView start={start} />;
}
