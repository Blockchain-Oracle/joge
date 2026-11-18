import { MARK, MARK_BOX, MARK_STROKE } from "@/lib/mark"

/**
 * Jōge's mark: 上 above the vermilion line, 下 below it. Its strokes follow the page's Up and Down text colours, so it
 * reads on the night page and the cream one.
 */
export function JogeMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${MARK_BOX} ${MARK_BOX}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Jōge"
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={MARK_STROKE}>
        <path d={MARK.up} stroke="var(--up-text)" />
        <path d={MARK.down} stroke="var(--down-text)" />
        <circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill="var(--down-text)" stroke="none" />
        <path d={MARK.line} stroke="var(--vermilion)" />
      </g>
    </svg>
  )
}
