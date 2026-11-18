import { Activity, Bot, CandlestickChart, type LucideIcon, Palette, Ticket, Trophy } from "lucide-react";
import type { Route } from "next";

export interface Place {
  /** Number key that jumps here (1–6). */
  key: string;
  label: string;
  href: Route;
  icon: LucideIcon;
  /** Paths that count as being here. */
  paths: string[];
  /** False keeps it out of the phone dock (it lives in More there). */
  dock?: false;
}

/**
 * The app's places, in header and dock order (D21: events and Create are gone; Leaders joined in S08).
 */
export const PLACES: Place[] = [
  { key: "1", label: "Rounds", href: "/rounds", icon: CandlestickChart, paths: ["/rounds", "/r/"] },
  { key: "2", label: "Agents", href: "/agents", icon: Bot, paths: ["/agents"] },
  { key: "3", label: "Portfolio", href: "/portfolio", icon: Ticket, paths: ["/portfolio", "/proof/"] },
  { key: "4", label: "Leaders", href: "/leaderboard", icon: Trophy, paths: ["/leaderboard", "/u/"], dock: false },
];

/** The places the phone dock carries (the rest sit in More). */
export const DOCK_PLACES = PLACES.filter((place) => place.dock !== false);

export interface Page {
  label: string;
  href: Route;
  icon: LucideIcon;
  group: "app" | "joge";
}

/** Everything else reachable from More and ⌘K. */
export const PAGES: Page[] = [
  { label: "Status", href: "/status", icon: Activity, group: "joge" },
  { label: "Design system", href: "/dev", icon: Palette, group: "joge" },
];

export const placeFor = (path: string): Place | undefined =>
  PLACES.find((place) => place.paths.some((prefix) => path === prefix || path.startsWith(prefix)));

/** Where a page deeper than its place goes back to: a proof returns to its round; anything else to its place. */
export function backFor(path: string): { href: Route; label: string } | null {
  const proof = /^\/proof\/(\d+)/.exec(path);
  if (proof) return { href: `/r/${proof[1]}` as Route, label: `Round #${proof[1]}` };
  const place = placeFor(path);
  if (!place || place.paths.some((prefix) => path === prefix)) return null;
  return { href: place.href, label: place.label };
}

/** Anything can open the More drawer (e.g. a play-limit blocker sends the player to their limits). */
export const OPEN_MORE_EVENT = "joge:open-more";
