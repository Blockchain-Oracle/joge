"use client";

import { PERSONA_MAX, POSTURES, type Posture } from "@joge/brain/postures";
import { HOUR_SECONDS, MAX_STAKE, MIN_STAKE } from "@joge/sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bot, Sparkles, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AmountSheet, cue, cx, Segmented, toast } from "@/kit";
import { errorText } from "@/lib/error-text";
import { useSession } from "../auth/session.ts";
import { useWorld } from "../shell/world.tsx";
import { useWallet } from "../wallet/wallet-context.tsx";
import { type AgentDraft, agentQuery, createAgent, type DryRead, dryRead } from "./api.ts";
import { DAILY_BETS, NAME_MAX, PER_BET_CHIPS_USD } from "./constants.ts";
import { chipUsd, laneOf, MODE_COPY, POSTURE_COPY, useSatsUsd } from "./format.ts";
import { codename, newFaceSeed } from "./names.ts";
import { Portrait } from "./portrait.tsx";
import { Choice, FacePicker, LaneGrid, OWN_ICON, ReadCard, STYLES, type StyleKey } from "./studio-parts.tsx";

const FACES = 6;
const STEPS = ["Pick a face", "How it plays", "Where it plays", "What it risks"] as const;
const POSTURE_KEYS = Object.keys(POSTURES) as Posture[];
const LANES_STEP = 2;
const RISK_STEP = 3;
const DAILY = DAILY_BETS[1];
const HERO_FACE = 120;
const faces = () => Array.from({ length: FACES }, newFaceSeed);
const SATS_PER_BCH = 100_000_000;

/** The first six faces are fixed, so the server render and the page agree; the die draws random ones. */
const FIRST_FACES = ["sora", "kaze", "umi", "yama", "hoshi", "tsuki"];

/** The tightest per-bet ceiling of the chosen lanes (each lane class has its own cap in the contract). */
const ceilingOf = (lanes: number[]) =>
  lanes.reduce((low, thread) => {
    const cap = MAX_STAKE[(laneOf(thread)?.seconds ?? 0) >= HOUR_SECONDS ? "hourly" : "short"];
    return cap < low ? cap : low;
  }, MAX_STAKE.hourly);

/**
 * The agent studio: four steps, one decision each — a face (which names itself), how
 * it plays, where, and what it may risk — then an optional dry read with the real model and Create (a sign-in proof
 * first). `copyFrom` starts from another agent.
 */
