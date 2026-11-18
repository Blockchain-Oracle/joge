"use client";

import type { AssetId } from "@joge/sdk";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cx, Skeleton } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { clockTime, laneLabel, usd } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import { useWorld } from "../shell/world.tsx";
import { MARKETS } from "../terminal/constants.ts";
import { CandleStrip, type RoundCandle, resultOf } from "./candles.tsx";

/** A played round as the list shows it (prices in dollars). */
interface PlayedRound {
  roundId: number;
  asset: AssetId;
  laneSeconds: number | null;
  lockTime: number;
  closeTime: number;
  state: "settled" | "void";
  winner: number | null;
  entrants: number;
  pot: number;
  strike: number | null;
  close: number | null;
}

const PLAYED_PAGE = 6;
const REFRESH_MS = 30_000;
const nameOf = (asset: AssetId) => (asset === "GOLD" ? "Gold" : asset);

/**
 * Previous rounds (his feedback, 2026-11-18). What a player wants from the past: how this market has been moving
 * (every round as a candle, the empty ones faint but there, each one tappable for its proof) and the rounds people
 * actually played, to replay. One market at a time; no endless list.
 */
export function PreviousRounds() {
  const network = useWorld();
  const router = useRouter();
  const wanted = useSearchParams().get("asset");
  const market = MARKETS.find((each) => each.asset === wanted) ?? MARKETS[0];
  const asset = market.asset as AssetId;

  const strip = useQuery({
    queryKey: ["strip", network, asset],
    queryFn: async (): Promise<RoundCandle[]> =>
      (await fetch(`/api/rounds/strip?network=${network}&asset=${asset}`)).json(),
    refetchInterval: REFRESH_MS,
  });
  const played = useInfiniteQuery({
    queryKey: ["previous", network, asset],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<PlayedRound[]> => {
      const params = new URLSearchParams({ network, asset, limit: String(PLAYED_PAGE) });
      if (pageParam) params.set("before", String(pageParam));
      return (await fetch(`/api/rounds/previous?${params}`)).json();
    },
    getNextPageParam: (page) => (page.length < PLAYED_PAGE ? undefined : page.at(-1)?.closeTime),
    refetchInterval: REFRESH_MS,
  });

  const candles = strip.data ?? [];
  const playedCount = candles.filter((candle) => candle.entrants > 0).length;
  const priced = candles.filter((candle) => candle.open !== null && candle.close !== null);
  const rose = priced.filter((candle) => (candle.close ?? 0) >= (candle.open ?? 0)).length;
  const rows = played.data?.pages.flat() ?? [];
  const length = rows[0]?.laneSeconds ?? null;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="nx-display text-[clamp(26px,3.4vw,34px)]">Previous rounds</h1>
        <nav aria-label="Markets" className="flex gap-1 rounded-full bg-[var(--surface-1)] p-1">
          {MARKETS.map((each) => (
            <button
              key={each.asset}
              type="button"
              aria-pressed={each.asset === asset}
              onClick={() => router.replace(`/rounds/previous?asset=${each.asset}`)}
              className={cx(
                "flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-[13px] transition-colors",
                each.asset === asset ? "bg-[var(--ink)] text-[var(--ink-inverse)]" : "text-[var(--ink-2)]",
              )}
            >
              <AssetCube asset={each.asset as AssetId} size={18} />
              {nameOf(each.asset as AssetId)}
            </button>
          ))}
        </nav>
      </header>

      <section className="flex flex-col gap-4 rounded-[32px] bg-[var(--stage)] p-5 shadow-[inset_0_0_0_1px_var(--hairline)] md:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="nx-display text-[18px]">
            {nameOf(asset)}{" "}
            {length ? <span className="font-normal text-[14px] text-[var(--muted)]">{laneLabel(length)}</span> : null}
          </span>
          {candles.length > 0 ? (
            <span className="nx-num flex items-center gap-3 text-[13px] text-[var(--ink-2)]">
              <span>{candles.length} rounds</span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--vermilion)]" /> {playedCount} played
              </span>
              <span className="text-[var(--up-text)]">▲ {rose}</span>
              <span className="text-[var(--down-text)]">▼ {priced.length - rose}</span>
            </span>
          ) : null}
        </div>
        {strip.isPending ? (
          <Skeleton className="h-[230px] rounded-[20px]" label="Loading the rounds" />
        ) : candles.length === 0 ? (
          <p className="py-16 text-center text-[15px] text-[var(--muted)]">No rounds yet.</p>
        ) : (
          <CandleStrip candles={candles} />
        )}
      </section>

      {rows.length > 0 ? (
        <section className="flex flex-col gap-2" aria-label="Played rounds">
          <span className="nx-eyebrow flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--vermilion)]" /> Played
          </span>
          <ol className="flex flex-col gap-1.5">
            {rows.map((round) => (
              <li key={round.roundId}>
                <PlayedRow round={round} />
              </li>
            ))}
          </ol>
          {played.hasNextPage ? (
            <button
              type="button"
              onClick={() => void played.fetchNextPage()}
              disabled={played.isFetchingNextPage}
              className="self-center rounded-full bg-[var(--surface-1)] px-5 py-2.5 font-semibold text-[13px] hover:bg-[var(--surface-2)]"
            >
              Older
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

/** A played round: its time, who won, how far the price moved, the pot, then Replay. */
function PlayedRow({ round }: { round: PlayedRound }) {
  const money = useMoney();
  const result = resultOf(round);
  const move = round.strike !== null && round.close !== null ? round.close - round.strike : null;
  return (
    <Link
      href={`/r/${round.roundId}?play=1`}
      className="group flex items-center gap-3 rounded-[18px] bg-[var(--surface-1)] p-3 pl-4 transition-colors hover:bg-[var(--surface-2)]"
    >
      <span className="nx-num w-[104px] shrink-0 text-[13px] text-[var(--ink-2)]">
        {clockTime(round.lockTime)}–{clockTime(round.closeTime)}
      </span>
      <span
        className={cx(
          "flex flex-1 items-center gap-1.5 font-semibold text-[14px]",
          result.tone === "up"
            ? "text-[var(--up-text)]"
            : result.tone === "down"
              ? "text-[var(--down-text)]"
              : "text-[var(--muted)]",
        )}
      >
        <span className="nx-jp text-[17px]">{result.glyph}</span> {result.text}
      </span>
      <span
        className={cx(
          "nx-num hidden w-24 text-right text-[13px] sm:block",
          move === null ? "" : move >= 0 ? "text-[var(--up-text)]" : "text-[var(--down-text)]",
        )}
      >
        {move === null ? "" : `${move >= 0 ? "▲" : "▼"} ${usd(Math.abs(move))}`}
      </span>
      <span className="nx-num w-20 text-right font-semibold text-[14px]">{money.format(round.pot)}</span>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--ink-2)] transition-colors group-hover:bg-[var(--vermilion)] group-hover:text-white">
        <Play aria-label="Replay" className="size-3.5 translate-x-px" fill="currentColor" />
      </span>
    </Link>
  );
}
