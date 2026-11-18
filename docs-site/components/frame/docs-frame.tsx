"use client"

import { useSearchContext } from "fumadocs-ui/contexts/search"
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch"
import { Menu, Search, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useEffect, useState } from "react"
import { JogeMark } from "@/components/joge-mark"
import { SITE } from "@/lib/site"
import type { NavSection } from "@/lib/nav"

/*
 * The docs frame: a top bar (mark, search, theme, source, Play), the sections and their pages on the left with the
 * vermilion line marking where you are, the page in a reading column, and the page's outline on the right.
 */
export function DocsFrame({ nav, children, outline }: { nav: NavSection[]; children: ReactNode; outline?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const path = usePathname()
  useEffect(() => setOpen(false), [path])

  return (
    <div className="min-h-screen">
      <TopBar onMenu={() => setOpen((v) => !v)} menuOpen={open} />
      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside
          className={`${open ? "fixed inset-x-0 top-16 bottom-0 z-40 block bg-bg" : "hidden"} w-full shrink-0 overflow-y-auto border-fd-border lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:w-[290px] lg:border-r`}
        >
          <Sidebar nav={nav} path={path} />
        </aside>
        <main className="min-w-0 flex-1 px-5 pt-10 pb-24 sm:px-10 lg:px-14">{children}</main>
        {outline ? (
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[240px] shrink-0 overflow-y-auto py-10 pr-8 xl:block">
            {outline}
          </aside>
        ) : null}
      </div>
    </div>
  )
}

function TopBar({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const { setOpenSearch } = useSearchContext()
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-fd-border bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenu}
          aria-label={menuOpen ? "Close the menu" : "Open the menu"}
          className="grid size-10 place-items-center rounded-full border border-fd-border lg:hidden"
        >
          {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <JogeMark size={28} />
          <span className="font-display text-[18px] font-bold tracking-[-0.04em]">Jōge</span>
          <span className="font-mono text-[12px] tracking-[0.12em] text-muted-ink">DOCS</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpenSearch(true)}
          className="ms-auto flex h-10 items-center gap-3 rounded-full border border-fd-border bg-surface px-4 text-[14px] text-muted-ink transition-colors hover:text-ink-2 md:ms-10 md:w-[380px]"
        >
          <Search className="size-4" />
          <span className="hidden md:inline">Search the docs</span>
          <kbd className="ms-auto hidden rounded-md border border-fd-border px-1.5 font-mono text-[11px] md:inline">⌘K</kbd>
        </button>
        <div className="ms-auto hidden items-center gap-2 md:flex">
          <ThemeSwitch />
          <a href={SITE.repo} className="px-2 text-[14px] text-ink-2 hover:text-ink">
            GitHub
          </a>
        </div>
        <a
          href={SITE.play}
          className="inline-flex h-10 items-center rounded-full bg-[#e04d26] px-4 text-[14px] font-semibold text-white"
        >
          Play
        </a>
      </div>
    </header>
  )
}

function Sidebar({ nav, path }: { nav: NavSection[]; path: string }) {
  return (
    <nav aria-label="Docs" className="flex flex-col gap-7 px-5 py-8 lg:px-6">
      {nav.map((section) => (
        <div key={section.n} className="flex flex-col gap-1.5">
          <p className="mb-1 flex items-baseline gap-2.5 px-3">
            <span className="font-mono text-[11px] text-muted-ink">{section.n}</span>
            <span className="font-display text-[15px] font-bold tracking-[-0.02em]">{section.name}</span>
          </p>
          {section.pages.map((page) => {
            const here = page.href === path
            return (
              <Link
                key={page.n}
                href={page.href}
                aria-current={here ? "page" : undefined}
                className={`relative flex items-baseline gap-2.5 rounded-lg py-1.5 pr-3 pl-3 text-[14.5px] transition-colors ${
                  here ? "bg-surface text-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {here ? <span aria-hidden className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-vermilion" /> : null}
                <span className="w-7 shrink-0 font-mono text-[11.5px] text-muted-ink">{page.n}</span>
                {page.name}
              </Link>
            )
          })}
        </div>
      ))}
      <a
        href={SITE.app}
        className="mx-3 mt-2 flex items-center gap-2.5 rounded-xl border border-fd-border px-3 py-2.5 text-[13px] text-ink-2"
      >
        <span className="relative flex size-2">
          <span className="absolute inset-0 animate-[live-ping_1.6s_ease-out_infinite] rounded-full bg-[#e04d26]" />
          <span className="relative size-2 rounded-full bg-[#e04d26]" />
        </span>
        Live on Bitcoin Cash mainnet
      </a>
    </nav>
  )
}
