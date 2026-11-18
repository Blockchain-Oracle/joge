"use client";

import type { ChartWindow, RoundLevels } from "@joge/chart";
import { ChevronDown, History } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cue, Ring, Sheet, Skeleton } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { LiveChart } from "../chart/live-chart.tsx";
import { clockTime, laneLabel } from "../rounds/format.ts";
import { useNow } from "../rounds/use-now.ts";
import { LaneRail } from "./lane-rail.tsx";
import { SidePlates } from "./side-plates.tsx";
import { Stack } from "./stack.tsx";
import { useCountdownCues } from "./use-countdown-cues.ts";
import { useLane } from "./use-lane.ts";
import { useOneTap } from "./use-one-tap.ts";

const SECOND_MS = 1_000;
const ROLLING_MS = 300_000;
const ROLLING: ChartWindow = { kind: "rolling", spanMs: ROLLING_MS };
const HOUR_SECONDS = 3_600;
const HERO_RING = 92;
const NAMES = { BTC: "Bitcoin", ETH: "Ether", BCH: "Bitcoin Cash", GOLD: "Gold" } as const;

/**
 * The round screen (D21), rebuilt from Abu's products: the chart is the stage (Kakure), the question is five words
 * (Masayume's hero question), time is a ring that ticks its last five seconds (Senryo, Kakure's games), the stake is a
 * standing setting in a glass stack (Kakure), and Up/Down are flooded plates that call in one tap (Senryo, Owarine).
 * The lanes sit in a rail (Kakure's 20 rem rail); on a phone they open from the asset chip.
 */
export function Terminal() {
  const now = useNow();
  const { lane, lanes, live, next, strike, loading } = useLane();
  const [lanesOpen, setLanesOpen] = useState(false);
  const stakeClass = lane && lane.seconds >= HOUR_SECONDS ? "hourly" : "short";
  const tap = useOneTap(next, stakeClass);
  const left = next && now > 0 ? next.lockTime - now : null;
  useCountdownCues(left);

  const window: ChartWindow = useMemo(
    () => (live ? { kind: "fixed", from: live.lockTime * SECOND_MS, to: live.closeTime * SECOND_MS } : ROLLING),
    [live],
  );
  const levels: RoundLevels = useMemo(
    () => ({
      strike,
      lockAt: live ? live.lockTime * SECOND_MS : null,
      closeAt: live ? live.closeTime * SECOND_MS : null,
    }),
    [live, strike],
  );

  if (loading || !lane) return <Skeleton className="h-[78dvh] rounded-[32px]" label="Loading the rounds" />;
  const span = lane.seconds * SECOND_MS;
  const decidedAt = next ? clockTime(next.closeTime) : "--:--";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section
        aria-label={`${NAMES[lane.asset]} ${laneLabel(lane.seconds)}`}
        className="relative h-[calc(100dvh-180px)] min-h-[540px] overflow-hidden rounded-[32px] bg-[var(--stage)] shadow-[inset_0_0_0_1px_var(--hairline)] md:h-[calc(100dvh-104px)]"
      >
        <div className="absolute inset-x-0 top-[150px] bottom-[150px] md:top-[176px] md:bottom-[124px]">
          <LiveChart asset={lane.asset} window={window} levels={levels} engine="round" className="h-full w-full" />
        </div>
        <div className="absolute top-4 left-4 flex flex-col items-start gap-4 md:top-6 md:left-6">
          <button
            type="button"
            onClick={() => {
              cue("open");
              setLanesOpen(true);
            }}
            className="nx-glass flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 lg:pointer-events-none"
          >
            <AssetCube asset={lane.asset} size={32} />
            <span className="nx-display text-[16px]">{NAMES[lane.asset]}</span>
            <span className="nx-num text-[13px] text-[var(--muted)]">{laneLabel(lane.seconds)}</span>
            <ChevronDown aria-hidden className="size-4 text-[var(--muted)] lg:hidden" />
          </button>
          <h1 className="nx-display max-w-[11ch] text-[clamp(34px,5vw,64px)]">
            {next ? (
              <Link href={`/r/${next.roundId}`} className="hover:underline hover:decoration-[var(--vermilion)]">
                Up or down by <span className="tabular-nums">{decidedAt}</span>?
              </Link>
            ) : (
              <>
                Up or down by <span className="tabular-nums">{decidedAt}</span>?
              </>
            )}
          </h1>
        </div>
        <div className="absolute top-4 right-4 flex flex-col items-end gap-3 md:top-6 md:right-6">
          {left !== null && next ? (
            <Link href={`/r/${next.roundId}`} aria-label={`Round #${next.roundId}`}>
              <Ring leftMs={left * SECOND_MS} spanMs={span} size={HERO_RING} label="Entries close" />
            </Link>
          ) : null}
          <Link
            href={`/rounds/previous?asset=${lane.asset}`}
            className="nx-glass flex h-9 items-center gap-1.5 rounded-full px-3.5 font-semibold text-[13px]"
          >
            <History aria-hidden className="size-4" /> Previous
          </Link>
        </div>
        <div className="absolute top-1/2 left-3 -translate-y-1/2 md:left-6">
          <Stack tap={tap} />
        </div>
        <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
          <div className="mx-auto max-w-[620px]">
            <SidePlates tap={tap} />
          </div>
        </div>
      </section>
      <aside className="hidden lg:block">
        <LaneRail lanes={lanes} lane={lane} />
      </aside>
      <Sheet open={lanesOpen} onClose={() => setLanesOpen(false)} title="Lanes">
        <div className="pb-2">
          <LaneRail lanes={lanes} lane={lane} onPick={() => setLanesOpen(false)} />
        </div>
      </Sheet>
    </div>
  );
}
