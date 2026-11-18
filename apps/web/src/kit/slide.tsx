"use client";

import { Check, ChevronRight } from "lucide-react";
import { type PointerEvent, useRef, useState } from "react";
import { cx } from "./cx.ts";
import { cue } from "./feedback.ts";

const COMMIT_AT = 0.9;
const THUMB = 48;
const INSET = 4;

/** Slide to confirm (Kakure's mainnet step): for moves that are hard to undo. Enter on the thumb also confirms. */
export function SlideToConfirm({
  label,
  onConfirm,
  disabled = false,
  className,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const start = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [done, setDone] = useState(false);
  const room = () => (track.current?.clientWidth ?? 0) - THUMB - 2 * INSET;

  const confirm = () => {
    if (done || disabled) return;
    setDone(true);
    setOffset(room());
    cue("send");
    onConfirm();
  };
  const down = (event: PointerEvent<HTMLButtonElement>) => {
    if (done || disabled) return;
    start.current = event.clientX - offset;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (start.current === null) return;
    setOffset(Math.min(room(), Math.max(0, event.clientX - start.current)));
  };
  const up = () => {
    if (start.current === null) return;
    start.current = null;
    if (offset >= room() * COMMIT_AT) confirm();
    else setOffset(0);
  };

  return (
    <div
      ref={track}
      className={cx(
        "relative h-14 select-none rounded-full bg-[var(--surface-2)] shadow-[inset_0_0_0_1px_var(--hairline)]",
        disabled && "opacity-40",
        className,
      )}
    >
      <span className="absolute inset-0 grid place-items-center pl-10 font-semibold text-[14px] text-[var(--ink-2)]">
        {done ? "Done" : label}
      </span>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={(event) => {
          if (event.key === "Enter") confirm();
        }}
        style={{ transform: `translateX(${offset}px)` }}
        className={cx(
          "absolute top-1 left-1 grid size-12 touch-none place-items-center rounded-full bg-[var(--vermilion)] text-white shadow-[0_8px_24px_-8px_var(--vermilion)]",
          start.current === null && "transition-transform duration-300 ease-out",
        )}
      >
        {done ? (
          <Check size={22} strokeWidth={3} aria-hidden />
        ) : (
          <ChevronRight size={22} strokeWidth={3} aria-hidden />
        )}
      </button>
    </div>
  );
}
