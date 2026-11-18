import { cx } from "@/kit";

const GLYPH_SHARE = 0.56;
const SEAL_GLYPH_SHARE = 0.3;

/** A round's result as its own kanji on the side's plate: 上 Up won, 下 Down won, 無 refunded. */
export function RoundStamp({
  state,
  winner,
  size = 72,
  className,
}: {
  state: string;
  winner: number | null;
  size?: number;
  className?: string;
}) {
  const voided = state === "void" || winner === null;
  const glyph = voided ? "無" : winner === 0 ? "上" : "下";
  const label = voided ? "Refunded" : winner === 0 ? "Up won" : "Down won";
  return (
    <span
      role="img"
      aria-label={label}
      style={{ width: size, height: size, fontSize: size * GLYPH_SHARE }}
      className={cx(
        "nx-jp inline-grid shrink-0 place-items-center rounded-[26%] leading-none",
        voided
          ? "bg-[var(--surface-2)] text-[var(--muted)]"
          : winner === 0
            ? "bg-[var(--up)] text-[var(--up-ink)] shadow-[inset_0_-4px_0_var(--up-edge)]"
            : "bg-[var(--down)] text-[var(--down-ink)] shadow-[inset_0_-4px_0_var(--down-edge)]",
        className,
      )}
    >
      {glyph}
    </span>
  );
}

export type Verdict = "hit" | "miss" | "void";
const SEALS: Record<Verdict, { glyph: string; label: string; tone: string }> = {
  hit: { glyph: "的中", label: "You were right", tone: "text-[var(--vermilion)]" },
  miss: { glyph: "外れ", label: "Not this time", tone: "text-[var(--muted)]" },
  void: { glyph: "無効", label: "Refunded", tone: "text-[var(--gold-text)]" },
};

/** Your own result as a hanko pressed into the receipt at −4° (Senryo's seal): 的中 hit, 外れ miss, 無効 refunded. */
export function SealStamp({ verdict, size = 84 }: { verdict: Verdict; size?: number }) {
  const seal = SEALS[verdict];
  return (
    <span
      role="img"
      aria-label={seal.label}
      className={cx("nx-stamp", seal.tone)}
      style={{ width: size, height: size, fontSize: size * SEAL_GLYPH_SHARE }}
    >
      {seal.glyph}
    </span>
  );
}
