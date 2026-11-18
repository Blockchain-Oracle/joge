import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.ts";

type Tone = "primary" | "secondary" | "ghost" | "up" | "down" | "ink";
type Size = "sm" | "md" | "lg" | "cta";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primary` (violet) is THE action of a screen; `up` and `down` are the two sides of a round. */
  tone?: Tone;
  size?: Size;
  icon?: ReactNode;
}

/** Keys (a face on a lip, pressable) for anything that does something; flat pills for quiet choices. */
const KEY_TONE: Partial<Record<Tone, string>> = { primary: "accent", up: "up", down: "down", ink: "ink" };

const FLAT: Partial<Record<Tone, string>> = {
  secondary:
    "bg-glass text-ink shadow-[var(--pill-shadow)] hover:bg-surface-2 transition-colors duration-[var(--dur-hover)]",
  ghost: "text-ink-2 hover:bg-glass hover:text-ink transition-colors duration-[var(--dur-hover)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 rounded-full px-4 text-[14px] font-medium",
  md: "h-11 rounded-full px-5 text-[15px] font-medium",
  lg: "h-[52px] rounded-full px-6 type-cta",
  cta: "h-14 w-full rounded-full px-6 type-cta",
};

export function Button({ tone = "secondary", size = "md", icon, className, children, type, ...rest }: ButtonProps) {
  const key = KEY_TONE[tone];
  return (
    <button
      type={type ?? "button"}
      data-tone={key}
      data-size={size === "sm" ? "sm" : undefined}
      className={cx(
        "inline-flex items-center justify-center gap-2 disabled:pointer-events-none",
        key ? "jg-key" : cx(FLAT[tone], "disabled:opacity-40"),
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
