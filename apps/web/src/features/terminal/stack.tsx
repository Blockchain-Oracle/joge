"use client";

import { Coins, Volume2, VolumeX } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { AmountSheet, cue, cx, feedbackPrefs, setFeedbackPrefs } from "@/kit";
import { usd } from "../rounds/format.ts";
import { setChosenStake, type useOneTap } from "./use-one-tap.ts";

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
 * The glass stack on the chart's left edge: each setting is an icon and its value, nothing else. The stake opens
 * the amount sheet: type any stake (or tap one of the usual ones), and every Up/Down tap after uses it.
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
      <AmountSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Stake per tap"
        initial={tap.stakeUsd}
        presets={tap.ladder}
        min={tap.minUsd}
        max={tap.capUsd}
        maxLabel="Lane max"
        confirm={(dollars) => `Use ${usd(dollars)} a call`}
        onConfirm={(dollars) => {
          setChosenStake(dollars);
          setOpen(false);
        }}
      />
    </>
  );
}
