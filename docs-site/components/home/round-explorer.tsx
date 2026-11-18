"use client"

import { ArrowUpRight, RotateCcw } from "lucide-react"
import { type KeyboardEvent, type PointerEvent, useMemo, useRef, useState } from "react"
import round785 from "@/data/round-785.json"

/*
 * The docs' front piece: a real round from Bitcoin Cash mainnet (BTC, 5 minutes, round 785), its price path as the
 * engine kept it, the line to beat General Protocols signed at the lock, and both tickets. Drag the close and the
 * plates show what the contract pays each ticket for that close, with the same arithmetic as MasterLocked and
 * MasterSweep (packages/sdk/src/round/payout.ts): a tie refunds everyone, otherwise the winning side splits the whole
 * pot by stake. The six transactions underneath are the round's real ones.
 */

const EXPLORER = "https://explorer.bch.ninja/tx/"
const CENTS = 100
const MS = 1000
/** The contract's numbers (packages/sdk/src/round/constants.ts). */
const PROTOCOL_FEE_BPS = 200
const BPS = 10_000
const MIN_FEE_OUTPUT = 1000
const TICKET_DUST = 1200
const SWEEP_FEE_PER_TICKET = 250
/** Chart geometry, in viewBox units. */
const W = 1000
const H = 360
const PAD_SHARE = 0.35
/** A close this close to the line (share of the visible range) snaps onto it: a tie. */
const TIE_SNAP = 0.012
const KEY_STEP = 5
const KEY_STEP_BIG = 50

type Side = 0 | 1
const { round, path, prints, entries, transactions } = round785 as {
  round: typeof round785.round
  path: [number, number][]
  prints: [number, number][]
  entries: { at: number; outcome: number; stake: number; status: string; payoutSats: number }[]
  transactions: { kind: string; txid: string }[]
}

const strike = round.strikePrice / CENTS
const realClose = round.closePrice / CENTS
const start = path[0]?.[0] ?? round.lockTime * MS
const end = round.closeTime * MS
const lockAt = round.lockTime * MS
const prices = [...path.map((p) => p[1]), ...prints.map((p) => p[1]), strike]
const lo = Math.min(...prices)
const hi = Math.max(...prices)
const pad = (hi - lo) * PAD_SHARE
const yMin = lo - pad
const yMax = hi + pad

const x = (t: number) => ((t - start) / (end - start)) * W
const y = (p: number) => H - ((p - yMin) / (yMax - yMin)) * H
const pct = (v: number, of: number) => `${(v / of) * 100}%`

const usd = (p: number) =>
  p.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })
const sats = (n: number) => `${n.toLocaleString("en-US")} sats`

/** What the contract pays every ticket for a given close (tie → refund; else the winners split the pot by stake). */
function payouts(close: number) {
  const winner: Side | null = close === strike ? null : close > strike ? 0 : 1
  const winnerTotal = winner === null ? 0 : (round.totals[winner] ?? 0)
  const rawFee = Math.floor((round.pot * PROTOCOL_FEE_BPS) / BPS)
  const fee = winner === null || rawFee < MIN_FEE_OUTPUT ? 0 : rawFee
  const pot = round.pot - fee
  const paid = entries.map((entry) => {
    const share =
      winner === null ? entry.stake : entry.outcome === winner ? Math.floor((entry.stake * pot) / winnerTotal) : 0
    return share + TICKET_DUST - SWEEP_FEE_PER_TICKET
  })
  return { winner, fee, rawFee, pot, winnerTotal, paid }
}

const toPath = (points: [number, number][]) =>
  points.map(([t, p], i) => `${i === 0 ? "M" : "L"}${x(t).toFixed(1)} ${y(p).toFixed(1)}`).join("")
const before = path.filter(([t]) => t <= lockAt)
const after = path.filter(([t]) => t >= lockAt)
const lockPrice = after[0]?.[1] ?? strike

const KIND: Record<string, string> = { "lane-open": "Open", enter: "Enter", lock: "Lock", settle: "Settle", sweep: "Pay" }

