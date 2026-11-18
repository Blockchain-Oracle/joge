"use client";

import type { RoundRow } from "@joge/db";
import { TICKET_DUST } from "@joge/sdk";
import { ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { cx } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { clockTime, laneLabel } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";

export interface TicketRow {
  ticket: {
    outpoint: string;
    roundId: number;
    outcome: number;
    stake: number;
    status: string;
    payoutSats: number | null;
    enterTxid: string;
  };
  round: RoundRow;
}

/** The side a ticket took, as its plate in miniature. */
export function Side({ outcome }: { outcome: number }) {
  return (
    <span
      role="img"
      aria-label={outcome === 0 ? "Up" : "Down"}
      className={cx(
        "nx-jp grid size-10 shrink-0 place-items-center rounded-[11px] text-[18px]",
        outcome === 0 ? "bg-[var(--up)] text-[var(--up-ink)]" : "bg-[var(--down)] text-[var(--down-ink)]",
      )}
    >
      {outcome === 0 ? "上" : "下"}
    </span>
  );
}

/**
 * One ticket as four facts and a play button: the side, the round, the stake, and what it did to your money (+ won,
 * − lost, 無 refunded, a pulse while live). A decided ticket opens its round playing (the round film).
 */
export function TicketLine({ ticket, round }: TicketRow) {
  const money = useMoney();
  const decided = ticket.status === "won" || ticket.status === "lost" || ticket.status === "refunded";
  const net = (ticket.payoutSats ?? 0) - ticket.stake - Number(TICKET_DUST);
  return (
    <Link
      href={decided ? `/r/${ticket.roundId}?play=1` : `/r/${ticket.roundId}`}
      className="group flex items-center gap-3 rounded-[18px] bg-[var(--surface-1)] p-3 transition-colors hover:bg-[var(--surface-2)]"
    >
      <Side outcome={ticket.outcome} />
      <AssetCube asset={round.asset} size={26} />
      <span className="nx-num min-w-0 flex-1 truncate text-[13px] text-[var(--muted)]">
        {round.laneSeconds ? laneLabel(round.laneSeconds) : ""} · {clockTime(round.lockTime)}–
        {clockTime(round.closeTime)}
      </span>
      <span className="nx-num text-[14px] text-[var(--ink-2)]">{money.format(ticket.stake)}</span>
      <span className="nx-num w-20 text-right text-[14px] font-semibold">
        {ticket.status === "won" ? (
          <span className="text-[var(--up-text)]">+{money.format(Math.max(0, net))}</span>
        ) : ticket.status === "lost" ? (
          <span className="text-[var(--down-text)]">−{money.format(ticket.stake)}</span>
        ) : ticket.status === "refunded" ? (
          <span className="nx-jp text-[var(--gold-text)]" title="Refunded">
            無
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
            <span className="size-1.5 rounded-full bg-[var(--vermilion)] motion-safe:animate-pulse" /> live
          </span>
        )}
      </span>
      {decided ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--ink-2)] transition-colors group-hover:bg-[var(--vermilion)] group-hover:text-white">
          <Play aria-label="Replay" className="size-3.5 translate-x-px" fill="currentColor" />
        </span>
      ) : (
        <span className="grid size-8 shrink-0 place-items-center text-[var(--muted)]">
          <ChevronRight aria-hidden className="size-4" />
        </span>
      )}
    </Link>
  );
}
