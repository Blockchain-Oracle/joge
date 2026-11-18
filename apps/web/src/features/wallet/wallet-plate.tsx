"use client";

import { Copy, LogOut } from "lucide-react";
import { useSpot } from "@/features/chart/use-spot";
import { cx, RollingNumber, Skeleton, toast } from "@/kit";
import { copyText } from "@/lib/browser";
import { useWorld } from "../shell/world.tsx";
import { useWalletCoins } from "./coins.ts";
import { useWallet } from "./wallet-context.tsx";

const SATS_PER_BCH = 1e8;
const USD_FORMAT = { style: "currency", currency: "USD", maximumFractionDigits: 2 } as const;
const BCH_DIGITS = 5;
const SHORT = 6;

export const shortAddress = (address: string) => {
  const body = address.split(":").at(-1) ?? address;
  return `${body.slice(0, SHORT)}…${body.slice(-SHORT)}`;
};

/**
 * The wallet (D21): one balance in dollars (BCH under it), the paired wallet's own logo and the payout address to copy,
 * and a 試 sticker while the coins are test coins. Unpaired, it is one button.
 */
export function WalletPlate({ className }: { className?: string }) {
  const wallet = useWallet();
  const coins = useWalletCoins();
  const world = useWorld();
  const bchUsd = useSpot("BCH") ?? undefined;
  const connected = wallet.state === "connected";
  const bch = Number(coins.balance) / SATS_PER_BCH;
  if (!connected) {
    return (
      <button
        type="button"
        onClick={wallet.openConnect}
        className={cx(
          "nx-display flex h-14 items-center justify-center gap-3 rounded-full bg-[var(--ink)] text-[17px] text-[var(--ink-inverse)]",
          className,
        )}
      >
        <img src="/wallets/wizardconnect.png" alt="" className="size-6 rounded" />
        {wallet.state === "reconnecting" ? "Reconnecting…" : "Pair a wallet"}
      </button>
    );
  }
  return (
    <div className={cx("flex flex-col gap-3 rounded-[24px] bg-[var(--surface-1)] p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {coins.isPending ? (
            <Skeleton className="h-10 w-36" label="Reading your balance" />
          ) : bchUsd ? (
            <RollingNumber
              value={bch * bchUsd}
              format={USD_FORMAT}
              className="nx-num block text-[40px] font-semibold leading-none tracking-[-0.04em]"
            />
          ) : null}
          <p className="nx-num mt-1 text-[13px] text-[var(--muted)]">{bch.toFixed(BCH_DIGITS)} BCH</p>
        </div>
        <div className="flex items-center gap-1.5">
          {world === "chipnet" ? (
            <span
              className="nx-sticker bg-[var(--gold)] px-2.5 py-1 text-[12px] text-[#1a1406]"
              title="Test coins (chipnet)"
            >
              <span className="nx-jp">試</span> test
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void wallet.disconnect()}
            aria-label="Disconnect the wallet"
            className="grid size-9 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--glass)] hover:text-[var(--ink)]"
          >
            <LogOut size={16} aria-hidden />
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          void copyText(wallet.payout?.address ?? "");
          toast({ tone: "info", title: "Address copied" });
        }}
        className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-2 text-left"
        title="Payouts land at this address"
      >
        {wallet.walletIcon ? <img src={wallet.walletIcon} alt="" className="size-5 rounded" /> : null}
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{wallet.walletName ?? "Wallet"}</span>
        <span className="nx-num text-[12px] text-[var(--muted)]">
          {wallet.payout ? shortAddress(wallet.payout.address) : ""}
        </span>
        <Copy size={13} aria-hidden className="text-[var(--muted)]" />
      </button>
    </div>
  );
}
