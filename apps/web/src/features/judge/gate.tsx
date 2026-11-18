"use client";

import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mark } from "@/brand/mark";
import { cue, cx } from "@/kit";
import { useMoney } from "../rounds/money.ts";
import { useWorld } from "../shell/world.tsx";
import { DEFAULT_THREAD } from "../terminal/constants.ts";
import { pickLane } from "../terminal/use-lane.ts";
import { useWalletCoins } from "../wallet/coins.ts";
import { useWallet } from "../wallet/wallet-context.tsx";
import { keepDesk, leaveDesk, secretOf, useDeskSecret } from "./desk.ts";

const KICKER = { chipnet: "BCH BLAZE judges · chipnet test coins", mainnet: "BCH BLAZE judges · real money" } as const;

function Step({ label, state }: { label: string; state: "done" | "active" | "waiting" }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cx(
          "grid size-7 shrink-0 place-items-center rounded-full",
          state === "done" ? "bg-[var(--up)] text-[var(--up-ink)]" : "bg-[var(--surface-2)] text-[var(--muted)]",
        )}
      >
        {state === "done" ? (
          <Check aria-hidden className="size-4" strokeWidth={3} />
        ) : state === "active" ? (
          <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" />
        ) : null}
      </span>
      <span className={cx("text-[15px]", state === "waiting" ? "text-[var(--muted)]" : "font-semibold")}>{label}</span>
    </li>
  );
}

/**
 * /judge (F14): the judge link opens a funded wallet in this browser (Mitoshi's gate). The secret in the link's
 * fragment is kept here and wiped from the address bar at once; three steps show it opening; then one button plays.
 * Without a link it asks for one, or lets the judge pair their own wallet or look around.
 */
export function JudgeGate() {
  const router = useRouter();
  const network = useWorld();
  const wallet = useWallet();
  const money = useMoney();
  const secret = useDeskSecret();
  const coins = useWalletCoins();
  const [pasted, setPasted] = useState("");
  const [bad, setBad] = useState(false);
  const [returning, setReturning] = useState(false);
  const arrivedByLink = useRef(false);

  useEffect(() => {
    const fromLink = secretOf(window.location.hash);
    if (fromLink) {
      arrivedByLink.current = true;
      keepDesk(fromLink);
      window.history.replaceState(null, "", window.location.pathname);
    } else if (secret && !arrivedByLink.current) {
      setReturning(true);
    }
  }, [secret]);

  const open = wallet.desk;
  const funded = open && coins.data !== undefined;
  const play = () => {
    cue("go");
    pickLane(DEFAULT_THREAD);
    router.push("/rounds");
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 py-6">
      <section className="flex flex-col gap-6 rounded-[32px] bg-[var(--stage)] p-6 shadow-[inset_0_0_0_1px_var(--hairline)] md:p-8">
        <div className="flex items-center gap-3">
          <Mark size={44} />
          <span className="nx-eyebrow">{KICKER[network]}</span>
        </div>
        <h1 className="nx-display text-[clamp(32px,6vw,48px)] leading-[1.02]">
          {funded ? "Ready to play." : open ? "Opening the judge wallet" : "Judge wallet"}
        </h1>
        {open ? (
          <>
            <ol className="flex flex-col gap-3">
              <Step label="Unlocking the judge wallet" state="done" />
              <Step label="Reading its coins" state={funded ? "done" : "active"} />
              <Step label="Ready" state={funded ? "done" : "waiting"} />
            </ol>
            {funded ? (
              <>
                <div className="flex items-baseline justify-between rounded-[20px] bg-[var(--surface-1)] p-4">
                  <span className="nx-eyebrow">In the wallet</span>
                  <span className="nx-num text-[24px] font-semibold">{money.format(coins.balance)}</span>
                </div>
                <p className="text-[15px] text-[var(--ink-2)] leading-relaxed">
                  Every judge shares this wallet, so you may see their rounds too.
                </p>
                <button
                  type="button"
                  onClick={play}
                  className="flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--vermilion)] font-semibold text-[17px] text-white"
                >
                  Play BTC 5 min now <ArrowRight aria-hidden className="size-5" />
                </button>
                <Link
                  href="/portfolio"
                  className="nx-glass flex h-12 items-center justify-center rounded-full font-semibold text-[15px]"
                >
                  Your wallet
                </Link>
                {returning ? (
                  <button
                    type="button"
                    onClick={() => {
                      leaveDesk();
                      router.push("/");
                    }}
                    className="nx-eyebrow self-center hover:text-[var(--ink)]"
                  >
                    Give this wallet back
                  </button>
                ) : null}
              </>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-[16px] text-[var(--ink-2)] leading-relaxed">
              The judge link in our BCH BLAZE submission opens a funded wallet here. Nothing to set up.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const found = secretOf(pasted);
                if (!found) return setBad(true);
                keepDesk(found);
                setPasted("");
              }}
            >
              <input
                value={pasted}
                onChange={(event) => {
                  setPasted(event.target.value);
                  setBad(false);
                }}
                placeholder="Or paste that link here"
                aria-label="Judge link"
                className="h-12 min-w-0 flex-1 rounded-full bg-[var(--surface-2)] px-5 text-[15px] outline-none placeholder:text-[var(--muted)]"
              />
              <button
                type="submit"
                disabled={!pasted.trim()}
                className="h-12 rounded-full bg-[var(--ink)] px-5 font-semibold text-[15px] text-[var(--ink-inverse)] disabled:opacity-40"
              >
                Open
              </button>
            </form>
            {bad ? <p className="text-[14px] text-[var(--down-text)]">That isn't a judge link</p> : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={wallet.openConnect}
                className="nx-glass h-11 rounded-full px-5 font-semibold text-[14px]"
              >
                Pair your own wallet
              </button>
              <Link
                href="/rounds"
                className="nx-glass flex h-11 items-center rounded-full px-5 font-semibold text-[14px]"
              >
                Look around
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
