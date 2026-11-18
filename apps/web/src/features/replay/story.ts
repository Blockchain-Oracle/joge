import { TICKET_DUST } from "@joge/sdk";
import type { Cue } from "@/kit";
import type { TicketRow } from "../portfolio/ticket-row.tsx";
import { laneLabel } from "../rounds/format.ts";

/**
 * A player's story (the portfolio film): every decided ticket in the order its round closed, as one beat each on a
 * running net. Fast whatever the history: beats share about 16 s (at most 60 beats; a longer history groups its rounds
 * into 60), each sounding as it landed (a win climbs the ladder, a loss blips, a refund taps), then the total holds.
 */
export const STORY_LEAD_MS = 500;
export const STORY_HOLD_MS = 2_200;
const STORY_RUN_MS = 16_000;
const BEAT_MIN_MS = 240;
const BEAT_MAX_MS = 700;
const MAX_BEATS = 60;
const LADDER_TOP = 10;
/** After the last beat: the total stamps, then its chord. */
const STAMP_AFTER_MS = 250;
const VERDICT_AFTER_MS = 500;

export type Outcome = "won" | "lost" | "refunded";

export interface Beat {
  /** The round to replay (null when the beat groups several rounds). */
  roundId: number | null;
  label: string;
  outcome: Outcome;
  /** This beat's net and the running net after it (sats). */
  net: number;
  total: number;
  at: number;
}

export interface Story {
  beats: Beat[];
  beatMs: number;
  totalMs: number;
  low: number;
  high: number;
  wins: number;
  losses: number;
  cues: Array<{ at: number; cue: Cue; step: number }>;
}

const netOf = (row: TicketRow) => (row.ticket.payoutSats ?? 0) - row.ticket.stake - Number(TICKET_DUST);

export function storyOf(rows: TicketRow[]): Story | null {
  const decided = rows
    .filter((row) => row.ticket.status === "won" || row.ticket.status === "lost" || row.ticket.status === "refunded")
    .sort((a, b) => a.round.closeTime - b.round.closeTime);
  if (decided.length === 0) return null;
  const groups: TicketRow[][] = [];
  const per = Math.ceil(decided.length / MAX_BEATS);
  for (let i = 0; i < decided.length; i += per) groups.push(decided.slice(i, i + per));
  const beatMs = Math.min(BEAT_MAX_MS, Math.max(BEAT_MIN_MS, STORY_RUN_MS / groups.length));
  let total = 0;
  const beats = groups.map((group, index): Beat => {
    const net = group.reduce((sum, row) => sum + netOf(row), 0);
    total += net;
    const first = group[0];
    const won = group.filter((row) => row.ticket.status === "won").length;
    const lost = group.filter((row) => row.ticket.status === "lost").length;
    const single = group.length === 1 && first;
    return {
      roundId: single ? first.ticket.roundId : null,
      label: single
        ? `${first.round.asset} ${first.round.laneSeconds ? laneLabel(first.round.laneSeconds) : ""} #${first.ticket.roundId}`
        : `${group.length} rounds`,
      outcome: won > lost ? "won" : lost > won ? "lost" : net >= 0 ? (won > 0 ? "won" : "refunded") : "lost",
      net,
      total,
      at: STORY_LEAD_MS + (index + 1) * beatMs,
    };
  });
  const totals = [0, ...beats.map((beat) => beat.total)];
  const cues: Story["cues"] = [{ at: 0, cue: "open", step: 0 }];
  let run = 0;
  for (const beat of beats) {
    if (beat.outcome === "won") {
      run += 1;
      cues.push({ at: beat.at, cue: "profit", step: Math.min(LADDER_TOP, run - 1) });
    } else {
      run = 0;
      cues.push({ at: beat.at, cue: beat.outcome === "lost" ? "adverse" : "tap", step: 0 });
    }
  }
  const end = STORY_LEAD_MS + beats.length * beatMs;
  cues.push({ at: end + STAMP_AFTER_MS, cue: "stamp", step: 0 });
  cues.push({ at: end + VERDICT_AFTER_MS, cue: total >= 0 ? "win" : "loss", step: 0 });
  return {
    beats,
    beatMs,
    totalMs: end + STORY_HOLD_MS,
    low: Math.min(...totals),
    high: Math.max(...totals),
    wins: decided.filter((row) => row.ticket.status === "won").length,
    losses: decided.filter((row) => row.ticket.status === "lost").length,
    cues,
  };
}

/** How many beats have landed by film time `t`, and how far the next one has travelled (0–1). */
export function progressAt(story: Story, t: number): { landed: number; partial: number } {
  const run = Math.max(0, t - STORY_LEAD_MS);
  const landed = Math.min(story.beats.length, Math.floor(run / story.beatMs));
  const partial = landed >= story.beats.length ? 0 : (run % story.beatMs) / story.beatMs;
  return { landed, partial };
}
