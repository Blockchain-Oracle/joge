/** Up to this span on screen (20 minutes) the axis reads seconds ("14:30:15"); past it, minutes ("14:30"). */
const SECONDS_SPAN_MS = 1_200_000;
/** Past this span (36 hours) it reads days ("Nov 16"). */
const CLOCK_SPAN_MS = 129_600_000;

const DAY = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const two = (n: number) => String(n).padStart(2, "0");

/** A time as coarse as the span on screen needs (the viewer's local time). */
export function defaultTime(ms: number, spanMs: number): string {
  const d = new Date(ms);
  const clock = `${two(d.getHours())}:${two(d.getMinutes())}`;
  if (spanMs <= SECONDS_SPAN_MS) return `${clock}:${two(d.getSeconds())}`;
  if (spanMs <= CLOCK_SPAN_MS) return clock;
  return DAY.format(d);
}
