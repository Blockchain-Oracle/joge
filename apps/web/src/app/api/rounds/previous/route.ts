import { previousRounds } from "@joge/db";
import { toDollars } from "@joge/sdk";
import { MARKETS } from "@/features/terminal/constants";
import { database, networkOf, nowSeconds } from "@/server/db";

const PAGE = 20;
const MAX_PAGE = 50;

/**
 * Finished rounds of the four markets, newest first, as the Previous rounds list shows them: market, time, result,
 * the price move, pot and entries (prices already in dollars). `?asset=` picks one market; `?before=` pages back.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const asset = url.searchParams.get("asset");
  const threads = MARKETS.filter((market) => !asset || market.asset === asset).map((market) => market.thread);
  const before = Number(url.searchParams.get("before")) || nowSeconds() + 1;
  const limit = Math.min(MAX_PAGE, Number(url.searchParams.get("limit")) || PAGE);
  const rows = await previousRounds(database.db, networkOf(request), threads, before, limit);
  return Response.json(
    rows.map((round) => ({
      roundId: round.roundId,
      asset: round.asset,
      laneSeconds: round.laneSeconds,
      lockTime: round.lockTime,
      closeTime: round.closeTime,
      state: round.state,
      winner: round.winner,
      voidReason: round.voidReason,
      entrants: round.entrants,
      pot: round.pot,
      strike: round.strikePrice === null ? null : toDollars(round.asset, round.strikePrice),
      close: round.closePrice === null ? null : toDollars(round.asset, round.closePrice),
    })),
  );
}
