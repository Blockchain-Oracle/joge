import Link from "next/link"
import { DocsFrame } from "@/components/frame/docs-frame"
import { docsNav } from "@/lib/nav"

/** A missing page (exported as 404.html, which nginx serves for anything it can't find): the app's own "went down". */
export default function NotFound() {
  return (
    <DocsFrame nav={docsNav()}>
      <div className="mx-auto flex max-w-[640px] flex-col items-start gap-5 py-16">
        <svg viewBox="0 0 160 80" className="w-40" aria-hidden>
          <path d="M8 40H152" stroke="var(--vermilion)" strokeWidth="4" strokeLinecap="round" />
          <path
            d="M8 22L34 18L52 26L70 20L92 44L112 52L130 66L148 72"
            fill="none"
            stroke="var(--down-text)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="148" cy="72" r="5" fill="var(--down-text)" />
        </svg>
        <p className="font-mono text-[12px] tracking-[0.12em] text-muted-ink">404</p>
        <h1 className="font-display text-[2.4rem] font-bold tracking-[-0.045em]">
          <span className="font-jp text-down-text">下</span> This page went down.
        </h1>
        <p className="text-[17px] text-ink-2">It moved or never existed. Search the docs, or start with how to play.</p>
        <Link
          href="/docs/play"
          className="inline-flex h-11 items-center rounded-full bg-[#e04d26] px-5 text-[14px] font-semibold text-white"
        >
          What Jōge is
        </Link>
      </div>
    </DocsFrame>
  )
}
