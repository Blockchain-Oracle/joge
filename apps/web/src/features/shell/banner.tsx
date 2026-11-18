"use client";

import { Check, Copy, ExternalLink, QrCode } from "lucide-react";
import { useState } from "react";
import { DottedQr, Sheet } from "@/kit";
import { copyText } from "@/lib/browser";

/**
 * The BCH BLAZE banner every Mainnet Track entry carries at the top of its home page (F15): the Widget Factory deck,
 * the source repository and the team's CashTokens address (BLAZE sends prizes there; EMBER2026 holders vote by sending
 * their tokens there). The address is the one Hashi uses (one team, one wallet); a tap opens it as a QR code.
 */
const DECK = process.env.NEXT_PUBLIC_BLAZE_DECK_URL;
const REPO = process.env.NEXT_PUBLIC_REPO_URL || "https://github.com/Blockchain-Oracle/joge";
const CASHTOKENS =
  process.env.NEXT_PUBLIC_CASHTOKENS_ADDRESS || "bitcoincash:zqnvys4cpkjk9qtsmjwmhysgtlm9vvf6uvms3x8sh9";
const HEAD = 8;
const TAIL = 6;
const COPIED_MS = 1500;
const QR_SIZE = 220;

export function BlazeBanner() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const bare = CASHTOKENS.replace(/^bitcoincash:/, "");
  const link = "inline-flex items-center gap-1 whitespace-nowrap underline-offset-4 hover:underline";
  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 bg-[var(--vermilion)] px-4 py-2 font-semibold text-[13px] text-white">
        <a href="https://bchblaze.cash" target="_blank" rel="noreferrer" className="nx-num tracking-[0.08em]">
          BCH BLAZE 2026 <span className="hidden sm:inline">· Mainnet Track</span>
        </a>
        {DECK ? (
          <a href={DECK} target="_blank" rel="noreferrer" className={link}>
            <span className="sm:hidden">Deck</span>
            <span className="hidden sm:inline">Widget Factory deck</span> <ExternalLink size={12} aria-hidden />
          </a>
        ) : null}
        <a href={REPO} target="_blank" rel="noreferrer" className={link}>
          Source <ExternalLink size={12} aria-hidden />
        </a>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Show the CashTokens address as a QR code"
          className="inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 hover:bg-white/15"
        >
          <QrCode size={14} aria-hidden />
          <span className="opacity-85">CashTokens</span>
          <span className="nx-num hidden underline decoration-white/40 underline-offset-4 sm:inline">
            {bare.slice(0, HEAD)}…{bare.slice(-TAIL)}
          </span>
        </button>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="Send to Jōge">
        <div className="flex flex-col items-center gap-4 pb-2">
          <DottedQr value={CASHTOKENS} size={QR_SIZE} label={`QR code for ${CASHTOKENS}`} />
          <p className="nx-num max-w-[22rem] break-all text-center text-[13px] leading-relaxed">
            <span className="text-[var(--muted)]">bitcoincash:</span>
            {bare}
          </p>
          <button
            type="button"
            onClick={async () => {
              if (await copyText(CASHTOKENS)) {
                setCopied(true);
                setTimeout(() => setCopied(false), COPIED_MS);
              }
            }}
            className="nx-glass inline-flex h-11 items-center gap-2 rounded-full px-5 font-semibold text-[14px]"
          >
            {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copied ? "Copied" : "Copy address"}
          </button>
          <p className="max-w-[22rem] text-balance text-center text-[13px] text-[var(--ink-2)]">
            BCH BLAZE prizes go here, and EMBER2026 holders vote for Jōge by sending their tokens here.
          </p>
        </div>
      </Sheet>
    </>
  );
}
