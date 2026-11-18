"use client";

import type { ChartWindow, RoundLevels } from "@joge/chart";
import { MIN_STAKE } from "@joge/sdk";
import Link from "next/link";
import { useMemo } from "react";
import { cx, Ring, Skeleton } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { LiveChart } from "../chart/live-chart.tsx";
import { useSpot } from "../chart/use-spot.ts";
import { clockTime, laneLabel, usd } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import { useNow } from "../rounds/use-now.ts";
import { STAKE_LADDER_USD } from "../terminal/constants.ts";
import { useLane } from "../terminal/use-lane.ts";
import { estimatePayout } from "../ticket/payout.ts";
import { HeartbeatRing, HeartbeatStamp } from "./heartbeat.tsx";

const SECOND_MS = 1_000;
const ROLLING: ChartWindow = { kind: "rolling", spanMs: 300_000 };
const CARD_RING = 64;
const MULTIPLE_DIGITS = 2;
/** What a first tap stakes before the player picks a size (the terminal's preset with no balance). */
const FIRST_STAKE_USD = STAKE_LADDER_USD[1] ?? 0;
const NAMES = { BTC: "Bitcoin", ETH: "Ether", BCH: "Bitcoin Cash", GOLD: "Gold" } as const;

/**
 * The landing's right column (Kakure's live Window card, Agari's live previews): the round on screen right now, its
 * price against the line, the chart, and Up / Down with what a first stake pays. Either side opens the terminal.
 */
export function HeroRound() {
  const now = useNow();
  const { lane, live, next, strike, loading } = useLane();
  const spot = useSpot(lane?.asset);
  const money = useMoney();
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
  if (loading || !lane) return <Skeleton className="h-[520px] rounded-[32px]" label="Loading the live round" />;

  const left = next && now > 0 ? next.lockTime - now : null;
  const drift = spot !== null && strike !== null ? spot - strike : null;
  const stake = BigInt(money.toSats(FIRST_STAKE_USD) ?? Number(MIN_STAKE));
  const pays = (side: 0 | 1) => (next ? Number(estimatePayout(next, side, stake).pays) / Number(stake) : null);

  return (
    <div>
      <div className="relative">
        <div className="relative overflow-hidden rounded-[32px] bg-[var(--stage)] p-4 pb-9 shadow-[inset_0_0_0_1px_var(--hairline)] md:p-6 md:pb-10">
          <div className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-3">
              <AssetCube asset={lane.asset} size={40} />
              <span className="flex flex-col">
                <span className="nx-display text-[18px]">{NAMES[lane.asset]}</span>
                <span className="nx-num text-[12px] text-[var(--muted)]">{laneLabel(lane.seconds)} rounds</span>
              </span>
            </span>
            {left !== null && left > 0 ? (
              <Ring
                leftMs={left * SECOND_MS}
                spanMs={lane.seconds * SECOND_MS}
                size={CARD_RING}
                label="Entries close"
                className="text-[15px]"
              />
            ) : null}
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="nx-num text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.03em]">
              {spot === null ? "—" : usd(spot)}
            </span>
            {drift !== null ? (
              <span
                className={cx(
                  "nx-num text-[14px] font-semibold",
                  drift >= 0 ? "text-[var(--up-text)]" : "text-[var(--down-text)]",
                )}
              >
                {drift >= 0 ? "▲" : "▼"} {usd(Math.abs(drift))}
              </span>
            ) : null}
          </div>
          <Link
            href={next ? `/r/${next.roundId}` : "/rounds"}
            className="nx-display mt-1 block text-[20px] text-[var(--ink-2)] hover:text-[var(--ink)]"
          >
            Up or down by{" "}
            <span className="text-[var(--ink)] tabular-nums">{next ? clockTime(next.closeTime) : "--:--"}</span>?
          </Link>
          <div className="relative mt-3 h-[220px] md:h-[250px]">
            <LiveChart asset={lane.asset} window={window} levels={levels} engine="round" className="h-full w-full" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {([0, 1] as const).map((side) => {
              const multiple = pays(side);
              return (
                <Link key={side} href="/rounds" data-side={side === 0 ? "up" : "down"} className="nx-plate h-[68px]">
                  <span aria-hidden className="nx-jp text-[28px] leading-none">
                    {side === 0 ? "上" : "下"}
                  </span>
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-[18px] tracking-[0.06em]">{side === 0 ? "UP" : "DOWN"}</span>
                    <span className="nx-num mt-1 text-[12px] font-semibold opacity-75">
                      {multiple ? `${multiple.toFixed(MULTIPLE_DIGITS)}×` : "—"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <HeartbeatRing asset={lane.asset} />
      </div>
      <HeartbeatStamp asset={lane.asset} />
    </div>
  );
}
