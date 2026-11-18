"use client";

import { Coins, Volume2, VolumeX } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { cue, cx, feedbackPrefs, Sheet, setFeedbackPrefs } from "@/kit";
import { usd } from "../rounds/format.ts";
import { setChosenStake, type useOneTap } from "./use-one-tap.ts";

/** Up to five stakes sit in one row; a longer ladder (the hourly lanes') wraps four to a row. */
const ONE_ROW = 5;
const TWO_ROWS = 4;

const soundListeners = new Set<() => void>();
const soundOn = () => feedbackPrefs().sound;
function useSoundOn() {
  return useSyncExternalStore(
    (listener) => {
      soundListeners.add(listener);
      return () => soundListeners.delete(listener);
    },
    soundOn,
    () => false,
  );
}
function toggleSound() {
  setFeedbackPrefs({ sound: !feedbackPrefs().sound });
  for (const listener of soundListeners) listener();
  cue("fill");
}

/**
 * Kakure's glass stack on the chart's left edge: each setting is an icon and its value, nothing else. The stake opens
 * a sheet with one big figure and the ladder (one tap picks, and every Up/Down tap after uses it).
 */
export function Stack({ tap }: { tap: ReturnType<typeof useOneTap> }) {
  const sound = useSoundOn();
  const [open, setOpen] = useState(false);
  const rows = [
    {
      key: "stake",
      icon: <Coins aria-hidden className="size-[18px]" />,
      value: usd(tap.stakeUsd),
      label: "Stake per tap",
      onClick: () => {
        cue("open");
        setOpen(true);
      },
    },
    {
      key: "sound",
      icon: sound ? <Volume2 aria-hidden className="size-[18px]" /> : <VolumeX aria-hidden className="size-[18px]" />,
      value: sound ? "On" : "Off",
      label: "Sound",
      onClick: toggleSound,
    },
  ];
  return (
    <>
      <div className="nx-glass flex flex-col overflow-hidden rounded-[18px]">
        {rows.map((row, index) => (
          <button
            key={row.key}
            type="button"
            onClick={row.onClick}
            aria-label={`${row.label}: ${row.value}`}
            className={cx(
              "flex items-center gap-2.5 px-3.5 py-3 text-left hover:bg-[var(--glass)]",
              index > 0 && "border-t border-[var(--hairline)]",
            )}
          >
            <span className="text-[var(--muted)]">{row.icon}</span>
            <span className="nx-num text-[14px] font-semibold">{row.value}</span>
          </button>
        ))}
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="Stake per tap">
        <div className="flex flex-col items-center gap-6 pb-2">
          <p className="nx-num text-[56px] font-semibold leading-none tracking-[-0.04em]">{usd(tap.stakeUsd)}</p>
          <div
            className="grid w-full gap-2"
            style={{
              gridTemplateColumns: `repeat(${tap.ladder.length <= ONE_ROW ? tap.ladder.length : TWO_ROWS}, 1fr)`,
            }}
          >
            {tap.ladder.map((dollars) => (
              <button
                key={dollars}
                type="button"
                aria-pressed={dollars === tap.stakeUsd}
                onClick={() => {
                  setChosenStake(dollars);
                  cue("tap");
                  setOpen(false);
                }}
                className={cx(
                  "nx-num h-14 rounded-[16px] text-[16px] font-semibold",
                  dollars === tap.stakeUsd
                    ? "bg-[var(--ink)] text-[var(--ink-inverse)]"
                    : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]",
                )}
              >
                {Number.isInteger(dollars) ? `$${dollars}` : usd(dollars)}
              </button>
            ))}
          </div>
        </div>
      </Sheet>
    </>
  );
}
