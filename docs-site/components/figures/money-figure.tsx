"use client"

import { useRef } from "react"
import { useCompact } from "./use-compact"

/*
 * FIG 2 · Where the sats go. Round 785's real money: the two stakes, the pot, the fee the contract didn't take (510
 * sats is under its 1,000-sat minimum), and the payouts. The loser's 950 comes from its own ticket deposit, so that
 * line runs around the pot, not through it. Coins drift along the winner's path. Left to right on desktop, top to
 * bottom on phones.
 */

type Spot = { x: number; y: number }
type Scene = {
  w: number
  h: number
  k: number
  up: Spot
  down: Spot
  pot: Spot
  fee: Spot
  win: Spot
  back: Spot
  heads?: { label: string; x: number; y: number }[]
  paths: { win: string; lose: string; pay: string; deposit: string }
}

const WIDE: Scene = {
  w: 960,
  h: 540,
  k: 1,
  up: { x: 170, y: 230 },
  down: { x: 170, y: 370 },
  pot: { x: 480, y: 230 },
  fee: { x: 480, y: 360 },
  win: { x: 800, y: 230 },
  back: { x: 800, y: 370 },
  heads: [
    { label: "STAKES", x: 170, y: 120 },
    { label: "THE ROUND", x: 480, y: 120 },
    { label: "PAID OUT", x: 800, y: 120 },
  ],
  paths: {
    win: "M260 230H390",
    lose: "M260 370H360q20 0 20 -20V290q0 -20 20 -20H410",
    pay: "M550 230H720",
    deposit: "M260 392V450H780V392",
  },
}

const TALL: Scene = {
  w: 540,
  h: 780,
  k: 1.3,
  up: { x: 140, y: 130 },
  down: { x: 400, y: 130 },
  pot: { x: 200, y: 360 },
  fee: { x: 410, y: 360 },
  win: { x: 140, y: 640 },
  back: { x: 400, y: 640 },
  paths: {
    win: "M140 162V300",
    lose: "M400 162V230q0 20 -20 20H260q-20 0 -20 20V300",
    pay: "M200 392V560q0 20 -20 20H160q-20 0 -20 20V610",
    deposit: "M490 130H514V640H490",
  },
}

export function MoneyFigure() {
  const box = useRef<HTMLDivElement>(null)
  const S = useCompact(box) ? TALL : WIDE
  const { k } = S
  return (
    <div ref={box}>
      <svg viewBox={`0 0 ${S.w} ${S.h}`} className="block h-auto w-full" role="img" aria-label="Round 785's stakes, pot and payouts">
        <defs>
          <pattern id="fig2-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--hairline)" />
          </pattern>
        </defs>
        <rect width={S.w} height={S.h} fill="url(#fig2-dots)" />
        <text x="24" y="36" fontSize={12 * k} className="fill-[var(--muted)] font-mono tracking-[0.12em]">
          FIG 2 · WHERE THE SATS GO
        </text>
        {S.heads?.map((head) => (
          <text key={head.label} x={head.x} y={head.y} textAnchor="middle" fontSize={13} className="fill-[var(--muted)] font-mono tracking-[0.12em]">
            {head.label}
          </text>
        ))}

        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={S.paths.win} stroke="var(--up-text)" strokeWidth="3" />
          <path d={S.paths.lose} stroke="var(--down-text)" strokeWidth="3" />
          <path d={S.paths.pay} stroke="var(--up-text)" strokeWidth="5" />
          <path d={S.paths.deposit} stroke="var(--muted)" strokeWidth="2" strokeDasharray="5 6" />
        </g>
        {[0, 1, 2].map((i) => (
          <circle key={`${S.w}-${i}`} r="6" fill="var(--up)">
            <animateMotion dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" path={S.paths.pay} />
          </circle>
        ))}

        <Plate at={S.up} side="up" label="13,655" k={k} />
        <Plate at={S.down} side="down" label="11,845" k={k} />

        {[0, 1, 2, 3].map((i) => (
          <ellipse
            key={i}
            cx={S.pot.x}
            cy={S.pot.y + 18 - i * 12}
            rx="64"
            ry="18"
            fill="var(--surface-2)"
            stroke="var(--vermilion)"
            strokeWidth="2"
          />
        ))}
        <text x={S.pot.x} y={S.pot.y - 44} textAnchor="middle" fontSize={18 * k} className="fill-[var(--ink)] font-mono font-semibold">
          25,500
        </text>

        <g transform={`translate(${S.fee.x} ${S.fee.y})`}>
          <rect x="-74" y="-20" width="148" height="40" rx="20" fill="var(--bg)" stroke="var(--hairline)" strokeWidth="2" />
          <text textAnchor="middle" y="6" fontSize={14 * Math.min(k, 1.15)} className="fill-[var(--muted)] font-mono">
            2% · 510
          </text>
          <line x1="-56" x2="56" y1="0" y2="0" stroke="var(--vermilion)" strokeWidth="2.5" />
          <text textAnchor="middle" y="46" fontSize={12 * k} className="fill-[var(--muted)] font-mono">
            under 1,000
          </text>
          <text textAnchor="middle" y={46 + 18 * k} fontSize={12 * k} className="fill-[var(--muted)] font-mono">
            stays in the pot
          </text>
        </g>

        <Payout at={S.win} label="26,450" tone="up" k={k} />
        <Payout at={S.back} label="950 back" tone="muted" k={k} />
      </svg>
    </div>
  )
}

function Plate({ at, side, label, k }: { at: Spot; side: "up" | "down"; label: string; k: number }) {
  const up = side === "up"
  const { x, y } = at
  return (
    <g>
      <rect x={x - 90} y={y - 26} width="180" height="58" rx="14" fill={up ? "var(--up-edge)" : "var(--down-edge)"} />
      <rect x={x - 90} y={y - 30} width="180" height="56" rx="14" fill={up ? "var(--up)" : "var(--down)"} />
      <text x={x - 66} y={y + 7} fontSize={22} className="font-jp" fill={up ? "var(--up-ink)" : "var(--down-ink)"}>
        {up ? "上" : "下"}
      </text>
      <text x={x + 70} y={y + 6} textAnchor="end" fontSize={18 * Math.min(k, 1.15)} className="font-mono font-semibold" fill={up ? "var(--up-ink)" : "var(--down-ink)"}>
        {label}
      </text>
    </g>
  )
}

function Payout({ at, label, tone, k }: { at: Spot; label: string; tone: "up" | "muted"; k: number }) {
  const { x, y } = at
  return (
    <g>
      <rect
        x={x - 80}
        y={y - 26}
        width="160"
        height="52"
        rx="26"
        fill="var(--surface-2)"
        stroke={tone === "up" ? "var(--up-text)" : "var(--hairline)"}
        strokeWidth="2.5"
      />
      <text x={x} y={y + 7} textAnchor="middle" fontSize={18 * Math.min(k, 1.15)} className="font-mono font-semibold" fill={tone === "up" ? "var(--up-text)" : "var(--ink-2)"}>
        {label}
      </text>
    </g>
  )
}
