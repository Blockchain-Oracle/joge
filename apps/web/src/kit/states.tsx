"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "./button.tsx";
import { cx } from "./cx.ts";

const SHOW_ELAPSED_S = 3;
const STILL_WAITING_S = 15;
const SECOND_MS = 1_000;

/** A layout-shaped placeholder (never a spinner page). */
export function Skeleton({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={cx("animate-[jg-pulse_1200ms_var(--ease)_infinite] rounded-xl bg-glass", className)}
    />
  );
}

export interface EmptyAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

/** An empty list that says why, with one way forward. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body?: ReactNode;
  action?: EmptyAction;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center gap-3 px-6 py-10 text-center", className)}>
      <span className="grid size-14 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--ink-2)]">
        <Icon size={22} strokeWidth={2} aria-hidden />
      </span>
      <p className="nx-display text-[20px]">{title}</p>
      {body ? <p className="max-w-xs text-[14px] text-[var(--muted)]">{body}</p> : null}
      {action?.href ? (
        <Link href={action.href as never} data-tone="ink" className="jg-key mt-1 h-11 px-5 text-[14px]">
          {action.label}
        </Link>
      ) : action ? (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

/** A shimmering verb ("Locking…") that shows how long it has waited and offers a retry once it is overdue. */
export function Wait({ verb, onRetry, expectSeconds }: { verb: string; onRetry?: () => void; expectSeconds?: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / SECOND_MS)), SECOND_MS);
    return () => clearInterval(timer);
  }, []);
  const overdue = elapsed >= (expectSeconds ? expectSeconds * 2 : STILL_WAITING_S);
  return (
    <span role="status" className="type-caption inline-flex items-center gap-2 text-ink-2">
      <span className="animate-[jg-shimmer_1.6s_linear_infinite] bg-[linear-gradient(90deg,var(--ink-2),var(--ink),var(--ink-2))] bg-[length:200%_100%] bg-clip-text text-transparent">
        {verb}…
      </span>
      {elapsed >= SHOW_ELAPSED_S ? <span className="num text-muted">{elapsed}s</span> : null}
      {overdue && onRetry ? (
        <button type="button" onClick={onRetry} className="font-semibold text-accent hover:underline">
          Still waiting · Retry
        </button>
      ) : null}
    </span>
  );
}

const DOT_TONES = {
  up: "bg-up-text",
  down: "bg-down-text",
  accent: "bg-accent",
  cyan: "bg-cyan-text",
  muted: "bg-muted",
} as const;

/** A live dot with a ping halo. */
export function LiveDot({ tone = "up" }: { tone?: keyof typeof DOT_TONES }) {
  return (
    <span className="relative inline-flex size-2" aria-hidden>
      <span
        className={cx("absolute inset-0 animate-[jg-ping_1.6s_var(--ease-out)_infinite] rounded-full", DOT_TONES[tone])}
      />
      <span className={cx("relative size-2 rounded-full", DOT_TONES[tone])} />
    </span>
  );
}
