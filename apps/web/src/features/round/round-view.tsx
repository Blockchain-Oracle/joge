"use client";

import type { ChartWindow, RoundLevels } from "@joge/chart";
import { HOUR_SECONDS, TICKET_DUST, toDollars } from "@joge/sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, ChevronLeft, ChevronRight, SearchX, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSpot } from "@/features/chart/use-spot";
import { cx, EmptyState, Marble, Ring, Skeleton, toast } from "@/kit";
import { ASSET_TONE, AssetCube } from "@/marks/asset";
import { LiveChart } from "../chart/live-chart.tsx";
import { profileHref } from "../players/api.ts";
import { RoundFilmPlayer } from "../replay/round-film.tsx";
import { laneLabel, usd } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import { useClockTime, useNow } from "../rounds/use-now.ts";
import { ShareActions } from "../share/share-actions.tsx";
import { useWorld } from "../shell/world.tsx";
import { SidePlates } from "../terminal/side-plates.tsx";
import { pickLane } from "../terminal/use-lane.ts";
import { useOneTap } from "../terminal/use-one-tap.ts";
import { useWallet } from "../wallet/wallet-context.tsx";
import { roundQuery } from "./api.ts";
import { ROLLING_SPAN_MS, SECOND_MS } from "./constants.ts";
import { dueStep, finishRound } from "./finish.ts";
import { Receipt } from "./receipt.tsx";
import type { Verdict } from "./verdict.tsx";

const ROLLING: ChartWindow = { kind: "rolling", spanMs: ROLLING_SPAN_MS };
const STEP_LABEL = { lock: "Lock this round", settle: "Settle this round", pay: "Pay the tickets" } as const;
const HERO_RING = 76;
/** Lane round ids step by this per round (id = thread + counter × 256). */
const LANE_STEP = 256;

/**
 * One round (D21): who it is (asset, length, number), its state as a ring while it runs or its result as a stamp once
 * decided, one big figure, the chart, one row of four facts, the one-tap plates while it takes entries, your receipt,
 * and the entries. Every transaction lives on the proof page, one link away. Anyone can finish a stuck round here (F6).
 */
