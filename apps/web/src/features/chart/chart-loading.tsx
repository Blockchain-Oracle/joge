import { Wait } from "@/kit";

/** Covers the chart until its first prices arrive. */
export function ChartLoadingOverlay({ verb }: { verb: string }) {
  return (
    <div className="absolute inset-0 z-10 grid animate-[jg-pulse_1200ms_var(--ease)_infinite] place-items-center bg-surface-1/60">
      <Wait verb={verb} />
    </div>
  );
}
