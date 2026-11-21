"use client";

import { ArrowRight, ExternalLink, LoaderCircle } from "lucide-react";
import { cx } from "@/kit";
import { EXPLORER } from "../round/api.ts";
import { useMoney } from "../rounds/money.ts";
import { centreOf, switchWorld } from "../shell/world.tsx";
import { useWalletCoins } from "../wallet/coins.ts";
import { useWallet } from "../wallet/wallet-context.tsx";
import { useFaucet } from "./faucet.ts";
import { openGuide } from "./store.ts";

const WHEN = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

/**
 * The faucet's one button, in every state it can be in: one tap asks for free test coins, then it says they are on
 * their way, then that they landed. When our faucet is resting it opens the guide's list of outside faucets.
 */
export function TestCoinsButton({ className }: { className?: string }) {
  const faucet = useFaucet();
  const money = useMoney();
  const view = faucet.view;
  const base = cx(
    "flex h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold text-[15px] transition-opacity",
    className,
  );
  if (faucet.asking || view?.state === "pending")
    return (
      <span className={cx(base, "bg-[var(--gold)] text-[#1a1406] opacity-80")}>
        <LoaderCircle size={17} aria-hidden className="motion-safe:animate-spin" /> Sending free test BCH…
      </span>
    );
  if (view?.state === "sent" && view.txid)
    return (
      <a
        href={`${EXPLORER.chipnet}${view.txid}`}
        target="_blank"
        rel="noreferrer"
        className={cx(base, "bg-[var(--surface-2)] text-[var(--ink)]")}
      >
        +{money.format(view.sats ?? 0)} test BCH on its way <ExternalLink size={15} aria-hidden />
      </a>
    );
  if (view?.nextAt && view.state !== "dry")
    return (
      <span className={cx(base, "bg-[var(--surface-2)] text-[var(--muted)]")}>More at {WHEN.format(view.nextAt)}</span>
    );
  if (view?.state === "dry")
    return (
      <button type="button" onClick={() => openGuide("fund")} className={cx(base, "bg-[var(--surface-2)]")}>
        Our faucet is resting · other faucets <ArrowRight size={16} aria-hidden />
      </button>
    );
  return (
    <button
      type="button"
      onClick={faucet.claim}
      className={cx(base, "bg-[var(--gold)] text-[#1a1406] hover:opacity-90")}
    >
      <span className="nx-jp text-[17px]">試</span> Get free test BCH
    </button>
  );
}

/**
 * Chipnet with an empty (or nearly empty) wallet: says plainly that this is the test world, what the wallet holds,
 * and gives the coins in one tap, with the way to real BCH beside it (his report: "nobody will know this is testnet").
 */
export function TestCoinsCard({ className }: { className?: string }) {
  const wallet = useWallet();
  const coins = useWalletCoins();
  const money = useMoney();
  const empty = coins.balance === 0n;
  return (
    <section
      className={cx(
        "flex flex-col items-center gap-4 rounded-[28px] border border-[color-mix(in_oklab,var(--gold)_45%,transparent)] bg-[color-mix(in_oklab,var(--gold)_9%,var(--surface-1))] px-6 py-9 text-center",
        className,
      )}
    >
      <span className="nx-sticker bg-[var(--gold)] text-[#1a1406]" style={{ ["--tilt" as string]: "-3deg" }}>
        <span className="nx-jp">試</span> Chipnet · test coins
      </span>
      <p className="nx-display text-[26px] leading-tight">
        {empty ? "No test BCH yet." : `${money.format(coins.balance)} of test BCH.`}
      </p>
      <p className="max-w-sm text-[15px] text-[var(--ink-2)]">
        {empty ? `${wallet.walletName ?? "Your wallet"} is empty on chipnet. ` : ""}Free coins, enough for twenty calls.
        Nothing here is real money.
      </p>
      <TestCoinsButton className="w-full max-w-xs" />
      <button
        type="button"
        onClick={(event) => switchWorld("mainnet", centreOf(event.currentTarget))}
        className="text-[14px] font-semibold text-[var(--muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
      >
        Play with real BCH on mainnet
      </button>
    </section>
  );
}
