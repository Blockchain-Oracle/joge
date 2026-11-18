"use client";

import type { AssetId, StakeClass } from "@joge/sdk";
import { HOUR_SECONDS } from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { Skeleton } from "@/kit";
import { ASSET_TONE, AssetCube } from "@/marks/asset";
import { roundQuery } from "../round/api.ts";
import { countdown, laneLabel, usd } from "../rounds/format.ts";
import { useNow } from "../rounds/use-now.ts";
import { useWorld } from "../shell/world.tsx";
import { useOneTap } from "../terminal/use-one-tap.ts";

/** What Sensei's `ticket` tool returned for a round it named (the server checked it is taking entries). */
export type CallOutput =
  | {
      ok: true;
      roundId: number;
      outcome: number;
      asset: AssetId;
      laneSeconds: number | null;
      lockTime: number;
    }
  | { ok: false; reason: string };

const MULTIPLE_DIGITS = 2;

/**
 * A call card under Sensei's reply: the side on its own plate, the round and the time left. One tap enters it at the
 * player's standing stake, the same as the round screen; Sensei never signs, the player's wallet does.
 */
export function TradeCard({ call }: { call: CallOutput }) {
  const network = useWorld();
  const now = useNow();
  const view = useQuery({ ...roundQuery(network, call.ok ? call.roundId : -1), enabled: call.ok });
  const round = view.data?.round ?? null;
  const stakeClass: StakeClass = call.ok && (call.laneSeconds ?? 0) >= HOUR_SECONDS ? "hourly" : "short";
  const tap = useOneTap(round?.state === "open" ? round : null, stakeClass);
  if (!call.ok) return <p className="text-[13px] text-[var(--muted)]">{call.reason}</p>;
  if (view.isPending) return <Skeleton className="h-[76px] rounded-[20px]" label="Loading the round" />;
  if (!round) return null;
  const side = call.outcome === 0 ? 0 : 1;
  const multiple = tap.pays(side);
  const detail = tap.blocker
    ? tap.blocker.label
    : `${usd(tap.stakeUsd)} · ${
        multiple === "alone"
          ? `no ${side === 0 ? "Down" : "Up"} yet`
          : multiple
            ? `${multiple.toFixed(MULTIPLE_DIGITS)}×`
            : "—"
      }`;
  return (
    <button
      type="button"
      data-side={side === 0 ? "up" : "down"}
      onClick={() => (tap.blocker ? tap.blocker.onClick() : void tap.enter(side))}
      className="nx-plate h-auto w-full justify-start gap-3 p-3 text-left"
    >
      <AssetCube asset={call.asset} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] leading-tight">
          <span className="nx-jp">{side === 0 ? "上" : "下"}</span> {side === 0 ? "Up" : "Down"} ·{" "}
          {ASSET_TONE[call.asset].name}
          {call.laneSeconds ? ` ${laneLabel(call.laneSeconds)}` : ""}
        </span>
        <span className="nx-num block text-[12px] font-semibold opacity-75">
          {detail} · {countdown(round.lockTime, now)}
        </span>
      </span>
      {tap.busy === side ? <LoaderCircle aria-hidden className="size-5 motion-safe:animate-spin" /> : null}
    </button>
  );
}
