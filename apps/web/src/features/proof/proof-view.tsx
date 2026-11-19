"use client";

import { deploymentFor } from "@joge/contracts/browser";
import type { Network, RoundRow } from "@joge/db";
import {
  BPS,
  type FeedId,
  fetchMessages,
  MIN_FEE_OUTPUT,
  PROTOCOL_FEE_BPS,
  SWEEP_FEE_PER_TICKET,
  TICKET_DUST,
  verifyMessageSignature,
} from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, SearchX, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cx, EmptyState, Skeleton } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { addressOf } from "../players/api.ts";
import { roundQuery } from "../round/api.ts";
import { RoundStamp } from "../round/verdict.tsx";
import { roundName, usd } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import { useWorld } from "../shell/world.tsx";
import { ChainList, type CheckState, PayoutMath, SignedTile, WinnerRow } from "./pieces.tsx";

interface OracleRow {
  feed: FeedId;
  messageSequence: number;
  dataSequence: number;
  timestamp: number;
  price: number;
  message: string;
  signature: string;
}
interface Pair {
  previous: OracleRow;
  first: OracleRow;
}
interface ProofResponse {
  round: RoundRow;
  feeds: Array<{
    feed: FeedId;
    publicKey: string;
    scaling: number;
    lock: Pair | null;
    strike: OracleRow | null;
    close: Pair | null;
  }>;
}
type Check = CheckState;
type Match = "idle" | "checking" | "same" | "different" | "unavailable";

const NOT_FOUND = 404;
/** One feed decides a round with three tiles (lock, to beat, close); gold shows two feeds. */
const ONE_FEED_TILES = 3;

const proofQuery = (network: Network, roundId: number) => ({
  queryKey: ["proof", network, roundId],
  queryFn: async (): Promise<ProofResponse | null> => {
    const response = await fetch(`/api/rounds/${roundId}/proof?network=${network}`);
    if (response.status === NOT_FOUND) return null;
    if (!response.ok) throw new Error(`proof answered ${response.status}`);
    return (await response.json()) as ProofResponse;
  },
});

/**
 * A round's proof: every signed price that decided it, re-checked in the reader's browser (the Schnorr signature
 * against General Protocols' key, and the same message fetched from General Protocols itself), the payout maths
 * recomputed from the chain's numbers, the covenants' addresses and every transaction. Nothing here asks you to
 * trust Jōge's server.
 */
