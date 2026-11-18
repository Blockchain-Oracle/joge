"use client";

import type { ReactNode } from "react";
import { cx } from "./cx.ts";
import { cue } from "./feedback.ts";

/** A pill track of choices (lane length, theme, side); the chosen one is an ink pill. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
  label,
}: {
  options: readonly { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx("inline-flex gap-0.5 rounded-full bg-glass p-1 shadow-[var(--pill-shadow)]", className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => {
            cue("tap");
            onChange(option.value);
          }}
          className={cx(
            "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-[background-color,color,transform] duration-[var(--dur-state)] ease-[var(--ease-bounce)]",
            size === "sm" ? "h-7 px-3 text-xs" : "h-9 px-4 text-[14px]",
            option.value === value ? "bg-ink text-ink-inverse" : "text-ink-2 hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
