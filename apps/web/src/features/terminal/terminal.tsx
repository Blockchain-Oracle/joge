"use client";

import type { ChartWindow, RoundLevels } from "@joge/chart";
import { ChevronDown, CircleHelp, History, Share2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cue, Ring, Sheet, Skeleton } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { HistoryChart } from "../chart/history-chart.tsx";
import { LiveChart } from "../chart/live-chart.tsx";
import { PositionCard } from "../position/position-card.tsx";
import { useLanePositions } from "../position/use-lane-positions.ts";
import { clockTime, laneLabel } from "../rounds/format.ts";
import { useNow } from "../rounds/use-now.ts";
import { ShareSheet } from "../share/share-sheet.tsx";
import { startTour } from "../tour/store.ts";
import { TourHost } from "../tour/tour.tsx";
import { ChartControls, useChartView } from "./chart-controls.tsx";
import { LaneRail } from "./lane-rail.tsx";
import { SidePlates } from "./side-plates.tsx";
import { Stack } from "./stack.tsx";
import { useCountdownCues } from "./use-countdown-cues.ts";
import { useLane, useWakeLane } from "./use-lane.ts";
import { useOneTap } from "./use-one-tap.ts";

const SECOND_MS = 1_000;
const ROLLING_MS = 300_000;
const ROLLING: ChartWindow = { kind: "rolling", spanMs: ROLLING_MS };
const HOUR_SECONDS = 3_600;
const HERO_RING = 92;
const NAMES = { BTC: "Bitcoin", ETH: "Ether", BCH: "Bitcoin Cash", GOLD: "Gold" } as const;

/**
 * The round screen: the chart is the stage, the question is five words
 * (one question), time is a ring that ticks its last five seconds, the stake is a
 * standing setting in a glass stack, and Up/Down are flooded plates that call in one tap.
 * The four markets sit in a narrow rail beside the round; on a phone they open from the asset chip.
 */
export function Terminal() {
  const now = useNow();
  const { lane, lanes, live, next, strike, loading } = useLane();
  useWakeLane(lane?.thread);
  const [lanesOpen, setLanesOpen] = useState(false);
  const chart = useChartView();
  const [sharing, setSharing] = useState<number | null>(null);
  const stakeClass = lane && lane.seconds >= HOUR_SECONDS ? "hourly" : "short";
  const tap = useOneTap(next, stakeClass);
  const left = next && now > 0 ? next.lockTime - now : null;
  useCountdownCues(left);
  const positions = useLanePositions(lane, now);
  const holdingSide = positions.live?.side ?? null;

  const window: ChartWindow = useMemo(
    () => (live ? { kind: "fixed", from: live.lockTime * SECOND_MS, to: live.closeTime * SECOND_MS } : ROLLING),
    [live],
  );
  const levels: RoundLevels = useMemo(
    () => ({
      strike,
      lockAt: live ? live.lockTime * SECOND_MS : null,
      closeAt: live ? live.closeTime * SECOND_MS : null,
      position: holdingSide === null ? null : { side: holdingSide },
    }),
    [live, strike, holdingSide],
  );

  if (loading || !lane) return <Skeleton className="h-[78dvh] rounded-[32px]" label="Loading the rounds" />;
  const span = lane.seconds * SECOND_MS;
  const decidedAt = next ? clockTime(next.closeTime) : "--:--";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_248px]">
      <section
        aria-label={`${NAMES[lane.asset]} ${laneLabel(lane.seconds)}`}
        className="relative h-[calc(100dvh-180px)] min-h-[540px] overflow-hidden rounded-[32px] bg-[var(--stage)] shadow-[inset_0_0_0_1px_var(--hairline)] md:h-[calc(100dvh-104px)]"
      >
        <div className="absolute inset-x-0 top-[150px] bottom-[150px] md:top-[176px] md:bottom-[124px]">
          {chart.view === "live" ? (
            <LiveChart asset={lane.asset} window={window} levels={levels} engine="round" className="h-full w-full" />
          ) : (
            <HistoryChart
              key={lane.asset}
              asset={lane.asset}
              range={chart.view}
              style={chart.style}
              className="h-full w-full"
            />
          )}
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
            <span className="text-[14px] text-[var(--muted)]">{laneLabel(lane.seconds)}</span>
            <ChevronDown aria-hidden className="size-4 text-[var(--muted)] lg:hidden" />
          </button>
          <h1 data-tour="question" className="nx-display max-w-[11ch] text-[clamp(34px,5vw,64px)]">
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
            <Link
              href={`/r/${next.roundId}`}
              aria-label={`Round #${next.roundId}`}
              data-tour="clock"
              className="rounded-full"
            >
              <Ring leftMs={left * SECOND_MS} spanMs={span} size={HERO_RING} label="Entries close" />
            </Link>
          ) : null}
          <Link
            href={`/rounds/previous?asset=${lane.asset}`}
            className="nx-glass flex h-9 items-center gap-1.5 rounded-full px-3.5 font-semibold text-[13px]"
          >
            <History aria-hidden className="size-4" /> Previous
          </Link>
          <button
            type="button"
            data-tour="help"
            onClick={() => {
              cue("open");
              startTour();
            }}
            className="nx-glass flex h-9 items-center gap-1.5 rounded-full px-3.5 font-semibold text-[13px]"
          >
            <CircleHelp aria-hidden className="size-4" /> How to play
          </button>
          <ChartControls />
        </div>
        <div className="absolute top-1/2 left-3 -translate-y-1/2 md:left-6">
          <Stack tap={tap} />
        </div>
        <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
          <div className="mx-auto flex max-w-[620px] flex-col gap-2">
            {positions.list.map(({ round, position }) => (
              <PositionCard
                key={`${round.roundId}:${position.side}`}
                position={position}
                now={now}
                href={`/r/${round.roundId}`}
                roundLabel={`${clockTime(round.lockTime)}–${clockTime(round.closeTime)}`}
                action={
                  position.endsAt === null ? (
                    <button
                      type="button"
                      aria-label="Receipt and video"
                      title="Receipt and video"
                      onClick={() => setSharing(round.roundId)}
                      className="grid size-[68px] shrink-0 place-items-center rounded-[22px] bg-[var(--vermilion)] text-white"
                    >
                      <Share2 aria-hidden className="size-5" />
                    </button>
                  ) : null
                }
              />
            ))}
            <SidePlates tap={tap} />
          </div>
        </div>
      </section>
      <aside className="hidden lg:block">
        <LaneRail lanes={lanes} lane={lane} />
      </aside>
      <TourHost asset={NAMES[lane.asset]} decidedAt={next ? decidedAt : null} />
      {sharing === null ? null : <ShareSheet roundId={sharing} open onClose={() => setSharing(null)} />}
      <Sheet open={lanesOpen} onClose={() => setLanesOpen(false)} title="Markets">
        <div className="pb-2">
          <LaneRail lanes={lanes} lane={lane} onPick={() => setLanesOpen(false)} />
        </div>
      </Sheet>
    </div>
  );
}
