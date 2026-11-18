/** The chart's plumbing: what it watches (size, visibility, theme, tab focus) and the pointer over it. */

export interface BoxWatch {
  onResize: () => void;
  onVisible: (visible: boolean) => void;
  /** The theme or network world changed (colours are re-read), or the tab came back. */
  onRepaint: (themeChanged: boolean) => void;
}

export function watchBox(box: HTMLElement, w: BoxWatch): () => void {
  const ro = new ResizeObserver(() => w.onResize());
  ro.observe(box);
  const io = new IntersectionObserver(([entry]) => w.onVisible(Boolean(entry?.isIntersecting)));
  io.observe(box);
  const theme = new MutationObserver(() => w.onRepaint(true));
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-network"] });
  const visibility = () => w.onRepaint(false);
  document.addEventListener("visibilitychange", visibility);
  return () => {
    ro.disconnect();
    io.disconnect();
    theme.disconnect();
    document.removeEventListener("visibilitychange", visibility);
  };
}

/** Pointer position over the canvas (CSS pixels), or null when it leaves. */
export function attachHover(canvas: HTMLCanvasElement, onHover: (at: { x: number; y: number } | null) => void) {
  const move = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    onHover({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };
  const leave = () => onHover(null);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerleave", leave);
  return () => {
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerleave", leave);
  };
}
