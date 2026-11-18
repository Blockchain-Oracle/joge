"use client";

import Link from "next/link";
import { cx } from "@/kit";
import { useStreamLive } from "@/live/hooks";
import { useWorld, WORLD_STAMP } from "./world.tsx";

/** The world this page plays in and whether its live stream is up (Kakure's health chip); it opens /status. */
export function HealthChip() {
  const world = useWorld();
  const live = useStreamLive();
  const stamp = WORLD_STAMP[world];
  return (
    <Link
      href="/status"
      aria-label={`${stamp.label}, ${live ? "live" : "connecting"}: status`}
      className="nx-glass flex h-11 items-center gap-2 rounded-full px-3.5 font-semibold text-[13px] lg:px-4"
    >
      <span
        aria-hidden
        className={cx("size-2 rounded-full", live ? "bg-[var(--up)]" : "bg-[var(--gold)] motion-safe:animate-pulse")}
      />
      <span className="nx-jp text-[13px]">{stamp.glyph}</span>
      <span className="hidden lg:inline">{stamp.label}</span>
    </Link>
  );
}
