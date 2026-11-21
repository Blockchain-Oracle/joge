"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { AmountSheet, cue, cx } from "@/kit";
import { usd } from "../rounds/format.ts";
import { setChosenStake, type useOneTap } from "./use-one-tap.ts";

/** The usual stakes shown as chips; any other amount is one tap away (Other). */
const CHIPS = 4;
const CENTS = 100;

/**
 * How much each tap bets, on the plates themselves (a player in the BLAZE chat: "why can't I set how much I want to
 * bet?" — the stake sat in a glass stack at the chart's edge). The usual amounts are chips; Other opens the amount
 * sheet for any stake inside the lane's bounds. The choice stands for every Up or Down after.
 */
export function StakeRow({ tap }: { tap: ReturnType<typeof useOneTap> }) {
  const [open, setOpen] = useState(false);
  const chips = tap.ladder.slice(0, CHIPS);
  const same = (a: number, b: number) => Math.round(a * CENTS) === Math.round(b * CENTS);
  const custom = !chips.some((dollars) => same(dollars, tap.stakeUsd));
  const pick = (dollars: number) => {
    cue("tap");
    setChosenStake(dollars);
  };
  return (
    <div data-tour="amount" className="flex w-full items-center gap-3">
      <span className="nx-eyebrow shrink-0">Bet</span>
      <div className="flex min-w-0 flex-1 gap-1.5">
        {chips.map((dollars) => {
          const on = same(dollars, tap.stakeUsd);
          return (
            <button
              key={dollars}
              type="button"
              aria-pressed={on}
              onClick={() => pick(dollars)}
              className={cx(
                "nx-num h-10 min-w-0 flex-1 rounded-full text-[14px] font-semibold transition-[background-color,color,transform] duration-150 active:scale-95",
                on
                  ? "scale-[1.04] bg-[var(--ink)] text-[var(--ink-inverse)]"
                  : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]",
              )}
            >
              {usd(dollars)}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={custom}
          onClick={() => {
            cue("open");
            setOpen(true);
          }}
          className={cx(
            "nx-num flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold transition-[background-color,color,transform] duration-150 active:scale-95",
            custom
              ? "scale-[1.04] bg-[var(--ink)] text-[var(--ink-inverse)]"
              : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]",
          )}
        >
          {custom ? usd(tap.stakeUsd) : "Other"} <Pencil aria-hidden className="hidden size-3.5 sm:inline" />
        </button>
      </div>
      <AmountSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Bet per tap"
        initial={tap.stakeUsd}
        presets={tap.ladder}
        min={tap.minUsd}
        max={tap.capUsd}
        maxLabel="Market max"
        confirm={(dollars) => `Bet ${usd(dollars)} a tap`}
        onConfirm={(dollars) => {
          setChosenStake(dollars);
          setOpen(false);
        }}
      />
    </div>
  );
}
