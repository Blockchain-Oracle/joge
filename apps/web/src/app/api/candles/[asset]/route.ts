import { candleSeries } from "@joge/db";
import { ASSET, type AssetId } from "@joge/sdk";
import { CANDLE_RANGES, type CandleRange } from "@/features/chart/ranges";
import { database, nowSeconds } from "@/server/db";

/** The terminal's history views: the last hour in 1-minute candles, the last day in 15-minute ones. */
export async function GET(request: Request, context: RouteContext<"/api/candles/[asset]">) {
  const asset = (await context.params).asset.toUpperCase() as AssetId;
  if (!(asset in ASSET)) return Response.json({ error: "unknown asset" }, { status: 404 });
  const range = (new URL(request.url).searchParams.get("range") ?? "1h") as CandleRange;
  const spec = CANDLE_RANGES[range];
  if (!spec) return Response.json({ error: "unknown range" }, { status: 400 });
  const candles = await candleSeries(database.db, asset, nowSeconds() - spec.seconds, spec.bucketSeconds);
  return Response.json({ asset, range, bucketSeconds: spec.bucketSeconds, candles });
}
