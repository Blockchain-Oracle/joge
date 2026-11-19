"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Maximize, Minimize, Smartphone } from "lucide-react";
import { type PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import c from "./chrome.module.css";
import s from "./deck.module.css";
import { slideFonts } from "./fonts";
import { SLIDES } from "./slides-art";

/**
 * Jōge's "Widget Factory" deck as a presentation: one 16:9 slide at a time, full screen on a click. Arrow keys, space,
 * a click (left third goes back) or a swipe move through it; the slide number stays in the address (#3), so a link can
 * open on any slide. The same deck stays in Google Slides one click away.
 */
export const GOOGLE_DECK =
  "https://docs.google.com/presentation/d/1Qp5ucxWRxmVQPF2h8TTw9VVcokC_6BMCUVuwDr3cw-Y/edit?usp=sharing";
const IDLE_MS = 2600;
const SWIPE_PX = 40;
const BACK_ZONE = 0.3;
const PERCENT = 100;
const NEXT_KEYS = new Set(["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"]);
const PREV_KEYS = new Set(["ArrowLeft", "ArrowUp", "PageUp", "Backspace"]);

function fromHash(count: number): number | null {
  const n = Number.parseInt(window.location.hash.slice(1), 10);
  return Number.isInteger(n) && n >= 1 && n <= count ? n - 1 : null;
}

export function Deck() {
  const count = SLIDES.length;
  const [index, setIndex] = useState(0);
  const [chrome, setChrome] = useState(true);
  const [full, setFull] = useState(false);
  const [canFull, setCanFull] = useState(false);
  const root = useRef<HTMLElement>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const press = useRef<{ x: number; y: number } | null>(null);
  // True once the address has been read: until then the slide must not write its number over the one asked for.
  const [ready, setReady] = useState(false);

  const go = useCallback((n: number) => setIndex(Math.max(0, Math.min(count - 1, n))), [count]);
  const next = useCallback(() => setIndex((i) => Math.min(count - 1, i + 1)), [count]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  const wake = useCallback(() => {
    setChrome(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setChrome(false), IDLE_MS);
  }, []);

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.current?.requestFullscreen();
  }, []);

  // Open on the slide the address names, and follow it when it changes.
  useEffect(() => {
    const read = () => {
      const n = fromHash(count);
      if (n !== null) setIndex(n);
    };
    read();
    setReady(true);
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [count]);

  useEffect(() => {
    if (ready) window.history.replaceState(null, "", `#${index + 1}`);
  }, [index, ready]);

  useEffect(() => {
    setCanFull(document.fullscreenEnabled);
    const sync = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    wake();
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      clearTimeout(idle.current);
    };
  }, [wake]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button") && (event.key === " " || event.key === "Enter")) return;
      if (NEXT_KEYS.has(event.key)) next();
      else if (PREV_KEYS.has(event.key)) prev();
      else if (event.key === "Home") go(0);
      else if (event.key === "End") go(count - 1);
      else if (event.key === "f" || event.key === "F") toggleFull();
      else if (/^[1-9]$/.test(event.key)) go(Number(event.key) - 1);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, go, next, prev, toggleFull]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    press.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = press.current;
    press.current = null;
    if (!start || (event.target as HTMLElement).closest("a, button")) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
      return;
    }
    const box = event.currentTarget.getBoundingClientRect();
    if ((event.clientX - box.left) / box.width < BACK_ZONE) prev();
    else next();
  };

  return (
    <main
      ref={root}
      className={`${s.root} ${slideFonts}`}
      data-chrome={chrome}
      onPointerMove={wake}
      onPointerDown={wake}
      aria-label="Jōge, the Widget Factory deck"
    >
      <div className={s.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        {SLIDES.map(({ title, dark, Slide }, i) => (
          <section
            key={title}
            className={s.slide}
            data-active={i === index}
            data-dark={dark ?? false}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${title}`}
            aria-hidden={i !== index}
            inert={i !== index}
          >
            <Slide />
          </section>
        ))}
        <div className={c.progress} style={{ width: `${((index + 1) / count) * PERCENT}%` }} />
      </div>
      <p className={c.sr} aria-live="polite">
        Slide {index + 1} of {count}: {SLIDES[index]?.title}
      </p>
      <p className={c.turn} aria-hidden>
        <Smartphone size={15} className={c.tilt} aria-hidden /> Turn your phone for the full slide
      </p>
      <div className={c.chrome}>
        <div className={c.pill}>
          <button type="button" className={c.btn} onClick={prev} disabled={index === 0} aria-label="Previous slide">
            <ChevronLeft size={18} aria-hidden />
          </button>
          <span className={c.count}>
            {index + 1} / {count}
          </span>
          <button type="button" className={c.btn} onClick={next} disabled={index === count - 1} aria-label="Next slide">
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
        <div className={c.pill}>
          <a href={GOOGLE_DECK} target="_blank" rel="noreferrer" className={c.btn}>
            <ExternalLink size={15} aria-hidden />
            <span className={c.wide}>Google Slides</span>
            <span className={c.sr}>Open the deck in Google Slides</span>
          </a>
          {canFull ? (
            <button
              type="button"
              className={c.btn}
              onClick={toggleFull}
              aria-label={full ? "Leave full screen" : "Full screen"}
              title={full ? "Leave full screen (Esc)" : "Full screen (F)"}
            >
              {full ? <Minimize size={16} aria-hidden /> : <Maximize size={16} aria-hidden />}
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
