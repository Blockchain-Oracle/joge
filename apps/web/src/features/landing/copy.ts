/**
 * Every word on the landing (every line says only what the product does). One sentence per section
 * (numbered sections); the figures around them are live.
 */
export const HERO = {
  /** The hero chip: the promo says mainnet as soon as mainnet is live, whichever world the visitor is in. */
  live: { chipnet: "Live on Bitcoin Cash chipnet", mainnet: "Live on Bitcoin Cash mainnet" },
  title: "Bet up or down,",
  accent: "in minutes.",
  line: "Pick Bitcoin, Ether, BCH or gold. Guess if the price ends higher or lower. Guess right and you split the pot, paid straight to your wallet.",
  play: "Bet now",
  how: "How it works",
  /** Under the buttons: where a first visit starts. */
  free: "Starts on free test coins. Real BCH is one switch away.",
} as const;

export const STEPS = {
  lanes: { n: "01", title: "Pick a market", line: "Bitcoin, Ether and BCH every 5 minutes. Gold every hour." },
  call: { n: "02", title: "Tap Up or Down", line: "Pick your bet, then one tap. Your wallet signs." },
  pays: {
    n: "03",
    title: "Winners split the pot",
    line: "Everyone on the right side shares it, paid straight to their wallets. Watch one.",
  },
  signed: {
    n: "04",
    title: "Nobody can fake the price",
    line: "General Protocols signs every price. Bitcoin Cash checks the signature before anyone is paid.",
  },
  help: {
    n: "05",
    title: "Help if you want it",
    line: "Ask Sensei for a quick read, or let an agent bet for you within your limits.",
  },
} as const;

/** The stake chip in section 02's art. */
export const CALL_STAKE = "$0.10 · set once";

export const FINAL = { title: "The next round closes in", play: "Bet now" } as const;

/** "Built on" (each with its real logo, from the projects' own repositories). */
export const BUILT_ON = [
  { name: "General Protocols oracle", logo: "/brands/general-protocols.png", wide: true },
  { name: "CashTokens", logo: "/brands/cashtokens.svg", wide: false },
  { name: "CashScript", logo: "/brands/cashscript.png", wide: false },
  { name: "SolidCash", logo: "/brands/solidcash.svg", wide: false },
  { name: "WizardConnect", logo: "/wallets/wizardconnect.png", wide: false },
] as const;

/** Wallets proven to sign Jōge's entries over WizardConnect. */
export const WALLETS = [
  { name: "Cashonize", logo: "/wallets/cashonize.png" },
  { name: "Selene", logo: "/wallets/selene.svg" },
  { name: "Paytaca", logo: "/wallets/paytaca.png" },
  { name: "Electron Cash", logo: "/wallets/electron-cash.svg" },
] as const;
