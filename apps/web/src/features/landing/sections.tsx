"use client";

import type { LaneView, RoundCard } from "@joge/db";
import { ASSET_FEED, type AssetId, type FeedId } from "@joge/sdk";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cue, Ring } from "@/kit";
import { useOraclePrint } from "@/live/hooks";
import { AssetCube } from "@/marks/asset";
import { agentsQuery } from "../agents/api.ts";
import { faceOf } from "../agents/names.ts";
import { Portrait } from "../agents/portrait.tsx";
import { useSpot } from "../chart/use-spot.ts";
import { RoundFilmPlayer } from "../replay/round-film.tsx";
import { pricesQuery } from "../rounds/api.ts";
import { clockTime, laneLabel, printToDollars, usd } from "../rounds/format.ts";
import { useNow } from "../rounds/use-now.ts";
import { SenseiMark } from "../sensei/orb.tsx";
import { useWorld } from "../shell/world.tsx";
import { pickLane, useLane } from "../terminal/use-lane.ts";
import { CALL_STAKE, STEPS } from "./copy.ts";

const SECOND_MS = 1_000;
const TILE_RING = 40;
const FACES = 3;
const PRINT_SPAN = { seconds: 180 } as const;
const SIGNED_ASSETS: AssetId[] = ["BTC", "ETH", "BCH"];
/** A landing visitor has no tickets: the film plays from Up's side. */
const NO_FOCUS = new Set<string>();

