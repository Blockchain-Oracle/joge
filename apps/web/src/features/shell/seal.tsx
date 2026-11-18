import { cx } from "@/kit";

/** The hanko's two kanji stack inside the circle at this share of its size each. */
const HANKO_GLYPH_SHARE = 0.32;

/** Sensei's seal (D21): a vermilion hanko with 上 over 下 in the serif, a little air between them (Owarine's 終値 seal). */
export function Hanko({ size = 38, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * HANKO_GLYPH_SHARE }}
      className={cx("nx-seal flex-col", className)}
    >
      <span className="block leading-none">上</span>
      <span className="mt-[0.1em] block leading-none">下</span>
    </span>
  );
}
