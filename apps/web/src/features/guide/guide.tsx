"use client";

import { Check, ChevronLeft, Copy, ExternalLink, LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { Mark } from "@/brand/mark";
import { confetti, cue, cx, DottedQr, Sheet, usePhone } from "@/kit";
import { copyText } from "@/lib/browser";
import { EXPLORER } from "../round/api.ts";
import { useMoney } from "../rounds/money.ts";
import { useWorld } from "../shell/world.tsx";
import { useWalletCoins } from "../wallet/coins.ts";
import { useWallet } from "../wallet/wallet-context.tsx";
import { FUNDED_SATS, useFaucet } from "./faucet.ts";
import { closeGuide, GUIDE_STEPS, type GuideStep, setGuideStep, useGuide } from "./store.ts";

/** Enough to make a first call (a $0.10 stake and its fees) on either world. */
const QR_SIZE = 196;
const ADVANCE_MS = 900;
const COPIED_MS = 1_500;
const WHEN = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

/** Wallets that pair over WizardConnect and run chipnet (Cashonize needs no install). */
const GET_WALLETS = [
  { name: "Cashonize", logo: "/wallets/cashonize.png", href: "https://cashonize.com" },
  { name: "Paytaca", logo: "/wallets/paytaca.png", href: "https://www.paytaca.com" },
  { name: "Selene", logo: "/wallets/selene.svg", href: "https://selene.cash" },
] as const;
const OUTSIDE_FAUCETS = [
  { name: "chipnet.bch.ninja", href: "https://chipnet.bch.ninja/" },
  { name: "tbch.googol.cash", href: "https://tbch.googol.cash/" },
] as const;

/** Each step's words (≤ 25 with the world note, Senryo's budget). */
const COPY: Record<GuideStep, { title: string; line: { chipnet: string; mainnet: string } }> = {
  intro: {
    title: "Up or down, in minutes.",
    line: {
      chipnet: "Call where the price closes. The right side splits the pot.",
      mainnet: "Call where the price closes. The right side splits the pot.",
    },
  },
  wallet: {
    title: "Get a wallet.",
    line: { chipnet: "Cashonize runs in your browser. Set it to chipnet.", mainnet: "Any of these pairs with Jōge." },
  },
  pair: { title: "Pair it.", line: { chipnet: "Scan with your wallet.", mainnet: "Scan with your wallet." } },
  fund: {
    title: "Get test BCH.",
    line: { chipnet: "Free, for chipnet. Enough for twenty calls.", mainnet: "Send a dollar or two to your wallet." },
  },
  play: {
    title: "Call it.",
    line: {
      chipnet: "Tap Up or Down. Winners are paid straight to their wallet.",
      mainnet: "Tap Up or Down. Winners are paid straight to their wallet.",
    },
  },
};

/**
 * The first-run guide (S09R): Senryo's five short steps with a picture each and the world named on every one, and
 * Tempo's self-advancing funding: pairing moves it on, and so do the coins landing. Opens once per device; reopens
 * from More, ⌘K and any "Fund your wallet" blocker.
 */
export function Guide() {
  const { open, step } = useGuide();
  const world = useWorld();
  const wallet = useWallet();
  const coins = useWalletCoins();
  const router = useRouter();
  const path = usePathname();
  const index = GUIDE_STEPS.indexOf(step);
  const paired = wallet.state === "connected";
  const funded = paired && coins.data !== undefined && coins.balance >= FUNDED_SATS;
  const copy = COPY[step];
  const title = step === "fund" && world === "mainnet" ? "Add a little BCH." : copy.title;

  // Pairing and the coins landing move the guide on by themselves.
  useEffect(() => {
    if (!open) return;
    if (step === "pair" && !paired) wallet.pair();
    const next = step === "pair" && paired ? "fund" : step === "fund" && funded ? "play" : null;
    if (!next) return;
    const timer = setTimeout(() => {
      cue(next === "play" ? "arrive" : "tap");
      if (next === "play") confetti();
      setGuideStep(next);
    }, ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [open, step, paired, funded, wallet]);

  const go = (offset: number) => {
    const target = GUIDE_STEPS[index + offset];
    if (target) {
      cue("tap");
      setGuideStep(target);
    }
  };
  const finish = () => {
    closeGuide();
    if (!path.startsWith("/rounds")) router.push("/rounds");
  };

  return (
    <Sheet open={open} onClose={closeGuide}>
      <div className="flex flex-col gap-5 pt-3">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Back"
            className="grid size-9 place-items-center rounded-full bg-[var(--surface-2)] disabled:opacity-0"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <ol className="flex flex-1 gap-1.5" aria-label={`Step ${index + 1} of ${GUIDE_STEPS.length}`}>
            {GUIDE_STEPS.map((each, at) => (
              <li
                key={each}
                className={cx(
                  "h-1 flex-1 rounded-full transition-colors",
                  at <= index ? "bg-[var(--vermilion)]" : "bg-[var(--surface-2)]",
                )}
              />
            ))}
          </ol>
          <button type="button" onClick={closeGuide} className="nx-eyebrow px-2 py-1 hover:text-[var(--ink)]">
            Skip
          </button>
        </header>

        <div className="grid min-h-[220px] place-items-center rounded-[24px] bg-[var(--stage)] p-4">
          <Picture step={step} paired={paired} funded={funded} />
        </div>

        <div className="flex flex-col gap-2">
          <WorldNote />
          <h2 className="nx-display text-[28px] leading-tight">{title}</h2>
          <p className="text-[15px] text-[var(--ink-2)]">{copy.line[world]}</p>
        </div>

        <Action step={step} paired={paired} funded={funded} onNext={() => go(1)} onFinish={finish} />
      </div>
    </Sheet>
  );
}

/** The world on every step (Senryo's network note): test coins or real money. */
function WorldNote() {
  const world = useWorld();
  return world === "chipnet" ? (
    <span className="nx-sticker self-start bg-[var(--gold)] text-[#1a1406]">
      <span className="nx-jp">試</span> Chipnet · test coins
    </span>
  ) : (
    <span className="nx-sticker self-start bg-[var(--vermilion)] text-white">
      <span className="nx-jp">本</span> Mainnet · real BCH
    </span>
  );
}

function Picture({ step, paired, funded }: { step: GuideStep; paired: boolean; funded: boolean }) {
  const wallet = useWallet();
  const coins = useWalletCoins();
  const money = useMoney();
  const world = useWorld();
  if (step === "intro") return <Mark size={140} className="jg-guide-mark" />;
  if (step === "wallet")
    return (
      <ul className="flex gap-3">
        {GET_WALLETS.map((each) => (
          <li key={each.name}>
            <a
              href={each.href}
              target="_blank"
              rel="noreferrer"
              className="flex w-[92px] flex-col items-center gap-2 rounded-[20px] bg-[var(--surface-1)] p-3 hover:bg-[var(--surface-2)]"
            >
              <img src={each.logo} alt="" className="size-12 rounded-[14px] object-contain" />
              <span className="font-semibold text-[12px]">{each.name}</span>
            </a>
          </li>
        ))}
      </ul>
    );
  if (step === "pair") {
    if (paired) return <Done label={`Paired with ${wallet.walletName ?? "your wallet"}`} />;
    return wallet.qrUri ? (
      <DottedQr value={wallet.qrUri} size={QR_SIZE} label="WizardConnect pairing code" />
    ) : (
      <LoaderCircle
        aria-label="Opening a secure relay"
        className="size-8 text-[var(--muted)] motion-safe:animate-spin"
      />
    );
  }
  if (step === "fund") {
    if (funded) return <Done label={money.format(coins.balance)} />;
    if (world === "mainnet" && wallet.payout)
      return <DottedQr value={wallet.payout.address} size={QR_SIZE} label="Your wallet's address" />;
    return <Mark size={120} className="jg-guide-mark opacity-60" />;
  }
  return (
    <div className="grid w-full max-w-[320px] grid-cols-2 gap-2.5">
      <span data-side="up" className="nx-plate h-[76px] w-full">
        <span className="nx-jp text-[26px]">上</span> Up
      </span>
      <span data-side="down" className="nx-plate h-[76px] w-full">
        <span className="nx-jp text-[26px]">下</span> Down
      </span>
    </div>
  );
}

function Done({ label }: { label: string }) {
  return (
    <span className="flex flex-col items-center gap-3">
      <span className="grid size-16 place-items-center rounded-full bg-[var(--up)] text-[var(--up-ink)]">
        <Check size={30} strokeWidth={3} aria-hidden />
      </span>
      <span className="nx-num font-semibold text-[18px]">{label}</span>
    </span>
  );
}

function Primary({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--vermilion)] font-semibold text-[16px] text-white disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function Action({
  step,
  paired,
  funded,
  onNext,
  onFinish,
}: {
  step: GuideStep;
  paired: boolean;
  funded: boolean;
  onNext: () => void;
  onFinish: () => void;
}) {
  const wallet = useWallet();
  const world = useWorld();
  const phone = usePhone();
  const faucet = useFaucet();
  const money = useMoney();
  const [copied, setCopied] = useState(false);
  const copyOut = async (text: string) => {
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    }
  };

  if (step === "play") return <Primary onClick={onFinish}>Play</Primary>;
  if (step === "pair" && !paired)
    return (
      <div className="flex flex-col gap-2">
        {phone && wallet.uri ? (
          <a
            href={wallet.uri}
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--vermilion)] font-semibold text-[16px] text-white"
          >
            Open wallet <ExternalLink size={18} aria-hidden />
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => wallet.uri && copyOut(wallet.uri)}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--surface-2)] font-semibold text-[14px]"
        >
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    );
  if (step === "fund" && !funded) {
    if (!paired) return <Primary onClick={() => setGuideStep("pair")}>Pair first</Primary>;
    if (world === "mainnet")
      return (
        <button
          type="button"
          onClick={() => wallet.payout && copyOut(wallet.payout.address)}
          className="flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--surface-2)] font-semibold text-[15px]"
        >
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}{" "}
          {copied ? "Copied" : "Copy your address"}
        </button>
      );
    const view = faucet.view;
    if (faucet.asking || view?.state === "pending")
      return (
        <Primary disabled>
          <LoaderCircle size={18} aria-hidden className="motion-safe:animate-spin" /> Sending…
        </Primary>
      );
    if (view?.state === "sent" && view.txid)
      return (
        <a
          href={`${EXPLORER.chipnet}${view.txid}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--surface-2)] font-semibold text-[15px]"
        >
          <LoaderCircle size={16} aria-hidden className="motion-safe:animate-spin" /> +{money.format(view.sats ?? 0)} on
          its way <ExternalLink size={15} aria-hidden />
        </a>
      );
    if (view?.state === "dry")
      return (
        <div className="flex flex-col gap-2">
          <p className="text-center text-[14px] text-[var(--ink-2)]">Our faucet is resting. Try one of these.</p>
          <div className="grid grid-cols-2 gap-2">
            {OUTSIDE_FAUCETS.map((each) => (
              <a
                key={each.href}
                href={each.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-[var(--surface-2)] font-semibold text-[13px]"
              >
                {each.name} <ExternalLink size={14} aria-hidden />
              </a>
            ))}
          </div>
        </div>
      );
    if (view?.nextAt) return <Primary disabled>Again at {WHEN.format(view.nextAt)}</Primary>;
    return (
      <div className="flex flex-col gap-2">
        {view?.error ? <p className="text-center text-[14px] text-[var(--down-text)]">{view.error}</p> : null}
        <Primary onClick={faucet.claim}>Get test BCH</Primary>
      </div>
    );
  }
  return <Primary onClick={onNext}>{step === "wallet" ? "I have one" : "Next"}</Primary>;
}
