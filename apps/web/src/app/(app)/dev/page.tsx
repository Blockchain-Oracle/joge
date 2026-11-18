import type { Metadata } from "next";
import { AiGallery } from "@/features/dev/ai-gallery";
import { ChartGallery } from "@/features/dev/chart-gallery";
import { KitGallery } from "@/features/dev/kit-gallery";
import { ShareGallery } from "@/features/dev/share-gallery";
import { Tokens } from "@/features/dev/tokens";

export const metadata: Metadata = { title: "Design system" };

/** Every token and component, live: the place to check a change against the whole system. */
export default function DevPage() {
  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="type-headline-lg">
          Design <span className="jg-rainbow">system</span>
        </h1>
        <p className="type-body text-ink-2">
          An arcade for prices: colours, type, kanji, the chart and every piece, in this world. Switch night and day in
          More.
        </p>
      </header>
      <Tokens />
      <ShareGallery />
      <ChartGallery />
      <KitGallery />
      <AiGallery />
    </div>
  );
}
