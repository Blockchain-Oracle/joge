"use client";

import { hexToBin, lockingBytecodeToCashAddress } from "@bitauth/libauth";
import type { Network } from "@joge/db";
import { Braces, Check, ExternalLink, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cx, Marble } from "@/kit";
import { ShortAddress } from "../players/leaderboard.tsx";
import { ADDRESS_EXPLORER, EXPLORER } from "../round/api.ts";

/** A check's state, and how a badge wears it: grey idle, spinning, lime proven, coral not. */
export type CheckState = "idle" | "checking" | "valid" | "invalid";

const SHORT_TX = 10;
const PREFIX: Record<Network, "bchtest" | "bitcoincash"> = { chipnet: "bchtest", mainnet: "bitcoincash" };
const UTC_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
const SECOND_MS = 1_000;

export function Badge({ state, label, children }: { state: CheckState; label: string; children: ReactNode }) {
  return (
    <span
      role="img"
      aria-label={`${label}: ${state === "valid" ? "proven" : state === "invalid" ? "failed" : state}`}
      title={label}
      className={cx(
        "grid size-8 place-items-center rounded-full text-[11px] font-bold transition-colors",
        state === "valid"
          ? "bg-[var(--up)] text-[var(--up-ink)]"
          : state === "invalid"
            ? "bg-[var(--down)] text-[var(--down-ink)]"
            : "bg-[var(--surface-2)] text-[var(--muted)]",
      )}
    >
      {state === "checking" ? (
        <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" />
      ) : state === "valid" ? (
        <Check aria-hidden className="size-4" strokeWidth={3} />
      ) : state === "invalid" ? (
        <X aria-hidden className="size-4" strokeWidth={3} />
      ) : (
        children
      )}
    </span>
  );
}

export interface SignedPrice {
  message: string;
  signature: string;
  timestamp: number;
  price: number;
}

/**
 * One deciding moment (lock, the price to beat, the close) as a tile: the price, when it was signed, and two badges:
 * the signature checked against General Protocols' key here, and the same message fetched from General Protocols. The
 * raw message is one tap away.
 */
export function SignedTile({
  role,
  feed,
  price,
  signed,
  signature,
  source,
  publicKey,
}: {
  role: string;
  feed: string | null;
  price: string;
  signed: SignedPrice[];
  signature: CheckState;
  source: CheckState;
  publicKey: string;
}) {
  const [raw, setRaw] = useState(false);
  const main = signed.at(-1);
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-[22px] bg-[var(--surface-1)] p-4">
      <span className="nx-eyebrow flex items-center justify-between gap-2">
        {role}
        {feed ? <span className="text-[var(--faint)]">{feed}</span> : null}
      </span>
      <span className="nx-num text-[20px] font-semibold leading-none">{price}</span>
      <span className="nx-num text-[12px] text-[var(--muted)]">
        {main ? `${UTC_TIME.format(main.timestamp * SECOND_MS)} UTC` : "—"}
      </span>
      <span className="flex items-center gap-2">
        <Badge state={signature} label="Signature checked here">
          <ShieldCheck aria-hidden className="size-4" />
        </Badge>
        <Badge state={source} label="Same message at General Protocols">
          GP
        </Badge>
        <button
          type="button"
          onClick={() => setRaw((open) => !open)}
          aria-label={raw ? "Hide the raw message" : "Show the raw message"}
          aria-expanded={raw}
          className="ml-auto grid size-8 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        >
          <Braces aria-hidden className="size-4" />
        </button>
      </span>
      {raw ? (
        <div className="nx-num flex flex-col gap-2 break-all text-[10.5px] text-[var(--muted)]">
          {signed.map((each) => (
            <span key={each.message}>
              {each.message}
              <br />
              {each.signature}
            </span>
          ))}
          <span>key {publicKey}</span>
        </div>
      ) : null}
    </div>
  );
}

