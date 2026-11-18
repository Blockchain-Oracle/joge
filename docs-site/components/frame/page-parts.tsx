"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { type ReactNode, useEffect, useState } from "react"

/*
 * The pieces of a docs page: its header (where it sits, the title, one line), section headings that anchor, a figure
 * card, a note, the outline on the right, and the previous / next pages.
 */

export function PageHeader({
  section,
  title,
  lead,
  action,
}: {
  section: string
  title: ReactNode
  lead?: ReactNode
  action?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-fd-border pb-8">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[12px] tracking-[0.12em] text-muted-ink">{section}</p>
        {action}
      </div>
      <h1 className="font-display text-[2.4rem] leading-[1.02] font-bold tracking-[-0.045em] sm:text-[2.9rem]">{title}</h1>
      {lead ? <p className="max-w-[60ch] text-[18px] leading-[1.6] text-ink-2">{lead}</p> : null}
    </header>
  )
}

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mt-14 mb-4 scroll-mt-24 font-display text-[1.6rem] leading-tight font-bold tracking-[-0.035em]">
      <a href={`#${id}`} className="no-ink">
        {children}
      </a>
    </h2>
  )
}

export function P({ children }: { children: ReactNode }) {
  return <p className="my-4 max-w-[62ch] text-[17px] leading-[1.7] text-ink-2">{children}</p>
}

/** A figure on a dot grid, with its legend under it. */
export function Figure({ children, legend }: { children: ReactNode; legend?: ReactNode }) {
  return (
    <figure className="my-8 overflow-hidden rounded-[22px] border border-fd-border bg-bg">
      {children}
      {legend ? (
        <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-fd-border px-5 py-3.5 font-mono text-[12px] text-ink-2">
          {legend}
        </figcaption>
      ) : null}
    </figure>
  )
}

/** A short aside: the vermilion line, then one or two sentences. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex gap-4 rounded-2xl bg-surface p-5">
      <span aria-hidden className="w-[3px] shrink-0 rounded-full bg-vermilion" />
      <div className="text-[15.5px] leading-[1.6] text-ink-2 [&_p]:my-0 [&_p]:text-[15.5px]">{children}</div>
    </div>
  )
}

/** A compact reference table: only where the facts are a lookup. */
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-2xl border border-fd-border">
      <table className="w-full text-left text-[14.5px]">
        <thead>
          <tr className="border-b border-fd-border">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-mono text-[11.5px] font-medium tracking-[0.08em] text-muted-ink uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a fixed table
            <tr key={i} className="border-b border-fd-border last:border-0">
              {row.map((cell, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a fixed table
                <td key={j} className={`px-4 py-3 ${j === 0 ? "font-medium text-ink" : "text-ink-2"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** The page's outline, the current section marked as you read. */
export function Outline({ items }: { items: { id: string; label: ReactNode }[] }) {
  const [active, setActive] = useState(items[0]?.id)
  useEffect(() => {
    const seen = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) setActive(top.target.id)
      },
      { rootMargin: "-80px 0px -60% 0px" },
    )
    for (const item of items) {
      const node = document.getElementById(item.id)
      if (node) seen.observe(node)
    }
    return () => seen.disconnect()
  }, [items])
  return (
    <nav aria-label="On this page" className="flex flex-col gap-1">
      <p className="mb-2 font-mono text-[11px] tracking-[0.12em] text-muted-ink">ON THIS PAGE</p>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`relative py-1 pl-4 text-[13.5px] transition-colors ${active === item.id ? "text-ink" : "text-muted-ink hover:text-ink-2"}`}
        >
          <span aria-hidden className={`absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full ${active === item.id ? "bg-vermilion" : "bg-fd-border"}`} />
          {item.label}
        </a>
      ))}
    </nav>
  )
}

export function PrevNext({ prev, next }: { prev?: { n: string; name: string; href: string }; next?: { n: string; name: string; href: string } }) {
  return (
    <nav className="mt-16 grid gap-3 border-t border-fd-border pt-8 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} className="group flex flex-col gap-1 rounded-2xl border border-fd-border p-5 hover:bg-surface">
          <span className="flex items-center gap-1.5 font-mono text-[12px] text-muted-ink">
            <ArrowLeft className="size-3.5" /> {prev.n}
          </span>
          <span className="font-display text-[17px] font-bold tracking-[-0.02em]">{prev.name}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="group flex flex-col items-end gap-1 rounded-2xl border border-fd-border p-5 text-right hover:bg-surface">
          <span className="flex items-center gap-1.5 font-mono text-[12px] text-muted-ink">
            {next.n} <ArrowRight className="size-3.5" />
          </span>
          <span className="font-display text-[17px] font-bold tracking-[-0.02em]">{next.name}</span>
        </Link>
      ) : null}
    </nav>
  )
}

/** One legend entry: a swatch and a word. */
export function Key({
  swatch,
  children,
}: {
  swatch: "up" | "down" | "line" | "signed" | "you" | "muted"
  children: ReactNode
}) {
  const mark = {
    up: <span className="size-2.5 rounded-full bg-up" />,
    down: <span className="size-2.5 rounded-full bg-down" />,
    line: <span className="w-4 border-t-2 border-dashed border-vermilion" />,
    signed: <span className="size-2.5 border-2 border-fd-foreground" />,
    you: <span className="size-2.5 rounded-full bg-vermilion" />,
    muted: <span className="size-2.5 rounded-full bg-muted-ink" />,
  }[swatch]
  return (
    <span className="inline-flex items-center gap-2">
      {mark}
      {children}
    </span>
  )
}
