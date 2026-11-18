"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cx, toast } from "@/kit";

const COPIED_MS = 1_600;
const X_INTENT = "https://x.com/intent/post";
/** X's mark (simple-icons, CC0). */
const X_MARK =
  "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z";

/**
 * Sharing a round (F21): copy its link, hand it to the phone's own share sheet (Web Share, where the browser has it),
 * or post it on X. The link unfurls into the round's share card (its Open Graph image).
 */
export function ShareActions({ path, text, className }: { path: string; text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => new URL(path, window.location.origin).toString();
  // Known only in the browser: read after mount so the server render and the first client render agree.
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare("share" in navigator), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      toast({ tone: "info", title: "Copy the link from the address bar", body: url() });
    }
  };
  const pill =
    "inline-flex h-10 items-center gap-2 rounded-full px-4 font-medium text-[14px] shadow-[var(--pill-shadow)] hover:bg-glass";
  return (
    <div className={cx("flex flex-wrap gap-2", className)}>
      <button type="button" onClick={() => void copy()} className={pill}>
        {copied ? <Check size={16} aria-hidden /> : <Link2 size={16} aria-hidden />}
        {copied ? "Copied" : "Copy link"}
      </button>
      {canShare ? (
        <button
          type="button"
          onClick={() => void navigator.share({ title: "Jōge", text, url: url() }).catch(() => undefined)}
          className={pill}
        >
          <Share2 size={16} aria-hidden /> Share
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => window.open(`${X_INTENT}?${new URLSearchParams({ text, url: url() })}`, "_blank", "noreferrer")}
        className={pill}
      >
        <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden fill="currentColor">
          <path d={X_MARK} />
        </svg>
        Post on X
      </button>
    </div>
  );
}
