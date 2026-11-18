"use client";

import type { Network } from "@joge/db";
import { ArrowUpRight } from "lucide-react";
import { useMoney } from "../rounds/money.ts";
import { EXPLORER } from "./api.ts";
import { SealStamp, type Verdict } from "./verdict.tsx";

interface ReceiptTicket {
  outpoint: string;
  outcome: number;
  stake: number;
  status: string;
  payoutSats: number | null;
  payoutTxid: string | null;
  enterTxid: string;
}

/**
 * Your receipt (Senryo's slip, Mitoshi's cream): the seal pressed in once the round is decided, what came back as the
 * one big figure, what went in, and the two transactions that prove it.
 */
export function Receipt({
  network,
  roundId,
  tickets,
  verdict,
}: {
  network: Network;
  roundId: number;
  tickets: ReceiptTicket[];
  verdict: Verdict | null;
}) {
  const money = useMoney();
  const staked = tickets.reduce((sum, ticket) => sum + ticket.stake, 0);
  const paid = tickets.reduce((sum, ticket) => sum + (ticket.payoutSats ?? 0), 0);
  const first = tickets[0];
  const link = (txid: string, label: string) => (
    <a
      href={`${EXPLORER[network]}${txid}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 underline decoration-[var(--cream-hairline)] underline-offset-4 hover:decoration-current"
    >
      {label} <ArrowUpRight size={12} aria-hidden />
    </a>
  );
  return (
    <section
      aria-label={`Your receipt for round #${roundId}`}
      className="relative flex flex-col gap-4 rounded-[24px] bg-[var(--paper)] p-5 text-[var(--paper-ink)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="nx-eyebrow text-[var(--paper-ink)] opacity-60">{verdict ? "Back" : "In"}</p>
          <p className="nx-num text-[44px] font-semibold leading-none tracking-[-0.05em]">
            {money.format(verdict ? paid : staked)}
          </p>
          {verdict ? <p className="nx-num mt-1 text-[14px] opacity-60">in {money.format(staked)}</p> : null}
        </div>
        {verdict ? <SealStamp verdict={verdict} /> : null}
      </div>
      <div className="nx-num flex flex-wrap gap-x-5 gap-y-1 border-t-2 border-dashed border-[var(--cream-hairline)] pt-3 text-[13px]">
        {first ? link(first.enterTxid, "Entry") : null}
        {first?.payoutTxid ? link(first.payoutTxid, "Payout") : null}
      </div>
    </section>
  );
}
