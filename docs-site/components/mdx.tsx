import { Step, Steps } from "fumadocs-ui/components/steps"
import defaultMdxComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"
import type { ComponentProps, ReactNode } from "react"
import { DemandFigure } from "./figures/demand-figure"
import { LineFigure } from "./figures/line-figure"
import { MoneyFigure } from "./figures/money-figure"
import { RoundFigure } from "./figures/round-figure"
import { SystemFigure } from "./figures/system-figure"
import { VaultFigure } from "./figures/vault-figure"
import { Figure, H2, Key, Note, P } from "./frame/page-parts"
import { Logo } from "./logo-cloud"
import { Down, Line, Sats, Signed, Up, You } from "./manual/glyph"
import { Spotlight } from "./manual/spotlight"

/** A real screen, cropped to what the page is about, on its own (no spotlight). */
function Crop({ src, alt, caption, width }: { src: string; alt: string; caption?: ReactNode; width?: number }) {
  return (
    <figure className="my-8">
      <div className="overflow-hidden rounded-[22px] border border-fd-border" style={width ? { maxWidth: width } : undefined}>
        {/* biome-ignore lint/performance/noImgElement: a static export; the file is pre-sized */}
        <img src={src} alt={alt} loading="lazy" className="block h-auto w-full" />
      </div>
      {caption ? <figcaption className="mt-2.5 font-mono text-[12px] text-muted-ink">{caption}</figcaption> : null}
    </figure>
  )
}

/** A real screen with one part lit, framed like the figures. */
function Lit(props: ComponentProps<typeof Spotlight> & { caption?: ReactNode }) {
  const { caption, ...spot } = props
  return (
    <Figure legend={caption ? <span>{caption}</span> : undefined}>
      <Spotlight {...spot} />
    </Figure>
  )
}

/** Small numbered steps: the number in mono, then the words. */
function Facts({ children }: { children: ReactNode }) {
  return <div className="my-6 grid gap-3 sm:grid-cols-2">{children}</div>
}
function Fact({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-fd-border bg-surface p-5">
      <p className="font-mono text-[11.5px] tracking-[0.1em] text-muted-ink uppercase">{label}</p>
      <div className="mt-2 text-[15.5px] leading-[1.55] text-ink-2">{children}</div>
    </div>
  )
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    h2: ({ id, children }: ComponentProps<"h2">) => <H2 id={id ?? ""}>{children}</H2>,
    p: ({ children }: ComponentProps<"p">) => <P>{children}</P>,
    blockquote: ({ children }: ComponentProps<"blockquote">) => <Note>{children}</Note>,
    table: (props: ComponentProps<"table">) => (
      <div className="my-6 overflow-x-auto rounded-2xl border border-fd-border">
        <table {...props} />
      </div>
    ),
    Steps,
    Step,
    Figure,
    Key,
    Note,
    Crop,
    Lit,
    Facts,
    Fact,
    Logo,
    Up,
    Down,
    Line,
    Signed,
    You,
    Sats,
    RoundFigure,
    MoneyFigure,
    SystemFigure,
    VaultFigure,
    DemandFigure,
    LineFigure,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
