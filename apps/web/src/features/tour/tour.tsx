"use client";

import type { Network } from "@joge/db";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type RefObject, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cue, cx } from "@/kit";
import { openGuide, useGuide } from "../guide/store.ts";
import { useWorld } from "../shell/world.tsx";
import { useWallet } from "../wallet/wallet-context.tsx";
import { endTour, startTour, tourSeen, useTourOpen } from "./store.ts";

/** What a step points at: `data-tour="…"` on the round screen and the header's world switch. */
type Target = "question" | "clock" | "amount" | "sides" | "world" | "help";

interface Step {
  target: Target;
  glyph: string;
  gold?: boolean;
  title: string;
  line: string;
}

/** A first visit gets a moment to see the screen before the walkthrough starts. */
const FIRST_VISIT_DELAY_MS = 900;
/** Room between the ring and the thing it circles, between the ring and the card, and the card and the window. */
const PAD = 8;
const GAP = 16;
const EDGE = 12;
const ARROW_INSET = 26;
const CARD_FALLBACK = { w: 340, h: 210 };
const REMEASURE_MS = 250;

/** Six steps, each one short line: what the screen asks, when bets close, the bet, the tap, the coins, the way back. */
function stepsFor({ asset, decidedAt, world }: { asset: string; decidedAt: string | null; world: Network }): Step[] {
  return [
    {
      target: "question",
      glyph: "上下",
      title: `Will ${asset} go up or down?`,
      line: "Guess whether the price ends higher or lower. Guess right and you split the pot.",
    },
    {
      target: "clock",
      glyph: "時",
      title: "Bets close when this ring runs out.",
      line: `The price at that moment is the line to beat. ${decidedAt ? `At ${decidedAt}` : "When the round ends"} the price is above it (Up wins) or below (Down wins).`,
    },
    {
      target: "amount",
      glyph: "金",
      title: "Pick your bet.",
      line: "Tap an amount. It stays picked for every bet after.",
    },
    {
      target: "sides",
      glyph: "上",
      title: "Then tap Up or Down.",
      line: "One tap and your wallet signs. 1.8× means a $1 bet pays back $1.80 if you're right.",
    },
    world === "chipnet"
      ? {
          target: "world",
          glyph: "試",
          gold: true,
          title: "These are free test coins.",
          line: "Nothing here is real money, so play all you like. Flip this switch to play with real BCH.",
        }
      : {
          target: "world",
          glyph: "本",
          title: "This is real BCH.",
          line: "Your wallet bets real money here. Flip this switch for free test coins.",
        },
    { target: "help", glyph: "?", title: "See this again any time.", line: "How to play replays this walkthrough." },
  ];
}

interface Frame {
  hole: { left: number; top: number; width: number; height: number; radius: number } | null;
  card: { left: number; top: number; arrow: number; side: "below" | "above" | "center" };
}

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), Math.max(low, high));

/**
 * Where the ring and the card sit, measured every frame while the walkthrough is open (one element, so it is cheap),
 * so a resize, a scroll or a price row growing never leaves the ring behind. The card goes on the side with room.
 */
function useFrame(target: Target, card: RefObject<HTMLDivElement | null>): Frame | null {
  const [frame, setFrame] = useState<Frame | null>(null);
  useEffect(() => {
    let raf = 0;
    let last = "";
    const element = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
    const shown = element?.getBoundingClientRect();
    if (element && shown && (shown.top < 0 || shown.bottom > window.innerHeight))
      element.scrollIntoView({ block: "center", behavior: "smooth" });
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cw = card.current?.offsetWidth ?? CARD_FALLBACK.w;
      const ch = card.current?.offsetHeight ?? CARD_FALLBACK.h;
      const rect = element?.isConnected ? element.getBoundingClientRect() : null;
      let next: Frame;
      if (!(element && rect && rect.width > 0 && rect.height > 0)) {
        next = {
          hole: null,
          card: { left: (vw - cw) / 2, top: (vh - ch) / 2, arrow: cw / 2, side: "center" },
        };
      } else {
        const own = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
        const hole = {
          left: rect.left - PAD,
          top: rect.top - PAD,
          width: rect.width + 2 * PAD,
          height: rect.height + 2 * PAD,
          radius: 0,
        };
        hole.radius = Math.min(own + PAD, hole.height / 2, hole.width / 2);
        const below = vh - (hole.top + hole.height);
        const above = hole.top;
        const room = ch + GAP + EDGE;
        const side = below >= room ? "below" : above >= room ? "above" : below >= above ? "below" : "above";
        const top = clamp(side === "below" ? hole.top + hole.height + GAP : hole.top - GAP - ch, EDGE, vh - ch - EDGE);
        const centre = hole.left + hole.width / 2;
        const left = clamp(centre - cw / 2, EDGE, vw - cw - EDGE);
        next = { hole, card: { left, top, arrow: clamp(centre - left, ARROW_INSET, cw - ARROW_INSET), side } };
      }
      const key = JSON.stringify(next);
      if (key !== last) {
        last = key;
        setFrame(next);
      }
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      measure();
    };
    tick();
    // A throttled or background page pauses frames: a slow timer and the resize and scroll events keep it right too.
    const every = setInterval(measure, REMEASURE_MS);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(every);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [target, card]);
  return frame;
}

