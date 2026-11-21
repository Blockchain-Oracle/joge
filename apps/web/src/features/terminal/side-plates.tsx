"use client";

import { LoaderCircle } from "lucide-react";
import { cx } from "@/kit";
import { StakeRow } from "./stake-row.tsx";
import type { Side, useOneTap } from "./use-one-tap.ts";

const MULTIPLE_DIGITS = 2;

/**
 * Up and Down (plates, and what a win pays per dollar under each side once both sides have bets), with the bet chosen
 * right above them: one tap is the call. Whatever stands in the way
 * (no wallet, entries closing, your own limit) is said once, as a sticker above the plates, and the tap runs its fix.
 */
export function SidePlates({ tap, compact = false }: { tap: ReturnType<typeof useOneTap>; compact?: boolean }) {
  const sides: Array<{ side: Side; glyph: string; word: string }> = [
    { side: 0, glyph: "上", word: "UP" },
    { side: 1, glyph: "下", word: "DOWN" },
  ];
  return (
    <div className="relative flex flex-col items-center gap-3">
      {compact ? null : <StakeRow tap={tap} />}
      {tap.blocker ? (
        <button
          type="button"
          onClick={tap.blocker.onClick}
          className="nx-sticker bg-[var(--ink)] text-[var(--ink-inverse)]"
          style={{ ["--tilt" as string]: "-2deg" }}
        >
          {tap.blocker.label}
        </button>
      ) : null}
      <div data-tour="sides" className="grid w-full grid-cols-2 gap-3">
        {sides.map(({ side, glyph, word }) => {
          const multiple = tap.pays(side);
          return (
            <button
              key={side}
              type="button"
              data-side={side === 0 ? "up" : "down"}
              data-busy={tap.busy === side ? "" : undefined}
              disabled={tap.busy !== null && tap.busy !== side}
              onClick={() => (tap.blocker ? tap.blocker.onClick() : void tap.enter(side))}
              className={cx("nx-plate w-full", compact ? "h-16" : "h-[76px]")}
            >
              {tap.busy === side ? (
                <LoaderCircle aria-hidden className="size-6 motion-safe:animate-spin" />
              ) : (
                <span aria-hidden className="nx-jp text-[30px] leading-none">
                  {glyph}
                </span>
              )}
              <span className="flex flex-col items-start leading-none">
                <span className="text-[19px] tracking-[0.06em]">{word}</span>
                {/* Only what a win pays per dollar, once both sides have bets: the bet itself is picked just above
                    (his phone screenshot: "$0.10 · no Down yet" wrapped under each word, "all this text"). */}
                {typeof multiple === "number" ? (
                  <span className="nx-num mt-1 whitespace-nowrap text-[14px] font-semibold opacity-75">
                    {multiple.toFixed(MULTIPLE_DIGITS)}×
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
