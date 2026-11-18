"use client";

import { ASSET_FEED, type AssetId } from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { useOraclePrint } from "@/live/hooks";
import { pricesQuery } from "../rounds/api.ts";
import { printToDollars, usd } from "../rounds/format.ts";

const SECOND_MS = 1_000;
const RECENT = { seconds: 180 } as const;
const UTC_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/**
 * The product's own heartbeat: every minute General Protocols signs a price. Gold is
 * priced from two feeds, so its lane shows the Bitcoin Cash feed it is built on.
 */
function useHeartbeat(asset: AssetId) {
  const base: AssetId = asset === "GOLD" ? "BCH" : asset;
  const feed = ASSET_FEED[base];
  const live = useOraclePrint(feed);
  const history = useQuery(pricesQuery(base, RECENT));
  return { base, feed, live, print: live ?? history.data?.prints.at(-1) };
}

/** A vermilion ring leaves the card the moment a new signed price arrives. */
export function HeartbeatRing({ asset }: { asset: AssetId }) {
  const { live } = useHeartbeat(asset);
  return live ? <span key={live.dataSequence} aria-hidden className="lp-pulse" /> : null;
}

/** The 署名 stamp pressed onto the card's edge: the latest signed price and when it was signed; it re-presses each minute. */
export function HeartbeatStamp({ asset }: { asset: AssetId }) {
  const { base, feed, print } = useHeartbeat(asset);
  if (!print) return null;
  return (
    <div className="relative z-10 -mt-6 flex justify-center">
      <span
        key={`${print.dataSequence}-${print.timestamp}`}
        className="lp-signed flex items-center gap-2.5 rounded-[14px] bg-[var(--surface-1)] py-2 pr-3.5 pl-2 shadow-[inset_0_0_0_1px_var(--hairline),var(--shadow-float)]"
      >
        <span className="nx-stamp size-10 rounded-[9px] border-2 text-[11px] text-[var(--vermilion)]">署名</span>
        <span className="flex flex-col">
          <span className="nx-num text-[14px] font-semibold">
            {base} {usd(printToDollars(feed, print.price))}
          </span>
          <span className="nx-num text-[11px] text-[var(--muted)]">
            signed {UTC_TIME.format(print.timestamp * SECOND_MS)} UTC
          </span>
        </span>
      </span>
    </div>
  );
}
