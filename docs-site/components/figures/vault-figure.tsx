"use client"

import { useRef } from "react"
import { Caps, Chip, Gates, Ground, Path, Stub, Traveller, VaultBox } from "./kit"
import { useCompact } from "./use-compact"

/*
 * FIG 4 · An agent's leash. You fund the vault with a normal payment; the agent's key can spend it only as a bet into a
 * round's gate, under its cap, and the ticket it buys pays you. Anywhere else is refused by the covenant. Only you take
 * everything back.
 */

const KEY = <circle cx="7" cy="9" r="7" fill="none" stroke="var(--ink)" strokeWidth="2.4" />

function Wide() {
  const bet = "M505 240H800"
  return (
    <svg viewBox="0 0 960 470" className="block h-auto w-full" role="img" aria-label="An agent's vault: it can only bet for you, and only you withdraw">
      <Ground id="fig4w" w={960} h={470} caption="FIG 4 · AN AGENT'S LEASH" />
      <Chip at={{ x: 140, y: 240 }} label="Your wallet" w={170} tone="you" />
      <Path d="M225 222H372" tone="you" width={2.5} label="fund" at={{ x: 298, y: 210 }} />
      <Path d="M372 262H225" tone="you" width={2.5} dashed label="withdraw all" at={{ x: 298, y: 290 }} />

      <VaultBox at={{ x: 440, y: 240 }} w={130} h={100} />
      <Caps at={{ x: 440, y: 318 }}>vault · bet ≤ cap</Caps>
      <Chip at={{ x: 440, y: 92 }} label="agent key" w={170} icon={KEY} />
      <Path d="M440 114V188" tone="muted" dashed />

      <Path d={bet} tone="ink" width={3} label="bet" at={{ x: 585, y: 226 }} />
      <Gates at={{ x: 720, y: 240 }} />
      <Stub at={{ x: 862, y: 240 }} tone="you" w={120} label="pays you" />
      <Traveller d={bet} tone="ink" dur={2.4} />
      <Path d="M862 258V410H140V262" tone="you" dashed width={2.5} label="payout" at={{ x: 500, y: 400 }} />

      <Path d="M505 205H560V120H632" tone="down" dashed width={2.5} />
      <text x="640" y="125" fontSize="14" className="font-mono" fill="var(--down-text)">
        ✕ anywhere else
      </text>
    </svg>
  )
}

function Tall() {
  const k = 1.3
  const bet = "M270 342V464"
  return (
    <svg viewBox="0 0 540 660" className="block h-auto w-full" role="img" aria-label="An agent's vault">
      <Ground id="fig4t" w={540} h={660} caption="FIG 4 · AN AGENT'S LEASH" k={k} />
      <Chip at={{ x: 270, y: 96 }} label="Your wallet" w={220} tone="you" k={k} />
      <Path d="M235 118V188" tone="you" width={2.5} label="fund" at={{ x: 225, y: 160 }} anchor="end" k={k} />
      <Path d="M305 188V118" tone="you" width={2.5} dashed label="withdraw" at={{ x: 315, y: 160 }} anchor="start" k={k} />

      <VaultBox at={{ x: 270, y: 240 }} w={130} h={100} />
      <Chip at={{ x: 95, y: 240 }} label="agent" w={130} icon={KEY} k={k} />
      <Path d="M160 240H205" tone="muted" dashed />

      <Path d={bet} tone="ink" width={3} label="bet ≤ cap" at={{ x: 282, y: 412 }} anchor="start" k={k} />
      <Traveller d={bet} tone="ink" dur={1.6} />
      <Gates at={{ x: 270, y: 480 }} k={k} />
      <Path d="M270 498V560" tone="ink" />
      <Stub at={{ x: 270, y: 580 }} tone="you" w={150} label="pays you" k={k} />
      <Path d="M345 580H500V96H380" tone="you" dashed width={2.5} />

      <Path d="M205 278H150V318" tone="down" dashed width={2.5} />
      <text x="150" y="346" textAnchor="middle" fontSize={15 * k} className="font-mono" fill="var(--down-text)">
        ✕ elsewhere
      </text>
    </svg>
  )
}

export function VaultFigure() {
  const box = useRef<HTMLDivElement>(null)
  return <div ref={box}>{useCompact(box) ? <Tall /> : <Wide />}</div>
}
