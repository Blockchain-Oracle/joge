import { oracleSeries, priceSeries } from "@joge/db";
import { ASSET, ASSET_FEED, type AssetId } from "@joge/sdk";
import { CHART_WINDOW_MAX_SECONDS, CHART_WINDOW_SECONDS, SECOND_MS } from "@/server/constants";
import { database, nowSeconds } from "@/server/db";

/**
 * A chart's first paint: signed oracle prints and the indicative live line, for the last `seconds` or for a round's own
 * window (`from` and `to`, Unix seconds).
 */
export async function GET(request: Request, context: RouteContext<"/api/prices/[asset]">) {
  const asset = (await context.params).asset.toUpperCase() as AssetId;
  if (!(asset in ASSET)) return Response.json({ error: "unknown asset" }, { status: 404 });
  const query = new URL(request.url).searchParams;
  const asked = { from: Number(query.get("from")), to: Number(query.get("to")) };
  const fixed =
    Number.isSafeInteger(asked.from) && Number.isSafeInteger(asked.to) && asked.to > asked.from && asked.from > 0;
  const requested = Number(query.get("seconds") ?? CHART_WINDOW_SECONDS);
  const seconds = Math.min(
    CHART_WINDOW_MAX_SECONDS,
    Math.max(1, Number.isFinite(requested) ? requested : CHART_WINDOW_SECONDS),
  );
  const from = fixed ? asked.from : nowSeconds() - seconds;
  const to = fixed ? Math.min(asked.to, asked.from + CHART_WINDOW_MAX_SECONDS) : undefined;
  const [prints, live] = await Promise.all([
    asset === "GOLD" ? Promise.resolve([]) : oracleSeries(database.db, ASSET_FEED[asset], from, to),
    priceSeries(
      database.db,
      asset,
      new Date(from * SECOND_MS),
      to === undefined ? undefined : new Date(to * SECOND_MS),
    ),
  ]);
  return Response.json({ asset, prints, live: live.map((tick) => ({ at: tick.at.getTime(), price: tick.price })) });
}
