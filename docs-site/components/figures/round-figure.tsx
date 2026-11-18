"use client"

import { Pause, Play, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import round785 from "@/data/round-785.json"
import { useCompact } from "./use-compact"

/*
 * FIG 1 · A round. Mainnet round 785 (BTC, 5 min) as one scene driven by a playhead: its real price path above, and
 * the five moments of its life with the tokens each one makes (gate plates, tickets, the pot, the verdict, the
 * payouts). Wide layout for desktop; on phones the moments stack under the chart.
 */

const STATIONS = ["Open", "Enter", "Lock", "Settle", "Pay"] as const
const WIDE_X = [130, 312, 494, 676, 858]
const TALL_STEP = 92
/** Where each phase ends on the playhead (0..1). */
const PHASE = { open: 0.12, enter: 0.3, lock: 0.42, live: 0.78, settle: 0.88, pay: 1 } as const
const DURATION_MS = 10_000
const CENTS = 100
const MS = 1000
const PAD = 0.18

type Point = { x: number; y: number }
type Layout = {
  w: number
  h: number
  chart: { x0: number; x1: number; y0: number; y1: number }
  dot: (i: number) => Point
  token: (i: number) => Point
  label: { dx: number; dy: number; anchor: "middle" | "start" }
  stack: "v" | "h"
  /** Text scale, so labels stay legible when the tall layout is drawn small. */
  k: number
}

const WIDE: Layout = {
  w: 960,
  h: 540,
  chart: { x0: 70, x1: 890, y0: 64, y1: 270 },
  dot: (i) => ({ x: WIDE_X[i] ?? 0, y: 366 }),
  token: (i) => ({ x: WIDE_X[i] ?? 0, y: 430 }),
  label: { dx: 0, dy: -18, anchor: "middle" },
  stack: "v",
  k: 1,
}
const TALL: Layout = {
  w: 540,
  h: 880,
  chart: { x0: 30, x1: 510, y0: 80, y1: 330 },
  dot: (i) => ({ x: 48, y: 440 + i * TALL_STEP }),
  token: (i) => ({ x: 340, y: 440 + i * TALL_STEP }),
  label: { dx: 22, dy: 6, anchor: "start" },
  stack: "h",
  k: 1.35,
}

const { round, path, prints } = round785 as unknown as {
  round: typeof round785.round
  path: [number, number][]
  prints: [number, number][]
}
const start = path[0]?.[0] ?? round.lockTime * MS
const lock = round.lockTime * MS
const close = round.closeTime * MS
const strike = round.strikePrice / CENTS
const values = [...path.map((p) => p[1]), strike]
const lo = Math.min(...values)
const hi = Math.max(...values)
const yMin = lo - (hi - lo) * PAD
const yMax = hi + (hi - lo) * PAD

const ease = (v: number) => 1 - (1 - v) ** 3
const span = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)))

function clockAt(t: number) {
  if (t < PHASE.enter) return start + (lock - start) * span(t, 0, PHASE.enter)
  if (t < PHASE.lock) return lock
  return lock + (close - lock) * span(t, PHASE.lock, PHASE.live)
}

function stationAt(t: number) {
  if (t < PHASE.open) return 0
  if (t < PHASE.enter) return 1
  if (t < PHASE.live) return 2
  if (t < PHASE.settle) return 3
  return 4
}

