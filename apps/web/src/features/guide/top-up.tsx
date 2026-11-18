"use client";

import { useWorld } from "../shell/world.tsx";
import { useFaucet } from "./faucet.ts";
import { openGuide } from "./store.ts";

/**
 * "Not enough in your wallet", with its fix in the same line (his test: a top-up refused for $0.13 and nothing told
 * him where coins come from): on chipnet the faucet tops the wallet up right here; on mainnet the guide's funding step
 * shows your address.
 */
export function NotEnough() {
  const world = useWorld();
  const faucet = useFaucet();
  const state = faucet.view?.state ?? null;
  const fix =
    world !== "chipnet" ? (
      <button type="button" onClick={() => openGuide("fund")} className="font-semibold text-[var(--ink)] underline">
        Add BCH
      </button>
    ) : faucet.asking || state === "pending" ? (
      <span className="font-semibold text-[var(--ink)]">Free test BCH on its way…</span>
    ) : state === "sent" ? (
      <span className="font-semibold text-[var(--up-text)]">Test BCH sent · landing now</span>
    ) : (
      <button type="button" onClick={faucet.claim} className="font-semibold text-[var(--ink)] underline">
        Get free test BCH
      </button>
    );
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-2">
      <span>Not enough in your wallet</span>
      {fix}
    </span>
  );
}
