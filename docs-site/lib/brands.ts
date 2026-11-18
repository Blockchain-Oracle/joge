import type { Brand } from "@/components/logo-cloud"

/**
 * What Jōge is built on and works with (facts from the code: packages/contracts, packages/sdk, apps/web/features/
 * wallet). Marks are the same files the app's landing shows: each project's own logo from its own repository.
 */
export const BRANDS: Brand[] = [
  { name: "Bitcoin Cash", logo: "bch.svg" },
  { name: "General Protocols oracle", logo: "general-protocols.png" },
  { name: "CashTokens", logo: "cashtokens.svg" },
  { name: "CashScript", logo: "cashscript.png" },
  { name: "SolidCash", logo: "solidcash.svg" },
  { name: "WizardConnect", logo: "wizardconnect.png" },
]

/** The Bitcoin Cash wallets that pair with Jōge over WizardConnect. */
export const WALLETS: Brand[] = [
  { name: "Paytaca", logo: "paytaca.png" },
  { name: "Cashonize", logo: "cashonize.png" },
  { name: "Selene", logo: "selene.svg" },
  { name: "Electron Cash", logo: "electron-cash.svg" },
]
