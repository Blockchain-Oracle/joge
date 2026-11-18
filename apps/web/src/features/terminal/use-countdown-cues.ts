"use client";

import { useEffect, useRef } from "react";
import { cue } from "@/kit";
import { TICK_SECONDS } from "./constants.ts";

/**
 * The countdown is heard (Senryo's countBeep, Kakure's Practice clock): one click a second over the last five, then GO
 * when the round turns over. Sound itself stays the player's choice (off until turned on); the clicks are also felt.
 */
export function useCountdownCues(secondsLeft: number | null) {
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (secondsLeft === null) return;
    const previous = last.current;
    last.current = secondsLeft;
    if (previous === null || previous === secondsLeft) return;
    if (secondsLeft > 0 && secondsLeft <= TICK_SECONDS) cue("tick");
    else if (secondsLeft <= 0 && previous > 0) cue("go");
  }, [secondsLeft]);
}
