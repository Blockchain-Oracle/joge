"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo, Mark } from "@/brand/mark";
import { Ring } from "@/kit";
import { AssetMark } from "@/marks/asset";
import { useNow } from "../rounds/use-now.ts";
import { BlazeBanner } from "../shell/banner.tsx";
import { LiveSync } from "../shell/live-sync.tsx";
import { PLACES } from "../shell/places.ts";
import { useScrolled } from "../shell/use-scrolled.ts";
import { useLane } from "../terminal/use-lane.ts";
import { MAINNET_LIVE } from "../theme/theme.ts";
import { BUILT_ON, FINAL, HERO, WALLETS } from "./copy.ts";
import { HeroRound } from "./hero-round.tsx";
import { Sections } from "./sections.tsx";

const SECOND_MS = 1_000;
const FINAL_RING = 120;
const LOGO_H = 28;

function PlayButton({ label }: { label: string }) {
  return (
    <Link
      href="/rounds"
      className="inline-flex h-14 items-center gap-2.5 rounded-full bg-[var(--vermilion)] pr-2 pl-6 font-semibold text-[17px] text-white shadow-[0_10px_30px_-12px_var(--vermilion)] transition-transform active:scale-[0.98]"
    >
      {label}
      <span className="grid size-10 place-items-center rounded-full bg-white/15">
        <ArrowRight aria-hidden className="size-5" />
      </span>
    </Link>
  );
}

function Nav() {
  // Pinned like the app's header: once the page moves it takes the same lighter, frosted ground.
  const scrolled = useScrolled();
  return (
    <nav data-scrolled={scrolled ? "" : undefined} className="jg-header flex items-center justify-between gap-4 py-5">
      <Link href="/" aria-label="Jōge home" className="flex items-center">
        <Logo size={44} className="jg-mark-in" />
      </Link>
      <span className="hidden items-center gap-1 md:flex">
        {PLACES.map((place) => (
          <Link
            key={place.href}
            href={place.href}
            className="rounded-full px-4 py-2 font-semibold text-[14px] text-[var(--ink-2)] hover:bg-[var(--surface-1)] hover:text-[var(--ink)]"
          >
            {place.label}
          </Link>
        ))}
      </span>
      <Link
        href="/rounds"
        className="rounded-full bg-[var(--ink)] px-5 py-2.5 font-semibold text-[14px] text-[var(--ink-inverse)]"
      >
        Play
      </Link>
    </nav>
  );
}

function Hero() {
  return (
    <header className="relative grid items-center gap-10 pt-6 pb-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14 lg:pt-12">
      <span
        aria-hidden
        className="lp-kanji nx-kanji-band pointer-events-none absolute top-6 -right-28 hidden min-[1560px]:block"
      >
        上下
      </span>
      <div className="lp-rise flex flex-col items-start gap-6">
        <span className="flex items-center gap-2.5 rounded-full bg-[var(--surface-1)] py-1.5 pr-4 pl-2 shadow-[inset_0_0_0_1px_var(--hairline)]">
          <AssetMark asset="BCH" size={22} />
          <span className="lp-live" aria-hidden />
          <span className="font-semibold text-[13px]">{HERO.live[MAINNET_LIVE ? "mainnet" : "chipnet"]}</span>
        </span>
        <h1 className="nx-display text-[clamp(48px,7.4vw,96px)] leading-[0.98] tracking-[-0.045em]">
          <span className="lp-title block">{HERO.title}</span>
          <span className="lp-title-accent block">{HERO.accent}</span>
        </h1>
        <p className="max-w-[30rem] text-[18px] text-[var(--ink-2)] leading-relaxed">{HERO.line}</p>
        <div className="flex flex-wrap items-center gap-3">
          <PlayButton label={HERO.play} />
          <a href="#how" className="nx-glass inline-flex h-14 items-center rounded-full px-6 font-semibold text-[16px]">
            {HERO.how}
          </a>
        </div>
      </div>
      <div className="lp-rise relative [animation-delay:120ms]">
        <HeroRound />
      </div>
    </header>
  );
}

/** The last call (Kakure's FinalCall): the real time left on the next round, and the button. */
function FinalCall() {
  const now = useNow();
  const { lane, next } = useLane();
  const left = next && now > 0 ? next.lockTime - now : null;
  return (
    <section className="relative isolate flex flex-col items-center gap-6 overflow-hidden border-[var(--hairline)] border-t py-20 text-center">
      <span
        aria-hidden
        className="nx-kanji-band pointer-events-none absolute inset-0 -z-10 grid place-items-center font-bold font-stamp text-[clamp(10rem,30vw,24rem)] leading-none opacity-[0.07]"
      >
        上下
      </span>
      <h2 className="nx-display relative text-[clamp(30px,4vw,48px)]">{FINAL.title}</h2>
      {lane && left !== null && left > 0 ? (
        <Ring
          leftMs={left * SECOND_MS}
          spanMs={lane.seconds * SECOND_MS}
          size={FINAL_RING}
          label="Entries close"
          className="text-[28px]"
        />
      ) : null}
      <PlayButton label={FINAL.play} />
    </section>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col gap-8 border-[var(--hairline)] border-t py-12">
      <div className="flex flex-col gap-4">
        <span className="nx-eyebrow">Built on Bitcoin Cash</span>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {BUILT_ON.map((brand) => (
            <span key={brand.name} className="flex items-center gap-2.5">
              <img
                src={brand.logo}
                alt=""
                height={LOGO_H}
                className={brand.wide ? "h-7 w-auto rounded-md" : "size-7 rounded-md object-contain"}
              />
              {brand.wide ? (
                <span className="sr-only">{brand.name}</span>
              ) : (
                <span className="font-semibold text-[14px]">{brand.name}</span>
              )}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="nx-eyebrow">Works with</span>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {WALLETS.map((wallet) => (
            <span key={wallet.name} className="flex items-center gap-2.5">
              <img src={wallet.logo} alt="" height={LOGO_H} className="size-7 rounded-md object-contain" />
              <span className="font-semibold text-[14px]">{wallet.name}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 text-[13px] text-[var(--muted)]">
        <span className="flex items-center gap-2">
          <Mark size={26} /> Jōge 上下
        </span>
        <span className="flex gap-5">
          {PLACES.map((place) => (
            <Link key={place.href} href={place.href} className="hover:text-[var(--ink)]">
              {place.label}
            </Link>
          ))}
        </span>
      </div>
    </footer>
  );
}

/**
 * The landing (F16, D21): it opens on the product working (Agari, Kakure): the live round on the right with the
 * oracle's heartbeat, five words and one sentence on the left, then five numbered sections with one sentence each and
 * live art, the real time left on the next round, and what Jōge is built on.
 */
export function Landing() {
  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <BlazeBanner />
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <Nav />
        <Hero />
        <Sections />
        <FinalCall />
        <Footer />
      </div>
      <LiveSync />
    </div>
  );
}
