"use client";

import { connectFulcrum, FULCRUM } from "@joge/contracts/browser";
import type { Network } from "@joge/db";
import { useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";
import Link from "next/link";
import { cue, cx, Ring, Skeleton } from "@/kit";
import { useStreamLive } from "@/live/hooks";
import { useMoney } from "../rounds/money.ts";
import { useNow } from "../rounds/use-now.ts";
import { useWorld } from "../shell/world.tsx";
import {
  ago,
  type Check,
  KEEPER_SATS,
  LIMITS,
  PROBE_TIMEOUT_MS,
  SLOW_MS,
  STATUS_EVERY_MS,
  type StatusReport,
  statusQuery,
  type Tone,
  toneOfAge,
  worst,
} from "./checks.ts";

const SECOND_MS = 1_000;
const FEEDS = ["USD/BTC", "USD/ETH", "USD/BCH", "XAU/BCH"];
const ASSETS = ["BTC", "ETH", "BCH", "GOLD"];
const UTC_TIME = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
const DOT: Record<Tone, string> = {
  good: "bg-[var(--up)]",
  warn: "bg-[var(--gold)]",
  bad: "bg-[var(--down)]",
  wait: "bg-[var(--muted)]",
};
const WORD: Record<Tone, string> = { good: "live", warn: "behind", bad: "down", wait: "checking" };
const VERDICT_RING = 44;

/** Times one Fulcrum server from this browser: connect, ask for the chain tip, close. */
async function probeFulcrum(url: string): Promise<{ ms: number; tip: number }> {
  const started = performance.now();
  const server = connectFulcrum([url]);
  try {
    const tip = await Promise.race([
      server.connect().then(() => server.request("blockchain.headers.get_tip", [])),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), PROBE_TIMEOUT_MS)),
    ]);
    return { ms: Math.round(performance.now() - started), tip: (tip as { height: number }).height };
  } finally {
    void server.close().catch(() => undefined);
  }
}

function useFulcrumChecks(network: Network): Check[] {
  const probes = useQuery({
    queryKey: ["status", network, "fulcrum"],
    queryFn: () => Promise.allSettled(FULCRUM[network].map(probeFulcrum)),
    refetchInterval: STATUS_EVERY_MS,
    retry: false,
  });
  return FULCRUM[network].map((url, index) => {
    const host = new URL(url).hostname;
    const result = probes.data?.[index];
    if (!result) return { key: url, name: host, sees: "", detail: "checking…", tone: "wait" };
    if (result.status === "rejected") {
      return { key: url, name: host, sees: "", detail: "not answering", tone: "bad" };
    }
    const { ms, tip } = result.value;
    return {
      key: url,
      name: host,
      sees: `block ${tip.toLocaleString("en-US")}`,
      detail: `${ms} ms${ms > SLOW_MS ? " · slow" : ""}`,
      tone: ms > SLOW_MS ? "warn" : "good",
    };
  });
}

function serverChecks(report: StatusReport, now: number, formatSats: (sats: number) => string) {
  const beat = (name: string) => report.components.find((component) => component.component === name);
  const ageOf = (name: string) => {
    const found = beat(name);
    return found ? now - new Date(found.at).getTime() / SECOND_MS : null;
  };
  const prices: Check[] = [
    ...FEEDS.map((feed): Check => {
      const signed = report.feeds.find((row) => row.feed === feed);
      const age = signed ? now - signed.timestamp : null;
      return {
        key: feed,
        name: feed,
        sees: "",
        detail: age === null ? "never" : ago(age),
        tone: toneOfAge(age, LIMITS.feed),
      };
    }),
    ...ASSETS.map((asset): Check => {
      const tick = report.ticks.find((row) => row.asset === asset);
      const age = tick ? now - tick.at : null;
      return {
        key: `tick-${asset}`,
        name: `${asset} live`,
        sees: "",
        detail: age === null ? "never" : ago(age),
        tone: toneOfAge(age, LIMITS.tick),
      };
    }),
  ];
  const network = report.network;
  const indexerAge = ageOf(`indexer:${network}`);
  const keeperAge = ageOf(`keeper:${network}`);
  const agentsAge = ageOf(`agents:${network}`);
  const balance = beat(`keeper:${network}`)?.detail.balance;
  const tip = beat(`indexer:${network}`)?.detail.tip;
  const agents = beat(`agents:${network}`)?.detail;
  const rounds: Check[] = [
    {
      key: "indexer",
      name: "Indexer",
      sees: typeof tip === "number" ? `block ${tip.toLocaleString("en-US")}` : "",
      detail: indexerAge === null ? "never" : ago(indexerAge),
      tone: toneOfAge(indexerAge, LIMITS.indexer),
    },
    {
      key: "keeper",
      name: "Keeper",
      sees: "",
      detail: keeperAge === null ? "never" : ago(keeperAge),
      tone: toneOfAge(keeperAge, LIMITS.keeper),
    },
    {
      key: "keeper-wallet",
      name: "Keeper wallet",
      sees: "",
      detail: typeof balance === "number" && balance >= 0 ? formatSats(balance) : "unknown",
      tone:
        typeof balance !== "number" || balance < 0
          ? "wait"
          : balance >= KEEPER_SATS.good
            ? "good"
            : balance >= KEEPER_SATS.warn
              ? "warn"
              : "bad",
    },
    {
      key: "lanes",
      name: "Lanes open",
      href: "/rounds",
      sees: "",
      detail: `${report.lanes.open} of ${report.lanes.running}`,
      tone: report.lanes.running === 0 ? "bad" : report.lanes.open === report.lanes.running ? "good" : "warn",
    },
  ];
  const ai: Check[] = [
    {
      key: "model",
      name: "Sensei",
      sees: report.ai ? report.ai.id : "",
      detail: report.ai ? "ready" : "off",
      tone: report.ai ? "good" : "bad",
    },
    {
      key: "agents",
      name: "Agents",
      href: "/agents",
      sees:
        agents && typeof agents.calls === "number" ? `${agents.calls}/${String(agents.budget)} calls this hour` : "",
      detail: agentsAge === null ? "never" : ago(agentsAge),
      tone: toneOfAge(agentsAge, LIMITS.agents),
    },
  ];
  return { prices, rounds, ai };
}

