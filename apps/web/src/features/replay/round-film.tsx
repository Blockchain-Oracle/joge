"use client";

import type { RoundFilm } from "@joge/db";
import { useQuery } from "@tanstack/react-query";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { confetti, cx, filmCue, Skeleton } from "@/kit";
import { RoundStamp, SealStamp } from "../round/verdict.tsx";
import { usd } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import { useWorld } from "../shell/world.tsx";
import { drawFrame, type Palette, readPalette } from "./draw.ts";
import { ENTRIES_MS, type Film, filmOf, HOLD_MS, LOCK_MS, potsAt, resultAt, satsToUsd } from "./film.ts";

const SOUND_KEY = "joge:film-sound";
/** The DOM around the canvas (pot, result) refreshes at about this rate; the canvas draws every frame. */
const OVERLAY_MS = 80;
const STAMP_SIZE = 84;
const SEAL_SIZE = 72;
const PERCENT = 100;

export const filmQuery = (network: string, roundId: number) => ({
  queryKey: ["film", network, roundId],
  queryFn: async (): Promise<RoundFilm> => {
    const response = await fetch(`/api/rounds/${roundId}/film?network=${network}`);
    if (!response.ok) throw new Error(`film answered ${response.status}`);
    return (await response.json()) as RoundFilm;
  },
  staleTime: Number.POSITIVE_INFINITY,
});

