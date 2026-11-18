"use client";

import { ArrowUpRight } from "lucide-react";
import { useSpot } from "@/features/chart/use-spot";
import { cx } from "@/kit";
import { useWalletCoins } from "../wallet/coins.ts";
import { useWallet } from "../wallet/wallet-context.tsx";

const SATS_PER_BCH = 1e8;
const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

/**
 * The wallet pill in the header (Reachwise's button: an ink pill with its arrow on a chartreuse dot). Unpaired it says
 * "Pair a wallet"; paired it shows the wallet's own logo and the balance in dollars, and opens the wallet sheet.
 */
export function WalletButton({ compact = false }: { compact?: boolean }) {
  const wallet = useWallet();
  const coins = useWalletCoins();
  const bchUsd = useSpot("BCH") ?? undefined;
  const connected = wallet.state === "connected";
  const usd = connected && bchUsd ? USD.format((Number(coins.balance) / SATS_PER_BCH) * bchUsd) : null;
  return (
    <button
      type="button"
      onClick={wallet.openConnect}
      aria-label={connected ? `Paired with ${wallet.walletName ?? "a wallet"}` : "Pair a wallet"}
      className={cx(
        "inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full bg-accent font-semibold text-[14px] text-accent-ink transition-transform active:scale-[0.98]",
        compact ? "pr-1.5 pl-4" : "pr-1.5 pl-5",
      )}
    >
      {connected ? (
        <>
          {wallet.walletIcon ? <img src={wallet.walletIcon} alt="" className="-ml-2 size-7 rounded-full" /> : null}
          <span className="tabular-nums">{usd ?? "Paired"}</span>
        </>
      ) : (
        <span>{compact ? "Pair" : "Pair a wallet"}</span>
      )}
      <span className="jg-dot size-8">
        <ArrowUpRight size={16} aria-hidden />
      </span>
    </button>
  );
}
