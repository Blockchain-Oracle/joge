import { Accordion, Accordions } from "fumadocs-ui/components/accordion"
import { File, Files, Folder } from "fumadocs-ui/components/files"
import { ImageZoom } from "fumadocs-ui/components/image-zoom"
import { Step, Steps } from "fumadocs-ui/components/steps"
import { Tab, Tabs } from "fumadocs-ui/components/tabs"
import { TypeTable } from "fumadocs-ui/components/type-table"
import defaultMdxComponents from "fumadocs-ui/mdx"
import { icons } from "lucide-react"
import type { MDXComponents } from "mdx/types"
import type { ComponentProps } from "react"
import { BRANDS, WALLETS } from "@/lib/brands"
import { CashTokensCard } from "./blaze"
import { Diagram } from "./diagram"
import { JogeMark } from "./joge-mark"
import { Logo, LogoCloud } from "./logo-cloud"
import { Phone, Phones, Sheet, Shot } from "./phone"

/** What Jōge is built on, as the endless row. */
function Brands() {
  return <LogoCloud brands={BRANDS} />
}

/** Jōge's CashTokens address as a card with its QR code, for a docs page. */
function CashTokens() {
  return <CashTokensCard framed />
}

/** The wallets that pair with Jōge. */
function Wallets() {
  return <LogoCloud brands={WALLETS} seconds={30} />
}

/** A lucide icon by name, so .mdx files can write `icon={<Icon name="Route" />}` without imports. */
function Icon({ name, ...props }: { name: keyof typeof icons } & ComponentProps<"svg">) {
  const Glyph = icons[name]
  // A name lucide doesn't have renders nothing rather than breaking the page.
  return Glyph ? <Glyph {...props} /> : null
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    img: (props: ComponentProps<"img">) => <ImageZoom {...(props as ComponentProps<typeof ImageZoom>)} />,
    Accordion,
    Accordions,
    Files,
    Folder,
    File,
    Step,
    Steps,
    Tab,
    Tabs,
    TypeTable,
    Diagram,
    Brands,
    Wallets,
    CashTokens,
    Logo,
    LogoCloud,
    JogeMark,
    Phone,
    Phones,
    Shot,
    Sheet,
    Icon,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
