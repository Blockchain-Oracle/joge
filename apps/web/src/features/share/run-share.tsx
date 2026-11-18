"use client";

import { TICKET_DUST } from "@joge/sdk";
import { useEffect, useMemo, useState } from "react";
import { Segmented } from "@/kit";
import { profileHref } from "../players/api.ts";
import type { TicketRow } from "../portfolio/ticket-row.tsx";
import { laneLabel } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import { useWorld } from "../shell/world.tsx";
import { type Fonts, loadFonts, readFonts } from "./paint-kit.ts";
import { drawRun, RUN, RUN_PERIODS, type RunPeriod, type RunWords, runRows, runStory } from "./run.ts";
import { ShareFrame, type ShareSubject } from "./share-frame.tsx";

const HIDDEN = "••••";
const PERCENT = 100;
const SATS_PER_BCH = 100_000_000;
const HALF_CENT = 0.005;
const DAY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const SIGNED = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", signDisplay: "always" });
const MS_PER_SECOND = 1_000;
const netOf = (row: TicketRow) => (row.ticket.payoutSats ?? 0) - row.ticket.stake - Number(TICKET_DUST);

/**
 * Share your run (his ask: "I made this trade and profit", a PnL card like FOMO's): pick the period, see the card or
 * the video of your running net round by round, hide amounts if you like, then save, share, post or copy. The QR opens
 * your record on Jōge.
 */
export function RunShareSheet({
  rows,
  pkh,
  open,
  onClose,
}: {
  rows: TicketRow[];
  pkh: string;
  open: boolean;
  onClose: () => void;
}) {
  const network = useWorld();
  const money = useMoney();
  const [period, setPeriod] = useState<RunPeriod>("week");
  const [hidden, setHidden] = useState(false);
  const [fonts, setFonts] = useState<Fonts | null>(null);
  useEffect(() => {
    if (!open) return;
    const read = readFonts();
    void loadFonts(read).then(() => setFonts(read));
  }, [open]);

  const subject = useMemo((): ShareSubject | null => {
    if (!fonts || !money.bchUsd) return null;
    const now = Date.now();
    const chosen = runRows(rows, period, now);
    const story = runStory(chosen);
    if (!story) return null;
    const usd = (sats: number) => (sats / SATS_PER_BCH) * (money.bchUsd ?? 0);
    const staked = chosen.reduce((sum, row) => sum + row.ticket.stake, 0);
    const total = chosen.reduce((sum, row) => sum + netOf(row), 0);
    const even = Math.abs(usd(total)) < HALF_CENT;
    const roiValue = Math.round((Math.abs(total) / Math.max(1, staked)) * PERCENT);
    const roi = even || roiValue === 0 ? "0%" : `${total > 0 ? "+" : "−"}${roiValue}%`;
    const decided = chosen.filter((row) => row.ticket.status !== "refunded");
    const right = decided.filter((row) => row.ticket.status === "won").length;
    const best = chosen.reduce<TicketRow | null>((top, row) => (top && netOf(top) >= netOf(row) ? top : row), null);
    const first = chosen.reduce((low, row) => Math.min(low, row.round.closeTime), Number.POSITIVE_INFINITY);
    const pctOf = (sats: number) =>
      `${sats >= 0 ? "+" : "−"}${Math.round((Math.abs(sats) / Math.max(1, staked)) * PERCENT)}%`;
    const words: RunWords = {
      url: new URL(`${profileHref(network, pkh)}?w=${network}`, window.location.origin).toString(),
      period: RUN_PERIODS[period].label,
      dates: `${DAY.format(first * MS_PER_SECOND)} – ${DAY.format(now)}`,
      net: hidden ? roi : even ? "$0.00" : SIGNED.format(usd(total)),
      sign: even ? 0 : Math.sign(total),
      sub: hidden ? "" : `${roi} on ${money.format(staked)} staked`,
      rounds: String(chosen.length),
      right: decided.length > 0 ? `${Math.round((right / decided.length) * PERCENT)}%` : "—",
      best:
        best && netOf(best) > 0
          ? hidden
            ? pctOf(netOf(best))
            : `+${money.format(netOf(best))}`
          : best
            ? `${best.round.asset} ${best.round.laneSeconds ? laneLabel(best.round.laneSeconds) : ""}`
            : HIDDEN,
      netAt: (sats) => (hidden ? pctOf(sats) : SIGNED.format(usd(sats))),
    };
    return {
      key: `${period}:${hidden}:${chosen.length}`,
      name: `joge-run-${period}`,
      title: "My run on Jōge",
      url: words.url,
      post:
        total > 0 && !even
          ? `${roi} on Jōge ${RUN_PERIODS[period].label.toLowerCase()}: ${chosen.length} rounds of up or down, no house, settled on Bitcoin Cash.`
          : `${chosen.length} rounds of up or down on Jōge ${RUN_PERIODS[period].label.toLowerCase()}. No house, settled on Bitcoin Cash.`,
      imageLabel: "Card",
      imageSize: RUN.frame,
      drawImage: (ctx) => drawRun(ctx, story, words, fonts),
      sceneSize: RUN.frame,
      totalMs: story.totalMs,
      drawScene: (ctx, t) => drawRun(ctx, story, words, fonts, t),
      cues: story.cues,
    };
  }, [fonts, money, rows, period, hidden, network, pkh]);

  return (
    <ShareFrame
      open={open}
      onClose={onClose}
      subject={subject}
      hidden={hidden}
      onHidden={setHidden}
      waiting={fonts ? "No finished rounds in this period yet" : "Getting your run…"}
      controls={
        <Segmented
          label="Period"
          value={period}
          onChange={setPeriod}
          options={(Object.keys(RUN_PERIODS) as RunPeriod[]).map((key) => ({
            value: key,
            label: RUN_PERIODS[key].label,
          }))}
        />
      }
    />
  );
}
