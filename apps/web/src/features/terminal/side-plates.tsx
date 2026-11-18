"use client";

import { LoaderCircle } from "lucide-react";
import { cx } from "@/kit";
import type { Side, useOneTap } from "./use-one-tap.ts";

const MULTIPLE_DIGITS = 2;

/**
 * Up and Down (plates, "pays N×" under each side): one tap is the call. Whatever stands in the way
 * (no wallet, entries closing, your own limit) is said once, as a sticker above the plates, and the tap runs its fix.
 */
export function SidePlates({ tap, compact = false }: { tap: ReturnType<typeof useOneTap>; compact?: boolean }) {
  const sides: Array<{ side: Side; glyph: string; word: string }> = [
    { side: 0, glyph: "上", word: "UP" },
    { side: 1, glyph: "下", word: "DOWN" },
  ];
  return (
    <div className="relative flex flex-col items-center gap-3">
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
      <div className="grid w-full grid-cols-2 gap-3">
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
                <span className="nx-num mt-1 text-[13px] font-semibold opacity-75">
                  {multiple === "alone"
                    ? `no ${side === 0 ? "Down" : "Up"} yet`
                    : multiple
                      ? `${multiple.toFixed(MULTIPLE_DIGITS)}×`
                      : "—"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
