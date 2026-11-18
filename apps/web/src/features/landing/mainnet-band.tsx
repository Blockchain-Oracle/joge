"use client";

import { deploymentFor } from "@joge/contracts/browser";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { EXPLORER } from "../round/api.ts";
import { setWorld } from "../shell/world.tsx";

const SINCE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const SHORT = 6;

/** The mainnet deployment, when there is one (its genesis is the proof anyone can open). */
function mainnet() {
  try {
    return deploymentFor("mainnet");
  } catch {
    return null;
  }
}

/** The hero's badge: the 本 stamp, a live pulse and the words, in vermilion. */
export function MainnetBadge() {
  return (
    <span className="lp-mainnet-badge inline-flex items-center gap-3 rounded-full bg-[var(--vermilion)] py-2 pr-5 pl-2 text-white shadow-[0_18px_40px_-18px_var(--vermilion)]">
      <span className="nx-jp grid size-9 place-items-center rounded-full bg-white font-bold text-[18px] text-[var(--vermilion)]">
        本
      </span>
      <span className="lp-live lp-live-white" aria-hidden />
      <span className="nx-display text-[clamp(15px,1.6vw,19px)] tracking-[-0.01em]">Live on Bitcoin Cash mainnet</span>
    </span>
  );
}

/**
 * The mainnet moment under the hero: one huge line that it is live with real money, and the proof a judge can open —
 * the day it went live and its genesis transaction on the explorer — then a way straight into mainnet.
 */
export function MainnetBand() {
  const deployment = mainnet();
  if (!deployment) return null;
  const genesis = deployment.genesisTxid;
  return (
    <section
      aria-label="Live on mainnet"
      className="relative isolate overflow-hidden rounded-[36px] bg-[var(--vermilion)] px-6 py-10 text-white md:px-12 md:py-14"
    >
      <span
        aria-hidden
        className="nx-jp pointer-events-none absolute -right-6 -bottom-16 -z-10 font-bold text-[clamp(12rem,26vw,22rem)] leading-none text-white opacity-[0.12]"
      >
        本
      </span>
      <p className="nx-num flex items-center gap-2 text-[13px] uppercase tracking-[0.18em] opacity-90">
        <span className="lp-live lp-live-white" aria-hidden /> Mainnet · real BCH
      </p>
      <h2 className="nx-display mt-3 max-w-[14ch] text-[clamp(40px,7vw,92px)] leading-[0.95] tracking-[-0.045em]">
        Live on Bitcoin Cash mainnet.
      </h2>
      <p className="mt-5 max-w-[34rem] text-[clamp(16px,1.6vw,19px)] opacity-90">
        Real rounds, real payouts, settled by contracts on chain since {SINCE.format(new Date(deployment.createdAt))}.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/rounds"
          onClick={() => setWorld("mainnet")}
          className="inline-flex h-14 items-center rounded-full bg-white px-7 font-semibold text-[16px] text-[var(--vermilion)]"
        >
          Play on mainnet
        </Link>
        <a
          href={`${EXPLORER.mainnet}${genesis}`}
          target="_blank"
          rel="noreferrer"
          className="nx-num inline-flex h-14 items-center gap-2 rounded-full bg-white/15 px-6 text-[14px] hover:bg-white/25"
        >
          Genesis {genesis.slice(0, SHORT)}…{genesis.slice(-SHORT)} <ArrowUpRight size={16} aria-hidden />
        </a>
      </div>
    </section>
  );
}
