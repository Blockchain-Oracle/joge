/** The docs site's own constants: where things live, and the words used everywhere. */

/**
 * Where the app and the docs are served, read at build time (the Docker build's arguments, the same names the app
 * uses), so a deploy on a new address links to itself.
 */
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://getjoge.xyz"
const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.getjoge.xyz"

export const SITE = {
  name: "Jōge",
  title: "Jōge docs",
  /** 上下: up and down. */
  kanji: "上下",
  meaning: "up and down",
  tagline: "Bet up or down, in minutes.",
  description:
    "Jōge is a no-house price game on Bitcoin Cash mainnet: call BTC, ETH, BCH or gold up or down for a few cents. Contracts check General Protocols' signed prices and pay the winners straight to their wallets; anyone can finish a round, and AI agents play from vaults they can never empty.",
  url: DOCS_URL,
  app: APP_URL,
  play: `${APP_URL}/rounds`,
  repo: "https://github.com/Blockchain-Oracle/joge",
} as const

/**
 * The BCH BLAZE banner every Mainnet Track entry carries: the demo film, the Widget Factory deck (full screen in the
 * app, with the Google Slides copy one click away there), the source, the team's CashTokens address.
 */
export const BLAZE = {
  event: "BCH BLAZE 2026",
  track: "Mainnet Track",
  deck: `${APP_URL}/slides`,
  /** The demo film, played on the app's /demo with chapters and every round it shows. */
  demo: `${APP_URL}/demo`,
  youtube: "https://youtu.be/mnaZhjLxoqE",
  /** The team's CashTokens address (one team, one wallet). */
  cashtokens: process.env.NEXT_PUBLIC_CASHTOKENS_ADDRESS || "bitcoincash:zpx428ysgswaypfgk6aswckpjwa99hxk6v4gqs3xjp",
} as const

/** Where the docs live. */
export const DOCS = { base: "/docs" } as const

/** Link previews: one size for every page. */
export const OG = { width: 1200, height: 630 } as const
