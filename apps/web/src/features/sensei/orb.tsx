"use client";

import { useEffect, useState } from "react";
import { cue } from "@/kit";
import { Hanko } from "../shell/seal.tsx";
import { openSensei, useSensei } from "./store.ts";

/** The ring's geometry (Owarine's dock: R = 30 on a 72-unit view box). */
const VIEW = 72;
const CENTRE = 36;
const R = 30;
const LENGTH = 2 * Math.PI * R;
/** Teaser cadence (Owarine `SenseiDock.tsx` L15-23): three pops, then it rests. */
const TEASERS = ["Up or down?", "Coin-flip?", "Want a read?"];
const FIRST_MS = 3_500;
const HOLD_MS = 4_800;
const GAP_MS = 4_500;
const POPS = 3;
/** Under this share of the round left, the orb pulses faster (Owarine: 3.4 s → 1.4 s). */
export const URGENT_SHARE = 0.15;
const RING_STROKE = 4;
/** The seal fills this share of the mark. */
const SEAL_SHARE = 0.65;

function useTeaser(open: boolean): number {
  const [index, setIndex] = useState(-1);
  useEffect(() => {
    if (open || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIndex(-1);
      return;
    }
    let alive = true;
    let pops = 0;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const cycle = (delay: number) => {
      timers.push(
        setTimeout(() => {
          if (!alive) return;
          setIndex(pops % TEASERS.length);
          timers.push(
            setTimeout(() => {
              if (!alive) return;
              setIndex(-1);
              pops += 1;
              if (pops < POPS) cycle(GAP_MS);
            }, HOLD_MS),
          );
        }, delay),
      );
    };
    cycle(FIRST_MS);
    return () => {
      alive = false;
      for (const timer of timers) clearTimeout(timer);
    };
  }, [open]);
  return index;
}

/** Sensei's mark: the seal inside a vermilion ring that drains to the next round, with an idle pulse. */
export function SenseiMark({ share, size = 46 }: { share: number; size?: number }) {
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} aria-hidden className="absolute inset-0 -rotate-90">
        <circle cx={CENTRE} cy={CENTRE} r={R} fill="none" stroke="var(--hairline)" strokeWidth={RING_STROKE} />
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={R}
          fill="none"
          stroke="var(--vermilion)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={LENGTH}
          strokeDashoffset={LENGTH * (1 - share)}
          style={{ transition: "stroke-dashoffset 900ms linear" }}
        />
      </svg>
      <Hanko size={Math.round(size * SEAL_SHARE)} className="relative" />
      <span aria-hidden className="nx-orb-pulse" />
    </span>
  );
}

/** How much of a round is left, as a share of its length (1 while nothing is known). */
export const leftShare = (leftMs: number | null, spanMs: number) =>
  leftMs === null ? 1 : Math.min(1, Math.max(0, leftMs / Math.max(1, spanMs)));

/**
 * Sensei's front door (Masayume → Agari → Owarine → Mitoshi kept it the same): a seal in the corner whose ring drains
 * to the next round, a pulse that quickens near the end, a name that slides out on hover, three springy questions that
 * pop and then rest. Tapping it opens Sensei.
 */
export function SenseiOrb({ leftMs, spanMs }: { leftMs: number | null; spanMs: number }) {
  const { open } = useSensei();
  const teaser = useTeaser(open);
  const share = leftShare(leftMs, spanMs);
  const ask = (question?: string) => {
    cue("open");
    openSensei(question ?? null);
  };
  return (
    <div className="nx-orb-wrap">
      {teaser >= 0 && !open ? (
        <button key={teaser} type="button" className="nx-teaser" onClick={() => ask(TEASERS[teaser])}>
          {TEASERS[teaser]}
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Ask Sensei"
        aria-expanded={open}
        onClick={() => ask()}
        data-urgent={share < URGENT_SHARE ? "" : undefined}
        className="nx-orb"
      >
        <span className="nx-orb-name">
          Sensei <b className="text-[var(--vermilion)]">AI</b>
        </span>
        <SenseiMark share={share} />
      </button>
    </div>
  );
}
