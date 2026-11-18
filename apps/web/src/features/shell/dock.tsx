"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cue, cx } from "@/kit";
import { useNow } from "../rounds/use-now.ts";
import { leftShare, SenseiMark } from "../sensei/orb.tsx";
import { openSensei } from "../sensei/store.ts";
import { useLane } from "../terminal/use-lane.ts";
import { DOCK_PLACES, type Place, placeFor } from "./places.ts";

const SECOND_MS = 1_000;
const MINUTE_SECONDS = 60;
const STROKE = 2;
const STROKE_HERE = 2.4;
/** Places either side of the seal. */
const LEFT_COUNT = 2;

/**
 * The phone dock (Mitoshi's floating dock with a seal in the centre): places either side, More at the end, and in the
 * middle Sensei's seal with its ring draining to the next round. It replaces the corner orb on a phone, so nothing ever
 * covers the Up and Down plates.
 */
export function Dock({ onMore }: { onMore: () => void }) {
  const path = usePathname();
  const place = placeFor(path);
  const { lane, next } = useLane();
  const now = useNow();
  const share = leftShare(
    next && now > 0 ? (next.lockTime - now) * SECOND_MS : null,
    (lane?.seconds ?? MINUTE_SECONDS) * SECOND_MS,
  );
  const item = (href: Place) => {
    const Icon = href.icon;
    const here = href === place;
    return (
      <Link
        key={href.href}
        href={href.href}
        aria-current={here ? "page" : undefined}
        className={cx(
          "flex flex-1 flex-col items-center gap-1 py-1",
          here ? "text-[var(--ink)]" : "text-[var(--muted)]",
        )}
      >
        <Icon size={21} aria-hidden strokeWidth={here ? STROKE_HERE : STROKE} />
        <span className="text-[10.5px] font-semibold">{href.label}</span>
      </Link>
    );
  };
  return (
    <nav
      aria-label="Places"
      className="nx-glass fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),10px)] z-[var(--z-chrome)] flex h-[68px] items-center rounded-[32px] px-2 md:hidden"
    >
      {DOCK_PLACES.slice(0, LEFT_COUNT).map(item)}
      <button
        type="button"
        aria-label="Ask Sensei"
        onClick={() => {
          cue("open");
          openSensei();
        }}
        className="-mt-6 grid flex-1 place-items-center"
      >
        <span className="grid size-[60px] place-items-center rounded-full bg-[var(--surface-1)] shadow-[0_10px_24px_-10px_rgb(0_0_0/0.6)]">
          <SenseiMark share={share} size={52} />
        </span>
      </button>
      {DOCK_PLACES.slice(LEFT_COUNT).map(item)}
      <button
        type="button"
        onClick={onMore}
        className="flex flex-1 flex-col items-center gap-1 py-1 text-[var(--muted)]"
      >
        <span className="grid size-[21px] place-items-center text-[18px] leading-none">⋯</span>
        <span className="text-[10.5px] font-semibold">More</span>
      </button>
    </nav>
  );
}
