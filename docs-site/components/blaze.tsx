"use client"

import { Popover } from "@base-ui/react/popover"
import { Banner } from "fumadocs-ui/components/banner"
import { Check, Copy, QrCode } from "lucide-react"
import { useState } from "react"
import { encode } from "uqr"
import { BLAZE, SITE } from "@/lib/site"

const link = "whitespace-nowrap underline decoration-white/30 underline-offset-4 hover:decoration-white"
const SHORT = 6

/** The address as a QR code drawn as one SVG path (no image file, so it follows whatever address the build was given). */
function Qr({ value, size = 200 }: { value: string; size?: number }) {
  const { data, size: cells } = encode(value, { ecc: "M", border: 2 })
  const path = data
    .flatMap((row, y) => row.map((on, x) => (on ? `M${x} ${y}h1v1h-1z` : "")))
    .join("")
  return (
    <svg viewBox={`0 0 ${cells} ${cells}`} width={size} height={size} shapeRendering="crispEdges" aria-hidden>
      <rect width={cells} height={cells} fill="#fff" />
      <path d={path} fill="#050505" />
    </svg>
  )
}

/** The team's CashTokens address: the code to scan, the address in full and a copy button. */
export function CashTokensCard({ framed = false }: { framed?: boolean }) {
  const [copied, setCopied] = useState(false)
  if (!BLAZE.cashtokens) return null
  const bare = BLAZE.cashtokens.replace(/^bitcoincash:/, "")
  const copy = async () => {
    await navigator.clipboard.writeText(BLAZE.cashtokens)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div
      className={`not-prose flex flex-col items-center gap-4 px-5 pt-6 pb-5 ${
        framed ? "mx-auto my-6 max-w-80 rounded-2xl border bg-fd-card" : ""
      }`}
    >
      <p className="label-mono">/ Send to Jōge</p>
      <div className="rounded-[1.25rem] bg-white p-2">
        <Qr value={BLAZE.cashtokens} />
      </div>
      <p className="max-w-full break-all text-center font-mono text-xs leading-relaxed">
        <span className="text-fd-muted-foreground">bitcoincash:</span>
        {bare}
      </p>
      <button
        type="button"
        onClick={copy}
        className="flex items-center gap-2 rounded-full bg-fd-muted px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-fd-accent"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy address"}
      </button>
    </div>
  )
}

/**
 * The strip every BCH BLAZE entry carries, here above every docs page as on the app: the event and track, the demo
 * film, the Widget Factory deck, the source and the CashTokens address with its QR code. Items appear once the build is given them.
 */
export function BlazeBanner() {
  const cashtokens = BLAZE.cashtokens.replace(/^bitcoincash:/, "")
  return (
    <Banner
      height="2.25rem"
      className="gap-x-3.5 bg-[#e04d26] px-3 text-xs font-medium text-white sm:gap-x-5"
    >
      <a href="https://bchblaze.cash" className="whitespace-nowrap font-mono uppercase tracking-[0.08em]">
        <span className="sm:hidden">BCH BLAZE</span>
        <span className="hidden sm:inline">
          {BLAZE.event} · {BLAZE.track}
        </span>
      </a>
      <a href={BLAZE.demo} className={link}>
        Demo ↗
      </a>
      {BLAZE.deck ? (
        <a href={BLAZE.deck} className={link}>
          <span className="sm:hidden">Deck</span>
          <span className="hidden sm:inline">Widget Factory deck</span> ↗
        </a>
      ) : null}
      <a href={SITE.repo} className={link}>
        <span className="sm:hidden">Code</span>
        <span className="hidden sm:inline">Source code</span> ↗
      </a>
      {cashtokens ? (
        <Popover.Root>
          <Popover.Trigger
            className="group flex items-center gap-1.5 whitespace-nowrap rounded-full py-0.5 pr-2 pl-1.5 transition-colors hover:bg-white/15 focus-visible:bg-white/15"
            aria-label={`CashTokens address ${BLAZE.cashtokens}: show it as a QR code`}
            title={BLAZE.cashtokens}
          >
            <QrCode className="size-3.5" />
            <span className="opacity-80">CashTokens</span>
            <span className="hidden font-mono underline decoration-white/30 underline-offset-4 group-hover:decoration-white sm:inline xl:hidden">
              {cashtokens.slice(0, SHORT + 2)}…{cashtokens.slice(-SHORT)}
            </span>
            <span className="hidden font-mono underline decoration-white/30 underline-offset-4 group-hover:decoration-white xl:inline">
              {BLAZE.cashtokens}
            </span>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="bottom" align="end" sideOffset={8} collisionPadding={16} className="z-50">
              <Popover.Popup className="w-[min(20rem,calc(100vw-2rem))] origin-(--transform-origin) overflow-y-auto max-h-(--available-height) rounded-xl border bg-fd-popover text-left text-fd-popover-foreground shadow-lg focus-visible:outline-none data-closed:animate-fd-popover-out data-open:animate-fd-popover-in">
                <CashTokensCard />
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      ) : null}
    </Banner>
  )
}
