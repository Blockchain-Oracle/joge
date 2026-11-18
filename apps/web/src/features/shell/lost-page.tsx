import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/brand/mark";

/** The line this page drew before it fell through: above the line to beat, then off the bottom of the chart. */
const FALL = "M0 132 L60 118 L104 126 L150 96 L196 108 L240 84 L282 98 L318 90 L352 150 L384 226 L404 300";
const LINE_Y = 120;

/**
 * When a page is not there or breaks: the app's own chart and words — the price ran above
 * the line, then went down and off the chart — with the way back to the rounds one tap away.
 */
export function LostPage({
  code,
  title,
  line,
  action,
}: {
  code: string;
  title: string;
  line: string;
  /** The way out besides the rounds (a retry for an error). */
  action?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[960px] flex-col gap-10 px-5 py-6 md:px-8">
      <Link href="/" aria-label="Jōge home" className="self-start">
        <Logo size={40} />
      </Link>
      <section className="relative flex flex-1 flex-col justify-center gap-8 overflow-hidden rounded-[32px] bg-[var(--stage)] p-6 shadow-[inset_0_0_0_1px_var(--hairline)] md:p-10">
        <svg
          viewBox="0 0 420 300"
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 h-auto w-[48%] opacity-90"
        >
          <line x1="0" x2="420" y1={LINE_Y} y2={LINE_Y} stroke="var(--muted)" strokeDasharray="6 6" strokeWidth="2" />
          <path
            d={FALL}
            fill="none"
            stroke="var(--down-text)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="352" cy="150" r="6" fill="var(--down-text)" />
        </svg>
        <p className="nx-num text-[14px] text-[var(--muted)]">{code}</p>
        <h1 className="nx-display max-w-[12ch] text-[clamp(44px,8vw,96px)] leading-[0.95]">
          <span className="nx-jp text-[var(--down-text)]">下</span> {title}
        </h1>
        <p className="relative max-w-[30ch] text-[17px] text-[var(--ink-2)]">{line}</p>
        <div className="relative flex flex-wrap gap-3">
          <Link
            href="/rounds"
            className="inline-flex h-14 items-center rounded-full bg-[var(--ink)] px-7 font-semibold text-[16px] text-[var(--ink-inverse)]"
          >
            Back to the rounds
          </Link>
          {action}
        </div>
      </section>
    </main>
  );
}
