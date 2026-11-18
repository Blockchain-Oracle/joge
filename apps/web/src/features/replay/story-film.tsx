"use client";

import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { confetti, cx, filmCue } from "@/kit";
import type { TicketRow } from "../portfolio/ticket-row.tsx";
import { useMoney } from "../rounds/money.ts";
import { type Palette, readPalette } from "./draw.ts";
import { type Beat, progressAt, STORY_HOLD_MS, type Story, storyOf } from "./story.ts";

const SOUND_KEY = "joge:film-sound";
const OVERLAY_MS = 80;
const PAD_X = 14;
const PAD_Y = 22;
const RANGE_PAD = 0.18;
const LINE_W = 2.6;
const DISC_R = 5;
const HEAD_R = 6;
const HALO_R = 14;
const HALO_ALPHA = 0.25;
const WASH_ALPHA = 0.14;
const DASH_LEN = 6;
const HIT_PX = 14;
const EVEN_W = 1.5;

const OUTCOME_COLOR = (palette: Palette, outcome: Beat["outcome"]) =>
  outcome === "won" ? palette.up : outcome === "lost" ? palette.down : palette.muted;

function drawStory(ctx: CanvasRenderingContext2D, story: Story, t: number, w: number, h: number, palette: Palette) {
  ctx.clearRect(0, 0, w, h);
  const span = Math.max(story.high - story.low, 1);
  const low = story.low - span * RANGE_PAD;
  const high = story.high + span * RANGE_PAD;
  const n = story.beats.length;
  const x = (i: number) => PAD_X + (i / n) * (w - PAD_X * 2);
  const y = (sats: number) => PAD_Y + (1 - (sats - low) / (high - low)) * (h - PAD_Y * 2);
  const zero = y(0);
  // Break-even: the vermilion line to beat, here your own.
  ctx.save();
  ctx.setLineDash([DASH_LEN, DASH_LEN]);
  ctx.strokeStyle = palette.vermilion;
  ctx.lineWidth = EVEN_W;
  ctx.beginPath();
  ctx.moveTo(PAD_X, zero);
  ctx.lineTo(w - PAD_X, zero);
  ctx.stroke();
  ctx.restore();
  const { landed, partial } = progressAt(story, t);
  const points: Array<[number, number, Beat | null]> = [[x(0), zero, null]];
  for (let i = 0; i < landed; i++) {
    const beat = story.beats[i];
    if (beat) points.push([x(i + 1), y(beat.total), beat]);
  }
  const next = story.beats[landed];
  const last = points.at(-1);
  if (next && last && partial > 0) {
    points.push([last[0] + (x(landed + 1) - last[0]) * partial, last[1] + (y(next.total) - last[1]) * partial, null]);
  }
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1] ?? [0, 0];
    const [x1, y1] = points[i] ?? [0, 0];
    const above = (y0 + y1) / 2 <= zero;
    ctx.strokeStyle = above ? palette.upLine : palette.downLine;
    ctx.lineWidth = LINE_W;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.globalAlpha = WASH_ALPHA;
    ctx.fillStyle = above ? palette.up : palette.down;
    ctx.beginPath();
    ctx.moveTo(x0, zero);
    ctx.lineTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1, zero);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  for (const [px, py, beat] of points) {
    if (!beat) continue;
    ctx.fillStyle = OUTCOME_COLOR(palette, beat.outcome);
    ctx.beginPath();
    ctx.arc(px, py, DISC_R, 0, Math.PI * 2);
    ctx.fill();
  }
  const head = points.at(-1);
  if (head) {
    const color = head[1] <= zero ? palette.up : palette.down;
    ctx.globalAlpha = HALO_ALPHA;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(head[0], head[1], HALO_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(head[0], head[1], HEAD_R, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * A player's story as a film (the portfolio replay): the running net drawn round by round, each beat a disc in its
 * outcome's colour with its own sound, the net counting up and down; at rest it shows the whole story with Replay.
 * Tap a disc to watch that round's film.
 */
export function StoryFilm({ rows, big = false, className }: { rows: TicketRow[]; big?: boolean; className?: string }) {
  const story = useMemo(() => storyOf(rows), [rows]);
  if (!story) return null;
  return <StoryPlayer story={story} big={big} className={className} />;
}

function StoryPlayer({ story, big, className }: { story: Story; big: boolean; className: string | undefined }) {
  const router = useRouter();
  const money = useMoney();
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const time = useRef(story.totalMs);
  const palette = useRef<Palette | null>(null);
  const size = useRef({ width: 0, height: 0 });
  const [shown, setShown] = useState(story.totalMs);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(true);

  const paint = useCallback(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context || size.current.width === 0) return;
    palette.current ??= readPalette(element);
    const ratio = window.devicePixelRatio || 1;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawStory(context, story, time.current, size.current.width, size.current.height, palette.current);
  }, [story]);

  useEffect(() => {
    try {
      setSound(localStorage.getItem(SOUND_KEY) !== "off");
    } catch {
      // Sound stays on.
    }
  }, []);

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

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let lastOverlay = 0;
    let frame = 0;
    const end = story.totalMs - STORY_HOLD_MS;
    const tick = (stamp: number) => {
      const from = time.current;
      const to = Math.min(story.totalMs, from + (stamp - last));
      last = stamp;
      time.current = to;
      if (sound) for (const cue of story.cues) if (cue.at > from && cue.at <= to) filmCue(cue.cue, cue.step);
      if (from < end && to >= end && (story.beats.at(-1)?.total ?? 0) > 0) confetti();
      paint();
      if (stamp - lastOverlay > OVERLAY_MS || to >= story.totalMs) {
        lastOverlay = stamp;
        setShown(to);
      }
      if (to >= story.totalMs) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, story, paint, sound]);

  const start = () => {
    if (time.current >= story.totalMs) time.current = 0;
    setPlaying(true);
  };
  const { landed } = progressAt(story, shown);
  const current = story.beats[Math.max(0, landed - 1)];
  const net = landed === 0 ? 0 : (current?.total ?? 0);
  const atRest = !playing && shown >= story.totalMs;
  const tally = story.beats.slice(0, landed);

  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={cx(
            "nx-num font-semibold leading-none tracking-[-0.04em]",
            big ? "text-[clamp(44px,7vw,72px)]" : "text-[26px]",
            net > 0 ? "text-[var(--up-text)]" : net < 0 ? "text-[var(--down-text)]" : "",
          )}
        >
          {net >= 0 ? "+" : "−"}
          {money.format(Math.abs(net))}
        </span>
        <span className="nx-num text-[13px] text-[var(--muted)]">
          {atRest ? `${story.wins} won · ${story.losses} lost` : (current?.label ?? "")}
        </span>
        <span className="nx-num text-[13px]">
          <span className="text-[var(--up-text)]">{tally.filter((beat) => beat.outcome === "won").length}</span>
          {" · "}
          <span className="text-[var(--down-text)]">{tally.filter((beat) => beat.outcome === "lost").length}</span>
        </span>
      </div>
      <div ref={box} className="relative h-[180px] md:h-[220px]">
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full cursor-pointer"
          onClick={(event) => {
            if (!atRest) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const px = event.clientX - rect.left;
            const n = story.beats.length;
            const index = Math.round(((px - PAD_X) / (rect.width - PAD_X * 2)) * n) - 1;
            const beat = story.beats[index];
            const beatX = PAD_X + ((index + 1) / n) * (rect.width - PAD_X * 2);
            if (beat?.roundId != null && Math.abs(beatX - px) < HIT_PX) router.push(`/r/${beat.roundId}?play=1`);
          }}
        />
        {atRest ? (
          <button
            type="button"
            onClick={start}
            className="absolute bottom-3 left-3 flex h-10 items-center gap-2 rounded-full bg-[var(--vermilion)] pr-4 pl-3.5 font-semibold text-[14px] text-white shadow-[0_10px_30px_-10px_var(--vermilion)]"
          >
            <Play aria-hidden className="size-4" fill="currentColor" /> Replay
          </button>
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
          max={story.totalMs}
          step={10}
          value={shown}
          aria-label="Story position"
          onChange={(event) => {
            setPlaying(false);
            time.current = Number(event.target.value);
            setShown(time.current);
            paint();
          }}
          className="h-1 flex-1 cursor-pointer accent-[var(--vermilion)]"
        />
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
