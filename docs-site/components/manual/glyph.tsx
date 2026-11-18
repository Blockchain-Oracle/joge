import type { ReactNode } from "react"

/*
 * Glyph-words: the nouns of a round written in their own shapes and colours, so the prose is its own legend.
 * ▲ Up in lime, ▼ Down in coral, the line in vermilion dashes, "you" in vermilion, a signed price as a square.
 */

export function Up({ children = "Up" }: { children?: ReactNode }) {
  return <span className="font-semibold whitespace-nowrap text-up-text">▲ {children}</span>
}

export function Down({ children = "Down" }: { children?: ReactNode }) {
  return <span className="font-semibold whitespace-nowrap text-down-text">▼ {children}</span>
}

/** The line to beat: a short vermilion dash before the words. */
export function Line({ children = "the line" }: { children?: ReactNode }) {
  return (
    <span className="whitespace-nowrap font-semibold text-vermilion">
      <span aria-hidden className="me-1 inline-block w-4 border-t-2 border-dashed border-vermilion align-middle" />
      {children}
    </span>
  )
}

/** A signed price: the hollow square the chart draws for every General Protocols message. */
export function Signed({ children = "signed price" }: { children?: ReactNode }) {
  return (
    <span className="whitespace-nowrap font-semibold">
      <span aria-hidden className="me-1 inline-block size-2.5 border-2 border-fd-foreground align-[-0.05em]" />
      {children}
    </span>
  )
}

export function You({ children = "you" }: { children?: ReactNode }) {
  return <span className="font-semibold text-vermilion">{children}</span>
}

/** A figure in the prose: mono, tabular. */
export function Sats({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[0.92em] whitespace-nowrap tabular-nums">{children}</span>
}
