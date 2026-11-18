import type { ReactNode } from "react"

/*
 * The pieces every figure is drawn from: Jōge's own objects (chips, plates, coins, tickets, the vault), a dot grid, the
 * FIG caption, and paths that carry a label. Colours come from the page's tokens, so light and dark both work.
 */

export type Pt = { x: number; y: number }

export function Ground({ id, w, h, caption, k = 1 }: { id: string; w: number; h: number; caption: string; k?: number }) {
  return (
    <>
      <defs>
        <pattern id={`${id}-dots`} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--hairline)" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}-dots)`} />
      <text x="24" y="36" fontSize={12 * k} className="fill-[var(--muted)] font-mono tracking-[0.12em]">
        {caption}
      </text>
    </>
  )
}

/** A rounded chip with a label: a service, a wallet, a part of the engine. */
export function Chip({
  at,
  label,
  w = 150,
  tone = "ink",
  icon,
  k = 1,
}: {
  at: Pt
  label: string
  w?: number
  tone?: "ink" | "you" | "muted"
  icon?: ReactNode
  k?: number
}) {
  const h = 44
  const stroke = tone === "you" ? "var(--vermilion)" : tone === "muted" ? "var(--hairline)" : "var(--strong-line)"
  return (
    <g>
      <rect x={at.x - w / 2} y={at.y - h / 2} width={w} height={h} rx="14" fill="var(--surface-1)" stroke={stroke} strokeWidth={tone === "you" ? 2.5 : 1.5} />
      {icon ? <g transform={`translate(${at.x - w / 2 + 14} ${at.y - 9})`}>{icon}</g> : null}
      <text
        x={icon ? at.x - w / 2 + 40 : at.x}
        y={at.y + 5 * k}
        textAnchor={icon ? "start" : "middle"}
        fontSize={14 * k}
        className={`font-mono font-medium ${tone === "you" ? "fill-[var(--vermilion)]" : "fill-[var(--ink)]"}`}
      >
        {label}
      </text>
    </g>
  )
}

/** A path with an optional label at a point on it. */
export function Path({
  d,
  tone = "ink",
  dashed = false,
  width = 2,
  label,
  at,
  anchor = "middle",
  k = 1,
}: {
  d: string
  tone?: "ink" | "you" | "muted" | "up" | "down"
  dashed?: boolean
  width?: number
  label?: string
  at?: Pt
  anchor?: "start" | "middle" | "end"
  k?: number
}) {
  const color = {
    ink: "var(--ink-2)",
    you: "var(--vermilion)",
    muted: "var(--muted)",
    up: "var(--up-text)",
    down: "var(--down-text)",
  }[tone]
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? "6 6" : undefined} strokeLinecap="round" strokeLinejoin="round" />
      {label && at ? (
        <text x={at.x} y={at.y} textAnchor={anchor} fontSize={13 * k} className="font-mono" fill={color}>
          {label}
        </text>
      ) : null}
    </g>
  )
}

/** A coin that travels a path forever (SMIL, so it also runs inside an exported SVG). */
export function Traveller({ d, tone = "up", dur = 2.4, delays = [0] }: { d: string; tone?: "up" | "you" | "ink"; dur?: number; delays?: number[] }) {
  const fill = tone === "up" ? "var(--up)" : tone === "you" ? "var(--vermilion)" : "var(--ink)"
  return (
    <>
      {delays.map((delay) => (
        <circle key={delay} r="6" fill={fill}>
          <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" path={d} />
        </circle>
      ))}
    </>
  )
}

/** The Up and Down gate plates, side by side. */
export function Gates({ at, k = 1 }: { at: Pt; k?: number }) {
  return (
    <g>
      {(["up", "down"] as const).map((side, i) => {
        const x = at.x + (i ? 26 : -26)
        const up = side === "up"
        return (
          <g key={side}>
            <rect x={x - 22} y={at.y - 16} width="44" height="32" rx="8" fill={up ? "var(--up)" : "var(--down)"} />
            <text x={x} y={at.y + 7} textAnchor="middle" fontSize={18 * Math.min(k, 1.1)} className="font-jp" fill={up ? "var(--up-ink)" : "var(--down-ink)"}>
              {up ? "上" : "下"}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/** The round's master: a coin ringed in vermilion with the line through it. */
export function Master({ at, r = 24 }: { at: Pt; r?: number }) {
  return (
    <g>
      <circle cx={at.x} cy={at.y} r={r} fill="var(--surface-2)" stroke="var(--vermilion)" strokeWidth="2.5" />
      <path d={`M${at.x - r * 0.45} ${at.y}H${at.x + r * 0.45}`} stroke="var(--vermilion)" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

/** A ticket stub. */
export function Stub({ at, tone = "up", label = "", k = 1, w = 112 }: { at: Pt; tone?: "up" | "down" | "you"; label?: string; k?: number; w?: number }) {
  const fill = tone === "up" ? "var(--up)" : tone === "down" ? "var(--down)" : "var(--vermilion)"
  const ink = tone === "up" ? "var(--up-ink)" : tone === "down" ? "var(--down-ink)" : "#fff"
  return (
    <g>
      <path d={`M${at.x - w / 2} ${at.y - 18}h${w}v12a6 6 0 0 0 0 12v12h-${w}v-12a6 6 0 0 0 0-12z`} fill={fill} />
      {label ? (
        <text x={at.x} y={at.y + 5} textAnchor="middle" fontSize={13 * Math.min(k, 1.2)} className="font-mono font-semibold" fill={ink}>
          {label}
        </text>
      ) : null}
    </g>
  )
}

/** A signed price: the hollow square. */
export function Square({ at, size = 10, tone = "ink" }: { at: Pt; size?: number; tone?: "ink" | "you" }) {
  return (
    <rect
      x={at.x - size / 2}
      y={at.y - size / 2}
      width={size}
      height={size}
      fill="var(--bg)"
      stroke={tone === "you" ? "var(--vermilion)" : "var(--ink)"}
      strokeWidth="2.2"
    />
  )
}

/** The agent vault: a box with a keyhole. */
export function VaultBox({ at, w = 120, h = 92 }: { at: Pt; w?: number; h?: number }) {
  return (
    <g>
      <rect x={at.x - w / 2} y={at.y - h / 2} width={w} height={h} rx="18" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="2.5" />
      <circle cx={at.x} cy={at.y - 8} r="9" fill="var(--vermilion)" />
      <path d={`M${at.x} ${at.y}v16`} stroke="var(--vermilion)" strokeWidth="5" strokeLinecap="round" />
    </g>
  )
}

/** A label in the figure's own small mono caps. */
export function Caps({ at, children, anchor = "middle", k = 1, tone = "muted" }: { at: Pt; children: string; anchor?: "start" | "middle" | "end"; k?: number; tone?: "muted" | "ink" | "you" }) {
  const fill = tone === "ink" ? "var(--ink)" : tone === "you" ? "var(--vermilion)" : "var(--muted)"
  return (
    <text x={at.x} y={at.y} textAnchor={anchor} fontSize={12 * k} className="font-mono tracking-[0.12em]" fill={fill}>
      {children.toUpperCase()}
    </text>
  )
}