function Row({ check }: { check: Check }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span aria-hidden className={cx("size-2.5 shrink-0 rounded-full", DOT[check.tone])} />
      <span className="flex min-w-0 flex-1 flex-col">
        {check.href ? (
          <Link href={check.href as never} className="font-semibold text-[14px] hover:underline">
            {check.name}
          </Link>
        ) : (
          <span className="font-semibold text-[14px]">{check.name}</span>
        )}
        {check.sees ? <span className="nx-num truncate text-[12px] text-[var(--muted)]">{check.sees}</span> : null}
      </span>
      <span
        className={cx(
          "nx-num shrink-0 text-right text-[13px]",
          check.tone === "bad" ? "text-[var(--down-text)]" : "text-[var(--ink-2)]",
        )}
      >
        {check.detail}
      </span>
    </li>
  );
}

function Group({ title, checks }: { title: string; checks: Check[] }) {
  return (
    <section className="rounded-[24px] bg-[var(--surface-1)] px-5 py-3">
      <h2 className="nx-eyebrow flex items-center gap-2 pt-1">
        <span aria-hidden className={cx("size-2 rounded-full", DOT[worst(checks.map((check) => check.tone))])} />
        {title}
      </h2>
      <ul className="divide-y divide-[var(--hairline)]">
        {checks.map((check) => (
          <Row key={check.key} check={check} />
        ))}
      </ul>
    </section>
  );
}

/**
 * /status (F18): what this browser sees right now. The verdict on top (CWF's board), then every check grouped and
 * the worst group first: signed and live prices, the chain servers this page talks to, the engine that runs the
 * rounds, the AI, and this browser's own live stream. It re-checks every 30 s while the page is open.
 */
export function StatusView() {
  const network = useWorld();
  const now = useNow();
  const money = useMoney();
  const streamLive = useStreamLive();
  const report = useQuery(statusQuery(network));
  const chain = useFulcrumChecks(network);

  if (report.isPending) return <Skeleton className="h-[520px] rounded-[32px]" label="Checking" />;
  if (!report.data) {
    return (
      <section className="rounded-[32px] bg-[var(--stage)] p-6">
        <h1 className="nx-display text-[32px] text-[var(--down-text)]">The server is not answering</h1>
      </section>
    );
  }
  const { prices, rounds, ai } = serverChecks(report.data, now > 0 ? now : report.data.now, money.format);
  const browser: Check[] = [
    {
      key: "stream",
      name: "Live stream",
      sees: "",
      detail: streamLive ? "connected" : "connecting",
      tone: streamLive ? "good" : "warn",
    },
  ];
  const groups = [
    { title: "Prices", checks: prices },
    { title: "Rounds", checks: rounds },
    { title: "Chain servers", checks: chain },
    { title: "AI", checks: ai },
    { title: "This browser", checks: browser },
  ];
  const all = groups.flatMap((group) => group.checks);
  const count = (tone: Tone) => all.filter((check) => check.tone === tone).length;
  const overall = worst(all.map((check) => check.tone));
  const order: Tone[] = ["bad", "warn", "wait", "good"];
  groups.sort(
    (a, b) =>
      order.indexOf(worst(a.checks.map((check) => check.tone))) -
      order.indexOf(worst(b.checks.map((check) => check.tone))),
  );
  const checkedAt = report.dataUpdatedAt;
  const nextIn = Math.max(0, checkedAt + STATUS_EVERY_MS - now * SECOND_MS);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-wrap items-center gap-5 rounded-[32px] bg-[var(--stage)] p-5 shadow-[inset_0_0_0_1px_var(--hairline)] md:p-7">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="nx-eyebrow">Status · {network}</span>
          <h1 className="nx-display text-[clamp(30px,5vw,48px)] leading-none">
            {overall === "good"
              ? "All live"
              : [
                  count("good") ? `${count("good")} live` : "",
                  count("warn") ? `${count("warn")} behind` : "",
                  count("bad") ? `${count("bad")} down` : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
          </h1>
          <div className="flex flex-wrap gap-1.5" aria-hidden>
            {all.map((check) => (
              <span
                key={check.key}
                title={`${check.name}: ${WORD[check.tone]}`}
                className={cx("h-2 w-4 rounded-full", DOT[check.tone])}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            cue("tap");
            void report.refetch();
          }}
          className="flex items-center gap-3"
          aria-label="Check again"
        >
          <Ring leftMs={nextIn} spanMs={STATUS_EVERY_MS} size={VERDICT_RING} label="Next check">
            <RotateCw aria-hidden className="size-4" />
          </Ring>
          <span className="nx-num text-left text-[12px] text-[var(--muted)]">
            Checked {UTC_TIME.format(checkedAt)} UTC
            <br />
            every 30 s
          </span>
        </button>
      </section>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <Group key={group.title} title={group.title} checks={group.checks} />
        ))}
      </div>
    </div>
  );
}
