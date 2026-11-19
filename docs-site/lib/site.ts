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
  tagline: "Up or down, in minutes.",
  description:
    "Jōge is a no-house price game on Bitcoin Cash mainnet: call BTC, ETH, BCH or gold up or down for a few cents. Contracts check General Protocols' signed prices and pay the winners straight to their wallets; anyone can finish a round, and AI agents play from vaults they can never empty.",
  url: DOCS_URL,
  app: APP_URL,
  play: `${APP_URL}/rounds`,
  repo: "https://github.com/Blockchain-Oracle/joge",
} as const

/**
 * The BCH BLAZE banner every Mainnet Track entry carries: the Widget Factory deck, the source, the team's CashTokens
 * address. Each item shows once its value is set at build time (the same variables as the app's banner).
 */
export const BLAZE = {
  event: "BCH BLAZE 2026",
  track: "Mainnet Track",
  deck:
    process.env.NEXT_PUBLIC_BLAZE_DECK_URL ||
    "https://docs.google.com/presentation/d/1Qp5ucxWRxmVQPF2h8TTw9VVcokC_6BMCUVuwDr3cw-Y/edit?usp=sharing",
  /** The team's CashTokens address (one team, one wallet). */
  cashtokens: process.env.NEXT_PUBLIC_CASHTOKENS_ADDRESS || "bitcoincash:zqnvys4cpkjk9qtsmjwmhysgtlm9vvf6uvms3x8sh9",
} as const

/** Where the docs live. */
export const DOCS = { base: "/docs" } as const

/** Link previews: one size for every page. */
export const OG = { width: 1200, height: 630 } as const
