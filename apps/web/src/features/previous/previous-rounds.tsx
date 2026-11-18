"use client";

import type { AssetId } from "@joge/sdk";
import { useInfiniteQuery } from "@tanstack/react-query";
import { History, Play } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cx, EmptyState, Skeleton } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { clockTime, laneLabel, usd } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import { useWorld } from "../shell/world.tsx";
import { MARKETS } from "../terminal/constants.ts";

/** One finished round as the list shows it (prices in dollars). */
interface PastRound {
  roundId: number;
  asset: AssetId;
  laneSeconds: number | null;
  lockTime: number;
  closeTime: number;
  state: "settled" | "void";
  winner: number | null;
  voidReason: string | null;
  entrants: number;
  pot: number;
  strike: number | null;
  close: number | null;
}

const FILTERS: Array<{ value: AssetId | null; label: string }> = [
  { value: null, label: "All" },
  ...MARKETS.map((market) => ({
    value: market.asset as AssetId,
    label: market.asset === "GOLD" ? "Gold" : market.asset,
  })),
];
const REFRESH_MS = 30_000;

/**
 * Previous rounds (his feedback, 2026-11-18): every finished round someone played in the four markets, newest first,
 * named by market and time, never by number. A row says who won and how far the price moved; opening it replays the
 * round, with its proof one tap further.
 */
export function PreviousRounds() {
  const network = useWorld();
  const router = useRouter();
  const asset = (useSearchParams().get("asset") as AssetId | null) ?? null;
  const list = useInfiniteQuery({
    queryKey: ["previous", network, asset],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<PastRound[]> => {
      const params = new URLSearchParams({ network });
      if (asset) params.set("asset", asset);
      if (pageParam) params.set("before", String(pageParam));
      return (await fetch(`/api/rounds/previous?${params}`)).json();
    },
    getNextPageParam: (page) => page.at(-1)?.closeTime,
    refetchInterval: REFRESH_MS,
  });
  const rounds = list.data?.pages.flat() ?? [];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="nx-display flex items-center gap-2.5 text-[clamp(26px,3.4vw,34px)]">
          <History aria-hidden className="size-6 text-[var(--vermilion)]" /> Previous rounds
        </h1>
        <nav aria-label="Markets" className="flex gap-1 rounded-full bg-[var(--surface-1)] p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              aria-pressed={filter.value === asset}
              onClick={() =>
                router.replace(filter.value ? `/rounds/previous?asset=${filter.value}` : "/rounds/previous")
              }
              className={cx(
                "flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-[13px] transition-colors",
                filter.value === asset ? "bg-[var(--ink)] text-[var(--ink-inverse)]" : "text-[var(--ink-2)]",
              )}
            >
              {filter.value ? <AssetCube asset={filter.value} size={18} /> : null}
              {filter.label}
            </button>
          ))}
        </nav>
      </header>
      {list.isPending ? (
        <Skeleton className="h-[420px] rounded-[24px]" label="Loading previous rounds" />
      ) : rounds.length === 0 ? (
        <EmptyState icon={History} title="No played rounds yet" action={{ label: "Play", href: "/rounds" }} />
      ) : (
        <ol className="flex flex-col gap-1.5">
          {rounds.map((round) => (
            <li key={round.roundId}>
              <PastRow round={round} />
            </li>
          ))}
        </ol>
      )}
      {list.hasNextPage ? (
        <button
          type="button"
          onClick={() => void list.fetchNextPage()}
          disabled={list.isFetchingNextPage}
          className="self-center rounded-full bg-[var(--surface-1)] px-5 py-2.5 font-semibold text-[13px] hover:bg-[var(--surface-2)]"
        >
          Older
        </button>
      ) : null}
    </div>
  );
}

/** Market and time · who won · how the price moved · the pot, then Replay. */
function PastRow({ round }: { round: PastRound }) {
  const money = useMoney();
  const move = round.strike !== null && round.close !== null ? round.close - round.strike : null;
  const result =
    round.state === "settled" && round.winner !== null
      ? round.winner === 0
        ? { text: "Up won", glyph: "上", tone: "text-[var(--up-text)]" }
        : { text: "Down won", glyph: "下", tone: "text-[var(--down-text)]" }
      : { text: "Refunded", glyph: "無", tone: "text-[var(--muted)]" };
  return (
    <Link
      href={`/r/${round.roundId}?play=1`}
      className="group flex items-center gap-3 rounded-[18px] bg-[var(--surface-1)] p-3 transition-colors hover:bg-[var(--surface-2)]"
    >
      <AssetCube asset={round.asset} size={34} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold text-[14px]">
          {round.asset === "GOLD" ? "Gold" : round.asset}{" "}
          <span className="nx-num font-normal text-[var(--muted)]">
            {round.laneSeconds ? laneLabel(round.laneSeconds) : ""}
          </span>
        </span>
        <span className="nx-num text-[12px] text-[var(--muted)]">
          {clockTime(round.lockTime)}–{clockTime(round.closeTime)}
        </span>
      </span>
      <span className={cx("flex w-[118px] items-center gap-1.5 font-semibold text-[14px]", result.tone)}>
        <span className="nx-jp text-[17px]">{result.glyph}</span> {result.text}
      </span>
      <span
        className={cx(
          "nx-num hidden w-24 text-right text-[13px] sm:block",
          move === null ? "text-[var(--muted)]" : move >= 0 ? "text-[var(--up-text)]" : "text-[var(--down-text)]",
        )}
      >
        {move === null ? "—" : `${move >= 0 ? "▲" : "▼"} ${usd(Math.abs(move))}`}
      </span>
      <span className="nx-num w-16 text-right text-[13px] text-[var(--ink-2)]">{money.format(round.pot)}</span>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--ink-2)] transition-colors group-hover:bg-[var(--vermilion)] group-hover:text-white">
        <Play aria-label="Replay" className="size-3.5 translate-x-px" fill="currentColor" />
      </span>
    </Link>
  );
}
