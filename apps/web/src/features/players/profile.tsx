"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Copy, ExternalLink, Trophy, UserX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cue, cx, EmptyState, Marble, Skeleton } from "@/kit";
import { copyText } from "@/lib/browser";
import { agentsQuery } from "../agents/api.ts";
import { faceOf } from "../agents/names.ts";
import { Portrait } from "../agents/portrait.tsx";
import { TicketLine } from "../portfolio/ticket-row.tsx";
import { StoryFilm } from "../replay/story-film.tsx";
import { ADDRESS_EXPLORER } from "../round/api.ts";
import { useNow } from "../rounds/use-now.ts";
import { setWorld, useWorld } from "../shell/world.tsx";
import { useWallet } from "../wallet/wallet-context.tsx";
import { addressOf, pkhOf, profileQuery } from "./api.ts";
import { ShortAddress } from "./leaderboard.tsx";

const PERCENT = 100;
const DAY_SECONDS = 86_400;
const SECOND_MS = 1_000;
const WEEKS = 12;
const WEEK_DAYS = 7;
const COPIED_MS = 1_500;
/** The list shows the latest tickets; the story film above plays them all. */
const SHOWN_TICKETS = 30;
/** Cell shades by tickets that day: one, a few, many (an empty day stays faint). */
const BUSY_DAY = 4;
const SHADES = ["opacity-45", "opacity-75", "opacity-100"];

/** Twelve weeks of days, oldest first, each tinted by that day's result (lime up, coral down). */
function Days({ days, now }: { days: Array<{ day: number; tickets: number; net: number }>; now: number }) {
  const today = Math.floor(now / DAY_SECONDS) * DAY_SECONDS;
  const byDay = new Map(days.map((entry) => [entry.day, entry]));
  const cells = Array.from(
    { length: WEEKS * WEEK_DAYS },
    (_, index) => today - (WEEKS * WEEK_DAYS - 1 - index) * DAY_SECONDS,
  );
  return (
    <div
      role="img"
      aria-label={`${days.length} days played in the last twelve weeks`}
      className="grid w-fit grid-flow-col grid-rows-[repeat(7,12px)] auto-cols-[12px] gap-[3px]"
    >
      {cells.map((day) => {
        const entry = byDay.get(day);
        const shade = entry ? SHADES[entry.tickets >= BUSY_DAY ? 2 : entry.tickets > 1 ? 1 : 0] : "";
        return (
          <span
            key={day}
            title={entry ? `${new Date(day * SECOND_MS).toDateString()}: ${entry.tickets} tickets` : undefined}
            className={cx(
              "size-3 rounded-[3px]",
              entry ? (entry.net >= 0 ? "bg-[var(--up)]" : "bg-[var(--down)]") : "bg-[var(--surface-2)]",
              shade,
            )}
          />
        );
      })}
    </div>
  );
}

/**
 * A player: no account, just a payout address. Its marble, its place, one big number (what it won), three small
 * ones, twelve weeks of days, and its tickets; all of it read from what the chain decided.
 */
