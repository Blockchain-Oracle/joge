"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/kit";
import { clockTime, countdown, usd } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import type { Position } from "./position.ts";

const TONE = {
  up: "text-[var(--up-text)]",
  down: "text-[var(--down-text)]",
  gold: "text-[var(--gold-text)]",
  muted: "text-[var(--ink-2)]",
} as const;

/**
 * Your call, on the stage (his feedback, 2026-11-18): which side you took and for how much, whether it is winning
 * right now and by how much, what it pays, and the time to the next moment that matters. Once the round is decided it
 * says what came back. One glance, no scrolling; tapping it opens the round.
 */
export function PositionCard({
  position,
  now,
  href,
  roundLabel,
  children,
  action,
  className,
}: {
  position: Position;
  now: number;
  href?: string;
  /** Which round, when more than one could be meant (the terminal holds the live one and the next one). */
  roundLabel?: string;
  /** Extra lines under the card (the round page puts the transactions there). */
  children?: ReactNode;
  /** One button beside the card (the terminal's "share" on a decided round). */
  action?: ReactNode;
  className?: string;
}) {
  const money = useMoney();
  const { status, side, stake, pays, endsAt } = position;
  const up = side === 0;
  let headline: string;
  let tone: keyof typeof TONE = "muted";
  let sub: string;
  let figureLabel = "Pays if right";
  switch (status.kind) {
    case "open":
      headline = status.alone ? `Waiting for a ${up ? "Down" : "Up"} call` : `Starts ${clockTime(endsAt ?? 0)}`;
      tone = status.alone ? "gold" : "muted";
      sub = status.alone
        ? "Refunded if nobody takes the other side"
        : `The line to beat is the price at ${clockTime(endsAt ?? 0)}`;
      break;
    case "starting":
      headline = "Setting the line";
      sub = "The oracle signs it within a minute";
      break;
    case "live": {
      const gap = `${status.gap >= 0 ? "▲" : "▼"} ${usd(Math.abs(status.gap))}`;
      headline = status.winning === null ? "Level with the line" : status.winning ? "Winning" : "Behind";
      tone = status.winning === null ? "muted" : status.winning ? (up ? "up" : "down") : "muted";
      sub = `${gap} ${status.gap >= 0 ? "above" : "below"} the line`;
      break;
    }
    case "won":
      headline = `Won +${money.format(Math.max(0, pays - stake))}`;
      tone = up ? "up" : "down";
      sub = "Paid to your wallet";
      figureLabel = "Back";
      break;
    case "lost":
      headline = "Not this time";
      tone = "muted";
      sub = `${up ? "Down" : "Up"} won`;
      figureLabel = "Back";
      break;
    default:
      headline = "Refunded";
      tone = "gold";
      sub = "Nobody took the other side";
      figureLabel = "Back";
  }
  const body = (
    <>
      <span
        aria-hidden
        className={cx(
          "nx-jp grid size-12 shrink-0 place-items-center rounded-[14px] text-[22px]",
          up ? "bg-[var(--up)] text-[var(--up-ink)]" : "bg-[var(--down)] text-[var(--down-ink)]",
        )}
      >
        {up ? "上" : "下"}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="nx-eyebrow truncate">
          {roundLabel ? `${roundLabel} · ` : ""}Your {up ? "Up" : "Down"} · {money.format(stake)}
        </span>
        <span className={cx("nx-display truncate text-[18px] leading-tight", TONE[tone])}>{headline}</span>
        <span className="nx-num truncate text-[12px] text-[var(--muted)]">{sub}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="nx-eyebrow">{figureLabel}</span>
        <span className="nx-num text-[18px] font-semibold leading-tight">{money.format(pays)}</span>
        {endsAt ? <span className="nx-num text-[12px] text-[var(--muted)]">{countdown(endsAt, now)}</span> : null}
      </span>
      {href ? <ChevronRight aria-hidden className="size-4 shrink-0 text-[var(--muted)]" /> : null}
    </>
  );
  const frame = "nx-glass flex w-full items-center gap-3 rounded-[22px] p-2.5 pr-3 text-left";
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        {href ? (
          <Link href={href as never} className={cx(frame, "transition-transform active:scale-[0.99]")}>
            {body}
          </Link>
        ) : (
          <div className={frame}>{body}</div>
        )}
        {action}
      </div>
      {children}
    </div>
  );
}
