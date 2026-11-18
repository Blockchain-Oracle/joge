"use client";

import { CandleChart, type CandlePoint, type CandleStyle } from "@joge/chart";
import type { AssetId } from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { ChartLoadingOverlay } from "@/features/chart/chart-loading";
import { cx } from "@/kit";
import { useLiveEvent } from "@/live/hooks";
import type { LiveEvents } from "@/live/stream";
import { CANDLE_RANGES, type CandleRange } from "./ranges.ts";

const SECOND_MS = 1_000;
/** History is re-read now and then; the stream keeps its last candle moving in between. */
const REFRESH_MS = 60_000;

interface CandlesResponse {
  candles: CandlePoint[];
  bucketSeconds: number;
}

/** The terminal's 1H / 1D view: the market's recent history as candles or a line, its last candle live. */
export function HistoryChart({
  asset,
  range,
  style,
  className,
}: {
  asset: AssetId;
  range: CandleRange;
  style: CandleStyle;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const chart = useRef<CandleChart | null>(null);
  const history = useQuery({
    queryKey: ["candles", asset, range],
    queryFn: async (): Promise<CandlesResponse> => (await fetch(`/api/candles/${asset}?range=${range}`)).json(),
    refetchInterval: REFRESH_MS,
  });

  useEffect(() => {
    if (!box.current) return;
    const created = new CandleChart(box.current);
    chart.current = created;
    return () => {
      created.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    const data = history.data;
    if (data) chart.current?.setCandles(data.candles, data.bucketSeconds * SECOND_MS);
  }, [history.data]);
  useEffect(() => chart.current?.setStyle(style), [style]);

  useLiveEvent(
    "price",
    useCallback(
      (event: LiveEvents["price"]) => {
        if (event.asset === asset) chart.current?.pushPrice(event.price);
      },
      [asset],
    ),
  );

  return (
    <div
      ref={box}
      role="img"
      className={cx("relative", className)}
      aria-label={`${asset} over the last ${CANDLE_RANGES[range].label}`}
    >
      {history.isPending ? <ChartLoadingOverlay verb="Loading history" /> : null}
    </div>
  );
}
