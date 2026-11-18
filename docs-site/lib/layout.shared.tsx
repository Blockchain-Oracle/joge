import type { BaseLayoutProps, LinkItemType } from "fumadocs-ui/layouts/shared"
import { JogeMark } from "@/components/joge-mark"
import { DOCS, SITE } from "./site"

/** The one filled action in the bar: into the app, in Jōge's vermilion. */
const openApp: LinkItemType = {
  type: "custom",
  secondary: true,
  children: (
    <a
      href={SITE.play}
      className="inline-flex h-8 items-center rounded-full bg-fd-primary px-3.5 text-[13px] font-semibold whitespace-nowrap text-fd-primary-foreground transition-opacity hover:opacity-90"
    >
      Play Jōge
    </a>
  ),
}

/** The bar on every page: the mark, "Jōge docs", the source on GitHub, and the app. */
export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: SITE.repo,
    nav: {
      title: (
        <span className="flex items-center gap-2">
          <JogeMark size={26} />
          <span className="font-display text-[17px] font-bold tracking-[-0.04em]">{SITE.name}</span>
          <span className="label-mono hidden sm:inline">/ docs</span>
        </span>
      ),
      url: "/",
    },
    links: [openApp],
  }
}

/** The home page's bar also names the docs' sections (inside the docs they are the tabs). */
export function homeOptions(): BaseLayoutProps {
  const base = baseOptions()
  return {
    ...base,
    links: [
      { text: "Play", url: DOCS.start, active: "nested-url" },
      { text: "How rounds work", url: DOCS.rounds, active: "nested-url" },
      { text: "Agents", url: DOCS.agents, active: "nested-url" },
      { text: "Mainnet", url: DOCS.mainnet, active: "nested-url" },
      { text: "Build", url: DOCS.build, active: "nested-url" },
      openApp,
    ],
  }
}
