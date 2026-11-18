import type { Network } from "@joge/db";

export const THEME_KEY = "joge-theme";
export const NETWORK_KEY = "joge-network";
export type ThemeChoice = "dark" | "light" | "system";

/** Mainnet becomes a choice once its category exists (stage S09, `NEXT_PUBLIC_JOGE_MAINNET_LIVE=true`). */
export const MAINNET_LIVE = process.env.NEXT_PUBLIC_JOGE_MAINNET_LIVE === "true";

/** The world a first visit opens in: chipnet, so nobody lands on real money without the slide (Kakure). */
export const DEFAULT_NETWORK: Network = "chipnet";

/**
 * Runs before first paint (inline in <head>): sets the theme and the network world from what this browser chose last,
 * so neither the colours nor the chipnet tint ever flash. No choice saved means night (D21: the stage Abu's products
 * share) and the default network.
 */
export const THEME_INIT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("${THEME_KEY}");d.dataset.theme=t==="light"||(t==="system"&&matchMedia("(prefers-color-scheme: light)").matches)?"light":"dark";var n=localStorage.getItem("${NETWORK_KEY}");d.dataset.network=${MAINNET_LIVE ? `n==="mainnet"||n==="chipnet"?n:"${DEFAULT_NETWORK}"` : '"chipnet"'};}catch(e){d.dataset.theme="dark";d.dataset.network="${DEFAULT_NETWORK}";}})();`;

const prefersLight = () => window.matchMedia("(prefers-color-scheme: light)").matches;

export function applyTheme(choice: ThemeChoice) {
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Private windows may refuse storage; the choice still applies to this page.
  }
  document.documentElement.dataset.theme =
    choice === "dark" || (choice === "system" && !prefersLight()) ? "dark" : "light";
}

export function currentTheme(): ThemeChoice {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "system" || saved === "dark") return saved;
  } catch {
    // Fall through to the default.
  }
  return "dark";
}

export function applyNetwork(network: Network) {
  try {
    localStorage.setItem(NETWORK_KEY, network);
  } catch {
    // As above: the world still switches for this page.
  }
  document.documentElement.dataset.network = network;
}

export const currentNetwork = (): Network =>
  document.documentElement.dataset.network === "mainnet" ? "mainnet" : "chipnet";
