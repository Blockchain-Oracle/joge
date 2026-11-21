"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cue, feedbackPrefs, setFeedbackPrefs } from "@/kit";
import type { useOneTap } from "./use-one-tap.ts";

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
 * The glass stack on the chart's left edge: the sound switch, an icon and its value. (The stake moved onto the Up and
 * Down plates, where a player looks for it: StakeRow.)
 */
export function Stack(_props: { tap?: ReturnType<typeof useOneTap> }) {
  const sound = useSoundOn();
  return (
    <div className="nx-glass flex flex-col overflow-hidden rounded-[18px]">
      <button
        type="button"
        onClick={toggleSound}
        aria-label={`Sound: ${sound ? "On" : "Off"}`}
        className="flex items-center gap-2.5 px-3.5 py-3 text-left hover:bg-[var(--glass)]"
      >
        <span className="text-[var(--muted)]">
          {sound ? <Volume2 aria-hidden className="size-[18px]" /> : <VolumeX aria-hidden className="size-[18px]" />}
        </span>
        <span className="nx-num text-[14px] font-semibold">{sound ? "On" : "Off"}</span>
      </button>
    </div>
  );
}
