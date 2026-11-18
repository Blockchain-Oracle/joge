import type { AssetId } from "@joge/sdk";
import type { CSSProperties } from "react";
import { cx } from "@/kit/cx";
import { ASSET_MARKS } from "./asset-marks.generated.ts";

/** Each asset's own colour (its brand colour as `solid`; c1/c2 kept for gradients elsewhere). */
export const ASSET_TONE: Record<AssetId, { c1: string; c2: string; solid: string; name: string }> = {
  BTC: { c1: "#ffb84d", c2: "#e07b00", solid: "#f7931a", name: "Bitcoin" },
  ETH: { c1: "#93a8ff", c2: "#4a5fd0", solid: "#627eea", name: "Ether" },
  BCH: { c1: "#45e3ad", c2: "#06956c", solid: "#0ac18e", name: "Bitcoin Cash" },
  GOLD: { c1: "#e9c46a", c2: "#b8892a", solid: "#c99a2e", name: "Gold" },
};

/** Gold's mark: a cast bar seen from the front, drawn on the same 24-unit grid as the coin logos. */
const INGOT =
  '<path fill="currentColor" fill-rule="evenodd" d="M7.1 7.5h9.8l3.6 9.5h-17zm1.4 2-2.1 5.5h11.2l-2.1-5.5z" clip-rule="evenodd"/><path fill="currentColor" d="M9.6 11.3h4.8l.8 2.2H8.8z"/>';

const MARKUP: Record<AssetId, string> = { ...ASSET_MARKS, GOLD: INGOT };

/** An asset's real logo, in the current colour. */
export function AssetMark({ asset, size = 20, className }: { asset: AssetId; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={ASSET_TONE[asset].name}
      className={className}
      // Build-time logo markup from scripts/marks.ts, never user input.
      dangerouslySetInnerHTML={{ __html: MARKUP[asset] }}
    />
  );
}

const MARK_SHARE = 0.62;

/** The asset as a coin: its real logo in white on a disc of its own colour (how wallets and exchanges show it). */
export function AssetCube({ asset, size = 44, className }: { asset: AssetId; size?: number; className?: string }) {
  const tone = ASSET_TONE[asset];
  return (
    <span
      className={cx("jg-candy", className)}
      style={{ width: size, height: size, "--c1": tone.solid } as CSSProperties}
    >
      <AssetMark asset={asset} size={Math.round(size * MARK_SHARE)} />
    </span>
  );
}
