"use client";

import type { CandleStyle } from "@joge/chart";
import { CandlestickChart, LineChart } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cue, cx } from "@/kit";
import { CANDLE_RANGES, type ChartView } from "../chart/ranges.ts";

const VIEW_KEY = "joge:chart-view";
const STYLE_KEY = "joge:chart-style";
const VIEWS: ChartView[] = ["live", "1h", "1d"];
const listeners = new Set<() => void>();

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key) as T | null;
    return value && allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // It still holds for this page.
  }
  for (const listener of listeners) listener();
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Which chart the stage shows and how history is drawn; both survive a reload (Kakure keeps its interval). */
export function useChartView() {
  const view = useSyncExternalStore(
    subscribe,
    () => read(VIEW_KEY, VIEWS, "live"),
    () => "live" as ChartView,
  );
  const style = useSyncExternalStore(
    subscribe,
    () => read<CandleStyle>(STYLE_KEY, ["candles", "line"], "candles"),
    () => "candles" as CandleStyle,
  );
  return {
    view,
    style,
    setView: (next: ChartView) => write(VIEW_KEY, next),
    setStyle: (next: CandleStyle) => write(STYLE_KEY, next),
  };
}

/**
 * Kakure's chart controls: the live round, or the last hour or day as history; history draws as candles or a line.
 * One small glass pill; the candle/line switch shows only for history.
 */
export function ChartControls({ className }: { className?: string }) {
  const { view, style, setView, setStyle } = useChartView();
  const label = (each: ChartView) => (each === "live" ? "Live" : CANDLE_RANGES[each].label);
  return (
    <div className={cx("nx-glass flex items-center gap-0.5 rounded-full p-1", className)}>
      {VIEWS.map((each) => (
        <button
          key={each}
          type="button"
          aria-pressed={view === each}
          onClick={() => {
            cue("tap");
            setView(each);
          }}
          className={cx(
            "nx-num h-7 rounded-full px-2.5 text-[12px] font-semibold transition-colors",
            view === each ? "bg-[var(--ink)] text-[var(--ink-inverse)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]",
          )}
        >
          {each === "live" ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--vermilion)]" aria-hidden />
              {label(each)}
            </span>
          ) : (
            label(each)
          )}
        </button>
      ))}
      {view === "live" ? null : (
        <button
          type="button"
          aria-label={style === "candles" ? "Show as a line" : "Show as candles"}
          title={style === "candles" ? "Line" : "Candles"}
          onClick={() => {
            cue("tap");
            setStyle(style === "candles" ? "line" : "candles");
          }}
          className="grid size-7 place-items-center rounded-full text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          {style === "candles" ? (
            <CandlestickChart aria-hidden className="size-4" />
          ) : (
            <LineChart aria-hidden className="size-4" />
          )}
        </button>
      )}
    </div>
  );
}
