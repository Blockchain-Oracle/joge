"use client";

import { HOUR_SECONDS } from "@joge/sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { roundQuery } from "../round/api.ts";
import { countdown } from "../rounds/format.ts";
import { useNow } from "../rounds/use-now.ts";
import { useWorld } from "../shell/world.tsx";
import { CLOSE_LEAD_SECONDS } from "../terminal/constants.ts";
import { useOneTap } from "../terminal/use-one-tap.ts";
import { answerProposal, type Memory } from "./api.ts";
import { PERCENT } from "./constants.ts";
import { useSatsUsd } from "./format.ts";

const _MS_PER_SECOND = 1_000;

/**
 * An ask-me-first proposal while its round takes entries: the side on its plate, the stake and how sure the agent is.
 * Take it enters in one tap (at the proposal's stake, signed in the owner's wallet); Pass lets it go.
 */
export function Proposal({ entry, owner }: { entry: Memory; owner: boolean }) {
  const network = useWorld();
  const now = useNow();
  const client = useQueryClient();
  const money = useSatsUsd();
  const view = useQuery(roundQuery(network, entry.roundId));
  const round = view.data?.round ?? null;
  const tap = useOneTap(
    round?.state === "open" ? round : null,
    round?.laneSeconds && round.laneSeconds >= HOUR_SECONDS ? "hourly" : "short",
    entry.stake,
  );
  if (round?.state !== "open" || round.lockTime - now < CLOSE_LEAD_SECONDS) return null;
  const side = entry.side === "down" ? 1 : 0;
  const answer = async (proposal: "taken" | "passed") => {
    try {
      await answerProposal(network, entry.id, proposal);
      void client.invalidateQueries({ queryKey: ["agent", network, entry.agentId] });
    } catch (error) {
      toast({ tone: "down", title: "Not saved", body: error instanceof Error ? error.message : "" });
    }
  };
  const take = async () => {
    if (tap.blocker) {
      tap.blocker.onClick();
      return;
    }
    if (await tap.enter(side)) await answer("taken");
  };
  return (
    <div data-side={side === 0 ? "up" : "down"} className="nx-plate h-auto flex-col items-stretch gap-3 p-4 text-left">
      <div className="flex items-center gap-3">
        <AssetCube asset={round.asset} size={36} />
        <span className="min-w-0 flex-1">
          <span className="block text-[19px] leading-tight">
            <span className="nx-jp">{side === 0 ? "上" : "下"}</span> {side === 0 ? "Up" : "Down"} ·{" "}
            {money.format(entry.stake ?? 0)}
          </span>
          <span className="nx-num block text-[12px] font-semibold opacity-75">
            {Math.round((entry.confidence ?? 0) * PERCENT)}% · {countdown(round.lockTime, now)}
          </span>
        </span>
      </div>
      {entry.why ? <p className="line-clamp-2 font-sans text-[14px] font-medium leading-snug">{entry.why}</p> : null}
      {owner ? (
        <div className="flex gap-2 font-sans">
          <button
            type="button"
            disabled={tap.busy !== null}
            onClick={() => void take()}
            className="h-11 flex-1 rounded-full bg-[#0b0b0b] font-semibold text-[15px] text-white disabled:opacity-60"
          >
            {tap.busy !== null ? "Signing…" : tap.blocker ? tap.blocker.label : "Take it"}
          </button>
          <button
            type="button"
            onClick={() => void answer("passed")}
            className="h-11 rounded-full bg-black/10 px-5 font-semibold text-[15px]"
          >
            Pass
          </button>
        </div>
      ) : null}
    </div>
  );
}
