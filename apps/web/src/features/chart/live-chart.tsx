"use client";

import { type ChartWindow, PriceChart, RoundChart, type RoundLevels } from "@joge/chart";
import type { AssetId } from "@joge/sdk";
import { ASSET_FEED } from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ChartLoadingOverlay } from "@/features/chart/chart-loading";
import { cx } from "@/kit";
import { useLiveEvent } from "@/live/hooks";
import type { LiveEvents } from "@/live/stream";
import { type PriceSpan, pricesQuery } from "../rounds/api.ts";
import { printToDollars, usd } from "../rounds/format.ts";

const SECOND_MS = 1_000;
const HISTORY_FACTOR = 2;
const LEAD_IN_SECONDS = 180;
/** The settling price is the oracle's first message after the close: fetch a little past it. */
const SETTLE_TAIL_SECONDS = 120;

/**
 * The live price chart for one asset: first paint from the API (indicative ticks plus signed oracle prints), then
 * kept live by the tab's stream. Gold's line is PAXG's indicative price; its oracle price is combined at settlement.
 */
export function LiveChart({
  asset,
  window,
  levels,
  engine = "price",
  className,
}: {
  asset: AssetId;
  window: ChartWindow;
  levels?: RoundLevels;
  /** "round": the redo's Window chart (D21); "price": the current one. */
  engine?: "price" | "round";
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const chart = useRef<PriceChart | RoundChart | null>(null);
  const rollingMs = window.kind === "rolling" ? window.spanMs : 0;
  const fixedFrom = window.kind === "fixed" ? window.from : 0;
  const fixedTo = window.kind === "fixed" ? window.to : 0;
  // What the first paint needs: twice a rolling span, or a round's own window (a minute before its lock, two after its close).
  const span: PriceSpan = useMemo(
    () =>
      rollingMs > 0
        ? { seconds: Math.ceil((rollingMs * HISTORY_FACTOR) / SECOND_MS) }
        : {
            from: Math.floor(fixedFrom / SECOND_MS) - LEAD_IN_SECONDS,
            to: Math.ceil(fixedTo / SECOND_MS) + SETTLE_TAIL_SECONDS,
          },
    [rollingMs, fixedFrom, fixedTo],
  );
  const history = useQuery(pricesQuery(asset, span));

  useEffect(() => {
    if (!box.current) return;
    // Colours come from the chart's own box, so a chart on a dark card draws for the dark in both worlds.
    const created =
      engine === "round"
        ? new RoundChart(box.current)
        : new PriceChart(box.current, { format: usd, colorsFrom: box.current });
    chart.current = created;
    return () => {
      created.dispose();
      chart.current = null;
    };
    // The window and levels are pushed below; a new asset is a new chart.
  }, [asset, engine]);

  useEffect(() => chart.current?.setWindow(window), [window]);
  useEffect(() => chart.current?.setLevels(levels ?? {}), [levels]);
  useEffect(() => {
    const data = history.data;
    if (!data || !chart.current) return;
    chart.current.setHistory(data.live.map((tick) => ({ t: tick.at, p: tick.price })));
    if (asset !== "GOLD") {
      const feed = ASSET_FEED[asset];
      chart.current.setPrints(
        data.prints.map((print) => ({ t: print.timestamp * SECOND_MS, p: printToDollars(feed, print.price) })),
      );
    }
  }, [history.data, asset]);

  useLiveEvent(
    "price",
    useCallback(
      (event: LiveEvents["price"]) => {
        if (event.asset === asset) chart.current?.pushPrice(event.price);
      },
      [asset],
    ),
  );
  useLiveEvent(
    "oracle",
    useCallback(
      (event: LiveEvents["oracle"]) => {
        if (asset === "GOLD" || event.feed !== ASSET_FEED[asset]) return;
        chart.current?.pushPrint({ t: event.timestamp * SECOND_MS, p: printToDollars(event.feed, event.price) });
      },
      [asset],
    ),
  );

  return (
    <div ref={box} className={cx("relative", className)}>
      {history.isPending ? <ChartLoadingOverlay verb="Loading prices" /> : null}
    </div>
  );
}