export function RoundExplorer() {
  const [close, setClose] = useState(realClose)
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const result = useMemo(() => payouts(close), [close])
  const changed = close !== realClose

  const fromPointer = (event: PointerEvent) => {
    const rect = box.current?.getBoundingClientRect()
    if (!rect) return
    const share = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    let price = yMax - share * (yMax - yMin)
    if (Math.abs(price - strike) < (yMax - yMin) * TIE_SNAP) price = strike
    setClose(Math.round(price * CENTS) / CENTS)
  }
  const onKey = (event: KeyboardEvent) => {
    const step = event.shiftKey ? KEY_STEP_BIG : KEY_STEP
    if (event.key === "ArrowUp") setClose((c) => Math.min(yMax, Math.round((c + step) * CENTS) / CENTS))
    else if (event.key === "ArrowDown") setClose((c) => Math.max(yMin, Math.round((c - step) * CENTS) / CENTS))
    else if (event.key === "Home") setClose(strike)
    else return
    event.preventDefault()
  }

  const verdict =
    result.winner === null ? "Tie: everyone gets their stake back" : result.winner === 0 ? "Up wins" : "Down wins"
  const enterTx = transactions.filter((t) => t.kind === "enter")

  return (
    <div className="overflow-hidden rounded-[28px] border border-fd-border bg-surface">
      {/* The round */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 pt-5 sm:px-7 sm:pt-6">
        {/* biome-ignore lint/performance/noImgElement: a static export; the coin is a tiny SVG */}
        <img src="/logos/coin-btc.svg" alt="" width={28} height={28} />
        <span className="font-display text-[17px] font-bold tracking-[-0.03em]">BTC · 5 min</span>
        <span className="label-mono">18 Nov 2026 · 17:30 → 17:35 UTC</span>
        <span className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-vermilion px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.06em] text-white uppercase">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-[live-ping_1.6s_ease-out_infinite] rounded-full bg-white" />
            <span className="relative size-1.5 rounded-full bg-white" />
          </span>
          Mainnet round
        </span>
      </div>

      {/* The chart: drag anywhere to set the close */}
      <div className="px-2 pt-3 sm:px-4">
        <div
          ref={box}
          className="relative aspect-[1000/360] w-full cursor-ns-resize touch-none select-none"
          onPointerDown={(event) => {
            dragging.current = true
            event.currentTarget.setPointerCapture(event.pointerId)
            fromPointer(event)
          }}
          onPointerMove={(event) => dragging.current && fromPointer(event)}
          onPointerUp={() => {
            dragging.current = false
          }}
        >
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
            <defs>
              <clipPath id="above">
                <rect x={x(lockAt)} y={0} width={W} height={y(strike)} />
              </clipPath>
              <clipPath id="below">
                <rect x={x(lockAt)} y={y(strike)} width={W} height={H} />
              </clipPath>
            </defs>
            {/* The side the close is on, washed */}
            {result.winner !== null ? (
              <rect
                x={x(lockAt)}
                width={W - x(lockAt)}
                y={result.winner === 0 ? 0 : y(strike)}
                height={result.winner === 0 ? y(strike) : H - y(strike)}
                fill={result.winner === 0 ? "var(--up-text)" : "var(--down-text)"}
                opacity={0.08}
              />
            ) : null}
            {/* Entries open, then the live part split by the line */}
            <path d={toPath(before)} fill="none" stroke="var(--muted)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
            <path
              d={toPath(after)}
              clipPath="url(#above)"
              fill="none"
              stroke="var(--up-text)"
              strokeWidth={2.5}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={toPath(after)}
              clipPath="url(#below)"
              fill="none"
              stroke="var(--down-text)"
              strokeWidth={2.5}
              vectorEffect="non-scaling-stroke"
            />
            {/* The line to beat, from the lock */}
            <line
              x1={x(lockAt)}
              x2={W}
              y1={y(strike)}
              y2={y(strike)}
              stroke="var(--vermilion)"
              strokeWidth={2}
              strokeDasharray="7 6"
              vectorEffect="non-scaling-stroke"
            />
            {/* Lock and close */}
            {[lockAt, end].map((t) => (
              <line
                key={t}
                x1={x(t)}
                x2={x(t)}
                y1={0}
                y2={H}
                stroke="var(--hairline)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {/* What-if: from the real last price to the chosen close */}
            {changed ? (
              <line
                x1={x(path.at(-1)?.[0] ?? end)}
                y1={y(path.at(-1)?.[1] ?? realClose)}
                x2={W}
                y2={y(close)}
                stroke="var(--ink-2)"
                strokeWidth={1.5}
                strokeDasharray="3 5"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>

          {/* Signed prices: one a minute from General Protocols */}
          {prints.map(([t, p]) =>
            t >= start && t <= end ? (
              <span
                key={t}
                className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink-2 bg-surface"
                style={{ left: pct(x(t), W), top: pct(y(p), H) }}
              />
            ) : null,
          )}

          <span className="label-mono pointer-events-none absolute top-1 -translate-x-1/2" style={{ left: pct(x(lockAt), W) }}>
            Lock
          </span>
          <span className="label-mono pointer-events-none absolute top-1 right-1">Close</span>
          <span
            className="pointer-events-none absolute -translate-y-full pb-1 font-mono text-[11px] text-vermilion sm:text-[12px]"
            style={{ left: pct(x(lockAt) + 8, W), top: pct(y(strike), H) }}
          >
            Line to beat {usd(strike)}
          </span>
          <span
            className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-vermilion"
            style={{ left: pct(x(lockAt), W), top: pct(y(lockPrice), H) }}
          />

          {/* The close: the handle you drag */}
          <div
            role="slider"
            tabIndex={0}
            aria-label="Closing price"
            aria-valuemin={Math.round(yMin)}
            aria-valuemax={Math.round(yMax)}
            aria-valuenow={close}
            aria-valuetext={`${usd(close)}: ${verdict}`}
            onKeyDown={onKey}
            className="absolute right-0 flex -translate-y-1/2 translate-x-[2px] items-center gap-1.5 outline-none"
            style={{ top: pct(y(close), H) }}
          >
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold sm:text-[12px] ${
                result.winner === 0
                  ? "bg-up text-up-ink"
                  : result.winner === 1
                    ? "bg-down text-down-ink"
                    : "bg-fd-foreground text-fd-background"
              }`}
            >
              {usd(close)}
            </span>
            <span className="size-4 rounded-full border-[3px] border-fd-background bg-fd-foreground shadow-[0_0_0_6px_color-mix(in_oklab,var(--ink)_14%,transparent)]" />
          </div>
        </div>
      </div>

      {/* What the contract pays */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 pt-5 sm:px-7">
        <p className="font-display text-[22px] font-bold tracking-[-0.035em] sm:text-[26px]" aria-live="polite">
          {verdict}
        </p>
        <p className="font-mono text-[12px] text-fd-muted-foreground">
          {changed ? "Drag the close · your what-if" : `Real close ${usd(realClose)} · drag it`}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 px-3 pt-3 sm:gap-3 sm:px-5">
        {([0, 1] as const).map((side) => {
          const entry = entries.find((e) => e.outcome === side)
          const index = entries.findIndex((e) => e.outcome === side)
          const won = result.winner === side
          const paid = index >= 0 ? (result.paid[index] ?? 0) : 0
          return (
            <div
              key={side}
              className={`rounded-[20px] p-4 transition-colors sm:p-5 ${
                won ? (side === 0 ? "bg-up text-up-ink" : "bg-down text-down-ink") : "bg-surface-2"
              }`}
            >
              <p className="font-display text-[18px] font-bold tracking-[-0.03em]">
                {side === 0 ? "▲ Up" : "▼ Down"}
              </p>
              <p className={`mt-3 font-mono text-[12px] ${won ? "opacity-70" : "text-fd-muted-foreground"}`}>Staked</p>
              <p className="font-mono text-[15px] font-semibold">{sats(entry?.stake ?? 0)}</p>
              <p className={`mt-2 font-mono text-[12px] ${won ? "opacity-70" : "text-fd-muted-foreground"}`}>
                {result.winner === null ? "Refunded" : won ? "Paid" : "Deposit back"}
              </p>
              <p className="font-mono text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">{sats(paid)}</p>
            </div>
          )
        })}
      </div>

      {/* The arithmetic, as the contract does it */}
      <p className="px-5 pt-4 font-mono text-[12px] leading-relaxed text-fd-muted-foreground sm:px-7">
        {result.winner === null
          ? `Close = line: no winner, so each ticket gets its stake and its ${sats(TICKET_DUST)} deposit back, less ${SWEEP_FEE_PER_TICKET} for the sweep.`
          : `Winner: stake × ${round.pot.toLocaleString("en-US")} pot ÷ ${result.winnerTotal.toLocaleString("en-US")} on its side, plus its deposit less ${SWEEP_FEE_PER_TICKET}. The 2% fee (${result.rawFee} sats) is under the ${MIN_FEE_OUTPUT.toLocaleString("en-US")}-sat minimum, so it stays in the pot.`}
      </p>

      {/* The round's real transactions */}
      <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-fd-border px-5 py-4 sm:px-7">
        <span className="label-mono me-1">On chain</span>
        {transactions.map((t) => {
          const side = t.kind === "enter" ? (enterTx[0]?.txid === t.txid ? " ▲" : " ▼") : ""
          return (
            <a
              key={t.txid}
              href={`${EXPLORER}${t.txid}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[11.5px] hover:bg-fd-accent"
            >
              {KIND[t.kind] ?? t.kind}
              {side}
              <ArrowUpRight className="size-3 opacity-60" aria-hidden />
            </a>
          )
        })}
        {changed ? (
          <button
            type="button"
            onClick={() => setClose(realClose)}
            className="ms-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-medium hover:bg-fd-accent"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Real close
          </button>
        ) : null}
      </div>
    </div>
  )
}
