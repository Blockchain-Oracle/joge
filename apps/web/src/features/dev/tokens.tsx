/** The kanji Jōge draws: the seal, the watermark, the stamps and the test-world sticker (Noto Serif JP). */
const KANJI = "上下 的中 外れ 無効 試";

const COLORS = [
  "bg",
  "surface-1",
  "surface-2",
  "surface-3",
  "ink",
  "ink-2",
  "muted",
  "faint",
  "up",
  "up-deep",
  "up-text",
  "down",
  "down-deep",
  "down-text",
  "up-edge",
  "down-edge",
  "vermilion",
  "accent",
  "gold",
  "paper",
  "stage",
] as const;

const TYPE = [
  ["type-display", "Up or down?"],
  ["type-headline-lg", "Anyone opens a round"],
  ["type-headline-md", "Nobody runs the house"],
  ["type-heading", "BTC · 5 min"],
  ["type-title-lg", "Round #1043"],
  ["type-title", "Up is winning"],
  ["type-cta", "Enter Up"],
  ["type-body", "Winners are paid straight to their wallet."],
  ["type-caption", "Locks in 2:05 · 14 entries"],
  ["type-label", "Live round · pot 21,500 sats"],
  ["type-clock", "02:14"],
  ["type-data-hero", "$64,677.07"],
  ["type-data-lg", "1.84×"],
  ["type-data", "12,500 sats"],
  ["type-data-sm", "bchtest:qz…70wp"],
] as const;

const RADII = ["sm", "md", "lg", "xl", "rail"] as const;
const MOTION = ["--dur-hover", "--dur-state", "--dur-pill", "--dur-drawer-in", "--dur-drawer-out"] as const;

export function Tokens() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {COLORS.map((name) => (
          <div key={name} className="jg-panel flex items-center gap-3 p-2">
            <span
              className="size-9 shrink-0 rounded-[10px] shadow-[var(--pill-shadow)]"
              style={{ background: `var(--${name})` }}
            />
            <span className="type-data-sm">--{name}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {TYPE.map(([utility, sample]) => (
          <div key={utility} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-hairline pb-3">
            <span className="type-data-sm w-36 shrink-0 text-muted">{utility}</span>
            <span className={utility}>{sample}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <p className="type-label pb-2 text-muted">Kanji (Noto Serif JP)</p>
          <p className="font-stamp text-5xl">{KANJI}</p>
        </div>
        <div className="flex gap-3">
          {RADII.map((radius) => (
            <div key={radius} className="flex flex-col items-center gap-1">
              <span
                className="size-14 bg-accent-wash shadow-[var(--pill-shadow)]"
                style={{ borderRadius: `var(--radius-${radius})` }}
              />
              <span className="type-data-sm text-muted">{radius}</span>
            </div>
          ))}
        </div>
        <ul className="type-data-sm text-ink-2">
          {MOTION.map((token) => (
            <li key={token}>{token}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
