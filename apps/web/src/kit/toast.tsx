"use client";

import { Check, Info, X } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { cx } from "./cx.ts";
import { cue } from "./feedback.ts";

export interface Toast {
  id: number;
  tone: "up" | "info" | "down";
  title: string;
  body?: string;
  /** Where a tap goes (a round, a receipt). */
  href?: string;
  /** A round's verdict: the toast wears the hanko instead of the disc and thuds in (receipt). */
  seal?: Seal;
}

export type Seal = "的中" | "外れ" | "無効";
const SEAL_TONES: Record<Seal, string> = {
  的中: "text-[var(--vermilion)]",
  外れ: "text-[var(--muted)]",
  無効: "text-[var(--gold-text)]",
};
const SEAL_GLYPH_SHARE = 0.3;
const SEAL_TTL_MS = 6_000;
const SEAL_SIZE = 40;
const DISC_SIZE = 34;

/** Toasts: good news and notes stay 3.5 s, trouble 5 s. */
const TTL_MS = { up: 3_500, info: 3_500, down: 5_000 } as const;
const SWIPE_DISMISS_PX = 24;
const SOUNDS = { up: "arrive", info: "tap", down: "error" } as const;
const ICONS = { up: Check, info: Info, down: X } as const;
const DISCS = {
  up: "bg-[var(--up)] text-[var(--up-ink)]",
  info: "bg-[var(--surface-3)] text-[var(--ink)]",
  down: "bg-[var(--down)] text-[var(--down-ink)]",
} as const;

/**
 * A toast's or notice's tone as a small plate-coloured disc (lime for good news, coral for trouble), or the round's
 * verdict hanko when it carries one.
 */
export function ToneDisc({ tone, seal, size = 30 }: { tone: Toast["tone"]; seal?: Seal | undefined; size?: number }) {
  if (seal) {
    return (
      <span
        aria-hidden
        className={cx("nx-stamp shrink-0 rounded-[10px] border-2", SEAL_TONES[seal])}
        style={{ width: size, height: size, fontSize: size * SEAL_GLYPH_SHARE }}
      >
        {seal}
      </span>
    );
  }
  const Icon = ICONS[tone];
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cx("grid shrink-0 place-items-center rounded-full", DISCS[tone])}
    >
      <Icon size={size / 2} strokeWidth={3} />
    </span>
  );
}

let current: Toast | null = null;
let nextId = 1;
const listeners = new Set<() => void>();
const sinks = new Set<(toast: Toast) => void>();
let opener: (toast: Toast) => void = () => {};

const emit = () => {
  for (const listener of listeners) listener();
};

/** Shows one toast (a newer one replaces it) and records it for the notices bell. */
export function toast(input: Omit<Toast, "id">) {
  current = { ...input, id: nextId };
  nextId += 1;
  cue(input.seal ? "stamp" : SOUNDS[input.tone]);
  for (const sink of sinks) sink(current);
  emit();
}

/** The notices drawer keeps every toast. */
export function onToast(sink: (toast: Toast) => void) {
  sinks.add(sink);
  return () => sinks.delete(sink);
}

/** What a tap on a toast does (the shell routes it). */
export function onToastOpen(open: (toast: Toast) => void) {
  opener = open;
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function Toaster() {
  const shown = useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
  const startY = useRef<number | null>(null);
  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(
      () => {
        if (current?.id === shown.id) {
          current = null;
          emit();
        }
      },
      shown.seal ? SEAL_TTL_MS : TTL_MS[shown.tone],
    );
    return () => clearTimeout(timer);
  }, [shown]);
  if (!shown) return null;
  const dismiss = () => {
    current = null;
    emit();
  };
  return (
    <div className="pointer-events-none fixed inset-x-3 top-[calc(env(safe-area-inset-top)+10px)] z-[var(--z-toast)] flex justify-center md:top-[76px]">
      <button
        key={shown.id}
        type="button"
        onClick={() => {
          opener(shown);
          dismiss();
        }}
        onPointerDown={(event) => {
          startY.current = event.clientY;
        }}
        onPointerUp={(event) => {
          if (startY.current !== null && startY.current - event.clientY > SWIPE_DISMISS_PX) dismiss();
          startY.current = null;
        }}
        className="nx-glass pointer-events-auto flex w-full max-w-[380px] animate-[jg-toast-in_320ms_var(--ease-out)] items-center gap-3 rounded-full py-2 pr-5 pl-2 text-left shadow-[var(--shadow-float)]"
      >
        <ToneDisc tone={shown.tone} seal={shown.seal} size={shown.seal ? SEAL_SIZE : DISC_SIZE} />
        <span className="min-w-0">
          <span className="block truncate font-semibold text-[14px] text-[var(--ink)]">{shown.title}</span>
          {shown.body ? (
            <span className="nx-num block truncate text-[12px] text-[var(--muted)]">{shown.body}</span>
          ) : null}
        </span>
      </button>
    </div>
  );
}
