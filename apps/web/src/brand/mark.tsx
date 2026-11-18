import { cx } from "@/kit";
import { MARK, MARK_BOX, MARK_STROKE } from "./geometry.ts";

/**
 * The mark (see geometry.ts). Its colours come from CSS (--mark-up / --mark-down / --vermilion) so day draws the darker
 * greens and reds; hovering a link that holds it lifts 上 and drops 下 a step, like a price moving off the line.
 */
export function Mark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${MARK_BOX} ${MARK_BOX}`}
      width={size}
      height={size}
      className={cx("jg-mark shrink-0", className)}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={MARK_STROKE}
    >
      <path className="jg-mark-up" d={MARK.up} stroke="var(--mark-up)" />
      <g className="jg-mark-down">
        <path d={MARK.down} stroke="var(--mark-down)" />
        <circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill="var(--mark-down)" stroke="none" />
      </g>
      <path d={MARK.line} stroke="var(--vermilion)" />
    </svg>
  );
}

/** "Jōge" with its macron drawn as the same vermilion line to beat. */
export function Wordmark({ className, size }: { className?: string; size?: number }) {
  return (
    <span
      className={cx("nx-display inline-flex items-baseline", className)}
      style={size ? { fontSize: size } : undefined}
      role="img"
      aria-label="Jōge"
    >
      <span aria-hidden>J</span>
      <span aria-hidden className="relative">
        o
        <span className="absolute inset-x-[0.06em] top-[0.12em] h-[0.1em] rounded-full bg-[var(--vermilion)]" />
      </span>
      <span aria-hidden>ge</span>
    </span>
  );
}

/** The wordmark is set at this share of the mark's size in the lockup. */
const WORD_SHARE = 0.62;

/** The lockup: mark and wordmark. */
export function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span className={cx("jg-logo inline-flex items-center gap-1.5", className)}>
      <Mark size={size} />
      <Wordmark className="leading-none" size={Math.round(size * WORD_SHARE)} />
    </span>
  );
}
