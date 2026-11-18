import type { ReactNode } from "react";
import { cx } from "./cx.ts";

export type Tone = "up" | "down" | "accent" | "cyan" | "gold";

/** A status tag: LIVE, NEXT ROUND, SETTLED. */
export function Tag({
  tone,
  children,
  className,
}: {
  tone?: Tone | undefined;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx("jg-tag", className)} data-tone={tone}>
      {children}
    </span>
  );
}
