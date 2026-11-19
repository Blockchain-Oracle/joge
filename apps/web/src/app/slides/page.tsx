import type { Metadata } from "next";
import { Deck } from "@/features/slides/deck";

export const metadata: Metadata = {
  title: "Widget Factory deck",
  description:
    "Jōge's BCH BLAZE 2026 deck: the story, the benefits, how it uses BCH and where it goes next, in seven slides.",
};

export default function SlidesPage() {
  return <Deck />;
}
