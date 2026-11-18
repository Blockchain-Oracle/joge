import { HEX_RADIX, HEX3, HEX6 } from "./constants.ts";

/** Everything the chart takes from the page: the world's colours and its four type faces. */
export interface Colors {
  ink: string;
  muted: string;
  faint: string;
  hairline: string;
  surface: string;
  ground: string;
  /** Faces (fills) and the ink that sits on them. */
  up: string;
  upInk: string;
  down: string;
  downInk: string;
  /** Line colours that read on the ground in this world. */
  upLine: string;
  downLine: string;
  neutral: string;
  mono: string;
  pixel: string;
  display: string;
  stamp: string;
  /** Night world: lines and heads glow. */
  glow: boolean;
}

export function readColors(root: Element = document.documentElement): Colors {
  const css = getComputedStyle(root);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const body = getComputedStyle(document.body);
  const face = (name: string, fallback: string) => body.getPropertyValue(name).trim() || fallback;
  return {
    ink: v("--ink", "#f3f1ec"),
    muted: v("--muted", "#6f6c66"),
    faint: v("--faint", "#45433f"),
    hairline: v("--hairline", "rgba(255,255,255,.08)"),
    surface: v("--surface-2", "#1d1d1b"),
    ground: v("--surface-1", "#151514"),
    up: v("--up", "#3ccb7f"),
    upInk: v("--up-ink", "#06140c"),
    down: v("--down", "#ff5d4d"),
    downInk: v("--down-ink", "#1a0604"),
    upLine: v("--up-text", "#3ccb7f"),
    downLine: v("--down-text", "#ff6e5f"),
    neutral: v("--cyan-text", "#c9c5bd"),
    mono: face("--font-martian", "ui-monospace, monospace"),
    pixel: face("--font-martian", "ui-monospace, monospace"),
    display: face("--font-funnel-display", "system-ui, sans-serif"),
    stamp: face("--font-dela", "sans-serif"),
    glow: false,
  };
}

const RED_SHIFT = 16;
const GREEN_SHIFT = 8;
const BYTE = 255;

/** A token colour at some opacity, as canvas-safe rgba() (hex tokens only; anything else passes through). */
export function alpha(color: string, a: number): string {
  let hex = color.trim().replace("#", "");
  if (hex.length === HEX3) hex = [...hex].map((ch) => ch + ch).join("");
  if (hex.length !== HEX6 || /[^0-9a-f]/i.test(hex)) return color;
  const n = Number.parseInt(hex, HEX_RADIX);
  return `rgba(${(n >> RED_SHIFT) & BYTE},${(n >> GREEN_SHIFT) & BYTE},${n & BYTE},${a})`;
}

const LARGE = 1000;
const CENT = 0.01;
const DIGITS = { large: 1, unit: 3, small: 5, tiny: 8 } as const;

export const defaultFormat = (p: number) => {
  const digits = p >= LARGE ? DIGITS.large : p >= 1 ? DIGITS.unit : p >= CENT ? DIGITS.small : DIGITS.tiny;
  return p.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
};
