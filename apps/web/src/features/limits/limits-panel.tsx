"use client";

import { Coffee, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AmountSheet, cue, cx } from "@/kit";
import { usd } from "../rounds/format.ts";
import { useNow } from "../rounds/use-now.ts";
import { SettingRow } from "../shell/prefs.tsx";
import { COOL_OFFS, DAILY_OPTIONS } from "./constants.ts";
import { effective, setDailyLimit, startCoolOff, useLimits } from "./limits.ts";

const SECOND_MS = 1_000;
/** The smallest daily limit worth setting (one minimum call), and where a typed one starts. */
const DAILY_MIN_USD = 0.05;
const DAILY_TYPED_START = 5;
const WHEN = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" });

const pill = (selected: boolean) =>
  cx(
    "nx-num h-9 rounded-full px-3 text-[13px] font-semibold transition-colors",
    selected ? "bg-[var(--ink)] text-[var(--ink-inverse)]" : "bg-[var(--surface-3)] hover:bg-[var(--strong)]",
  );

/**
 * Play limits (F26) as two settings: a daily stake limit and a break. A looser limit waits a day and a break can't be
 * ended early; the one-tap plates wear either as their blocker.
 */
export function LimitsPanel() {
  const limits = useLimits();
  const now = useNow();
  const nowMs = now * SECOND_MS;
  const inForce = effective(limits, nowMs);
  const [typing, setTyping] = useState(false);
  const custom = inForce.dailyUsd !== null && !DAILY_OPTIONS.includes(inForce.dailyUsd);
  return (
    <>
      <AmountSheet
        open={typing}
        onClose={() => setTyping(false)}
        title="Daily limit"
        initial={inForce.dailyUsd ?? DAILY_TYPED_START}
        presets={DAILY_OPTIONS.filter((option): option is number => option !== null)}
        min={DAILY_MIN_USD}
        max={null}
        confirm={(dollars) => `${usd(dollars)} a day`}
        onConfirm={(dollars) => {
          setDailyLimit(dollars);
          setTyping(false);
        }}
      />
      <div className="flex flex-col">
        <SettingRow icon={<ShieldCheck size={18} aria-hidden />} label="Daily limit">
          <span className="flex gap-1">
            {DAILY_OPTIONS.map((option) => (
              <button
                key={option ?? "off"}
                type="button"
                aria-pressed={inForce.dailyUsd === option}
                onClick={() => {
                  cue("tap");
                  setDailyLimit(option);
                }}
                className={pill(inForce.dailyUsd === option)}
              >
                {option === null ? "∞" : `$${option}`}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={custom}
              onClick={() => {
                cue("open");
                setTyping(true);
              }}
              className={pill(custom)}
            >
              {custom ? usd(inForce.dailyUsd ?? 0) : "Other"}
            </button>
          </span>
        </SettingRow>
        {limits.pending && limits.pending.from > nowMs ? (
          <p className="nx-num -mt-2 pb-3 pl-[30px] text-[12px] text-[var(--muted)]">
            {limits.pending.dailyUsd === null ? "∞" : `$${limits.pending.dailyUsd}`} from{" "}
            {WHEN.format(limits.pending.from)}
          </p>
        ) : null}
      </div>
      <SettingRow icon={<Coffee size={18} aria-hidden />} label="Break">
        {inForce.coolOffUntil ? (
          <span className="nx-num text-[13px] text-[var(--ink-2)]">until {WHEN.format(inForce.coolOffUntil)}</span>
        ) : (
          <span className="flex gap-1">
            {COOL_OFFS.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  cue("tap");
                  startCoolOff(option.ms);
                }}
                className={pill(false)}
              >
                {option.label}
              </button>
            ))}
          </span>
        )}
      </SettingRow>
    </>
  );
}
