"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet } from "@/kit";
import { type SignRequest, useWallet } from "./wallet-context.tsx";
import { WALLETS, WIZARDCONNECT_LOGO } from "./wallets.ts";

/** After this long without an answer the card says where the request is waiting. */
const NUDGE_MS = 15_000;
const TICK_MS = 1_000;
const SECONDS = 60;

/** The card's face: which wallet, what it is asked to sign, how long it has waited, and Cancel. */
export function SignCard({
  request,
  name,
  logo,
  waited,
  onCancel,
}: {
  request: SignRequest;
  name: string;
  logo: string;
  /** Seconds since the wallet was asked. */
  waited: number;
  onCancel: () => void;
}) {
  const clock = `${Math.floor(waited / SECONDS)}:${String(waited % SECONDS).padStart(2, "0")}`;
  return (
    <div className="flex flex-col items-center gap-4 pt-6 pb-1 text-center" aria-live="polite">
      <div className="relative grid size-24 place-items-center">
        {request.done ? null : (
          <span className="absolute inset-0 rounded-full border-2 border-[var(--vermilion)] motion-safe:animate-ping" />
        )}
        <span
          className={`relative grid size-24 place-items-center rounded-full border-2 ${
            request.done ? "border-[var(--up)] bg-[var(--up)]" : "border-[var(--vermilion)] bg-[var(--surface-2)]"
          }`}
        >
          {request.done ? (
            <Check size={44} className="text-[var(--up-ink)]" aria-hidden />
          ) : (
            <img src={logo} alt="" className="size-14 rounded-[14px]" />
          )}
        </span>
      </div>
      <h2 className="nx-display text-[26px] leading-tight">{request.done ? "Signed" : `Confirm in ${name}`}</h2>
      <p className="nx-glass rounded-full px-4 py-2 font-semibold text-[15px]">{request.what}</p>
      {request.done ? null : (
        <>
          <p className="max-w-[20rem] text-balance text-[14px] text-[var(--ink-2)]">
            {waited * TICK_MS >= NUDGE_MS
              ? `Not seeing it? Open ${name}: the request is waiting there.`
              : `${name} is showing the request. Nothing moves until you approve it.`}
          </p>
          <div className="flex w-full items-center justify-between pt-2">
            <span className="nx-num text-[13px] text-[var(--muted)]">Waiting {clock}</span>
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-full bg-[var(--surface-2)] px-5 font-semibold text-[14px] hover:bg-[var(--surface-3)]"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The one card every signature shows, on every page: which wallet to look at, what it is being asked to sign (the
 * same words the wallet shows), how long it has waited, and a way out. A request that is only in the wallet's own
 * window is easy to miss; this says so.
 */
export function SignPrompt() {
  const wallet = useWallet();
  const request = wallet.signing;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!request || request.done) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [request]);

  const name = wallet.walletName ?? "your wallet";
  const logo =
    wallet.walletIcon ??
    WALLETS.find((each) => wallet.walletName?.toLowerCase().includes(each.name.toLowerCase()))?.logo ??
    WIZARDCONNECT_LOGO;
  const waited = request ? Math.max(0, Math.floor((now - request.since) / TICK_MS)) : 0;

  return (
    <Sheet open={request !== null} onClose={wallet.cancelSigning}>
      {request ? (
        <SignCard request={request} name={name} logo={logo} waited={waited} onCancel={wallet.cancelSigning} />
      ) : null}
    </Sheet>
  );
}
