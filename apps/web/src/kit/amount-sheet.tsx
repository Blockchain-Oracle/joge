"use client";

import { Delete } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cx } from "./cx.ts";
import { cue } from "./feedback.ts";
import { usePhone } from "./media.ts";
import { Sheet } from "./sheet.tsx";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"] as const;
const DECIMALS = 2;
/** The figure's input grows with what is typed, plus room for the caret (in character widths). */
const CARET_ROOM_CH = 0.5;
const CENTS = 100;
const MONEY = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** One key applied to an amount typed as text: two decimals at most, no leading zeros. */
function pressKey(value: string, key: string): string {
  if (key === "del") return value.slice(0, -1);
  if (key === ".") return value.includes(".") ? value : `${value || "0"}.`;
  const [, fraction] = value.split(".");
  if (fraction !== undefined && fraction.length >= DECIMALS) return value;
  if (value === "0") return key;
  return value + key;
}

const asText = (dollars: number) => (Number.isInteger(dollars) ? String(dollars) : dollars.toFixed(DECIMALS));
const round = (dollars: number) => Math.floor(dollars * CENTS) / CENTS;

/**
 * Any amount, typed: one big figure you type into on a computer or tap out on a phone's keypad, the usual amounts as quick
 * picks, Max when there is one, the bounds said in words, and one button that says what it will do.
 */
export function AmountSheet({
  open,
  onClose,
  title,
  initial,
  presets,
  min,
  max,
  maxLabel = "Max",
  confirm,
  onConfirm,
  busy = false,
  problem,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Dollars shown when the sheet opens. */
  initial: number;
  presets: readonly number[];
  /** Bounds in dollars; `max` null means none. */
  min: number;
  max: number | null;
  maxLabel?: string;
  /** The button's words for an amount, e.g. "Send $2.00". */
  confirm: (dollars: number) => string;
  onConfirm: (dollars: number) => void | Promise<void>;
  busy?: boolean;
  /** Something about this amount that needs saying, with its fix (e.g. "not enough in your wallet · Get test BCH"). */
  problem?: (dollars: number) => ReactNode;
}) {
  const phone = usePhone();
  const [text, setText] = useState(asText(initial));
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    setText(asText(initial));
    if (!phone) requestAnimationFrame(() => input.current?.select());
  }, [open, initial, phone]);

  const dollars = Number(text || "0");
  const tooLow = dollars < min;
  const tooHigh = max !== null && dollars > max;
  const bounds = max === null ? `From ${MONEY.format(min)}` : `${MONEY.format(min)} to ${MONEY.format(max)}`;
  const note = tooLow
    ? `At least ${MONEY.format(min)}`
    : tooHigh
      ? `At most ${MONEY.format(max ?? 0)}`
      : (problem?.(dollars) ?? bounds);
  const blocked = tooLow || tooHigh || busy || Boolean(problem?.(dollars));
  const submit = () => {
    if (blocked) return;
    cue("tap");
    void onConfirm(round(dollars));
  };
  const picks = max === null ? presets : [...presets.filter((value) => value < max), round(max)];

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <form
        className="flex flex-col items-center gap-5 pb-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label className="nx-num flex items-baseline justify-center text-[56px] font-semibold leading-none tracking-[-0.04em]">
          <span className="text-[var(--muted)]">$</span>
          <input
            ref={input}
            value={text || ""}
            placeholder="0"
            readOnly={phone}
            inputMode="decimal"
            aria-label={`${title}, in dollars`}
            onChange={(event) => {
              const next = event.target.value.replace(/[^0-9.]/g, "");
              if (/^\d*\.?\d{0,2}$/.test(next)) setText(next);
            }}
            className="w-[6ch] min-w-0 bg-transparent text-center outline-none"
            style={{ width: `${Math.max(1, (text || "0").length) + CARET_ROOM_CH}ch` }}
          />
        </label>
        <p
          className={cx(
            "-mt-2 min-h-5 text-center text-[13px]",
            tooLow || tooHigh ? "text-[var(--down-text)]" : "text-[var(--muted)]",
          )}
        >
          {note}
        </p>
        <div className="flex w-full flex-wrap justify-center gap-2">
          {picks.map((value, index) => {
            const isMax = max !== null && index === picks.length - 1 && value === round(max);
            return (
              <button
                key={`${value}-${index}`}
                type="button"
                aria-pressed={dollars === value}
                onClick={() => {
                  cue("tap");
                  setText(asText(value));
                }}
                className={cx(
                  "nx-num h-11 min-w-[64px] rounded-full px-4 text-[14px] font-semibold",
                  dollars === value
                    ? "bg-[var(--ink)] text-[var(--ink-inverse)]"
                    : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]",
                )}
              >
                {isMax ? maxLabel : Number.isInteger(value) ? `$${value}` : MONEY.format(value)}
              </button>
            );
          })}
        </div>
        {phone ? (
          <div className="grid w-full grid-cols-3 gap-1.5">
            {KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-label={key === "del" ? "Delete" : key}
                onClick={() => {
                  cue("tap");
                  setText((value) => pressKey(value, key));
                }}
                className="nx-num grid h-12 place-items-center rounded-[14px] text-[22px] font-semibold active:bg-[var(--surface-2)]"
              >
                {key === "del" ? <Delete size={22} aria-hidden /> : key}
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={blocked}
          className="nx-display h-14 w-full rounded-full bg-[var(--ink)] text-[17px] text-[var(--ink-inverse)] disabled:opacity-40"
        >
          {confirm(round(dollars))}
        </button>
      </form>
    </Sheet>
  );
}
