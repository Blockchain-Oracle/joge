"use client"

import { useRef } from "react"
import { Caps, Ground, Square } from "./kit"
import { useCompact } from "./use-compact"

/*
 * FIG 6 · The line nobody can race. General Protocols signs about once a minute. The lock proves the first message at
 * or after the start (S, with the one before it); the line to beat is the NEXT message, S + 1, signed about a minute
 * after anyone could have locked. The close is the first message at or after the close time.
 */

type Lay = { w: number; h: number; x0: number; step: number; axis: number; k: number }
const WIDE: Lay = { w: 960, h: 340, x0: 90, step: 88, axis: 230, k: 1 }
const TALL: Lay = { w: 540, h: 360, x0: 36, step: 52, axis: 250, k: 1.3 }
const MESSAGES = 10
/** The round starts between message 2 and 3, and closes five minutes (five messages) later. */
const START_AFTER = 2
const LENGTH = 5

function Scene({ L, id }: { L: Lay; id: string }) {
  const xs = Array.from({ length: MESSAGES }, (_, i) => L.x0 + i * L.step)
  const at = (i: number) => xs[i] ?? 0
  const start = (at(START_AFTER) + at(START_AFTER + 1)) / 2
  const close = start + LENGTH * L.step
  const s = START_AFTER + 1
  const lineY = L.axis - 90
  const last = at(MESSAGES - 1)
  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className="block h-auto w-full" role="img" aria-label="Which signed messages lock, set the line and close a round">
      <Ground id={id} w={L.w} h={L.h} caption="FIG 6 · THE LINE NOBODY CAN RACE" k={L.k} />
      <line x1={at(0) - 20} x2={last + 20} y1={L.axis} y2={L.axis} stroke="var(--hairline)" strokeWidth="2" />
      {[start, close].map((x, i) => (
        <g key={x}>
          <line x1={x} x2={x} y1={70} y2={L.axis + 16} stroke="var(--strong-line)" strokeDasharray="4 5" />
          <Caps at={{ x, y: 62 }} k={L.k} tone="ink">
            {i ? "close" : "start"}
          </Caps>
        </g>
      ))}
      {/* The line to beat, from message S + 1 */}
      <line x1={at(s + 1)} x2={close} y1={lineY} y2={lineY} stroke="var(--vermilion)" strokeWidth="3" strokeDasharray="9 7" />
      <path d={`M${at(s + 1)} ${L.axis - 12}V${lineY}`} stroke="var(--vermilion)" strokeWidth="2" />
      <Caps at={{ x: at(s + 1) + 10, y: lineY - 14 }} anchor="start" k={L.k} tone="you">
        the line
      </Caps>
      {xs.map((x, i) => (
        <Square key={x} at={{ x, y: L.axis }} size={14} tone={i === s + 1 ? "you" : "ink"} />
      ))}
      {/* Brackets: the lock pair and the close pair */}
      {[
        { a: s - 1, label: "lock" },
        { a: START_AFTER + LENGTH, label: "close" },
      ].map(({ a, label }) => (
        <g key={label}>
          <path d={`M${at(a)} ${L.axis + 22}v10H${at(a + 1)}v-10`} fill="none" stroke="var(--ink-2)" strokeWidth="2" />
          <Caps at={{ x: (at(a) + at(a + 1)) / 2, y: L.axis + 54 }} k={L.k}>
            {label}
          </Caps>
        </g>
      ))}
      <text x={at(s)} y={L.axis - 20} textAnchor="middle" fontSize={13 * L.k} className="font-mono" fill="var(--ink-2)">
        S
      </text>
      <text x={at(s + 1)} y={L.axis + 54} textAnchor="middle" fontSize={13 * L.k} className="font-mono" fill="var(--vermilion)">
        S+1
      </text>
    </svg>
  )
}

export function LineFigure() {
  const box = useRef<HTMLDivElement>(null)
  const compact = useCompact(box)
  return <div ref={box}>{compact ? <Scene L={TALL} id="fig6t" /> : <Scene L={WIDE} id="fig6w" />}</div>
}
