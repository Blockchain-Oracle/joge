import { leaderboard } from "@joge/db";
import { database, networkOf, nowSeconds } from "@/server/db";

const DAY_SECONDS = 86_400;
const DAYS_PER_WEEK = 7;
const WEEK_SECONDS = DAYS_PER_WEEK * DAY_SECONDS;
const PERIODS = { day: DAY_SECONDS, week: WEEK_SECONDS, all: null } as const;
type Period = keyof typeof PERIODS;

/** The best players of a period (`?period=day|week|all`), by money won; a player is a payout address. */
export async function GET(request: Request) {
  const network = networkOf(request);
  const asked = new URL(request.url).searchParams.get("period");
  const period: Period = asked === "day" || asked === "week" ? asked : "all";
  const span = PERIODS[period];
  const players = await leaderboard(database.db, network, span === null ? null : nowSeconds() - span);
  return Response.json({ network, period, players });
}
