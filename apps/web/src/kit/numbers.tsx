"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { cx } from "./cx.ts";

const SPIN_MS = 260;
const SPIN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const TIMING = { duration: SPIN_MS, easing: SPIN_EASE };

/** A figure that rolls to its new value (mono, tabular). */
export function RollingNumber({
  value,
  format,
  className,
  prefix,
  suffix,
}: {
  value: number;
  format?: Format;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <NumberFlow
      value={value}
      locales="en-US"
      className={cx("num", className)}
      transformTiming={TIMING}
      spinTiming={TIMING}
      {...(format ? { format } : {})}
      {...(prefix ? { prefix } : {})}
      {...(suffix ? { suffix } : {})}
    />
  );
}
