/**
 * Jōge's mark, drawn once: the line to beat in vermilion; 上 rises above it in Up's lime and 下 hangs below it in
 * Down's coral, the two characters sharing that one line (上's base stroke is 下's top stroke). Read left to right it
 * says 上下; read as a chart it is a price above the line and a price below it, 下's dot the live price head.
 * Coordinates are in a 64-unit box. The app, the icon script and the share image all draw from here.
 */
export const MARK_BOX = 64;
export const MARK_STROKE = 6;
export const MARK = {
  up: "M21 32V8.5M21 19.5H32.5",
  down: "M43 32V55.5",
  dot: { cx: 51.5, cy: 42.5, r: 3.9 },
  line: "M7.5 32H56.5",
} as const;

/** The night colours (the plates' own); day swaps in the darker text greens and reds through CSS. */
export const MARK_NIGHT = { up: "#b5f543", down: "#ff647c", line: "#e04d26" } as const;

/** The mark as a standalone SVG string (for satori, which draws SVG from an image source). */
export function markSvg(colors: { up: string; down: string; line: string } = MARK_NIGHT, stroke = MARK_STROKE) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK_BOX} ${MARK_BOX}"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="${stroke}"><path d="${MARK.up}" stroke="${colors.up}"/><path d="${MARK.down}" stroke="${colors.down}"/><circle cx="${MARK.dot.cx}" cy="${MARK.dot.cy}" r="${MARK.dot.r}" fill="${colors.down}" stroke="none"/><path d="${MARK.line}" stroke="${colors.line}"/></g></svg>`;
}
