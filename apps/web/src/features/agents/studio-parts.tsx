"use client";

import { LANES } from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { Dices, Hourglass, PenLine, Repeat2, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { cue, cx, LiveDot } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { lobbyQuery } from "../rounds/api.ts";
import { laneLabel } from "../rounds/format.ts";
import { useWorld } from "../shell/world.tsx";
import type { DryRead } from "./api.ts";
import { PERCENT } from "./constants.ts";
import { useSatsUsd } from "./format.ts";
import { Portrait } from "./portrait.tsx";

/** Styles to start from: real briefs the model reads (the owner can write their own instead). */
export const STYLES = [
  {
    key: "momentum",
    name: "Momentum",
    line: "Follows the move",
    icon: TrendingUp,
    text: "Follow the move. If the last few signed prices climb, call Up; if they fall, call Down. Sit out when the line is flat or the pot is already crowded on that side.",
  },
  {
    key: "contrarian",
    name: "Contrarian",
    line: "Leans against the crowd",
    icon: Repeat2,
    text: "Lean against the crowd. When one side holds most of the pot, take the other side only if the prices do not clearly back the crowd. Otherwise sit out.",
  },
  {
    key: "patient",
    name: "Patient",
    line: "Only clear moves",
    icon: Hourglass,
    text: "Enter rarely. Only call a side when the recent prices show a clear, steady move and the payout is fair. A round you skip costs nothing.",
  },
] as const;
export type StyleKey = (typeof STYLES)[number]["key"] | "own";

/** A big choice tile: an icon, a name and a few words. */
export function Choice({
  on,
  onClick,
  icon,
  title,
  line,
}: {
  on: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  line: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        cue("tap");
        onClick();
      }}
      className={cx(
        "flex items-center gap-3 rounded-[20px] p-4 text-left transition-colors",
        on ? "bg-[var(--ink)] text-[var(--ink-inverse)]" : "bg-[var(--surface-1)] hover:bg-[var(--surface-2)]",
      )}
    >
      <span
        className={cx(
          "grid size-11 shrink-0 place-items-center rounded-full",
          on ? "bg-[var(--up)] text-[var(--up-ink)]" : "bg-[var(--surface-2)]",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="nx-display block text-[17px]">{title}</span>
        <span className={cx("block text-[13px]", on ? "opacity-70" : "text-[var(--muted)]")}>{line}</span>
      </span>
    </button>
  );
}

export const OWN_ICON = <PenLine size={19} aria-hidden />;

/** Six faces to pick from, and a die for six more. */
export function FacePicker({
  seeds,
  picked,
  onPick,
  onShuffle,
}: {
  seeds: string[];
  picked: string;
  onPick: (seed: string) => void;
  onShuffle: () => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {seeds.map((seed) => (
        <button
          key={seed}
          type="button"
          aria-pressed={seed === picked}
          aria-label="Pick this face"
          onClick={() => {
            cue("tap");
            onPick(seed);
          }}
          className={cx(
            "grid place-items-center rounded-[18px] p-1 transition-transform hover:-translate-y-0.5",
            seed === picked && "shadow-[inset_0_0_0_2.5px_var(--ink)]",
          )}
        >
          <Portrait seed={seed} name="A face" size={64} />
        </button>
      ))}
      <button
        type="button"
        onClick={onShuffle}
        aria-label="More faces"
        className="grid place-items-center rounded-[18px] bg-[var(--surface-1)] text-[var(--muted)] hover:text-[var(--ink)]"
      >
        <Dices size={26} aria-hidden />
      </button>
    </div>
  );
}

/** Every lane as a tile to toggle; a live dot marks lanes with a round taking entries now. */
export function LaneGrid({ lanes, onChange }: { lanes: number[]; onChange: (lanes: number[]) => void }) {
  const network = useWorld();
  const lobby = useQuery(lobbyQuery(network));
  const running = new Set((lobby.data?.lanes ?? []).filter((lane) => lane.next).map((lane) => lane.thread));
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {LANES.map((lane) => {
        const on = lanes.includes(lane.thread);
        return (
          <button
            key={lane.thread}
            type="button"
            aria-pressed={on}
            onClick={() => {
              cue("tap");
              onChange(on ? lanes.filter((each) => each !== lane.thread) : [...lanes, lane.thread]);
            }}
            className={cx(
              "flex items-center gap-3 rounded-[18px] p-3 text-left transition-colors",
              on ? "bg-[var(--ink)] text-[var(--ink-inverse)]" : "bg-[var(--surface-1)] hover:bg-[var(--surface-2)]",
            )}
          >
            <AssetCube asset={lane.asset} size={30} />
            <span className="nx-display flex-1 text-[15px]">
              {lane.asset} <span className="nx-num font-semibold opacity-60">{laneLabel(lane.seconds)}</span>
            </span>
            {running.has(lane.thread) ? <LiveDot tone="up" /> : null}
          </button>
        );
      })}
    </div>
  );
}

/** A dry read's answer as the agent would make it: its face, the side, how sure, why, and what the rules allow. */
export function ReadCard({ read, face, name }: { read: DryRead; face: string; name: string }) {
  const money = useSatsUsd();
  const side = read.read.side;
  return (
    <div className="flex gap-3 rounded-[20px] bg-[var(--surface-1)] p-4">
      <Portrait seed={face} name={name} size={52} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cx(
              "nx-jp grid size-8 place-items-center rounded-[9px] text-[15px]",
              side === "up"
                ? "bg-[var(--up)] text-[var(--up-ink)]"
                : side === "down"
                  ? "bg-[var(--down)] text-[var(--down-ink)]"
                  : "bg-[var(--surface-2)] text-[var(--muted)]",
            )}
          >
            {side === "up" ? "上" : side === "down" ? "下" : "—"}
          </span>
          <span className="nx-num text-[15px] font-semibold">{Math.round(read.read.confidence * PERCENT)}%</span>
          <span className="nx-eyebrow ml-auto">
            {read.gate.enter ? `would bet ${money.format(BigInt(read.gate.stake))}` : "would sit out"}
          </span>
        </div>
        <p className="mt-2 line-clamp-3 text-[14px] leading-snug text-[var(--ink-2)]">{read.read.why}</p>
      </div>
    </div>
  );
}