export function RoundFigure() {
  const box = useRef<HTMLDivElement>(null)
  const L = useCompact(box) ? TALL : WIDE
  const [t, setT] = useState(1)
  const [playing, setPlaying] = useState(false)
  const frame = useRef(0)
  const started = useRef(false)

  const play = useCallback(() => {
    setPlaying(true)
    const from = performance.now()
    setT(0)
    const step = (now: number) => {
      const next = Math.min(1, (now - from) / DURATION_MS)
      setT(next)
      if (next < 1) frame.current = requestAnimationFrame(step)
      else setPlaying(false)
    }
    frame.current = requestAnimationFrame(step)
  }, [])
  const pause = () => {
    cancelAnimationFrame(frame.current)
    setPlaying(false)
  }

  // Rests on the whole round; plays from the open once it is mostly in view.
  useEffect(() => {
    const node = box.current
    if (!node) return
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started.current) {
          started.current = true
          play()
        }
      },
      { threshold: 0.6 },
    )
    seen.observe(node)
    return () => {
      seen.disconnect()
      cancelAnimationFrame(frame.current)
    }
  }, [play])

  const { chart, k } = L
  const x = (time: number) => chart.x0 + ((time - start) / (close - start)) * (chart.x1 - chart.x0)
  const y = (p: number) => chart.y1 - ((p - yMin) / (yMax - yMin)) * (chart.y1 - chart.y0)
  const line = path.map(([pt, p], i) => `${i ? "L" : "M"}${x(pt).toFixed(1)} ${y(p).toFixed(1)}`).join("")
  const clock = clockAt(t)
  const station = stationAt(t)
  const head = path.reduce((best, point) => (point[0] <= clock ? point : best), path[0] ?? [start, strike])
  const lineDraw = ease(span(t, PHASE.enter, PHASE.lock))
  const show = (a: number, b: number) => ease(span(t, a, b))
  const pay = ease(span(t, PHASE.settle, PHASE.pay - 0.03))
  const first = L.dot(0)
  const last = L.dot(STATIONS.length - 1)
  const at = (i: number) => L.token(i)
  const v = L.stack === "v"

  return (
    <div ref={box} className="flex flex-col">
      <svg viewBox={`0 0 ${L.w} ${L.h}`} className="block h-auto w-full" role="img" aria-label="Round 785 from open to payout">
        <defs>
          <pattern id="fig1-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--hairline)" />
          </pattern>
          <clipPath id="fig1-drawn">
            <rect x="0" y="0" width={x(clock)} height={L.h} />
          </clipPath>
          <clipPath id="fig1-above">
            <rect x={x(lock)} y="0" width={L.w} height={y(strike)} />
          </clipPath>
          <clipPath id="fig1-below">
            <rect x={x(lock)} y={y(strike)} width={L.w} height={L.h} />
          </clipPath>
        </defs>
        <rect width={L.w} height={L.h} fill="url(#fig1-dots)" />
        <text x="24" y="36" fontSize={12 * k} className="fill-[var(--muted)] font-mono tracking-[0.12em]">
          FIG 1 · A ROUND
        </text>

        <g clipPath="url(#fig1-drawn)" fill="none" strokeLinejoin="round" strokeLinecap="round">
          <path d={line} stroke="var(--muted)" strokeWidth={2.5} />
          <g clipPath="url(#fig1-above)">
            <path d={line} stroke="var(--up-text)" strokeWidth={3} />
          </g>
          <g clipPath="url(#fig1-below)">
            <path d={line} stroke="var(--down-text)" strokeWidth={3} />
          </g>
        </g>
        <line
          x1={x(lock)}
          x2={x(lock) + (x(close) - x(lock)) * lineDraw}
          y1={y(strike)}
          y2={y(strike)}
          stroke="var(--vermilion)"
          strokeWidth="2.5"
          strokeDasharray="8 7"
        />
        <text x={x(lock) + 10} y={y(strike) - 10} opacity={lineDraw} fontSize={13 * k} className="fill-[var(--vermilion)] font-mono">
          line to beat
        </text>
        {prints.map(([pt, price]) =>
          pt >= start && pt <= clock ? (
            <rect key={pt} x={x(pt) - 4} y={y(price) - 4} width="8" height="8" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2" />
          ) : null,
        )}
        <circle cx={x(head[0])} cy={y(head[1])} r="6" fill="var(--ink)" />
        {[lock, close].map((mark) => (
          <line key={mark} x1={x(mark)} x2={x(mark)} y1={chart.y0 - 16} y2={chart.y1 + 16} stroke="var(--hairline)" />
        ))}

        {/* The five moments */}
        <line x1={first.x} y1={first.y} x2={last.x} y2={last.y} stroke="var(--hairline)" strokeWidth="2" />
        <line
          x1={first.x}
          y1={first.y}
          x2={first.x + (last.x - first.x) * t}
          y2={first.y + (last.y - first.y) * t}
          stroke="var(--vermilion)"
          strokeWidth="2"
        />
        {STATIONS.map((name, i) => {
          const d = L.dot(i)
          return (
            <g key={name} opacity={i <= station ? 1 : 0.35}>
              <circle cx={d.x} cy={d.y} r="5" fill={i <= station ? "var(--vermilion)" : "var(--muted)"} />
              <text
                x={d.x + L.label.dx}
                y={d.y + L.label.dy}
                textAnchor={L.label.anchor}
                fontSize={13 * k}
                className={`font-mono tracking-[0.12em] ${i === station ? "fill-[var(--ink)]" : "fill-[var(--muted)]"}`}
              >
                {name.toUpperCase()}
              </text>
            </g>
          )
        })}

        <g opacity={show(0, PHASE.open)}>
          <Master x={at(0).x - (v ? 0 : 96)} y={at(0).y} />
          <Gate x={at(0).x - (v ? 40 : 20)} y={at(0).y + (v ? 48 : 0)} n={1} k={k} />
          <Gate x={at(0).x + 40} y={at(0).y + (v ? 48 : 0)} n={2} k={k} />
        </g>
        <g opacity={show(PHASE.open, PHASE.enter)}>
          <Ticket x={at(1).x - (v ? 0 : 66)} y={at(1).y - (v ? 4 : 0)} side="up" label="13,655" k={k} />
          <Ticket x={at(1).x + (v ? 0 : 66)} y={at(1).y + (v ? 46 : 0)} side="down" label="11,845" k={k} />
        </g>
        <g opacity={show(PHASE.enter, PHASE.lock)}>
          <circle cx={at(2).x} cy={at(2).y + (v ? 18 : 0)} r="34" fill="var(--surface-2)" stroke="var(--vermilion)" strokeWidth="2.5" />
          <text x={at(2).x} y={at(2).y + (v ? 23 : 5)} textAnchor="middle" fontSize={14 * k} className="fill-[var(--ink)] font-mono font-semibold">
            25,500
          </text>
        </g>
        <g opacity={show(PHASE.live, PHASE.settle)} transform={`rotate(-4 ${at(3).x} ${at(3).y + (v ? 18 : 0)})`}>
          <rect x={at(3).x - 48} y={at(3).y + (v ? -4 : -22)} width="96" height="44" rx="10" fill="var(--up)" />
          <text x={at(3).x} y={at(3).y + (v ? 25 : 7)} textAnchor="middle" fontSize={19 * k} className="fill-[var(--up-ink)] font-display font-bold">
            ▲ UP
          </text>
        </g>
        <g opacity={show(PHASE.settle, PHASE.settle + 0.04)}>
          <circle
            cx={at(3).x + (at(4).x - at(3).x) * pay}
            cy={at(3).y + (at(4).y - at(3).y) * pay}
            r="7"
            fill="var(--up)"
            opacity={pay < 1 ? 1 : 0}
          />
          <Wallet x={at(4).x - (v ? 0 : 60)} y={at(4).y - (v ? 4 : 0)} label="26,450" tone="up" lit={pay} k={k} />
          <Wallet x={at(4).x + (v ? 0 : 60)} y={at(4).y + (v ? 46 : 0)} label="950" tone="muted" lit={pay} k={k} />
        </g>
      </svg>

      <div className="flex items-center gap-3 px-5 pb-4">
        <button
          type="button"
          onClick={playing ? pause : play}
          aria-label={playing ? "Pause" : "Play the round"}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-fd-foreground text-fd-background"
        >
          {playing ? <Pause className="size-4" /> : t >= 1 ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(t * 1000)}
          aria-label="Playhead"
          onChange={(event) => {
            pause()
            setT(Number(event.target.value) / 1000)
          }}
          className="h-1 flex-1 cursor-pointer accent-[var(--vermilion)]"
        />
      </div>
    </div>
  )
}

