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
