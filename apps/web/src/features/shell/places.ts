import {
  Activity,
  BookOpen,
  Bot,
  CandlestickChart,
  Compass,
  History,
  type LucideIcon,
  Palette,
  PlayCircle,
  Ticket,
  Trophy,
} from "lucide-react";
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
 * The app's places, in header and dock order.
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

/** The docs site (its own deploy): linked from the header, More, ⌘K, the landing's bar and its footer. */
export const DOCS_URL = (process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.getjoge.xyz") as Route;

/** Everything else reachable from More and ⌘K. */
export const PAGES: Page[] = [
  // The first-run guide, reopened from here and ⌘K (the host opens it for `?guide=1`).
  { label: "Previous rounds", href: "/rounds/previous", icon: History, group: "app" },
  { label: "Guide", href: "/rounds?guide=1" as Route, icon: Compass, group: "joge" },
  { label: "Status", href: "/status", icon: Activity, group: "joge" },
  { label: "Demo video", href: "/demo", icon: PlayCircle, group: "joge" },
  { label: "Docs", href: DOCS_URL, icon: BookOpen, group: "joge" },
  // The design gallery is for building Jōge, not for players: it is listed only in development.
  ...(process.env.NODE_ENV === "production"
    ? []
    : [{ label: "Design system", href: "/dev" as Route, icon: Palette, group: "joge" as const }]),
];

export const placeFor = (path: string): Place | undefined =>
  PLACES.find((place) => place.paths.some((prefix) => path === prefix || path.startsWith(prefix)));

/** Where a page deeper than its place goes back to: a proof to its round, a round to the previous rounds, else its place. */
export function backFor(path: string): { href: Route; label: string } | null {
  const proof = /^\/proof\/(\d+)/.exec(path);
  if (proof) return { href: `/r/${proof[1]}` as Route, label: "The round" };
  if (path.startsWith("/r/")) return { href: "/rounds/previous", label: "Previous rounds" };
  const place = placeFor(path);
  if (!place || place.paths.some((prefix) => path === prefix)) return null;
  return { href: place.href, label: place.label };
}

/** Anything can open the More drawer (e.g. a play-limit blocker sends the player to their limits). */
export const OPEN_MORE_EVENT = "joge:open-more";