export function Profile({ address, world }: { address: string; world?: "chipnet" | "mainnet" | undefined }) {
  const network = useWorld();
  useEffect(() => {
    if (world && world !== network) setWorld(world);
  }, [world, network]);
  const now = useNow();
  const wallet = useWallet();
  const [copied, setCopied] = useState(false);
  const [allTickets, setAllTickets] = useState(false);
  const pkh = pkhOf(network, address);
  const profile = useQuery({ ...profileQuery(network, pkh ?? ""), enabled: pkh !== null });

  if (pkh === null) {
    return (
      <EmptyState icon={UserX} title="Not an address" action={{ label: "See the leaders", href: "/leaderboard" }} />
    );
  }
  if (profile.isPending) return <Skeleton className="h-[480px] rounded-[32px]" label="Loading the player" />;
  const data = profile.data;
  const full = addressOf(network, pkh);
  const yours = wallet.keys.some((key) => key.pkh === pkh);
  const totals = data?.totals ?? null;
  const decided = totals ? totals.won + totals.lost : 0;

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-6 rounded-[32px] bg-[var(--stage)] p-5 shadow-[inset_0_0_0_1px_var(--hairline)] md:p-7">
        <div className="flex items-center gap-4">
          <Marble seed={pkh} size={72} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="nx-display flex flex-wrap items-center gap-2 text-[clamp(22px,3vw,30px)]">
              <ShortAddress address={full} />
              {yours ? (
                <span className="nx-eyebrow rounded-full bg-[var(--vermilion)] px-2 py-0.5 text-white">you</span>
              ) : null}
            </h1>
            <span className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void copyText(full);
                  cue("tap");
                  setCopied(true);
                  setTimeout(() => setCopied(false), COPIED_MS);
                }}
                className="nx-glass inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-semibold text-[12px]"
              >
                {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
                {copied ? "Copied" : "Address"}
              </button>
              <a
                href={`${ADDRESS_EXPLORER[network]}${full}`}
                target="_blank"
                rel="noreferrer"
                className="nx-glass inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-semibold text-[12px]"
              >
                Explorer <ExternalLink aria-hidden className="size-3.5" />
              </a>
            </span>
          </div>
          {data?.rank ? (
            <Link href="/leaderboard" className="flex flex-col items-center" aria-label={`Rank ${data.rank}`}>
              <Trophy aria-hidden className="size-5 text-[var(--vermilion)]" />
              <span className="nx-display text-[26px]">#{data.rank}</span>
            </Link>
          ) : null}
        </div>
        {totals ? (
          <>
            {/* The story is the hero: the running net round by round, ending on where they stand. */}
            {data ? <StoryFilm rows={data.tickets} big /> : null}
            <dl className="grid grid-cols-3 gap-2">
              {[
                { label: "Rounds", value: String(totals.rounds) },
                { label: "Right", value: decided ? `${Math.round((totals.won / decided) * PERCENT)}%` : "—" },
                {
                  label: "Best run",
                  value: `${data?.bestStreak ?? 0}${data?.streak ? ` · now ${data.streak}` : ""}`,
                },
              ].map((fact) => (
                <div key={fact.label} className="min-w-0 rounded-[18px] bg-[var(--surface-1)] p-3">
                  <dt className="nx-eyebrow">{fact.label}</dt>
                  <dd className="nx-num mt-1 truncate font-semibold text-[18px]">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-2">
              <p className="nx-eyebrow">12 weeks</p>
              <Days days={data?.days ?? []} now={now} />
            </div>
          </>
        ) : (
          <p className="text-[15px] text-[var(--muted)]">No decided rounds yet.</p>
        )}
      </section>
      <PlayerAgents pkh={pkh} />
      {data && data.tickets.length > 0 ? (
        <section className="flex flex-col gap-1.5" aria-label="Tickets">
          {data.tickets.slice(0, allTickets ? undefined : SHOWN_TICKETS).map(({ ticket, round }) => (
            <TicketLine key={ticket.outpoint} ticket={ticket} round={round} />
          ))}
          {!allTickets && data.tickets.length > SHOWN_TICKETS ? (
            <button
              type="button"
              onClick={() => setAllTickets(true)}
              className="nx-num self-center rounded-full bg-[var(--surface-1)] px-4 py-2 font-semibold text-[13px] hover:bg-[var(--surface-2)]"
            >
              +{data.tickets.length - SHOWN_TICKETS}
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

/** The agents this player owns, as their faces: each opens its agent (players and their agents link both ways). */
function PlayerAgents({ pkh }: { pkh: string }) {
  const network = useWorld();
  const agents = useQuery(agentsQuery(network, [pkh]));
  const owned = agents.data ?? [];
  if (owned.length === 0) return null;
  return (
    <section className="flex flex-wrap items-center gap-2" aria-label="Their agents">
      {owned.map((agent) => (
        <Link
          key={agent.id}
          href={`/agents/${agent.id}`}
          className="flex items-center gap-2 rounded-full bg-[var(--surface-1)] py-1 pr-4 pl-1 hover:bg-[var(--surface-2)]"
        >
          <Portrait seed={faceOf(agent)} name={agent.name} size={34} />
          <span className="font-semibold text-[14px]">{agent.name}</span>
        </Link>
      ))}
    </section>
  );
}
