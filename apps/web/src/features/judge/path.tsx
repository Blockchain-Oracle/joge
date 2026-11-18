"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cue, cx, Drawer } from "@/kit";
import type { TicketRow } from "../portfolio/ticket-row.tsx";
import { useWorld } from "../shell/world.tsx";
import { useWallet } from "../wallet/wallet-context.tsx";
import { leaveDesk, useDeskSteps } from "./desk.ts";

const DECIDED = new Set(["won", "lost", "refunded"]);

/** The desk's own tickets, read from the chain's record (refreshed when its rounds move: LiveSync). */
function useDeskTickets() {
  const network = useWorld();
  const wallet = useWallet();
  const pkh = wallet.desk ? wallet.payout?.pkh : undefined;
  return useQuery({
    queryKey: ["tickets", network, pkh ?? ""],
    enabled: pkh !== undefined,
    queryFn: async () => {
      const response = await fetch(`/api/tickets?network=${network}&pkh=${pkh}`);
      return ((await response.json()) as { tickets: TicketRow[] }).tickets;
    },
  });
}

/**
 * The judge's path (Mitoshi's three steps): enter a round, get paid without a claim, check the proof yourself. The
 * first two tick from the desk's tickets on chain, the third when Verify all finishes on a proof page.
 */
export function useJudgePath() {
  const tickets = useDeskTickets();
  const steps = useDeskSteps();
  const rows = tickets.data ?? [];
  const paid = rows.find((row) => DECIDED.has(row.ticket.status));
  return [
    {
      key: "enter",
      title: "Enter a round",
      line: "Up or Down on BTC 5 min · 30 s",
      done: rows.length > 0,
      href: "/rounds",
    },
    {
      key: "paid",
      title: "Get paid, no claim",
      line: "It lands in the wallet when the round closes",
      done: paid !== undefined,
      href: paid ? `/r/${paid.ticket.roundId}` : "/portfolio",
    },
    {
      key: "proof",
      title: "Check the proof",
      line: "Every signed price re-checked in your browser",
      done: steps.has("proof"),
      href: paid ? `/proof/${paid.ticket.roundId}` : rows[0] ? `/proof/${rows[0].ticket.roundId}` : "/rounds",
    },
  ];
}

/** The header chip while a judge holds the desk: 審 and how far along the path they are; it opens the path. */
export function JudgeChip() {
  const wallet = useWallet();
  const router = useRouter();
  const path = useJudgePath();
  const [open, setOpen] = useState(false);
  if (!wallet.desk) return null;
  const done = path.filter((step) => step.done).length;
  return (
    <>
      <button
        type="button"
        onClick={() => {
          cue("open");
          setOpen(true);
        }}
        aria-label={`Judge path, ${done} of ${path.length} done`}
        className="flex h-11 items-center gap-2 rounded-full px-3.5 font-semibold text-[13px] shadow-[inset_0_0_0_1.5px_var(--vermilion)]"
      >
        <span className="nx-jp text-[15px] text-[var(--vermilion)]">審</span>
        <span className="nx-num">
          {done}/{path.length}
        </span>
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Judge wallet">
        <div className="flex flex-col gap-4">
          <ol className="flex flex-col gap-2">
            {path.map((step, index) => (
              <li key={step.key}>
                <Link
                  href={step.href as never}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-[20px] bg-[var(--surface-2)] p-3.5 transition-colors hover:bg-[var(--surface-3)]"
                >
                  <span
                    className={cx(
                      "nx-num grid size-8 shrink-0 place-items-center rounded-full text-[14px] font-semibold",
                      step.done ? "bg-[var(--up)] text-[var(--up-ink)]" : "bg-[var(--surface-3)]",
                    )}
                  >
                    {step.done ? <Check aria-hidden className="size-4" strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-semibold text-[15px]">{step.title}</span>
                    <span className="text-[13px] text-[var(--muted)]">{step.line}</span>
                  </span>
                  <ArrowRight aria-hidden className="size-4 text-[var(--muted)]" />
                </Link>
              </li>
            ))}
          </ol>
          <p className="text-[13px] text-[var(--muted)]">Every judge shares this wallet.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                wallet.openConnect();
              }}
              className="nx-glass h-11 rounded-full px-5 font-semibold text-[14px]"
            >
              Pair your own wallet
            </button>
            <button
              type="button"
              onClick={() => {
                leaveDesk();
                setOpen(false);
                router.push("/");
              }}
              className="h-11 rounded-full px-4 font-semibold text-[14px] text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Give it back
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
