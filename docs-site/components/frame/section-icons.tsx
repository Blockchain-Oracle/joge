/* Each section's small drawing, made from Jōge's own pieces (48-unit box). */

const ICONS: Record<string, React.ReactNode> = {
  "01": (
    <>
      <rect x="2" y="12" width="20" height="24" rx="5" fill="var(--up)" />
      <rect x="26" y="12" width="20" height="24" rx="5" fill="var(--down)" />
      <path d="M12 18v12M12 24h5" stroke="var(--up-ink)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M36 18v12" stroke="var(--down-ink)" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  "02": (
    <path
      d="M4 13h40v8a3 3 0 0 0 0 6v8H4v-8a3 3 0 0 0 0-6z"
      fill="none"
      stroke="var(--vermilion)"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
  ),
  "03": (
    <>
      <path d="M3 30H45" stroke="var(--vermilion)" strokeWidth="2.6" strokeDasharray="5 4" />
      <rect x="18" y="10" width="11" height="11" fill="none" stroke="var(--ink)" strokeWidth="2.6" />
    </>
  ),
  "04": (
    <>
      <rect x="6" y="8" width="36" height="32" rx="8" fill="none" stroke="var(--ink)" strokeWidth="2.6" />
      <circle cx="24" cy="21" r="4.5" fill="var(--vermilion)" />
      <path d="M24 25v8" stroke="var(--vermilion)" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  "05": (
    <>
      <circle cx="24" cy="24" r="20" fill="var(--vermilion)" />
      <text x="24" y="31" textAnchor="middle" fontSize="20" fill="#fff" className="font-jp">
        本
      </text>
    </>
  ),
  "06": (
    <>
      <rect x="6" y="8" width="36" height="8" rx="3" fill="var(--ink)" />
      <rect x="6" y="20" width="26" height="8" rx="3" fill="var(--ink-2)" />
      <rect x="6" y="32" width="16" height="8" rx="3" fill="var(--vermilion)" />
    </>
  ),
}

export function SectionIcon({ n, size = 44 }: { n: string; size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      {ICONS[n]}
    </svg>
  )
}
