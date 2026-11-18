"use client";

import type { LaneView } from "@joge/db";
import { useSpot } from "@/features/chart/use-spot";
import { cue, cx, Ring } from "@/kit";
import { AssetCube } from "@/marks/asset";
import { laneLabel, usd } from "../rounds/format.ts";
import { useNow } from "../rounds/use-now.ts";
import { LaneAgents } from "./lane-agents.tsx";
import { pickLane } from "./use-lane.ts";

const SECOND_MS = 1_000;
const TILE_RING = 38;

function LaneTile({ lane, active, onPick }: { lane: LaneView; active: boolean; onPick?: () => void }) {
  const now = useNow();
  const price = useSpot(lane.asset) ?? undefined;
  const next = lane.next;
  const left = next ? (next.lockTime - now) * SECOND_MS : 0;
  return (
    <button
      type="button"
      onClick={() => {
        cue("tap");
        pickLane(lane.thread);
        onPick?.();
      }}
      aria-current={active ? "true" : undefined}
      className={cx(
        "flex w-full items-center gap-2.5 rounded-[16px] p-2 text-left transition-colors",
        active ? "bg-[var(--surface-2)] shadow-[inset_0_0_0_1.5px_var(--ink)]" : "hover:bg-[var(--glass)]",
      )}
    >
      <AssetCube asset={lane.asset} size={32} />
      <span className="min-w-0 flex-1">
        <span className="nx-display block text-[15px]">
          {lane.asset} <span className="text-[var(--muted)]">{laneLabel(lane.seconds)}</span>
        </span>
        <span className="nx-num block text-[13px] text-[var(--ink-2)]">{price ? usd(price) : "—"}</span>
      </span>
      {next ? <Ring leftMs={left} spanMs={lane.seconds * SECOND_MS} size={TILE_RING} label="Next round in" /> : null}
    </button>
  );
}

/**
 * The markets (Kakure's rail, narrowed): each a live tile (coin, length, price, a ring to its next round), then the agents
 * playing the one on screen with their call. Nothing here needs a caption to be understood.
 */
export function LaneRail({
  lanes,
  lane,
  onPick,
}: {
  lanes: LaneView[];
  lane: LaneView | undefined;
  onPick?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        {lanes.map((each) => (
          <LaneTile
            key={each.thread}
            lane={each}
            active={each.thread === lane?.thread}
            {...(onPick ? { onPick } : {})}
          />
        ))}
      </div>
      {lane ? <LaneAgents lane={lane} /> : null}
    </div>
  );
}