/** The payout maths as one line of chips: pot − fees = shared ÷ the winning side's stakes = each one's multiple. */
export function PayoutMath({
  pot,
  fees,
  shared,
  winnerTotal,
  winnerSide,
  format,
}: {
  pot: number;
  fees: number;
  shared: number;
  winnerTotal: number;
  winnerSide: "Up" | "Down";
  format: (sats: number) => string;
}) {
  const multiple = winnerTotal > 0 ? shared / winnerTotal : 0;
  const chip = (label: string, value: string, tone?: "ink") => (
    <span
      className={cx(
        "flex flex-col rounded-[16px] px-3 py-2",
        tone === "ink" ? "bg-[var(--ink)] text-[var(--ink-inverse)]" : "bg-[var(--surface-2)]",
      )}
    >
      <span className="nx-eyebrow text-[9.5px] opacity-80">{label}</span>
      <span className="nx-num text-[15px] font-semibold">{value}</span>
    </span>
  );
  const op = (sign: string) => <span className="nx-num text-[18px] text-[var(--muted)]">{sign}</span>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chip("pot", format(pot))}
      {op("−")}
      {chip("fees", format(fees))}
      {op("÷")}
      {chip(winnerSide, format(winnerTotal))}
      {op("=")}
      {chip("pays", `${multiple.toFixed(2)}×`, "ink")}
    </div>
  );
}

/** A winner: their marble and address, what went in, what came back, and whether it is exact to the sat. */
export function WinnerRow({
  network,
  pkh,
  address,
  stake,
  paid,
  exact,
  format,
}: {
  network: Network;
  pkh: string;
  address: string;
  stake: number;
  paid: number | null;
  exact: boolean | null;
  format: (sats: number) => string;
}) {
  return (
    <a
      href={`/u/${address.split(":").pop()}`}
      className="flex items-center gap-3 rounded-[16px] px-2 py-2 hover:bg-[var(--surface-2)]"
      data-network={network}
    >
      <Marble seed={pkh} size={28} />
      <ShortAddress address={address} className="flex-1 truncate text-[13px]" />
      <span className="nx-num text-[13px] text-[var(--muted)]">{format(stake)}</span>
      <span className="nx-num text-[14px] font-semibold">→ {paid === null ? "…" : format(paid)}</span>
      <Badge state={exact === null ? "idle" : exact ? "valid" : "invalid"} label="Paid exactly as computed">
        =
      </Badge>
    </a>
  );
}

/** Every transaction of the round as a timeline (kind, short id, block), and the five contracts behind one tap. */
export function ChainList({
  network,
  transactions,
  contracts,
}: {
  network: Network;
  transactions: Array<{ txid: string; kind: string; height: number | null }>;
  contracts: Array<{ name: string; bytecode: string }>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      <ol className="flex flex-col">
        {transactions.map((tx) => (
          <li key={tx.txid}>
            <a
              href={`${EXPLORER[network]}${tx.txid}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[14px] px-2 py-2 hover:bg-[var(--surface-2)]"
            >
              <span
                className={cx(
                  "size-2 shrink-0 rounded-full",
                  tx.height ? "bg-[var(--up)]" : "bg-[var(--gold)] motion-safe:animate-pulse",
                )}
              />
              <span className="w-16 font-semibold text-[13px]">{tx.kind}</span>
              <span className="nx-num flex-1 truncate text-[12px] text-[var(--muted)]">
                {tx.txid.slice(0, SHORT_TX)}…
              </span>
              <span className="nx-num text-[12px] text-[var(--muted)]">{tx.height ?? "pending"}</span>
              <ExternalLink aria-hidden className="size-3.5 text-[var(--muted)]" />
            </a>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => setOpen((shown) => !shown)}
        aria-expanded={open}
        className="nx-eyebrow mt-2 self-start px-2 py-1 hover:text-[var(--ink)]"
      >
        {open ? "Hide contracts" : `Contracts · ${contracts.length}`}
      </button>
      {open ? (
        <div className="flex flex-wrap gap-1.5 px-2 pt-2">
          {contracts.map((contract) => {
            const encoded = lockingBytecodeToCashAddress({
              bytecode: hexToBin(contract.bytecode),
              prefix: PREFIX[network],
              tokenSupport: true,
            });
            const address = typeof encoded === "string" ? null : encoded.address;
            return address ? (
              <a
                key={contract.name}
                href={`${ADDRESS_EXPLORER[network]}${address}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 font-semibold text-[12px] hover:bg-[var(--surface-3)]"
              >
                {contract.name} <ExternalLink aria-hidden className="size-3" />
              </a>
            ) : (
              <span
                key={contract.name}
                className="inline-flex h-8 items-center rounded-full bg-[var(--surface-2)] px-3 text-[12px]"
              >
                {contract.name}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