/** A numbered section: its number, a title, one sentence, and live art beside it. */
function Section({ step, children }: { step: { n: string; title: string; line: string }; children: ReactNode }) {
  return (
    <section className="grid items-center gap-6 border-[var(--hairline)] border-t py-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12 md:py-16">
      <div className="flex flex-col gap-3">
        <span className="nx-num text-[13px] text-[var(--vermilion)]">{step.n}</span>
        <h2 className="nx-display text-[clamp(30px,4vw,48px)] leading-[1.02]">{step.title}</h2>
        <p className="max-w-md text-[17px] text-[var(--ink-2)] leading-relaxed">{step.line}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function LaneTile({ lane }: { lane: LaneView }) {
  const now = useNow();
  const price = useSpot(lane.asset) ?? undefined;
  const left = lane.next ? (lane.next.lockTime - now) * SECOND_MS : 0;
  return (
    <Link
      href="/rounds"
      onClick={() => {
        cue("tap");
        pickLane(lane.thread);
      }}
      className="flex items-center gap-3 rounded-[22px] bg-[var(--surface-1)] p-3 shadow-[inset_0_0_0_1px_var(--hairline)] transition-colors hover:bg-[var(--surface-2)]"
    >
      <AssetCube asset={lane.asset} size={40} />
      <span className="min-w-0 flex-1">
        <span className="nx-display block text-[16px]">
          {lane.asset} <span className="text-[var(--muted)]">{laneLabel(lane.seconds)}</span>
        </span>
        <span className="nx-num block text-[13px] text-[var(--ink-2)]">{price ? usd(price) : "—"}</span>
      </span>
      {lane.next ? (
        <Ring leftMs={left} spanMs={lane.seconds * SECOND_MS} size={TILE_RING} label="Next round in" />
      ) : null}
    </Link>
  );
}

function Lanes({ lanes }: { lanes: LaneView[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {lanes.map((lane) => (
        <LaneTile key={lane.thread} lane={lane} />
      ))}
    </div>
  );
}

/** Two plates and the standing stake: the whole act of playing. */
function CallArt() {
  return (
    <div aria-hidden className="flex flex-col items-center gap-4 rounded-[28px] bg-[var(--surface-1)] p-6">
      <span className="nx-glass nx-num rounded-full px-4 py-2 text-[15px] font-semibold">{CALL_STAKE}</span>
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        <span data-side="up" className="nx-plate h-16">
          <span className="nx-jp text-[26px] leading-none">上</span>
          <span className="text-[17px] tracking-[0.06em]">UP</span>
        </span>
        <span data-side="down" className="nx-plate h-16">
          <span className="nx-jp text-[26px] leading-none">下</span>
          <span className="text-[17px] tracking-[0.06em]">DOWN</span>
        </span>
      </div>
    </div>
  );
}

/** A finished round as the landing shows it (the pot is known for each lane's latest round). */
interface Paid {
  roundId: number;
  state: RoundCard["state"];
  winner: number | null;
  closeTime: number;
  asset: AssetId;
  laneSeconds: number;
  pot: number | null;
}

/** The latest round that paid somebody, as its film: press Replay and watch it happen, sounds and all. */
function PaidArt({ round }: { round: Paid | null }) {
  if (!round) return null;
  return (
    <div className="flex flex-col gap-2 rounded-[28px] bg-[var(--surface-1)] p-4 shadow-[inset_0_0_0_1px_var(--hairline)]">
      <RoundFilmPlayer roundId={round.roundId} focus={NO_FOCUS} />
      <Link
        href={`/r/${round.roundId}`}
        className="nx-eyebrow inline-flex items-center gap-1 self-end hover:text-[var(--ink)]"
      >
        #{round.roundId} · {round.asset} {laneLabel(round.laneSeconds)}{" "}
        <ArrowUpRight aria-hidden className="size-3.5" />
      </Link>
    </div>
  );
}

function SignedRow({ asset }: { asset: AssetId }) {
  const feed: FeedId = ASSET_FEED[asset];
  const live = useOraclePrint(feed);
  const history = useQuery(pricesQuery(asset, PRINT_SPAN));
  const print = live ?? history.data?.prints.at(-1);
  return (
    <li className="flex items-center gap-3 py-3">
      <AssetCube asset={asset} size={30} />
      <span className="nx-num flex-1 text-[14px] text-[var(--muted)]">{feed}</span>
      <span className="nx-num text-[15px] font-semibold">{print ? usd(printToDollars(feed, print.price)) : "—"}</span>
      <span className="nx-num w-[72px] text-right text-[12px] text-[var(--muted)]">
        {print ? clockTime(print.timestamp) : "--:--"}
      </span>
      <BadgeCheck aria-label="Signature checks" className="size-[18px] text-[var(--up-text)]" />
    </li>
  );
}

/** The last signed price of each feed, and a way into one round's proof. */
function SignedArt({ proofOf }: { proofOf: number | null }) {
  return (
    <div className="rounded-[28px] bg-[var(--surface-1)] px-5 py-2 shadow-[inset_0_0_0_1px_var(--hairline)]">
      <ul className="divide-y divide-[var(--hairline)]">
        {SIGNED_ASSETS.map((asset) => (
          <SignedRow key={asset} asset={asset} />
        ))}
      </ul>
      {proofOf !== null ? (
        <Link
          href={`/proof/${proofOf}`}
          className="nx-eyebrow flex items-center justify-center gap-1 border-[var(--hairline)] border-t py-3 hover:text-[var(--ink)]"
        >
          Check a round's proof <ArrowUpRight aria-hidden className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

/** Sensei's orb beside the faces of the agents playing now (real agents, most money entrusted first). */
function HelpArt() {
  const network = useWorld();
  const agents = useQuery(agentsQuery(network));
  const faces = (agents.data ?? []).slice(0, FACES);
  return (
    <div className="flex items-center gap-5 rounded-[28px] bg-[var(--surface-1)] p-5 shadow-[inset_0_0_0_1px_var(--hairline)]">
      <SenseiMark share={1} size={56} />
      <span className="h-10 w-px bg-[var(--hairline)]" />
      <span className="flex -space-x-3">
        {faces.map((agent) => (
          <Link
            key={agent.id}
            href={`/agents/${agent.id}`}
            aria-label={agent.name}
            className="transition-transform hover:-translate-y-1"
          >
            <Portrait seed={faceOf(agent)} name={agent.name} size={56} />
          </Link>
        ))}
      </span>
      <Link href="/agents" className="nx-num ml-auto text-[13px] text-[var(--muted)] hover:text-[var(--ink)]">
        {agents.data?.length === 1 ? "1 agent" : `${agents.data?.length ?? 0} agents`} →
      </Link>
    </div>
  );
}

/** Sections 01–05 below the hero. */
export function Sections() {
  const { lanes } = useLane();
  const lastPaid =
    lanes
      .flatMap((lane) =>
        lane.recent
          .filter((round) => round.state === "settled")
          .map((round) => ({
            ...round,
            asset: lane.asset,
            laneSeconds: lane.seconds,
            pot: lane.last?.roundId === round.roundId ? lane.last.pot : null,
          })),
      )
      .sort((a, b) => b.closeTime - a.closeTime)[0] ?? null;
  return (
    <div id="how">
      <Section step={STEPS.lanes}>
        <Lanes lanes={lanes} />
      </Section>
      <Section step={STEPS.call}>
        <CallArt />
      </Section>
      <Section step={STEPS.pays}>
        <PaidArt round={lastPaid} />
      </Section>
      <Section step={STEPS.signed}>
        <SignedArt proofOf={lastPaid?.roundId ?? null} />
      </Section>
      <Section step={STEPS.help}>
        <HelpArt />
      </Section>
    </div>
  );
}
