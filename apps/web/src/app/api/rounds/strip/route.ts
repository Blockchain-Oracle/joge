import { roundStrip } from "@joge/db";
import { toDollars } from "@joge/sdk";
import { MARKETS } from "@/features/terminal/constants";
import { database, networkOf } from "@/server/db";

const STRIP = 48;
const MS = 1_000;

/**
 * One market's last 48 decided rounds as candles, oldest first: open and close are the round's own prices (the signed
 * strike and close when it settled, else the first and last point of its kept path), high and low from the path.
 * Empty rounds are in it too: they happened on chain, nobody played.
 */
export async function GET(request: Request) {
  const asset = new URL(request.url).searchParams.get("asset") ?? "BTC";
  const market = MARKETS.find((each) => each.asset === asset) ?? MARKETS[0];
  const rows = await roundStrip(database.db, networkOf(request), market.thread, STRIP);
  const candles = rows.map(({ round, points }) => {
    const inside = points.filter(([at]) => at >= round.lockTime * MS && at <= round.closeTime * MS).map(([, p]) => p);
    const strike = round.strikePrice === null ? null : toDollars(round.asset, round.strikePrice);
    const close = round.closePrice === null ? null : toDollars(round.asset, round.closePrice);
    const open = strike ?? inside[0] ?? null;
    const last = close ?? inside.at(-1) ?? null;
    const all = [...inside, ...(open === null ? [] : [open]), ...(last === null ? [] : [last])];
    return {
      roundId: round.roundId,
      lockTime: round.lockTime,
      closeTime: round.closeTime,
      state: round.state,
      winner: round.winner,
      entrants: round.entrants,
      pot: round.pot,
      open,
      close: last,
      high: all.length > 0 ? Math.max(...all) : null,
      low: all.length > 0 ? Math.min(...all) : null,
    };
  });
  return Response.json(candles.reverse());
}