export function ProofView({ roundId }: { roundId: number }) {
  const network = useWorld();
  const proof = useQuery(proofQuery(network, roundId));
  const view = useQuery(roundQuery(network, roundId));
  const money = useMoney();
  const [checks, setChecks] = useState<Record<string, { signature: Check; source: Match }>>({});

  if (proof.isPending || view.isPending) return <Skeleton className="h-[520px]" label="Loading the proof" />;
  if (!proof.data || !view.data) {
    return (
      <EmptyState icon={SearchX} title={`No round #${roundId}`} action={{ label: "See the rounds", href: "/rounds" }} />
    );
  }
  const { round, feeds } = proof.data;
  const rows = feeds.flatMap((feed) => [
    ...(feed.lock
      ? [
          { role: "Before lock", row: feed.lock.previous, feed },
          { role: "Lock", row: feed.lock.first, feed },
        ]
      : []),
    ...(feed.strike ? [{ role: "To beat", row: feed.strike, feed }] : []),
    ...(feed.close
      ? [
          { role: "Before close", row: feed.close.previous, feed },
          { role: "Close", row: feed.close.first, feed },
        ]
      : []),
  ]);
  const key = (row: OracleRow) => `${row.feed}:${row.messageSequence}`;

  const verifyAll = async () => {
    for (const { row, feed } of rows) {
      setChecks((current) => ({ ...current, [key(row)]: { signature: "checking", source: "checking" } }));
      const signature: Check = verifyMessageSignature(row, feed.publicKey) ? "valid" : "invalid";
      let source: Match = "unavailable";
      try {
        const fromOracle = await fetchMessages({
          publicKey: feed.publicKey,
          minMessageTimestamp: row.timestamp,
          maxMessageTimestamp: row.timestamp,
        });
        source = fromOracle.some((each) => each.message === row.message && each.signature === row.signature)
          ? "same"
          : "different";
      } catch {
        source = "unavailable";
      }
      setChecks((current) => ({ ...current, [key(row)]: { signature, source } }));
    }
  };

  const allChecked = rows.length > 0 && rows.every(({ row }) => checks[key(row)]?.signature === "valid");
  const deployment = deploymentFor(network);
  const decided = round.state === "settled" || round.state === "void";
  const netPot = round.netPot ?? 0;
  const winnerTotal = round.winnerTotal ?? 0;
  const winners = view.data.entries.filter((entry) => round.state === "settled" && entry.outcome === round.winner);
  const gold = feeds.length > 1;
  const combine = (states: CheckState[]): CheckState =>
    states.length === 0
      ? "idle"
      : states.some((state) => state === "invalid")
        ? "invalid"
        : states.some((state) => state === "checking")
          ? "checking"
          : states.every((state) => state === "valid")
            ? "valid"
            : "idle";
  const tiles = feeds.flatMap((feed) =>
    [
      { role: "Lock", rows: feed.lock ? [feed.lock.previous, feed.lock.first] : [] },
      { role: "To beat", rows: feed.strike ? [feed.strike] : [] },
      { role: "Close", rows: feed.close ? [feed.close.previous, feed.close.first] : [] },
    ]
      .filter((tile) => tile.rows.length > 0)
      .map((tile) => ({ ...tile, feed })),
  );
  const fees = Number(feePaid(round.pot, PROTOCOL_FEE_BPS)) + Number(feePaid(round.pot, BigInt(round.creatorFeeBps)));

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-5 rounded-[32px] bg-[var(--stage)] p-5 shadow-[inset_0_0_0_1px_var(--hairline)] md:p-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <AssetCube asset={round.asset} size={44} />
            <h1 className="nx-display text-[clamp(24px,3vw,32px)] leading-tight">Proof · {roundName(round)}</h1>
          </div>
          {decided ? <RoundStamp state={round.state} winner={round.winner} size={56} /> : null}
        </div>
        {tiles.length === 0 ? (
          <p className="text-[15px] text-[var(--muted)]">Not signed yet</p>
        ) : (
          <div
            className={cx(
              "grid gap-2",
              tiles.length > ONE_FEED_TILES ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-3",
            )}
          >
            {tiles.map((tile) => (
              <SignedTile
                key={`${tile.feed.feed}-${tile.role}`}
                role={tile.role}
                feed={gold ? tile.feed.feed : null}
                price={usd((tile.rows.at(-1)?.price ?? 0) / tile.feed.scaling)}
                signed={tile.rows}
                signature={combine(tile.rows.map((row) => checks[key(row)]?.signature ?? "idle"))}
                source={combine(tile.rows.map((row) => sourceState(checks[key(row)]?.source ?? "idle")))}
                publicKey={tile.feed.publicKey}
              />
            ))}
          </div>
        )}
        {allChecked ? (
          <p className="flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--up)] font-semibold text-[16px] text-[var(--up-ink)]">
            <CheckCircle2 size={19} aria-hidden /> {rows.length} signatures proven
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void verifyAll()}
            disabled={rows.length === 0}
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--vermilion)] font-semibold text-[16px] text-white transition-transform active:scale-[0.99] disabled:opacity-40"
          >
            <ShieldCheck size={19} aria-hidden /> Verify {rows.length} signatures
          </button>
        )}
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {decided ? (
          <section className="flex flex-col gap-3 rounded-[24px] bg-[var(--surface-1)] p-4 md:p-5">
            <h2 className="nx-eyebrow">Payout</h2>
            {round.state === "settled" ? (
              <>
                <PayoutMath
                  pot={round.pot}
                  fees={fees}
                  shared={netPot}
                  winnerTotal={winnerTotal}
                  winnerSide={round.winner === 0 ? "Up" : "Down"}
                  format={money.format}
                />
                <div className="flex flex-col">
                  {winners.map((entry) => {
                    // ticketPayout (packages/sdk): the share of the pot, plus the ticket's own deposit, minus its sweep fee.
                    const share =
                      winnerTotal > 0
                        ? (BigInt(entry.stake) * BigInt(netPot)) / BigInt(winnerTotal)
                        : BigInt(entry.stake);
                    const expected = share + TICKET_DUST - SWEEP_FEE_PER_TICKET;
                    return (
                      <WinnerRow
                        key={entry.outpoint}
                        network={network}
                        pkh={entry.payoutPkh}
                        address={addressOf(network, entry.payoutPkh)}
                        stake={entry.stake}
                        paid={entry.payoutSats}
                        exact={entry.payoutSats === null ? null : BigInt(entry.payoutSats) === expected}
                        format={money.format}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-[15px] text-[var(--ink-2)]">Everyone was refunded.</p>
            )}
          </section>
        ) : null}
        <section className="flex flex-col gap-2 rounded-[24px] bg-[var(--surface-1)] p-4 md:p-5">
          <h2 className="nx-eyebrow">On chain</h2>
          <ChainList
            network={network}
            transactions={view.data.transactions}
            contracts={(["gate", "ticket", "masterOpen", "masterLocked", "masterSweep"] as const).map((name) => ({
              name: CONTRACT_NAME[name],
              bytecode: deployment.lockingBytecode[name],
            }))}
          />
        </section>
      </div>
    </div>
  );
}

const CONTRACT_NAME = {
  gate: "Gate",
  ticket: "Ticket",
  masterOpen: "Round · open",
  masterLocked: "Round · locked",
  masterSweep: "Round · paying",
} as const;

/** The fee the contract pays (writeSettlement): the share of the pot, or nothing under the dust floor. */
const feePaid = (pot: number, bps: bigint): bigint => {
  const fee = (BigInt(pot) * bps) / BPS;
  return fee < MIN_FEE_OUTPUT ? 0n : fee;
};

const sourceState = (match: Match): CheckState =>
  match === "same" ? "valid" : match === "checking" ? "checking" : match === "different" ? "invalid" : "idle";
