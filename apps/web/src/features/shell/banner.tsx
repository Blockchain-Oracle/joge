"use client";

import { Check, Copy, ExternalLink, PlayCircle, Presentation, QrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DottedQr, Sheet } from "@/kit";
import { copyText } from "@/lib/browser";

/**
 * The BCH BLAZE banner every Mainnet Track entry carries at the top of its home page: the demo film (/demo), the
 * Widget Factory deck (/slides, full screen), the source repository and the team's CashTokens address (BLAZE sends prizes there; EMBER2026 holders vote by sending
 * their tokens there). The address is the team's (one team, one wallet); a tap opens it as a QR code.
 */
const DEMO = "/demo";
const DECK = "/slides";
const REPO = process.env.NEXT_PUBLIC_REPO_URL || "https://github.com/Blockchain-Oracle/joge";
const CASHTOKENS =
  process.env.NEXT_PUBLIC_CASHTOKENS_ADDRESS || "bitcoincash:zpx428ysgswaypfgk6aswckpjwa99hxk6v4gqs3xjp";
const HEAD = 8;
const TAIL = 6;
const COPIED_MS = 1500;
const QR_SIZE = 220;

export function BlazeBanner() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const bare = CASHTOKENS.replace(/^bitcoincash:/, "");

  // Its height as `--banner-h` (one line on desktop, two on a phone): the round screen fits itself under it, or the
  // banner pushed Up and Down under a phone's dock and below a desktop's fold.
  useEffect(() => {
    const element = bar.current;
    if (!element) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => root.style.setProperty("--banner-h", `${element.offsetHeight}px`));
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--banner-h");
    };
  }, []);
  const link = "inline-flex items-center gap-1 whitespace-nowrap underline-offset-4 hover:underline";
  return (
    <>
      <div
        ref={bar}
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 bg-[var(--vermilion)] px-4 py-2 font-semibold text-[13px] text-white"
      >
        <a href="https://bchblaze.cash" target="_blank" rel="noreferrer" className="nx-num tracking-[0.08em]">
          BCH BLAZE 2026 <span className="hidden sm:inline">· Mainnet Track</span>
        </a>
        <a href={DEMO} className={link}>
          <PlayCircle size={13} aria-hidden />
          Demo
        </a>
        <a href={DECK} target="_blank" rel="noreferrer" className={link}>
          <Presentation size={13} aria-hidden />
          <span className="sm:hidden">Deck</span>
          <span className="hidden sm:inline">Widget Factory deck</span>
        </a>
        <a href={REPO} target="_blank" rel="noreferrer" className={link}>
          Source <ExternalLink size={12} aria-hidden />
        </a>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`CashTokens address ${CASHTOKENS}: show it as a QR code`}
          title={CASHTOKENS}
          className="inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 hover:bg-white/15"
        >
          <QrCode size={14} aria-hidden />
          <span className="opacity-85">CashTokens</span>
          <span className="nx-num hidden underline decoration-white/40 underline-offset-4 sm:inline xl:hidden">
            {bare.slice(0, HEAD)}…{bare.slice(-TAIL)}
          </span>
          <span className="nx-num hidden underline decoration-white/40 underline-offset-4 xl:inline">{CASHTOKENS}</span>
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
