import { HomeLayout } from "fumadocs-ui/layouts/home"
import Link from "next/link"
import { homeOptions } from "@/lib/layout.shared"
import { DOCS } from "@/lib/site"

/** A missing page (exported as 404.html, which nginx serves for anything it can't find): the app's own "went down". */
export default function NotFound() {
  return (
    <HomeLayout {...homeOptions()}>
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-24 text-center">
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
        <p className="label-mono">/ 404</p>
        <h1 className="font-display text-4xl font-bold tracking-[-0.045em]">
          <span className="font-jp text-down-text">下</span> This page went down.
        </h1>
        <p className="max-w-sm text-fd-muted-foreground">It moved or never existed. The docs start with how to play.</p>
        <Link
          href={DOCS.start}
          className="inline-flex h-11 items-center rounded-full bg-fd-primary px-5 text-[14px] font-semibold text-fd-primary-foreground"
        >
          How to play
        </Link>
      </main>
    </HomeLayout>
  )
}