export function Studio({ copyFrom }: { copyFrom: number | null }) {
  const network = useWorld();
  const router = useRouter();
  const client = useQueryClient();
  const wallet = useWallet();
  const session = useSession();
  const money = useSatsUsd();
  const [step, setStep] = useState(0);
  const [seeds, setSeeds] = useState<string[]>(FIRST_FACES);
  const [face, setFace] = useState(FIRST_FACES[0] ?? "sora");
  const [name, setName] = useState("");
  const [style, setStyle] = useState<StyleKey>("momentum");
  const [own, setOwn] = useState("");
  const [posture, setPosture] = useState<Posture>("balanced");
  const [lanes, setLanes] = useState<number[]>([]);
  const [perBetUsd, setPerBetUsd] = useState<number>(PER_BET_CHIPS_USD[1]);
  const [perBetOpen, setPerBetOpen] = useState(false);
  const [mode, setMode] = useState<"ask" | "auto">("ask");
  const [read, setRead] = useState<{ result: DryRead | null; pending: boolean; error: string | null }>({
    result: null,
    pending: false,
    error: null,
  });
  const [creating, setCreating] = useState(false);

  const source = useQuery({ ...agentQuery(network, copyFrom ?? 0), enabled: copyFrom !== null });
  const copied = useRef(false);
  useEffect(() => {
    const agent = source.data?.agent;
    if (!agent || copied.current) return;
    copied.current = true;
    setName(`${agent.name} II`.slice(0, NAME_MAX));
    const match = STYLES.find((each) => each.text === agent.persona);
    setStyle(match?.key ?? "own");
    if (!match) setOwn(agent.persona);
    setPosture(agent.posture);
    setLanes(agent.lanes);
    setMode(agent.mode);
  }, [source.data]);

  const shownName = name.trim() || codename(face);
  const persona = style === "own" ? own.trim() : (STYLES.find((each) => each.key === style)?.text ?? "");
  const ceiling = ceilingOf(lanes);
  const perBet = money.toSats(perBetUsd);
  const perBetSats = perBet === null ? null : Math.max(Number(MIN_STAKE), Math.min(Number(ceiling), perBet));
  const draft: AgentDraft | null =
    persona && lanes.length > 0 && perBetSats
      ? {
          name: shownName,
          persona,
          posture,
          lanes,
          perBetCap: perBetSats,
          dailyCap: perBetSats * DAILY,
          mode,
          copiedFrom: copyFrom,
          face,
        }
      : null;
  const ready = [true, Boolean(persona), lanes.length > 0, Boolean(draft)][step] ?? false;

  const runDryRead = async () => {
    if (!draft) return;
    setRead({ result: null, pending: true, error: null });
    try {
      setRead({ result: await dryRead(network, draft), pending: false, error: null });
      cue("arrive");
    } catch (error) {
      setRead({ result: null, pending: false, error: errorText(error) });
    }
  };

  const create = async () => {
    if (!draft) return;
    if (wallet.state !== "connected") {
      wallet.openConnect();
      return;
    }
    setCreating(true);
    try {
      if (!session.pkh) await session.signIn();
      const agent = await createAgent(network, draft);
      cue("fill");
      void client.invalidateQueries({ queryKey: ["agents", network] });
      router.push(`/agents/${agent.id}`);
    } catch (error) {
      toast({ tone: "down", title: "Not created", body: error instanceof Error ? error.message : "" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 pt-2">
      <div className="flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            aria-label="Back"
            onClick={() => setStep(step - 1)}
            className="nx-glass grid size-10 place-items-center rounded-full"
          >
            <ArrowLeft size={18} aria-hidden />
          </button>
        ) : null}
        <div className="flex flex-1 gap-1.5">
          {STEPS.map((label, index) => (
            <span
              key={label}
              className={cx("h-1.5 flex-1 rounded-full", index <= step ? "bg-[var(--ink)]" : "bg-[var(--surface-2)]")}
            />
          ))}
        </div>
      </div>
      <h1 className="nx-display text-[clamp(32px,5vw,48px)]">{STEPS[step]}</h1>

      {step === 0 ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Portrait seed={face} name={shownName} size={HERO_FACE} />
            <input
              value={name}
              maxLength={NAME_MAX}
              onChange={(event) => setName(event.target.value)}
              placeholder={codename(face)}
              aria-label="Name"
              className="nx-display min-w-0 flex-1 bg-transparent text-[28px] outline-none placeholder:text-[var(--ink)]"
            />
          </div>
          <FacePicker seeds={seeds} picked={face} onPick={setFace} onShuffle={() => setSeeds(faces())} />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {STYLES.map((each) => {
              const Icon = each.icon;
              return (
                <Choice
                  key={each.key}
                  on={style === each.key}
                  onClick={() => setStyle(each.key)}
                  icon={<Icon size={19} aria-hidden />}
                  title={each.name}
                  line={each.line}
                />
              );
            })}
            <Choice
              on={style === "own"}
              onClick={() => setStyle("own")}
              icon={OWN_ICON}
              title="Your words"
              line="Write its brief"
            />
          </div>
          {style === "own" ? (
            <textarea
              value={own}
              maxLength={PERSONA_MAX}
              rows={4}
              onChange={(event) => setOwn(event.target.value)}
              placeholder="How should it read a round?"
              aria-label="Brief"
              className="rounded-[18px] bg-[var(--surface-1)] p-4 text-[15px] leading-relaxed outline-none placeholder:text-[var(--muted)]"
            />
          ) : null}
          <Segmented
            label="Posture"
            value={posture}
            onChange={setPosture}
            options={POSTURE_KEYS.map((key) => ({ value: key, label: POSTURE_COPY[key].label }))}
            className="self-start"
          />
          <p className="nx-num text-[13px] text-[var(--muted)]">{POSTURE_COPY[posture].line}</p>
        </div>
      ) : null}

      {step === LANES_STEP ? <LaneGrid lanes={lanes} onChange={setLanes} /> : null}

      {step === RISK_STEP ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-4 rounded-[24px] bg-[var(--surface-1)] p-5">
            <button
              type="button"
              onClick={() => setPerBetOpen(true)}
              aria-label="Type the most it may bet"
              className="nx-num rounded-[16px] px-2 text-[56px] font-semibold leading-none tracking-[-0.04em] underline decoration-[var(--hairline)] decoration-2 underline-offset-8 hover:decoration-[var(--ink)]"
            >
              {chipUsd(perBetUsd)}
            </button>
            <p className="nx-eyebrow">a bet · up to {perBetSats ? money.format(perBetSats * DAILY) : "—"} a day</p>
            <div className="grid w-full grid-cols-5 gap-2">
              {PER_BET_CHIPS_USD.map((dollars) => {
                const sats = money.toSats(dollars);
                return (
                  <button
                    key={dollars}
                    type="button"
                    aria-pressed={dollars === perBetUsd}
                    disabled={sats !== null && BigInt(sats) > ceiling}
                    onClick={() => setPerBetUsd(dollars)}
                    className={cx(
                      "nx-num h-12 rounded-[14px] text-[15px] font-semibold disabled:opacity-30",
                      dollars === perBetUsd ? "bg-[var(--ink)] text-[var(--ink-inverse)]" : "bg-[var(--surface-2)]",
                    )}
                  >
                    {chipUsd(dollars)}
                  </button>
                );
              })}
            </div>
            <AmountSheet
              open={perBetOpen}
              onClose={() => setPerBetOpen(false)}
              title="Most it may bet"
              initial={perBetUsd}
              presets={PER_BET_CHIPS_USD}
              min={money.bchUsd ? (Number(MIN_STAKE) / SATS_PER_BCH) * money.bchUsd : 0}
              max={money.bchUsd ? (Number(ceiling) / SATS_PER_BCH) * money.bchUsd : null}
              maxLabel="Lane max"
              confirm={(dollars) => `${chipUsd(dollars)} a bet`}
              onConfirm={(dollars) => {
                setPerBetUsd(dollars);
                setPerBetOpen(false);
              }}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["ask", "auto"] as const).map((key) => (
              <Choice
                key={key}
                on={mode === key}
                onClick={() => setMode(key)}
                icon={key === "ask" ? <User size={19} aria-hidden /> : <Bot size={19} aria-hidden />}
                title={MODE_COPY[key].label}
                line={MODE_COPY[key].line}
              />
            ))}
          </div>
          {read.result ? <ReadCard read={read.result} face={face} name={shownName} /> : null}
          {read.error ? <p className="text-[14px] text-[var(--muted)]">{read.error}</p> : null}
        </div>
      ) : null}

      <div className="flex gap-2">
        {step === STEPS.length - 1 ? (
          <>
            <button
              type="button"
              onClick={() => void runDryRead()}
              disabled={!draft || read.pending}
              className="nx-glass inline-flex h-14 items-center gap-2 rounded-full px-5 font-semibold text-[15px] disabled:opacity-40"
            >
              <Sparkles size={17} aria-hidden /> {read.pending ? "Reading…" : "Try a read"}
            </button>
            <button
              type="button"
              onClick={() => void create()}
              disabled={!draft || creating}
              className="nx-display h-14 flex-1 rounded-full bg-[var(--ink)] text-[17px] text-[var(--ink-inverse)] disabled:opacity-40"
            >
              {creating ? "Signing…" : wallet.state !== "connected" ? "Pair a wallet" : `Create ${shownName}`}
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              cue("tap");
              setStep(step + 1);
            }}
            className="nx-display h-14 flex-1 rounded-full bg-[var(--ink)] text-[17px] text-[var(--ink-inverse)] disabled:opacity-40"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