function Master({ x, y }: Point) {
  return (
    <g>
      <circle cx={x} cy={y} r="22" fill="var(--surface-2)" stroke="var(--vermilion)" strokeWidth="2.5" />
      <path d={`M${x - 10} ${y}H${x + 10}`} stroke="var(--vermilion)" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

function Gate({ x, y, n, k }: Point & { n: number; k: number }) {
  return (
    <g>
      <rect x={x - 22} y={y - 16} width="44" height="32" rx="8" fill="var(--surface-2)" stroke="var(--ink-2)" strokeWidth="2" />
      <text x={x} y={y + 6} textAnchor="middle" fontSize={15 * Math.min(k, 1.15)} className="font-mono font-semibold" fill="var(--ink)">
        {n}
      </text>
    </g>
  )
}

function Ticket({ x, y, side, label, k }: Point & { side: "up" | "down"; label: string; k: number }) {
  const up = side === "up"
  return (
    <g>
      <path d={`M${x - 56} ${y - 18}h112v12a6 6 0 0 0 0 12v12h-112v-12a6 6 0 0 0 0-12z`} fill={up ? "var(--up)" : "var(--down)"} />
      <text x={x} y={y + 6} textAnchor="middle" fontSize={14 * Math.min(k, 1.2)} className="font-mono font-semibold" fill={up ? "var(--up-ink)" : "var(--down-ink)"}>
        {label}
      </text>
    </g>
  )
}

function Wallet({ x, y, label, tone, lit, k }: Point & { label: string; tone: "up" | "muted"; lit: number; k: number }) {
  return (
    <g opacity={0.35 + 0.65 * lit}>
      <rect
        x={x - 54}
        y={y - 18}
        width="108"
        height="36"
        rx="18"
        fill="var(--surface-2)"
        stroke={tone === "up" ? "var(--up-text)" : "var(--hairline)"}
        strokeWidth="2"
      />
      <text x={x} y={y + 5} textAnchor="middle" fontSize={14 * Math.min(k, 1.2)} className="font-mono font-semibold" fill={tone === "up" ? "var(--up-text)" : "var(--ink-2)"}>
        {label}
      </text>
    </g>
  )
}
