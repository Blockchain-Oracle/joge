"use client"

import { useRef } from "react"
import { Caps, Chip, Gates, Ground, Master, Path, Square, Stub, Traveller, VaultBox } from "./kit"
import { useCompact } from "./use-compact"

/*
 * FIG 3 · Who touches what. Your path is vermilion: your browser builds the entry from live coins and your wallet signs
 * it into a gate; the payout comes back to your wallet. Jōge's servers only lock, settle, pay and place agents' bets,
 * and General Protocols' signed prices are checked by the round contracts themselves.
 */

const SQUARE = <rect x="0" y="2" width="14" height="14" fill="none" stroke="var(--ink)" strokeWidth="2.4" />

function Wide() {
  const k = 1
  const enter = "M235 210H428"
  const payout = "M424 335H235"
  return (
    <svg viewBox="0 0 960 580" className="block h-auto w-full" role="img" aria-label="Who touches what: your wallet and browser, the round contracts on Bitcoin Cash, Jōge's servers, General Protocols">
      <Ground id="fig3w" w={960} h={580} caption="FIG 3 · WHO TOUCHES WHAT" />
      {/* General Protocols signs; the contracts check */}
      <Chip at={{ x: 480, y: 76 }} label="General Protocols" w={230} icon={SQUARE} />
      <Path d="M480 98V138" tone="muted" dashed />
      <Path d="M595 76H810V160" tone="muted" dashed />
      <Square at={{ x: 480, y: 118 }} />

      {/* Bitcoin Cash */}
      <rect x="340" y="140" width="280" height="370" rx="26" fill="var(--surface-1)" stroke="var(--hairline)" strokeWidth="1.5" />
      <Caps at={{ x: 480, y: 172 }}>Bitcoin Cash</Caps>
      <Gates at={{ x: 480, y: 210 }} />
      <Master at={{ x: 480, y: 272 }} />
      <Stub at={{ x: 480, y: 335 }} tone="up" w={96} />
      <VaultBox at={{ x: 480, y: 440 }} w={96} h={70} />
      <Caps at={{ x: 480, y: 495 }}>agent vault</Caps>

      {/* You */}
      <Chip at={{ x: 150, y: 210 }} label="Your browser" w={170} tone="you" k={k} />
      <Chip at={{ x: 150, y: 335 }} label="Your wallet" w={170} tone="you" k={k} />
      <Path d="M150 232V313" tone="you" width={2} />
      <Path d={enter} tone="you" width={3} label="enter" at={{ x: 330, y: 198 }} />
      <Path d={payout} tone="you" width={3} dashed label="payout" at={{ x: 330, y: 323 }} />
      <Traveller d={enter} tone="you" dur={2.2} />
      <Traveller d={payout} tone="up" dur={2.2} delays={[1.1]} />

      {/* Jōge's servers */}
      <rect x="700" y="160" width="220" height="330" rx="24" fill="none" stroke="var(--hairline)" strokeWidth="1.5" strokeDasharray="6 6" />
      <Caps at={{ x: 810, y: 192 }}>Jōge servers</Caps>
      <Chip at={{ x: 810, y: 242 }} label="keeper" w={170} />
      <Chip at={{ x: 810, y: 306 }} label="agents" w={170} />
      <Chip at={{ x: 810, y: 370 }} label="indexer" w={170} />
      <Chip at={{ x: 810, y: 434 }} label="web app" w={170} />
      <Path d="M725 242H650V272H504" tone="ink" label="lock · settle · pay" at={{ x: 577, y: 260 }} />
      <Path d="M725 306H660V440H528" tone="ink" label="bets" at={{ x: 668, y: 425 }} anchor="start" />
      <Path d="M620 370H725" tone="muted" dashed />
      <Path d="M810 456V545H60V210H65" tone="muted" dashed label="live stream" at={{ x: 470, y: 535 }} />
    </svg>
  )
}

function Tall() {
  const k = 1.3
  const enter = "M150 112V232"
  const payout = "M390 316V112"
  return (
    <svg viewBox="0 0 540 860" className="block h-auto w-full" role="img" aria-label="Who touches what">
      <Ground id="fig3t" w={540} h={860} caption="FIG 3 · WHO TOUCHES WHAT" k={k} />
      <Chip at={{ x: 150, y: 90 }} label="Browser" w={200} tone="you" k={k} />
      <Chip at={{ x: 390, y: 90 }} label="Wallet" w={200} tone="you" k={k} />
      <Path d="M250 90H290" tone="you" />

      <rect x="30" y="160" width="480" height="300" rx="26" fill="var(--surface-1)" stroke="var(--hairline)" strokeWidth="1.5" />
      <Caps at={{ x: 270, y: 192 }} k={k}>
        Bitcoin Cash
      </Caps>
      <Gates at={{ x: 150, y: 250 }} k={k} />
      <Master at={{ x: 270, y: 320 }} />
      <Stub at={{ x: 390, y: 334 }} tone="up" w={96} />
      <VaultBox at={{ x: 270, y: 405 }} w={90} h={60} />

      <Path d={enter} tone="you" width={3} label="enter" at={{ x: 160, y: 146 }} anchor="start" k={k} />
      <Path d={payout} tone="you" width={3} dashed label="payout" at={{ x: 380, y: 146 }} anchor="end" k={k} />
      <Traveller d={enter} tone="you" dur={1.8} />
      <Traveller d={payout} tone="up" dur={1.8} delays={[0.9]} />

      <Chip at={{ x: 330, y: 515 }} label="General Protocols" w={260} icon={SQUARE} k={k} />
      <Path d="M330 493V460" tone="muted" dashed />

      <rect x="30" y="570" width="480" height="250" rx="24" fill="none" stroke="var(--hairline)" strokeWidth="1.5" strokeDasharray="6 6" />
      <Caps at={{ x: 270, y: 604 }} k={k}>
        Jōge servers
      </Caps>
      <Chip at={{ x: 150, y: 660 }} label="keeper" w={190} k={k} />
      <Chip at={{ x: 390, y: 660 }} label="agents" w={190} k={k} />
      <Chip at={{ x: 150, y: 740 }} label="indexer" w={190} k={k} />
      <Chip at={{ x: 390, y: 740 }} label="web app" w={190} k={k} />
      <Path d="M150 638V552H52V320H246" tone="ink" />
      <Path d="M390 638V552H488V405H315" tone="ink" />
    </svg>
  )
}

export function SystemFigure() {
  const box = useRef<HTMLDivElement>(null)
  const compact = useCompact(box)
  return <div ref={box}>{compact ? <Tall /> : <Wide />}</div>
}