/**
 * The round screen's walkthrough: the screen dims, a vermilion ring circles one thing at a time (the question, the
 * clock, the bet, Up and Down, the test-coin switch, How to play) and a card beside it says what it is in a line.
 * Next, Back, Skip; the arrow keys and Esc work too. It starts by itself on a first visit and from How to play.
 */
export function TourHost({ asset, decidedAt }: { asset: string; decidedAt: string | null }) {
  const open = useTourOpen();
  const guide = useGuide();
  const guideOpen = useRef(guide.open);
  guideOpen.current = guide.open;

  // A first visit: once the screen has had a moment, unless the wallet guide is already up.
  useEffect(() => {
    if (tourSeen()) return;
    const timer = setTimeout(() => {
      if (!(tourSeen() || guideOpen.current)) startTour();
    }, FIRST_VISIT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <Asked />
      </Suspense>
      {open ? <Tour asset={asset} decidedAt={decidedAt} /> : null}
    </>
  );
}

/** `?tour=1` (How to play in More and ⌘K) starts it; the query is read in its own Suspense boundary. */
function Asked() {
  const asked = useSearchParams().get("tour") === "1";
  useEffect(() => {
    if (!asked) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("tour");
    window.history.replaceState(window.history.state, "", url);
    startTour();
  }, [asked]);
  return null;
}

function Tour({ asset, decidedAt }: { asset: string; decidedAt: string | null }) {
  const world = useWorld();
  const wallet = useWallet();
  const paired = wallet.state === "connected";
  const steps = stepsFor({ asset, decidedAt, world });
  const [index, setIndex] = useState(0);
  const step = steps[Math.min(index, steps.length - 1)] as Step;
  const last = index >= steps.length - 1;
  const card = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const frame = useFrame(step.target, card);

  useEffect(() => {
    cue("open");
  }, []);
  // The main button takes focus on every step, so Enter and Space move on.
  useEffect(() => {
    if (step.target) primary.current?.focus({ preventScroll: true });
  }, [step.target]);

  const finish = (pair: boolean) => {
    cue(pair ? "open" : "go");
    endTour();
    if (pair) openGuide("wallet");
  };
  const go = (offset: number) => {
    const target = index + offset;
    if (target < 0) return;
    if (target >= steps.length) {
      finish(!paired);
      return;
    }
    cue("tap");
    setIndex(target);
  };
  const goRef = useRef(go);
  goRef.current = go;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cue("close");
        endTour();
      } else if (event.key === "ArrowRight") goRef.current(1);
      else if (event.key === "ArrowLeft") goRef.current(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return createPortal(
    <div className="jg-tour">
      {/* Taps outside the card do nothing: no bet can be placed through the dimmed screen. */}
      <div aria-hidden className="jg-tour-veil" />
      {frame?.hole ? (
        <div
          aria-hidden
          className="jg-tour-hole"
          style={{
            left: frame.hole.left,
            top: frame.hole.top,
            width: frame.hole.width,
            height: frame.hole.height,
            borderRadius: frame.hole.radius,
          }}
        />
      ) : (
        <div aria-hidden className="jg-tour-dim" />
      )}
      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="jg-tour-title"
        className="jg-tour-card"
        data-side={frame?.card.side ?? "center"}
        style={{
          left: frame?.card.left ?? 0,
          top: frame?.card.top ?? 0,
          visibility: frame ? "visible" : "hidden",
          ["--arrow-x" as string]: `${frame?.card.arrow ?? 0}px`,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cx(
              "nx-jp grid h-10 min-w-10 place-items-center rounded-[14px] px-2 font-bold text-[17px]",
              step.gold ? "bg-[var(--gold)] text-[#1a1406]" : "bg-[var(--vermilion)] text-white",
            )}
          >
            {step.glyph}
          </span>
          <ol className="flex flex-1 gap-1" aria-label={`Step ${index + 1} of ${steps.length}`}>
            {steps.map((each, at) => (
              <li
                key={each.target}
                className={cx(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  at <= index ? "bg-[var(--vermilion)]" : "bg-[var(--surface-3)]",
                )}
              />
            ))}
          </ol>
          <button
            type="button"
            onClick={() => {
              cue("close");
              endTour();
            }}
            className="nx-eyebrow rounded-full px-2 py-1 hover:text-[var(--ink)]"
          >
            Skip
          </button>
        </div>
        <div key={step.target} className="jg-tour-words flex flex-col gap-1.5">
          <h2 id="jg-tour-title" className="nx-display text-[22px] leading-tight">
            {step.title}
          </h2>
          <p className="text-[15px] text-[var(--ink-2)] leading-snug">{step.line}</p>
        </div>
        <div className="flex items-center gap-2">
          {index > 0 ? (
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Back"
              className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
          ) : null}
          <button
            ref={primary}
            type="button"
            onClick={() => go(1)}
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-[var(--vermilion)] font-semibold text-[15px] text-white transition-transform active:scale-[0.98]"
          >
            {last ? (paired ? "Start betting" : "Pair a wallet") : "Next"}
          </button>
          {last && !paired ? (
            <button
              type="button"
              onClick={() => finish(false)}
              className="h-12 shrink-0 rounded-full bg-[var(--surface-2)] px-4 font-semibold text-[14px] hover:bg-[var(--surface-3)]"
            >
              Later
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
