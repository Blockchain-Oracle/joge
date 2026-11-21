import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { cx } from "@/kit/cx";
import { AssetCube } from "@/marks/asset";
import { txLink } from "../round/api.ts";
import { DOCS_URL } from "../shell/places.ts";
import { CHAPTERS, clock, FILM, type FilmRound, ROUNDS, type Step } from "./constants.ts";

const NAME = { BTC: "Bitcoin", ETH: "Ether" } as const;
const TX_HEAD = 8;
const CUBE = 40;

/** A moment in the film, as a link: the page plays from there (shareable, e.g. /demo?t=94). */
const at = (seconds: number) => `/demo?t=${seconds}#film` as Route;

function StepLabel({ step }: { step: Step }) {
  if (step === "enter ▲")
    return (
      <>
        enter <span className="text-[var(--up-text)]">▲</span>
      </>
    );
  if (step === "enter ▼")
    return (
      <>
        enter <span className="text-[var(--down-text)]">▼</span>
      </>
    );
  return <>{step}</>;
}

function RoundCard({ round }: { round: FilmRound }) {
  const pill = "nx-glass inline-flex h-10 items-center gap-1.5 rounded-full px-4 font-semibold text-[14px]";
  return (
    <article className="flex flex-col gap-4 rounded-[28px] bg-[var(--surface-1)] p-5 shadow-[inset_0_0_0_1px_var(--hairline)]">
      <div className="flex items-center gap-3">
        <AssetCube asset={round.asset} size={CUBE} />
        <div className="min-w-0 flex-1">
          <p className="nx-display text-[17px]">
            {NAME[round.asset]} 5 min <span className="text-[var(--muted)]">#{round.roundId}</span>
          </p>
          <p className="nx-num text-[12px] text-[var(--muted)]">{round.when}</p>
        </div>
        <Link
          href={at(round.at)}
          replace
          aria-label={`Play the film from ${clock(round.at)}`}
          className="nx-num inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-[var(--surface-2)] px-3 text-[12px] text-[var(--vermilion)] hover:bg-[var(--surface-3)]"
        >
          <Play size={11} aria-hidden className="fill-current" /> {clock(round.at)}
        </Link>
      </div>
      <div>
        <p className="nx-eyebrow">{round.shown}</p>
        <p className="nx-display mt-1 text-[21px] leading-tight">{round.result}</p>
      </div>
      <ol className="grid grid-cols-3 gap-1.5" aria-label={`Round ${round.roundId}'s transactions`}>
        {round.txs.map((tx) => (
          <li key={tx.txid}>
            <a
              href={txLink("mainnet", tx.txid)}
              target="_blank"
              rel="noreferrer"
              title={tx.txid}
              className="group flex flex-col gap-0.5 rounded-[14px] bg-[var(--surface-2)] px-2.5 py-2 transition-colors hover:bg-[var(--hairline)]"
            >
              <span className="flex items-center justify-between font-semibold text-[13px]">
                <span>
                  <StepLabel step={tx.step} />
                </span>
                <ArrowUpRight size={12} aria-hidden className="text-[var(--muted)] group-hover:text-[var(--ink)]" />
              </span>
              <span className="nx-num text-[11px] text-[var(--muted)]">{tx.txid.slice(0, TX_HEAD)}…</span>
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-auto flex flex-wrap gap-2">
        <Link href={`/r/${round.roundId}?w=mainnet&play=1` as Route} className={pill}>
          <Play size={13} aria-hidden className="fill-current" /> Replay
        </Link>
        <Link href={`/proof/${round.roundId}?w=mainnet` as Route} className={pill}>
          Proof
        </Link>
      </div>
    </article>
  );
}

/**
 * /demo: the film, played here from YouTube (the no-cookie player, so nothing is set until Play), its chapters as links
 * (/demo?t=94 starts there, so a moment can be shared), then the three mainnet rounds it shows, every step one tap
 * from the explorer. `start` comes from the address, read on the server, so the right player is in the first HTML.
 */
export function DemoView({ start }: { start: number | null }) {
  const playing = start === null ? undefined : CHAPTERS.findLast((chapter) => chapter.at <= start);
  const src = `https://www.youtube-nocookie.com/embed/${FILM.videoId}?rel=0${
    start === null ? "" : `&start=${start}&autoplay=1`
  }`;

  return (
    <div className="flex flex-col gap-10 pt-2 pb-16">
      <header className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-12">
        <div className="flex flex-col gap-3">
          <span className="nx-eyebrow">Demo · {clock(FILM.seconds)}</span>
          <h1 className="nx-display text-[clamp(38px,6vw,72px)] leading-[0.98] tracking-[-0.04em]">{FILM.title}.</h1>
        </div>
        <div className="flex flex-col gap-4 lg:pb-2">
          <p className="max-w-[40ch] text-[17px] text-[var(--ink-2)] leading-relaxed">
            Recorded with real wallets on mainnet. Every round in it is on chain, one tap away below.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/rounds"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--vermilion)] pr-2 pl-5 font-semibold text-[16px] text-white"
            >
              Play now
              <span className="grid size-8 place-items-center rounded-full bg-white/15">
                <ArrowRight aria-hidden className="size-4" />
              </span>
            </Link>
            <a
              href={DOCS_URL}
              className="nx-glass inline-flex h-12 items-center rounded-full px-5 font-semibold text-[15px]"
            >
              Docs
            </a>
            <Link
              href="/slides"
              className="nx-glass inline-flex h-12 items-center rounded-full px-5 font-semibold text-[15px]"
            >
              Slides
            </Link>
          </div>
        </div>
      </header>

      <section
        id="film"
        aria-label="The demo film"
        className="grid scroll-mt-24 gap-4 rounded-[32px] bg-[var(--stage)] p-3 shadow-[inset_0_0_0_1px_var(--hairline)] md:p-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6"
      >
        <figure className="flex min-w-0 flex-col gap-3">
          {/* YouTube refuses an embed that arrives without a referrer (error 153); the page sends its origin. */}
          <iframe
            key={start ?? "top"}
            className="aspect-video w-full rounded-[22px] bg-black"
            src={src}
            title={`Jōge: ${FILM.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 text-[14px] text-[var(--ink-2)]">
            <span>Abu's hello, then the four questions BCH BLAZE judges ask.</span>
            <a
              href={`https://youtu.be/${FILM.videoId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[var(--ink)] hover:underline"
            >
              Watch on YouTube <ArrowUpRight size={15} aria-hidden />
            </a>
          </figcaption>
        </figure>

        <nav aria-label="Chapters" className="flex min-w-0 flex-col">
          <span className="nx-eyebrow px-2 pb-2">Chapters</span>
          <ol className="flex flex-col">
            {CHAPTERS.map((chapter) => {
              const on = chapter === playing;
              return (
                <li key={chapter.at}>
                  <Link
                    href={at(chapter.at)}
                    scroll={false}
                    replace
                    aria-current={on ? "true" : undefined}
                    className={cx(
                      "flex items-baseline gap-3 rounded-[14px] px-2 py-[7px] text-[15px] leading-snug transition-colors",
                      on
                        ? "bg-[var(--surface-2)] text-[var(--ink)]"
                        : "text-[var(--ink-2)] hover:bg-[var(--surface-1)] hover:text-[var(--ink)]",
                    )}
                  >
                    <span className="nx-num inline-flex w-11 shrink-0 items-center gap-1 text-[12px] text-[var(--vermilion)]">
                      {on ? <Play size={10} aria-hidden className="fill-current" /> : null}
                      {clock(chapter.at)}
                    </span>
                    <span>{chapter.label}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </section>

      <section aria-labelledby="on-chain" className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="nx-eyebrow">On chain</span>
          <h2 id="on-chain" className="nx-display text-[clamp(28px,4vw,44px)] leading-[1.04]">
            Don't trust the video. Open the rounds.
          </h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {ROUNDS.map((round) => (
            <RoundCard key={round.roundId} round={round} />
          ))}
        </div>
      </section>
    </div>
  );
}
