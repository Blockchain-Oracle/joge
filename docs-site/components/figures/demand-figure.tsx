"use client"

import { useRef } from "react"
import { Caps, Ground, Master } from "./kit"
import { useCompact } from "./use-compact"

/*
 * FIG 5 · Awake while watched. A page showing a market wakes it; it stays awake ten minutes after the last look, and
 * the keeper opens its rounds only in that window. Before and after, the lane sleeps: no rounds, no fees.
 */

type Lay = { w: number; h: number; x0: number; x1: number; step: number; look: [number, number]; tail: number; k: number }

const WIDE: Lay = { w: 960, h: 360, x0: 80, x1: 880, step: 80, look: [240, 480], tail: 600, k: 1 }
const TALL: Lay = { w: 540, h: 420, x0: 40, x1: 500, step: 56, look: [150, 300], tail: 380, k: 1.3 }

function Scene({ L, id }: { L: Lay; id: string }) {
  const slots: number[] = []
  for (let x = L.x0 + L.step / 2; x < L.x1; x += L.step) slots.push(x)
  const awake = (x: number) => x > L.look[0] && x <= L.tail
  const rowLook = 140 * (L.k > 1 ? 1.15 : 1)
  const rowLane = rowLook + 120
  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className="block h-auto w-full" role="img" aria-label="A market opens rounds only while someone is looking">
      <Ground id={id} w={L.w} h={L.h} caption="FIG 5 · AWAKE WHILE WATCHED" k={L.k} />
      {/* Someone looking, then ten more minutes */}
      <rect x={L.x0} y={rowLook - 6} width={L.x1 - L.x0} height="12" rx="6" fill="var(--surface-2)" />
      <rect x={L.look[0]} y={rowLook - 6} width={L.look[1] - L.look[0]} height="12" rx="6" fill="var(--vermilion)" />
      <rect x={L.look[1]} y={rowLook - 6} width={L.tail - L.look[1]} height="12" rx="6" fill="var(--vermilion)" opacity="0.35" />
      <circle cx={L.look[0]} cy={rowLook} r="11" fill="var(--bg)" stroke="var(--vermilion)" strokeWidth="3">
        <animate attributeName="r" values="11;14;11" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <Caps at={{ x: (L.look[0] + L.look[1]) / 2, y: rowLook - 22 }} k={L.k} tone="you">
        page open
      </Caps>
      <Caps at={{ x: (L.look[1] + L.tail) / 2, y: rowLook - 22 }} k={L.k}>
        10 min
      </Caps>

      {/* The lane */}
      <line x1={L.x0} x2={L.x1} y1={rowLane} y2={rowLane} stroke="var(--hairline)" strokeWidth="2" />
      {slots.map((x) =>
        awake(x) ? (
          <Master key={x} at={{ x, y: rowLane }} r={L.k > 1 ? 15 : 18} />
        ) : (
          <circle key={x} cx={x} cy={rowLane} r="5" fill="var(--hairline)" />
        ),
      )}
      <Caps at={{ x: (L.x0 + L.look[0]) / 2, y: rowLane + 48 }} k={L.k}>
        asleep
      </Caps>
      <Caps at={{ x: (L.look[0] + L.tail) / 2, y: rowLane + 48 }} k={L.k} tone="ink">
        rounds open
      </Caps>
      <Caps at={{ x: (L.tail + L.x1) / 2, y: rowLane + 48 }} k={L.k}>
        asleep
      </Caps>
    </svg>
  )
}

export function DemandFigure() {
  const box = useRef<HTMLDivElement>(null)
  const compact = useCompact(box)
  return <div ref={box}>{compact ? <Scene L={TALL} id="fig5t" /> : <Scene L={WIDE} id="fig5w" />}</div>
}
