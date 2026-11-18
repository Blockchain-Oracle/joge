/** Read-side windows and page sizes. */

/** How far back the lobby looks for a lane's last finished round (the longest lane, plus slack). */
export const LAST_ROUND_WINDOW_SECONDS = 2 * 60 * 60;
/** A boundary pair sits within minutes of its boundary (the oracle signs every minute). */
export const PAIR_WINDOW_SECONDS = 15 * 60;
/** Most oracle prints one chart request returns (10 hours at one a minute). */
export const CHART_POINTS = 600;
/** Most entries one round request returns (the round page virtualises past this). */
export const ENTRIES_PAGE = 200;
/** How many finished rounds per lane the lobby's results strip shows. */
export const RECENT_RESULTS = 14;
/** How many players the leaderboard lists. */
export const LEADERBOARD_ROWS = 50;
/** A profile's activity grid covers this many days (twelve weeks). */
export const PROFILE_DAYS = 84;
/** How many decided tickets a profile reads to find its streaks. */
export const STREAK_TICKETS = 500;

// Chipnet faucet (S09R, Agari's rules): a wallet below the threshold is topped up to the target, never more.
const FAUCET_HOUR_MS = 60 * 60 * 1_000;
/** A wallet holding less than this gets topped up. */
export const FAUCET_THRESHOLD_SATS = 200_000n;
/** ...to this (enough for about twenty $0.10 calls on chipnet). */
export const FAUCET_TARGET_SATS = 1_000_000n;
/** One top-up per address per this long. */
export const FAUCET_ADDRESS_COOLDOWN_MS = 12 * FAUCET_HOUR_MS;
/** Claims per visitor (hashed IP) per day. */
export const FAUCET_VISITOR_PER_DAY = 5;
export const FAUCET_DAY_MS = 24 * FAUCET_HOUR_MS;
/** Most the faucet pays out in a day, all visitors together. */
export const FAUCET_DAILY_SATS = 60_000_000n;
/** The faucet wallet keeps this much; below it, claims answer "dry" with outside faucets. */
export const FAUCET_RESERVE_SATS = 2_000_000n;
