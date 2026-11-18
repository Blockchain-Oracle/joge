"use client";

import { type MouseEvent, useCallback, useRef, useState } from "react";
import { cx, Sheet, SlideToConfirm } from "@/kit";
import { MAINNET_LIVE } from "../theme/theme.ts";
import { centreOf, switchWorld, useWorld } from "./world.tsx";

/** The flood starts once the sheet has slid away, so it visibly spreads from the switch. */
const SHEET_EXIT_MS = 260;

/**
 * The world switch (Kakure's glow toggle): off is chipnet (試, test coins), on is mainnet (本, real BCH) and glows
 * vermilion. One tap goes back to chipnet; mainnet first asks for "Slide to use real money". Either way the new world
 * floods out from the switch. Its position follows <html data-network> in CSS, so the first paint is never wrong.
 */
export function WorldSwitch({ words = false, className }: { words?: boolean; className?: string }) {
  const world = useWorld();
  const [confirming, setConfirming] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const mainnet = world === "mainnet";

  const onToggle = (event: MouseEvent<HTMLButtonElement>) => {
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
      <button
        ref={button}
        type="button"
        role="switch"
        aria-checked={mainnet}
        aria-label={mainnet ? "Mainnet, real BCH. Switch to chipnet" : "Chipnet, test coins. Switch to mainnet"}
        title={mainnet ? "Mainnet: real BCH" : "Chipnet: test coins"}
        onClick={onToggle}
        className={cx("jg-world-toggle", className)}
      >
        <span aria-hidden className="jg-glow-label" data-side="off">
          <span className="nx-jp">試</span>
          {words ? <span className="hidden lg:inline">Chipnet</span> : null}
        </span>
        <span aria-hidden className="jg-glow-track">
          <span className="jg-glow-thumb" />
        </span>
        <span aria-hidden className="jg-glow-label" data-side="on">
          <span className="nx-jp">本</span>
          {words ? <span className="hidden lg:inline">Mainnet</span> : null}
        </span>
      </button>
      <Sheet open={confirming} onClose={() => setConfirming(false)} title="Switch to mainnet">
        <div className="flex flex-col gap-5">
          <p className="nx-display text-[28px] leading-tight">Real BCH from here.</p>
          <ul className="flex flex-col gap-2 rounded-[20px] bg-[var(--surface-1)] p-4 text-[14px] text-[var(--ink-2)]">
            <li>Your wallet stakes real BCH; winners are paid real BCH.</li>
            <li>Chipnet rounds and tickets stay apart.</li>
            <li>Back to chipnet in one tap.</li>
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