export function RoundView({ roundId, autoplay = false }: { roundId: number; autoplay?: boolean }) {
  const network = useWorld();
  const now = useNow();
  const clockTime = useClockTime();
  const wallet = useWallet();
  const money = useMoney();
  const client = useQueryClient();
  const view = useQuery(roundQuery(network, roundId));
  const [finishing, setFinishing] = useState(false);
  const round = view.data?.round;
  const priceNow = useSpot(round?.asset ?? "BTC") ?? undefined;
  const tap = useOneTap(
    round?.state === "open" ? round : null,
    round?.laneSeconds && round.laneSeconds >= HOUR_SECONDS ? "hourly" : "short",
  );

  const window: ChartWindow = useMemo(
    () =>
      round && round.state !== "open"
        ? { kind: "fixed", from: round.lockTime * SECOND_MS, to: round.closeTime * SECOND_MS }
        : ROLLING,
    [round],
  );
  const levels: RoundLevels = useMemo(
    () =>
      round
        ? {
            strike: round.liveStrike === null ? null : toDollars(round.asset, round.liveStrike),
            lockAt: round.lockTime * SECOND_MS,
            closeAt: round.closeTime * SECOND_MS,
          }
        : {},
    [round],
  );

  if (view.isPending) return <Skeleton className="h-[520px] rounded-[32px]" label="Loading the round" />;
  if (!view.data || !round) {
    return <EmptyState icon={SearchX} title={`No round #${roundId}`} action={{ label: "Rounds", href: "/rounds" }} />;
  }
  const mine = new Set(wallet.keys.map((key) => key.pkh));
  const myTickets = view.data.entries.filter((entry) => mine.has(entry.payoutPkh));
  const decided = round.state === "settled" || round.state === "void";
  let verdict: Verdict | null = null;
  if (decided && round.state === "void") verdict = "void";
  else if (decided && myTickets.some((ticket) => ticket.outcome === round.winner)) verdict = "hit";
  else if (decided && myTickets.length > 0) verdict = "miss";
  const step = dueStep(round, now);
  const strike = round.liveStrike === null ? null : toDollars(round.asset, round.liveStrike);
  const close = round.closePrice === null ? null : toDollars(round.asset, round.closePrice);
  const hero = close ?? (round.state === "locked" ? (priceNow ?? null) : null);
  const gap = hero !== null && strike !== null ? hero - strike : null;
  const open = round.state === "open";
  const ringEnd = open ? round.lockTime : round.closeTime;
  const ringSpan = (round.laneSeconds ?? round.closeTime - round.lockTime) * SECOND_MS;
  const facts = [
    { label: "To beat", value: strike === null ? "—" : usd(strike) },
    { label: decided ? "Closed" : "Closes", value: close === null ? clockTime(round.closeTime) : usd(close) },
    { label: "Pot", value: money.format(round.pot) },
    { label: "Entries", value: String(round.entrants) },
  ];

  const finish = async () => {
    setFinishing(true);
    try {
      const result = await finishRound(network, round, now);
      if ("waiting" in result) toast({ tone: "info", title: result.waiting });
      else
        toast({
          tone: "up",
          title: STEP_LABEL[result.done],
          body: `#${round.roundId}`,
          href: `/proof/${round.roundId}`,
        });
      void client.invalidateQueries({ queryKey: ["round", network, roundId] });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ tone: /already|conflict|missing/i.test(message) ? "info" : "down", title: "Not sent", body: message });
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-5 overflow-hidden rounded-[32px] bg-[var(--stage)] p-5 shadow-[inset_0_0_0_1px_var(--hairline)] md:p-7">
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-3">
            <span className="flex items-center gap-1.5 self-start">
              <Link
                href="/rounds"
                onClick={() => pickLane(round.thread)}
                className="nx-glass flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5"
              >
                <AssetCube asset={round.asset} size={30} />
                <span className="nx-display text-[15px]">{ASSET_TONE[round.asset].name}</span>
                <span className="nx-num text-[13px] text-[var(--muted)]">
                  {round.laneSeconds ? laneLabel(round.laneSeconds) : ""}
                </span>
              </Link>
              {/* A lane round's neighbours are one counter step away (round id = thread + counter × 256). */}
              {round.laneSeconds && round.roundId - LANE_STEP >= round.thread ? (
                <Link
                  href={`/r/${round.roundId - LANE_STEP}`}
                  aria-label="Previous round"
                  className="nx-glass grid size-9 place-items-center rounded-full"
                >
                  <ChevronLeft aria-hidden className="size-4" />
                </Link>
              ) : null}
              <span className="nx-num text-[13px] text-[var(--muted)]">#{round.roundId}</span>
              {round.laneSeconds && round.state !== "open" ? (
                <Link
                  href={`/r/${round.roundId + LANE_STEP}`}
                  aria-label="Next round"
                  className="nx-glass grid size-9 place-items-center rounded-full"
                >
                  <ChevronRight aria-hidden className="size-4" />
                </Link>
              ) : null}
            </span>
            {hero !== null ? (
              <p className="flex flex-wrap items-baseline gap-x-3">
                <span className="nx-num text-[clamp(40px,6vw,64px)] font-semibold leading-none tracking-[-0.05em]">
                  {usd(hero)}
                </span>
                {gap !== null ? (
                  <span
                    className={cx(
                      "nx-num text-[16px] font-semibold",
                      gap >= 0 ? "text-[var(--up-text)]" : "text-[var(--down-text)]",
                    )}
                  >
                    {gap >= 0 ? "▲" : "▼"} {usd(Math.abs(gap))}
                  </span>
                ) : null}
              </p>
            ) : (
              <h1 className="nx-display text-[clamp(32px,5vw,52px)]">
                Up or down by <span className="tabular-nums">{clockTime(round.closeTime)}</span>?
              </h1>
            )}
          </div>
          {decided ? null : (
            <Ring
              leftMs={(ringEnd - now) * SECOND_MS}
              spanMs={ringSpan}
              size={HERO_RING}
              label={open ? "Entries close" : "Closes"}
              className="text-[18px]"
            />
          )}
        </header>
        {decided ? (
          <RoundFilmPlayer roundId={round.roundId} focus={mine} autoplay={autoplay} />
        ) : (
          <LiveChart
            asset={round.asset}
            window={window}
            levels={levels}
            engine="round"
            className="h-[260px] md:h-[360px]"
          />
        )}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="nx-eyebrow">{fact.label}</dt>
              <dd className="nx-num text-[18px] font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
        {open ? <SidePlates tap={tap} /> : null}
        {step ? (
          <button
            type="button"
            onClick={() => void finish()}
            disabled={finishing}
            className="nx-display h-14 rounded-full bg-[var(--ink)] text-[17px] text-[var(--ink-inverse)] disabled:opacity-60"
          >
            {finishing ? "Building from the chain…" : STEP_LABEL[step]}
          </button>
        ) : null}
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ShareActions
          path={`/r/${round.roundId}`}
          text={`${ASSET_TONE[round.asset].name}: up or down? Round #${round.roundId} on Jōge.`}
        />
        <Link
          href={`/proof/${round.roundId}`}
          className="nx-glass inline-flex h-10 items-center gap-2 rounded-full px-4 font-semibold text-[14px]"
        >
          <ShieldCheck size={16} aria-hidden /> Proof
          <ArrowUpRight size={14} aria-hidden />
        </Link>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex flex-col gap-1 rounded-[24px] bg-[var(--surface-1)] p-3 md:p-4">
          <p className="nx-eyebrow px-2 pb-1">Entries</p>
          {view.data.entries.length === 0 ? (
            <p className="px-2 py-3 text-[14px] text-[var(--muted)]">{decided ? "無" : "None yet"}</p>
          ) : null}
          {view.data.entries.map((entry) => {
            const net = (entry.payoutSats ?? 0) - entry.stake - Number(TICKET_DUST);
            return (
              <Link
                key={entry.outpoint}
                href={profileHref(network, entry.payoutPkh) as never}
                className="flex items-center gap-3 rounded-[14px] px-2 py-2 hover:bg-[var(--surface-2)]"
              >
                <span
                  className={cx(
                    "nx-jp grid size-8 place-items-center rounded-[9px] text-[15px]",
                    entry.outcome === 0
                      ? "bg-[var(--up)] text-[var(--up-ink)]"
                      : "bg-[var(--down)] text-[var(--down-ink)]",
                  )}
                >
                  {entry.outcome === 0 ? "上" : "下"}
                </span>
                <Marble seed={entry.payoutPkh} size={24} />
                <span className="nx-num flex-1 text-[15px] font-semibold">{money.format(entry.stake)}</span>
                {mine.has(entry.payoutPkh) ? <span className="nx-eyebrow text-[var(--ink)]">you</span> : null}
                <span className="nx-num text-[13px] font-semibold">
                  {entry.status === "won" ? (
                    <span className="text-[var(--up-text)]">+{money.format(Math.max(0, net))}</span>
                  ) : entry.status === "lost" ? (
                    <span className="text-[var(--down-text)]">−{money.format(entry.stake)}</span>
                  ) : entry.status === "refunded" ? (
                    <span className="nx-jp text-[var(--gold-text)]">無</span>
                  ) : (
                    <span className="text-[var(--muted)]">in</span>
                  )}
                </span>
              </Link>
            );
          })}
        </section>
        {myTickets.length > 0 ? (
          <Receipt network={network} roundId={round.roundId} tickets={myTickets} verdict={verdict} />
        ) : null}
      </div>
    </div>
  );
}
