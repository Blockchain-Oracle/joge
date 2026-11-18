import type { Folder, Item, Node } from "fumadocs-core/page-tree"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { Diagram } from "@/components/diagram"
import { RoundExplorer } from "@/components/home/round-explorer"
import { Logo } from "@/components/logo-cloud"
import { MAINNET } from "@/lib/mainnet"
import { DOCS, SITE } from "@/lib/site"
import { source } from "@/lib/source"

const EXPLORER = "https://explorer.bch.ninja/tx/"
const SHORT = 6
const short = (txid: string) => `${txid.slice(0, SHORT)}…${txid.slice(-SHORT)}`

/**
 * The docs' front page. It opens on the round itself (a real mainnet round you can drag the close of), then the
 * mainnet proof, the round's life on chain, the docs as a contents page, and the system map.
 */
export default function HomePage() {
  const parts = source.getPageTree().children.filter((n): n is Folder => n.type === "folder" && Boolean(n.root))

  return (
    <main className="flex flex-1 flex-col pb-8">
      {/* The round */}
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-12">
        <div className="flex flex-col gap-5">
          <p className="label-mono">
            / Jōge · <span className="font-jp">上下</span> · the docs
          </p>
          <h1 className="font-display text-[3.25rem] leading-[0.92] font-bold tracking-[-0.055em] sm:text-[4.5rem]">
            Up or down, <span className="text-fd-muted-foreground">in minutes.</span>
          </h1>
          <p className="max-w-md text-[1.0625rem] leading-relaxed text-fd-muted-foreground">
            Call BTC, ETH, BCH or gold for a few cents. No house: a contract on Bitcoin Cash checks the signed price
            and pays the winners straight to their wallets.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={DOCS.start}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-fd-foreground px-5 text-[15px] font-semibold text-fd-background"
            >
              How to play <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href={DOCS.rounds}
              className="inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-[15px] font-medium ring-1 ring-fd-border hover:bg-fd-muted"
            >
              How a round works
            </Link>
          </div>
        </div>
        <RoundExplorer />
      </section>

      {/* Mainnet */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-20 sm:pt-28">
        <div className="relative isolate overflow-hidden rounded-[32px] bg-[#e04d26] px-6 py-10 text-white sm:px-10 sm:py-12">
          <span
            aria-hidden
            className="font-jp pointer-events-none absolute -right-4 -bottom-14 -z-10 text-[13rem] leading-none text-white/[0.12] sm:text-[18rem]"
          >
            本
          </span>
          <p className="font-mono text-[12px] tracking-[0.16em] uppercase opacity-90">Mainnet · real BCH</p>
          <h2 className="font-display mt-3 max-w-[16ch] text-[2.5rem] leading-[0.95] font-bold tracking-[-0.05em] sm:text-[3.75rem]">
            Live on Bitcoin Cash mainnet.
          </h2>
          <p className="mt-4 max-w-xl text-[16px] opacity-90">
            Its own token category, a genesis anyone can open, and rounds that open, lock, settle and pay on chain since{" "}
            {MAINNET.since}.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {MAINNET.proof.map((item) => (
              <a
                key={item.txid}
                href={`${EXPLORER}${item.txid}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white/15 px-4 font-mono text-[12.5px] hover:bg-white/25"
              >
                <span className="opacity-80">{item.label}</span> {short(item.txid)}
                <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            ))}
            <Link
              href={DOCS.mainnet}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[14px] font-semibold text-[#e04d26]"
            >
              Every address <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Built on */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-20 sm:pt-28">
        <p className="label-mono">/ Built on</p>
        <p className="font-display mt-5 max-w-5xl text-[1.6rem] leading-[1.3] font-semibold tracking-[-0.035em] sm:text-[2.3rem] sm:leading-[1.22]">
          <Brand logo="general-protocols.png">General Protocols</Brand> signs the price every minute.{" "}
          <Brand logo="cashscript.png">CashScript</Brand> and <Brand logo="solidcash.svg">SolidCash</Brand> contracts
          check it on chain, <Brand logo="cashtokens.svg">CashTokens</Brand> carry every round and ticket, and{" "}
          <Brand logo="wizardconnect.png">WizardConnect</Brand> pairs your wallet.{" "}
          <span className="text-fd-muted-foreground">Nobody holds your money. Anyone can finish a round.</span>
        </p>
      </section>

      {/* The docs, as a contents page */}
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pt-20 sm:pt-28 lg:grid-cols-[18rem_1fr] lg:gap-16">
        <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
          <p className="label-mono">/ Contents</p>
          <h2 className="font-display text-[2.25rem] leading-[1.02] font-bold tracking-[-0.045em]">
            {parts.length} parts. Start anywhere.
          </h2>
          <p className="text-[15px] text-fd-muted-foreground">
            Every page is also plain Markdown, and the whole set is one file for your AI:{" "}
            <a
              href="/llms-full.txt"
              className="font-mono text-[13px] whitespace-nowrap text-fd-foreground underline underline-offset-4"
            >
              llms-full.txt
            </a>
          </p>
        </div>
        <ol className="flex flex-col">
          {parts.map((part, i) => (
            <Part key={part.$id ?? i} part={part} n={i + 1} />
          ))}
        </ol>
      </section>

      {/* How it's built */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-20 sm:pt-28">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <p className="label-mono">/ How it’s built</p>
            <h2 className="font-display text-[2.25rem] leading-[1.02] font-bold tracking-[-0.045em] sm:text-[2.75rem]">
              The chain is the referee.
            </h2>
          </div>
          <Link href={DOCS.build} className="inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium md:pb-1.5">
            Architecture <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <Diagram
          name="system"
          alt="Jōge's system: your wallet and the browser build and sign every entry; round contracts on Bitcoin Cash hold the pot; General Protocols signs prices; the engine indexes the chain and runs the keeper and the agents"
          caption="Your browser builds each transaction from the chain itself; the engine only keeps things moving, and anyone can do its job."
        />
      </section>

      {/* Close */}
      <section className="relative mx-auto mt-16 w-full max-w-6xl overflow-hidden px-4 pt-16 sm:mt-24">
        <span
          aria-hidden
          className="font-jp pointer-events-none absolute -top-8 right-0 text-[11rem] leading-none text-fd-foreground/[0.06] select-none sm:text-[17rem]"
        >
          {SITE.kanji}
        </span>
        <div className="relative flex flex-col gap-6 border-t border-fd-border pt-10">
          <h2 className="font-display max-w-xl text-[2.25rem] leading-[1.02] font-bold tracking-[-0.045em] sm:text-[2.75rem]">
            Jōge means up and down.
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={DOCS.start}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-fd-foreground px-5 text-[15px] font-semibold text-fd-background"
            >
              How to play <ArrowRight className="size-4" aria-hidden />
            </Link>
            <a
              href={SITE.play}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-fd-primary px-5 text-[15px] font-semibold text-fd-primary-foreground"
            >
              Play Jōge <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

/** A brand named in a sentence, with its real mark beside it. */
function Brand({ logo, children }: { logo: string; children: ReactNode }) {
  return (
    <span className="whitespace-nowrap">
      <Logo name={logo} size={30} className="me-1.5 align-[-0.12em]" />
      {children}
    </span>
  )
}

/** One part of the docs: its number, its title and description, and its pages. */
function Part({ part, n }: { part: Folder; n: number }) {
  const pages = flatten(part.children)
  const href = part.index?.url ?? pages[0]?.url ?? DOCS.base
  return (
    <li className="grid gap-4 border-t border-fd-border py-8 first:border-t-0 first:pt-0 sm:grid-cols-[3.5rem_1fr]">
      <span className="font-mono text-[13px] text-fd-muted-foreground">{String(n).padStart(2, "0")}</span>
      <div className="flex flex-col gap-3">
        <Link href={href} className="group inline-flex items-baseline gap-2">
          <span className="font-display text-[1.6rem] leading-tight font-bold tracking-[-0.04em]">{part.name}</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        {part.description ? <p className="max-w-xl text-[15px] text-fd-muted-foreground">{part.description}</p> : null}
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
          {pages.map((page) => (
            <li key={page.url}>
              <Link href={page.url} className="text-[14px] text-fd-muted-foreground hover:text-fd-foreground">
                {page.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

function flatten(nodes: Node[]): Item[] {
  return nodes.flatMap((node) =>
    node.type === "page" ? [node] : node.type === "folder" ? [...(node.index ? [node.index] : []), ...flatten(node.children)] : [],
  )
}
