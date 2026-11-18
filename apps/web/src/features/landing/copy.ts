/**
 * Every word on the landing (Mitoshi's rule: every line says only what the product does). One sentence per section
 * (Agari's numbered sections); the figures around them are live.
 */
export const HERO = {
  live: { chipnet: "Live on Bitcoin Cash · test coins", mainnet: "Live on Bitcoin Cash" },
  title: "Up or down,",
  accent: "in minutes.",
  line: "Cents on BTC, ETH, BCH or gold. No house: the pot pays the winners.",
  play: "Play now",
  how: "How it pays",
} as const;

export const STEPS = {
  lanes: { n: "01", title: "Pick a lane", line: "Crypto every 5 minutes. Gold every hour." },
  call: { n: "02", title: "Tap Up or Down", line: "One tap. Your wallet signs." },
  pays: { n: "03", title: "The pot pays", line: "Winners paid straight to their wallets. Watch one." },
  signed: {
    n: "04",
    title: "Every price is signed",
    line: "General Protocols signs. The contract checks. So can you.",
  },
  help: { n: "05", title: "Sensei and agents", line: "A straight read, or an agent inside your caps." },
} as const;

/** The first line of the landing for judges (Mitoshi's JudgeStrip): one sentence, the long form on wide screens. */
export const JUDGE_STRIP = {
  wide: "BCH BLAZE judges: a funded wallet is one link away.",
  short: "Judges: a funded wallet is waiting",
  cta: "How",
} as const;

/** The stake chip in section 02's art. */
export const CALL_STAKE = "$0.10 · set once";

export const FINAL = { title: "The next round closes in", play: "Play now" } as const;

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
