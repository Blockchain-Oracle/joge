import { ArrowRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { DocsFrame } from "@/components/frame/docs-frame"
import { SearchButton } from "@/components/frame/search-button"
import { SectionIcon } from "@/components/frame/section-icons"
import { RoundExplorer } from "@/components/home/round-explorer"
import { MAINNET } from "@/lib/mainnet"
import { docsNav } from "@/lib/nav"

/*
 * The docs' front page: search first, a way into each section, the mechanism in one picture you can drag, and the
 * questions people arrive with, each pointing at the page that answers it.
 */

const QUESTIONS = [
  { q: "How is my payout worked out?", href: "/docs/round/payouts" },
  { q: "What if nobody takes the other side?", href: "/docs/round/refunds" },
  { q: "Who decides the price?", href: "/docs/price" },
  { q: "Can an agent spend my money?", href: "/docs/agents/vault" },
  { q: "Where are the mainnet contracts?", href: "/docs/mainnet/verify" },
  { q: "How do I get test BCH?", href: "/docs/play/first-round" },
]
const FIRST_PAGES = 3
const SHORT = 6

export default function HomePage() {
  const nav = docsNav()
  const pageOf = (href: string) => nav.flatMap((s) => s.pages).find((p) => p.href === href)
  return (
    <DocsFrame nav={nav}>
      <div className="mx-auto max-w-[920px]">
        <header className="flex flex-col gap-5 pb-10">
          <p className="font-mono text-[12px] tracking-[0.12em] text-muted-ink">JŌGE DOCS</p>
          <h1 className="font-display text-[2.6rem] leading-[1.02] font-bold tracking-[-0.045em] sm:text-[3.4rem]">
            Everything about Jōge.
          </h1>
          <p className="max-w-[58ch] text-[18px] leading-[1.6] text-ink-2">
            How to play, how a round settles on Bitcoin Cash, what an agent can and can&apos;t do with your money, and how
            it&apos;s built.
          </p>
          <SearchButton />
        </header>

        <section aria-label="Sections" className="grid gap-3 sm:grid-cols-2">
          {nav.map((section) => (
            <div key={section.n} className="flex flex-col gap-4 rounded-[22px] border border-fd-border bg-surface p-6">
              <div className="flex items-start justify-between">
                <SectionIcon n={section.n} />
                <span className="font-mono text-[12px] text-muted-ink">{section.n}</span>
              </div>
              <div>
                <h2 className="font-display text-[1.35rem] font-bold tracking-[-0.03em]">
                  <Link href={section.pages[0]?.href ?? "/docs"}>{section.name}</Link>
                </h2>
                <p className="mt-1 text-[14.5px] text-ink-2">{section.blurb}</p>
              </div>
              <ul className="flex flex-col gap-1.5 border-t border-fd-border pt-4">
                {section.pages.slice(0, FIRST_PAGES).map((page) => (
                  <li key={page.n}>
                    <Link href={page.href} className="flex items-baseline gap-2.5 text-[14.5px] text-ink hover:text-vermilion">
                      <span className="w-7 font-mono text-[11.5px] text-muted-ink">{page.n}</span>
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[12px] tracking-[0.12em] text-muted-ink">A ROUND, IN ONE PICTURE</p>
              <h2 className="mt-2 font-display text-[1.6rem] font-bold tracking-[-0.035em]">
                Drag the close. Watch who&apos;s paid.
              </h2>
            </div>
            <Link href="/docs/round" className="hidden shrink-0 items-center gap-1.5 text-[14.5px] font-medium sm:inline-flex">
              2.1 A round&apos;s life <ArrowRight className="size-4" />
            </Link>
          </div>
          <RoundExplorer />
        </section>

        <section className="mt-16">
          <p className="font-mono text-[12px] tracking-[0.12em] text-muted-ink">COMMON QUESTIONS</p>
          <ul className="mt-4 border-t border-fd-border">
            {QUESTIONS.map((item) => {
              const page = pageOf(item.href)
              return (
                <li key={item.q} className="border-b border-fd-border">
                  <Link href={item.href} className="group flex items-center justify-between gap-4 py-4">
                    <span className="text-[16.5px] font-medium">{item.q}</span>
                    <span className="flex shrink-0 items-center gap-2 font-mono text-[12px] text-muted-ink group-hover:text-ink-2">
                      {page ? <span className="hidden sm:inline">{`${page.n} ${page.name}`}</span> : null}
                      <ArrowRight className="size-4" />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <footer className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[12px] text-muted-ink">
          <span>Live on Bitcoin Cash mainnet since {MAINNET.since}</span>
          <a
            href={`https://explorer.bch.ninja/tx/${MAINNET.genesis}`}
            className="inline-flex items-center gap-1 text-ink-2 hover:text-ink"
          >
            Genesis {MAINNET.genesis.slice(0, SHORT)}…{MAINNET.genesis.slice(-SHORT)} <ArrowUpRight className="size-3.5" />
          </a>
        </footer>
      </div>
    </DocsFrame>
  )
}
