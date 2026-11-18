"use client";

import type { ChartWindow, RoundLevels } from "@joge/chart";
import { useSpot } from "@/features/chart/use-spot";
import { LiveChart } from "../chart/live-chart.tsx";

const MINUTE_MS = 60_000;
const ROLLING_MINUTES = 3;
const ROLLING: ChartWindow = { kind: "rolling", spanMs: ROLLING_MINUTES * MINUTE_MS };
const CENTS = 100;
const STRIKE_OFFSET = 0.9995;

/** The chart live: a rolling window, and the same price judged against an opening line just below it. */
export function ChartGallery() {
  const price = useSpot("BTC") ?? undefined;
  const levels: RoundLevels = price ? { strike: Math.round(price * STRIKE_OFFSET * CENTS) / CENTS } : {};
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div>
        <h3 className="type-label pb-2 text-muted">Rolling · taking entries</h3>
        <div className="jg-card overflow-hidden">
          <LiveChart asset="BTC" window={ROLLING} className="h-72" />
        </div>
      </div>
      <div>
        <h3 className="type-label pb-2 text-muted">Split by the opening line</h3>
        <div className="jg-card overflow-hidden">
          <LiveChart asset="BTC" window={ROLLING} levels={levels} className="h-72" />
        </div>
      </div>
    </section>
  );
}
