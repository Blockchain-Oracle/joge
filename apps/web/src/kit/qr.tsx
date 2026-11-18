import { encode } from "uqr";

const FINDER = 7;
const DOT = 0.5;
/** A module's dot fills 90 % of its cell. */
const DOT_FILL = 0.9;
const RING_INSET = 0.5;
const RING_RADIUS = 2.2;
const EYE_INSET = 2;
const EYE_RADIUS = 1;
const MARK_SHARE = 0.22;
const INK = "#16112f";

const inFinder = (row: number, col: number, size: number) =>
  (row < FINDER && col < FINDER) || (row < FINDER && col >= size - FINDER) || (row >= size - FINDER && col < FINDER);

/**
 * A QR code drawn as dots with rounded finder rings (WizardConnect pairing, share links), on a cream plate so it reads
 * the same in both themes. `mark` puts a logo in the middle (error correction H keeps it scannable).
 */
export function DottedQr({
  value,
  size = 232,
  mark,
  label,
}: {
  value: string;
  size?: number;
  mark?: string;
  label: string;
}) {
  const qr = encode(value, { ecc: "H", border: 0 });
  const count = qr.size;
  const markCells = mark ? Math.ceil(count * MARK_SHARE) | 1 : 0;
  const markStart = (count - markCells) / 2;
  const inMark = (row: number, col: number) =>
    markCells > 0 && row >= markStart && row < markStart + markCells && col >= markStart && col < markStart + markCells;
  const dots: Array<{ row: number; col: number }> = [];
  qr.data.forEach((cells, row) => {
    cells.forEach((dark, col) => {
      if (dark && !inFinder(row, col, count) && !inMark(row, col)) dots.push({ row, col });
    });
  });
  const finders = [
    [0, 0],
    [0, count - FINDER],
    [count - FINDER, 0],
  ] as const;
  return (
    <div className="inline-block rounded-xl bg-cream p-4">
      <svg width={size} height={size} viewBox={`0 0 ${count} ${count}`} role="img" aria-label={label}>
        {dots.map(({ row, col }) => (
          <circle key={`${row}-${col}`} cx={col + DOT} cy={row + DOT} r={DOT * DOT_FILL} fill={INK} />
        ))}
        {finders.map(([row, col]) => (
          <g key={`${row}-${col}`}>
            <rect
              x={col + RING_INSET}
              y={row + RING_INSET}
              width={FINDER - 1}
              height={FINDER - 1}
              rx={RING_RADIUS}
              fill="none"
              stroke={INK}
              strokeWidth={1}
            />
            <rect
              x={col + EYE_INSET}
              y={row + EYE_INSET}
              width={FINDER - 2 * EYE_INSET}
              height={FINDER - 2 * EYE_INSET}
              rx={EYE_RADIUS}
              fill={INK}
            />
          </g>
        ))}
        {mark ? <image href={mark} x={markStart} y={markStart} width={markCells} height={markCells} /> : null}
      </svg>
    </div>
  );
}
