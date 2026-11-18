"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { cx, Ring } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { useSpot } from "../chart/use-spot.ts";
import { usd } from "../rounds/format.ts";
import { useNow } from "../rounds/use-now.ts";
import { Hanko } from "../shell/seal.tsx";
import { useLane } from "../terminal/use-lane.ts";

/** Owarine's typewriter: one word every 24 ms, split on whitespace so lines never reflow. */
const WORD_MS = 24;
/** A word and the space after it. */
const PARTS_PER_STEP = 2;
const AVATAR = 27;
const METER_RING = 44;
const SECOND_MS = 1_000;

/** A reply that talked the player out of a bet gets these; any other read gets the second set (Owarine `copy.ts`). */
const SAT_OUT = /sit (?:it |this one |the next one )?out|skip (?:it|this)|pass on|not this one|stay out|no bet/i;
const AFTER_PASS = ["Good call, skip it", "Show me another", "Why sit out?"];
const AFTER_CALL = ["Why that side?", "What's the risk?", "What would flip it?"];

export const followUps = (reply: string) => (SAT_OUT.test(reply) ? AFTER_PASS : AFTER_CALL);

/** One of Sensei's rows: its seal, then the bubble or card. */
export function SenseiRow({ children }: { children: ReactNode }) {
  return (
    <div className="nx-msg flex items-start gap-2.5">
      <Hanko size={AVATAR} className="mt-0.5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">{children}</div>
    </div>
  );
}

/** The reply types itself in (a reply already read when the panel reopens shows whole). */
export function Typed({ text, live }: { text: string; live: boolean }) {
  const parts = useMemo(() => text.split(/(\s+)/), [text]);
  const [shown, setShown] = useState(() => (live ? 0 : Number.POSITIVE_INFINITY));
  const caught = shown >= parts.length;
  useEffect(() => {
    if (caught) return;
    const timer = setInterval(() => setShown((count) => count + PARTS_PER_STEP), WORD_MS);
    return () => clearInterval(timer);
  }, [caught]);
  return (
    <>
      {parts.slice(0, shown).join("")}
      {caught && !live ? null : <span aria-hidden className="nx-caret" />}
    </>
  );
}

export function ReadingDots() {
  return (
    <SenseiRow>
      <span role="status" aria-label="Reading the market" data-from="sensei" className="nx-bubble nx-dots">
        <i />
        <i />
        <i />
      </span>
    </SenseiRow>
  );
}

/**
 * The strip pinned at the top of the panel (Owarine's meter): the lane on screen, its price now against the line to
 * beat, and the ring to the next close of entries.
 */
export function SenseiMeter() {
  const { lane, next, strike } = useLane();
  const spot = useSpot(lane?.asset);
  const now = useNow();
  if (!lane) return null;
  const drift = spot !== null && strike !== null ? spot - strike : null;
  const left = next && now > 0 ? next.lockTime - now : null;
  return (
    <div className="flex items-center gap-3 rounded-[20px] bg-[var(--surface-2)] py-2 pr-2 pl-2.5">
      <AssetCube asset={lane.asset} size={30} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="nx-num text-[16px] font-semibold leading-tight">{spot === null ? "—" : usd(spot)}</span>
        {drift !== null ? (
          <span
            className={cx(
              "nx-num text-[12px] font-semibold",
              drift >= 0 ? "text-[var(--up-text)]" : "text-[var(--down-text)]",
            )}
          >
            {drift >= 0 ? "▲" : "▼"} {usd(Math.abs(drift))}
          </span>
        ) : null}
      </span>
      {left !== null && left > 0 ? (
        <Ring
          leftMs={left * SECOND_MS}
          spanMs={lane.seconds * SECOND_MS}
          size={METER_RING}
          label="Entries close"
          className="text-[11px]"
        />
      ) : null}
    </div>
  );
}
