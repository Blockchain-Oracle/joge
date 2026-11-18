import { useId } from "react";
import { cx } from "./cx.ts";

/**
 * A player's marble (Kakure's games, after boring-avatars' "marble", MIT): three blurred shapes in the brand's inks,
 * seeded by the address, so one player wears the same marble on every board. Agents wear faces; players wear marbles.
 */
const BOX = 80;
const HALF = BOX / 2;
const BLUR = 7;
const SHIFT_RANGE = 8;
const SCALE_RANGE = 4;
const SCALE_BASE = 1.2;
const SCALE_STEP = 10;
const TURN = 360;
const HASH_MULT = 31;
const DECIMAL = 10;
const SHAPES = 3;
const SHAPE_A = "M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z";
const SHAPE_B =
  "M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z";
const PALETTE = ["var(--vermilion)", "var(--up)", "var(--down)", "var(--gold)", "var(--surface-3)"] as const;

function hashOf(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (Math.imul(hash, HASH_MULT) + seed.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

const digit = (n: number, place: number) => Math.floor((n / DECIMAL ** place) % DECIMAL);
/** A value in `[0, range)`, negated when the seed's digit at `place` is even, so shapes drift both ways. */
const unit = (n: number, range: number, place?: number) =>
  place !== undefined && digit(n, place) % 2 === 0 ? -(n % range) : n % range;

export function Marble({ seed, size = 36, className }: { seed: string; size?: number; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const n = hashOf(seed.toLowerCase());
  const shapes = Array.from({ length: SHAPES }, (_, i) => {
    const m = n * (i + 1);
    return {
      fill: PALETTE[(n + i) % PALETTE.length],
      dx: unit(m, SHIFT_RANGE, 1),
      dy: unit(m, SHIFT_RANGE, 2),
      scale: SCALE_BASE + unit(m, SCALE_RANGE) / SCALE_STEP,
      rotate: unit(m, TURN, 1),
    };
  });
  const [base, first, second] = shapes;
  if (!base || !first || !second) return null;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${BOX} ${BOX}`}
      width={size}
      height={size}
      className={cx("shrink-0", className)}
      fill="none"
    >
      <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={0} y={0} width={BOX} height={BOX}>
        <rect width={BOX} height={BOX} rx={BOX} fill="white" />
      </mask>
      <g mask={`url(#${id}m)`}>
        <rect width={BOX} height={BOX} fill={base.fill} />
        <path
          filter={`url(#${id}b)`}
          d={SHAPE_A}
          fill={first.fill}
          transform={`translate(${first.dx} ${first.dy}) rotate(${first.rotate} ${HALF} ${HALF}) scale(${second.scale})`}
        />
        <path
          filter={`url(#${id}b)`}
          style={{ mixBlendMode: "overlay" }}
          d={SHAPE_B}
          fill={second.fill}
          transform={`translate(${second.dx} ${second.dy}) rotate(${second.rotate} ${HALF} ${HALF}) scale(${second.scale})`}
        />
      </g>
      <defs>
        <filter id={`${id}b`} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity={0} result="clear" />
          <feBlend in="SourceGraphic" in2="clear" result="shape" />
          <feGaussianBlur stdDeviation={BLUR} result="blur" />
        </filter>
      </defs>
    </svg>
  );
}