function soundOn() {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

/**
 * A round's replay (Senryo's film, Kakure's replay sheet): the whole round in ~9–17 s with its own sounds. It rests on
 * its last frame (the result) with a play button; play runs the entries, the lock, the price against the line to beat
 * and the verdict, with "your" tickets ringed and your result counting as it goes. Scrub to any moment.
 */
export function RoundFilmPlayer({
  roundId,
  focus,
  autoplay = false,
  className,
}: {
  roundId: number;
  focus: Set<string>;
  autoplay?: boolean;
  className?: string;
}) {
  const network = useWorld();
  const money = useMoney();
  const data = useQuery(filmQuery(network, roundId));
  const focusKey = [...focus].sort().join(",");
  const film = useMemo(
    () => (data.data ? filmOf(data.data, new Set(focusKey.split(",").filter(Boolean)), money.bchUsd ?? 0) : null),
    [data.data, focusKey, money.bchUsd],
  );
  if (data.isPending)
    return <Skeleton className={cx("h-[300px] rounded-[24px]", className)} label="Loading the replay" />;
  if (!film) return null;
  return <Player film={film} autoplay={autoplay} className={className} format={money.format} />;
}

function Player({
  film,
  autoplay,
  className,
  format,
}: {
  film: Film;
  autoplay: boolean;
  className: string | undefined;
  format: (sats: number) => string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const time = useRef(film.totalMs);
  const palette = useRef<Palette | null>(null);
  const [shown, setShown] = useState(film.totalMs);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(true);
  const size = useRef({ width: 0, height: 0 });

  const paint = useCallback(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context || size.current.width === 0) return;
    palette.current ??= readPalette(element);
    const ratio = window.devicePixelRatio || 1;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawFrame(context, film, time.current, size.current.width, size.current.height, palette.current, usd);
  }, [film]);

  useEffect(() => setSound(soundOn()), []);

  // The canvas follows its box (and its device pixels).
  useEffect(() => {
    const element = canvas.current;
    const holder = box.current;
    if (!element || !holder) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const ratio = window.devicePixelRatio || 1;
      size.current = { width: entry.contentRect.width, height: entry.contentRect.height };
      element.width = Math.round(entry.contentRect.width * ratio);
      element.height = Math.round(entry.contentRect.height * ratio);
      palette.current = readPalette(element);
      paint();
    });
    observer.observe(holder);
    return () => observer.disconnect();
  }, [paint]);

  // Playback: film time advances with the clock; each cue between two frames plays once.
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let lastOverlay = 0;
    let frame = 0;
    const tick = (stamp: number) => {
      const from = time.current;
      const to = Math.min(film.totalMs, from + (stamp - last));
      last = stamp;
      time.current = to;
      if (sound) for (const cue of film.cues) if (cue.at > from && cue.at <= to) filmCue(cue.cue, cue.step);
      const end = film.totalMs - HOLD_MS;
      if (from < end && to >= end) {
        const won = film.entries.some((entry) => entry.mine && entry.side === film.winner);
        if (won) confetti();
      }
      paint();
      if (stamp - lastOverlay > OVERLAY_MS || to >= film.totalMs) {
        lastOverlay = stamp;
        setShown(to);
      }
      if (to >= film.totalMs) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, film, paint, sound]);

  const start = useCallback(() => {
    if (time.current >= film.totalMs) time.current = 0;
    setShown(time.current);
    setPlaying(true);
  }, [film.totalMs]);

  useEffect(() => {
    if (autoplay) {
      time.current = 0;
      setPlaying(true);
    }
  }, [autoplay]);

  const done = shown >= film.totalMs - HOLD_MS;
  const [up, down] = potsAt(film, shown);
  const pot = up + down;
  const mine = film.entries.some((entry) => entry.mine);
  const result = resultAt(film, shown);
  const won = mine && !film.voided && film.entries.some((entry) => entry.mine && entry.side === film.winner);
  const atRest = !playing && shown >= film.totalMs;

  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]" aria-hidden>
          <span
            className="bg-[var(--up)] transition-[width]"
            style={{ width: pot ? `${(up / pot) * PERCENT}%` : "0%" }}
          />
          <span
            className="bg-[var(--down)] transition-[width]"
            style={{ width: pot ? `${(down / pot) * PERCENT}%` : "0%" }}
          />
        </div>
        <span className="nx-num text-[13px] text-[var(--muted)]">{format(pot)}</span>
        {result !== null ? (
          <span
            className={cx(
              "nx-num min-w-[72px] text-right text-[17px] font-semibold",
              result >= 0 ? "text-[var(--up-text)]" : "text-[var(--down-text)]",
            )}
          >
            {result >= 0 ? "+" : "−"}
            {usd(Math.abs(satsToUsd(film, result)))}
          </span>
        ) : null}
      </div>
      <div ref={box} className="relative h-[240px] md:h-[320px]">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        {done ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-4">
              <RoundStamp
                state={film.voided ? "void" : "settled"}
                winner={film.winner}
                size={STAMP_SIZE}
                className="nx-stamp-in"
              />
              {mine ? <SealStamp verdict={film.voided ? "void" : won ? "hit" : "miss"} size={SEAL_SIZE} /> : null}
            </div>
            {/* The stamps in plain words (his rule: no glyph without its meaning). */}
            <p className="nx-glass rounded-full px-4 py-1.5 font-semibold text-[14px]">
              {film.voided ? "Refunded · nobody took the other side" : film.winner === 0 ? "Up won" : "Down won"}
              {mine && !film.voided ? (won ? " · you were right" : " · not this time") : ""}
            </p>
            {atRest ? (
              <button
                type="button"
                onClick={start}
                className="pointer-events-auto flex h-11 items-center gap-2 rounded-full bg-[var(--vermilion)] pr-5 pl-4 font-semibold text-[15px] text-white shadow-[0_10px_30px_-10px_var(--vermilion)]"
              >
                <Play aria-hidden className="size-4" fill="currentColor" /> Replay
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (playing ? setPlaying(false) : start())}
          aria-label={playing ? "Pause" : atRest ? "Replay" : "Play"}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--surface-2)]"
        >
          {playing ? (
            <Pause aria-hidden className="size-4" fill="currentColor" />
          ) : atRest ? (
            <RotateCcw aria-hidden className="size-4" />
          ) : (
            <Play aria-hidden className="size-4" fill="currentColor" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={film.totalMs}
          step={10}
          value={shown}
          aria-label="Replay position"
          onChange={(event) => {
            setPlaying(false);
            time.current = Number(event.target.value);
            setShown(time.current);
            paint();
          }}
          className="h-1 flex-1 cursor-pointer accent-[var(--vermilion)]"
        />
        <span className="nx-eyebrow w-12 text-right">
          {shown < ENTRIES_MS ? "entries" : shown < ENTRIES_MS + LOCK_MS ? "lock" : done ? "result" : "live"}
        </span>
        <button
          type="button"
          onClick={() => {
            const next = !sound;
            setSound(next);
            try {
              localStorage.setItem(SOUND_KEY, next ? "on" : "off");
            } catch {
              // Kept for this page.
            }
          }}
          aria-label={sound ? "Mute the replay" : "Unmute the replay"}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--ink-2)]"
        >
          {sound ? <Volume2 aria-hidden className="size-4" /> : <VolumeX aria-hidden className="size-4" />}
        </button>
      </div>
    </div>
  );
}
