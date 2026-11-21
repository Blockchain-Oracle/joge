"use client";

import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, Share2, Ticket, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, Skeleton } from "@/kit";
import { fundedFloor } from "../guide/faucet.ts";
import { openGuide } from "../guide/store.ts";
import { profileHref } from "../players/api.ts";
import { StoryFilm } from "../replay/story-film.tsx";
import { clockTime } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import { RunShareSheet } from "../share/run-share.tsx";
import { ShareSheet } from "../share/share-sheet.tsx";
import { useWorld } from "../shell/world.tsx";
import { useJournal } from "../ticket/journal.ts";
import { useWalletCoins } from "../wallet/coins.ts";
import { useWallet } from "../wallet/wallet-context.tsx";
import { WALLETS } from "../wallet/wallets.ts";
import { Side, TicketLine, type TicketRow } from "./ticket-row.tsx";

const PERCENT = 100;
const SECOND_MS = 1_000;
const SETTLED = new Set(["won", "lost", "refunded"]);

/**
 * Your tickets: one big number (what you are up or down), three small ones, what is still in play, then every
 * ticket as a row of four facts: the side, the round, the stake and how it ended. All of it read from the chain.
 */
export function Portfolio() {
  const network = useWorld();
  const wallet = useWallet();
  const journal = useJournal();
  const money = useMoney();
  const coins = useWalletCoins();
  const [sharing, setSharing] = useState<number | null>(null);
  const [runOpen, setRunOpen] = useState(false);
  const receive = wallet.keys.filter((key) => key.path === "receive").map((key) => key.pkh);
  const tickets = useQuery({
    queryKey: ["tickets", network, receive.join(",")],
    enabled: receive.length > 0,
    queryFn: async () => {
      const response = await fetch(`/api/tickets?network=${network}&pkh=${receive.join(",")}`);
      if (!response.ok) throw new Error(`tickets answered ${response.status}`);
      return ((await response.json()) as { tickets: TicketRow[] }).tickets;
    },
  });

  if (wallet.state !== "connected") {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <ul className="flex -space-x-3" aria-label="Wallets that pair with Jōge">
          {WALLETS.map((each) => (
            <li
              key={each.name}
              className="grid size-14 place-items-center rounded-[18px] bg-[var(--surface-1)] ring-4 ring-[var(--bg)]"
            >
              <img src={each.logo} alt={each.name} className="size-8 object-contain" />
            </li>
          ))}
        </ul>
        <h1 className="nx-display text-[clamp(30px,5vw,44px)]">Your tickets</h1>
        {/* The guide walks a first-timer through it: a wallet, pairing, coins, a first call. */}
        <button
          type="button"
          onClick={() => openGuide("wallet")}
          className="nx-display h-14 rounded-full bg-[var(--vermilion)] px-8 text-[17px] text-white"
        >
          Get started
        </button>
      </div>
    );
  }
  if (tickets.isPending) return <Skeleton className="h-64 rounded-[24px]" label="Reading your tickets" />;
  const rows = tickets.data ?? [];
  const indexed = new Set(rows.map((row) => row.ticket.enterTxid));
  const pending = journal.filter(
    (entry) => entry.network === network && entry.txid && !indexed.has(entry.txid) && entry.state !== "lost",
  );
  const settled = rows.filter((row) => SETTLED.has(row.ticket.status));
  const staked = settled.reduce((sum, row) => sum + row.ticket.stake, 0);
  const back = settled.reduce((sum, row) => sum + (row.ticket.payoutSats ?? 0), 0);
  const decided = settled.filter((row) => row.ticket.status !== "refunded");
  const hits = decided.filter((row) => row.ticket.status === "won").length;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[32px] bg-[var(--stage)] p-6 shadow-[inset_0_0_0_1px_var(--hairline)] md:p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="nx-eyebrow">Net</p>
          {wallet.payout ? (
            <span className="flex flex-wrap items-center justify-end gap-2">
              {settled.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setRunOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--vermilion)] px-3.5 font-semibold text-[13px] text-white"
                >
                  <Share2 aria-hidden className="size-3.5" /> Share my run
                </button>
              ) : null}
              <Link
                href={profileHref(network, wallet.payout.pkh) as never}
                className="nx-glass inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 font-semibold text-[13px]"
              >
                <Trophy aria-hidden className="size-3.5 text-[var(--vermilion)]" /> Your record
              </Link>
            </span>
          ) : null}
        </div>
        {settled.length > 0 ? (
          // Your story as a film: the running net round by round, with each round's own sound (tap a disc to watch it).
          <StoryFilm rows={rows} big />
        ) : (
          <p className="nx-num text-[clamp(48px,8vw,80px)] font-semibold leading-none tracking-[-0.05em]">
            {money.format(0)}
          </p>
        )}
        <dl className="grid grid-cols-3 gap-4">
          {[
            { label: "In", value: money.format(staked) },
            { label: "Back", value: money.format(back) },
            { label: "Right", value: decided.length ? `${Math.round((hits / decided.length) * PERCENT)}%` : "—" },
          ].map((fact) => (
            <div key={fact.label}>
              <dt className="nx-eyebrow">{fact.label}</dt>
              <dd className="nx-num text-[18px] font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      {pending.length > 0 ? (
        <section className="flex flex-col gap-1.5" aria-label="On its way">
          {pending.map((entry) => (
            <Link
              key={entry.id}
              href={`/r/${entry.roundId}`}
              className="flex items-center gap-3 rounded-[18px] bg-[var(--surface-1)] p-3"
            >
              <Side outcome={entry.outcome} />
              <span className="nx-num flex-1 text-[14px] text-[var(--ink-2)]">{clockTime(entry.at / SECOND_MS)}</span>
              <span className="nx-num text-[15px] font-semibold">{money.format(Number(entry.stake))}</span>
              {entry.state === "failed" ? (
                <span className="nx-eyebrow text-[var(--down-text)]">failed</span>
              ) : (
                <LoaderCircle aria-label="On its way" className="size-4 text-[var(--muted)] motion-safe:animate-spin" />
              )}
            </Link>
          ))}
        </section>
      ) : null}
      {rows.length === 0 ? (
        // Paired but nothing played: the next step, coins first if the wallet has too few for a call.
        coins.data && coins.balance < fundedFloor(network) ? (
          <EmptyState
            icon={Ticket}
            title={network === "chipnet" ? "Get test BCH to play" : "Add BCH to play"}
            action={{ label: network === "chipnet" ? "Get test BCH" : "Add BCH", onClick: () => openGuide("fund") }}
          />
        ) : (
          <EmptyState icon={Ticket} title="No tickets yet" action={{ label: "Play a round", href: "/rounds" }} />
        )
      ) : (
        <section className="flex flex-col gap-1.5" aria-label="Tickets">
          {rows.map(({ ticket, round }) => (
            <TicketLine key={ticket.outpoint} ticket={ticket} round={round} onShare={setSharing} />
          ))}
        </section>
      )}
      {sharing === null ? null : <ShareSheet roundId={sharing} open onClose={() => setSharing(null)} />}
      {runOpen && wallet.payout ? (
        <RunShareSheet rows={rows} pkh={wallet.payout.pkh} open onClose={() => setRunOpen(false)} />
      ) : null}
    </div>
  );
}
