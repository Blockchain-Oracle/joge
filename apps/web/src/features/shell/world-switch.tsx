"use client";

import { type MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { cx, Sheet, SlideToConfirm } from "@/kit";
import { MAINNET_LIVE } from "../theme/theme.ts";
import { useTourOpen } from "../tour/store.ts";
import { centreOf, switchWorld, useWorld } from "./world.tsx";

/** The flood starts once the sheet has slid away, so it visibly spreads from the switch. */
const SHEET_EXIT_MS = 260;
/** On chipnet, until the switch is used once: the first nudge, how long the bubble stays, the gap, and how many. */
const NUDGE_FIRST_MS = 14_000;
const NUDGE_SHOW_MS = 4_500;
const NUDGE_EVERY_MS = 45_000;
const NUDGE_TIMES = 3;
const TOUCHED_KEY = "joge-world-touched";

const touched = () => {
  try {
    return localStorage.getItem(TOUCHED_KEY) === "yes";
  } catch {
    return false;
  }
};
const markTouched = () => {
  try {
    localStorage.setItem(TOUCHED_KEY, "yes");
  } catch {
    // Private windows may refuse storage: the nudge then stops for this page only.
  }
};

/**
 * The world switch (glow toggle): off is chipnet (試, free test coins), on is mainnet (本, real BCH) and glows
 * vermilion. One tap goes back to chipnet; mainnet first asks for "Slide to use real money". Either way the new world
 * floods out from the switch. Its position follows <html data-network> in CSS, so the first paint is never wrong.
 * The header's switch (`hint`) says what it is in a bubble on hover, and on chipnet it nudges now and then until it has
 * been used once, so nobody plays test coins thinking they are real, or misses that real BCH is one flip away.
 */
export function WorldSwitch({
  words = false,
  hint = false,
  className,
}: {
  words?: boolean;
  hint?: boolean;
  className?: string;
}) {
  const world = useWorld();
  const touring = useTourOpen();
  const [confirming, setConfirming] = useState(false);
  const [nudge, setNudge] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const mainnet = world === "mainnet";

  useEffect(() => {
    if (!hint || mainnet || touring || touched()) return;
    let shown = 0;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const fire = () => {
      if (document.hidden || shown >= NUDGE_TIMES || touched()) return;
      shown += 1;
      setNudge(true);
      hide = setTimeout(() => setNudge(false), NUDGE_SHOW_MS);
    };
    const first = setTimeout(fire, NUDGE_FIRST_MS);
    const every = setInterval(fire, NUDGE_EVERY_MS);
    return () => {
      clearTimeout(first);
      clearInterval(every);
      clearTimeout(hide);
      setNudge(false);
    };
  }, [hint, mainnet, touring]);

  const onToggle = (event: MouseEvent<HTMLButtonElement>) => {
    markTouched();
    setNudge(false);
    if (mainnet) {
      switchWorld("chipnet", event.detail > 0 ? { x: event.clientX, y: event.clientY } : centreOf(button.current));
    } else {
      setConfirming(true);
    }
  };
  const onConfirmed = useCallback(() => {
    setConfirming(false);
    setTimeout(() => switchWorld("mainnet", centreOf(button.current)), SHEET_EXIT_MS);
  }, []);

  return (
    <>
      <span className="jg-world-wrap" data-tour={hint ? "world" : undefined}>
        <button
          ref={button}
          type="button"
          role="switch"
          aria-checked={mainnet}
          aria-label={
            mainnet ? "Mainnet, real BCH. Switch to free test coins" : "Testnet, free test coins. Switch to real BCH"
          }
          onClick={onToggle}
          data-nudge={nudge ? "" : undefined}
          className={cx("jg-world-toggle", className)}
        >
          <span aria-hidden className="jg-glow-label" data-side="off">
            <span className="nx-jp">試</span>
            {words ? <span className="hidden lg:inline">Testnet</span> : null}
          </span>
          <span aria-hidden className="jg-glow-track">
            <span className="jg-glow-thumb" />
          </span>
          <span aria-hidden className="jg-glow-label" data-side="on">
            <span className="nx-jp">本</span>
            {words ? <span className="hidden lg:inline">Mainnet</span> : null}
          </span>
        </button>
        {hint ? (
          <span aria-hidden className="jg-world-hint" data-shown={nudge ? "" : undefined}>
            {mainnet ? (
              <>
                <span className="nx-jp">本</span> Real BCH · tap for free test coins
              </>
            ) : (
              <>
                <span className="nx-jp">試</span> Free test coins · tap for real BCH
              </>
            )}
          </span>
        ) : null}
      </span>
      <Sheet open={confirming} onClose={() => setConfirming(false)} title="Switch to mainnet">
        <div className="flex flex-col gap-5">
          <p className="nx-display text-[28px] leading-tight">Real BCH from here.</p>
          <ul className="flex flex-col gap-2 rounded-[20px] bg-[var(--surface-1)] p-4 text-[14px] text-[var(--ink-2)]">
            <li>Your wallet bets real BCH; winners are paid real BCH.</li>
            <li>Test-coin rounds and tickets stay apart.</li>
            <li>Back to free test coins in one tap.</li>
          </ul>
          {MAINNET_LIVE ? (
            <SlideToConfirm label="Slide to use real money" onConfirm={onConfirmed} />
          ) : (
            <p className="rounded-full bg-[var(--surface-2)] py-4 text-center font-semibold text-[14px] text-[var(--ink-2)]">
              Mainnet opens soon
            </p>
          )}
        </div>
      </Sheet>
    </>
  );
}
