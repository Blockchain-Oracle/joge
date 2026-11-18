"use client";

import type { PlayerTotals } from "@joge/db";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cx, EmptyState, Marble, Segmented, Skeleton } from "@/kit";
import { useMoney } from "../rounds/money.ts";
import { useWorld } from "../shell/world.tsx";
import { useWallet } from "../wallet/wallet-context.tsx";
import { addressOf, bareAddress, leaderboardQuery, type Period, profileHref } from "./api.ts";

const PERIODS: Array<{ value: Period; label: string }> = [
  { value: "day", label: "24h" },
  { value: "week", label: "7 days" },
  { value: "all", label: "All" },
];
const PODIUM = 3;
const PERCENT = 100;
const RANK_DIGITS = 2;
const ADDRESS_HEAD = 6;
const ADDRESS_TAIL = 4;
/** Podium order (Owarine, Kakure): second, first, third; the first stands tallest. */
const PODIUM_ORDER = [1, 0, 2];
const PLINTH = ["h-24", "h-16", "h-12"];
const FIRST_MARBLE = 72;
const OTHER_MARBLE = 60;

const rightShare = (player: PlayerTotals) =>
  player.won + player.lost > 0 ? `${Math.round((player.won / (player.won + player.lost)) * PERCENT)}%` : "—";

/** "qz3f8k…k2m" with the tail in vermilion (Owarine's short form). */
export function ShortAddress({ address, className }: { address: string; className?: string }) {
  const bare = bareAddress(address);
  return (
    <span className={cx("nx-num", className)}>
      {bare.slice(0, ADDRESS_HEAD)}…<span className="text-[var(--vermilion)]">{bare.slice(-ADDRESS_TAIL)}</span>
    </span>
  );
}

function Net({ sats, className }: { sats: number; className?: string }) {
  const money = useMoney();
  return (
    <span
      className={cx(
        "nx-num font-semibold",
        sats > 0 ? "text-[var(--up-text)]" : sats < 0 ? "text-[var(--down-text)]" : "text-[var(--muted)]",
        className,
      )}
    >
      {sats > 0 ? "+" : sats < 0 ? "−" : ""}
      {money.format(Math.abs(sats))}
    </span>
  );
}

function YouPill() {
  return <span className="nx-eyebrow rounded-full bg-[var(--vermilion)] px-2 py-0.5 text-white">you</span>;
}

/**
 * Leaders (F9): players ranked by what they won (paid back minus paid in), never by how often they were right; a
 * player is a payout address. A podium for the first three (Owarine, Kakure), then the field, your rows marked.
 */
export function Leaderboard() {
  const network = useWorld();
  const wallet = useWallet();
  const [period, setPeriod] = useState<Period>("week");
  const board = useQuery(leaderboardQuery(network, period));
  const mine = new Set(wallet.keys.map((key) => key.pkh));
  const players = board.data ?? [];
  const podium = players.slice(0, PODIUM);
  const field = players.slice(PODIUM);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="nx-display text-[clamp(34px,5vw,56px)]">Leaders</h1>
        <Segmented label="Period" options={PERIODS} value={period} onChange={setPeriod} />
      </div>
      {board.isPending ? (
        <Skeleton className="h-[420px] rounded-[32px]" label="Loading the leaders" />
      ) : players.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Nobody yet"
          body="Rounds decided in this period rank here."
          action={{ label: "Play a round", href: "/rounds" }}
        />
      ) : (
        <>
          <section
            aria-label="Podium"
            className="grid grid-cols-3 items-end gap-2 rounded-[32px] bg-[var(--stage)] px-3 pt-6 shadow-[inset_0_0_0_1px_var(--hairline)] md:gap-4 md:px-8"
          >
            {PODIUM_ORDER.map((place) => {
              const player = podium[place];
              if (!player) return <span key={place} />;
              const address = addressOf(network, player.payoutPkh);
              return (
                <Link
                  key={player.payoutPkh}
                  href={profileHref(network, player.payoutPkh) as never}
                  className="group flex min-w-0 flex-col items-center gap-2"
                >
                  <span
                    className={cx(
                      "rounded-full p-1",
                      place === 0 ? "shadow-[0_0_0_3px_var(--vermilion)]" : "shadow-[0_0_0_2px_var(--surface-3)]",
                    )}
                  >
                    <Marble seed={player.payoutPkh} size={place === 0 ? FIRST_MARBLE : OTHER_MARBLE} />
                  </span>
                  <ShortAddress address={address} className="max-w-full truncate text-[12px] md:text-[13px]" />
                  {mine.has(player.payoutPkh) ? <YouPill /> : null}
                  <Net sats={player.net} className="text-[15px] md:text-[18px]" />
                  <span
                    className={cx(
                      "nx-display grid w-full place-items-center rounded-t-[18px] text-[28px] transition-colors",
                      PLINTH[place],
                      place === 0
                        ? "bg-[var(--vermilion)] text-white"
                        : "bg-[var(--surface-2)] text-[var(--ink-2)] group-hover:bg-[var(--surface-3)]",
                    )}
                  >
                    {place + 1}
                  </span>
                </Link>
              );
            })}
          </section>
          {field.length > 0 ? (
            <ol className="flex flex-col gap-1.5" aria-label="The field">
              {field.map((player, index) => {
                const rank = index + PODIUM + 1;
                const isMine = mine.has(player.payoutPkh);
                return (
                  <li key={player.payoutPkh}>
                    <Link
                      href={profileHref(network, player.payoutPkh) as never}
                      className={cx(
                        "flex items-center gap-3 rounded-[18px] p-3 transition-colors hover:bg-[var(--surface-2)]",
                        isMine
                          ? "bg-[var(--surface-2)] shadow-[inset_3px_0_0_var(--vermilion)]"
                          : "bg-[var(--surface-1)]",
                      )}
                    >
                      <span className="nx-num w-7 text-[13px] text-[var(--muted)]">
                        {String(rank).padStart(RANK_DIGITS, "0")}
                      </span>
                      <Marble seed={player.payoutPkh} size={36} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="flex items-center gap-2">
                          <ShortAddress address={addressOf(network, player.payoutPkh)} className="text-[14px]" />
                          {isMine ? <YouPill /> : null}
                        </span>
                        <span className="nx-num text-[12px] text-[var(--muted)]">
                          {player.rounds} rounds · {rightShare(player)} right
                        </span>
                      </span>
                      <Net sats={player.net} className="text-[15px]" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : null}
          <p className="nx-num text-center text-[12px] text-[var(--muted)]">
            Net = paid back − paid in, per decided round
          </p>
        </>
      )}
    </div>
  );
}
