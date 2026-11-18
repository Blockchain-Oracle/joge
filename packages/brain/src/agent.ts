import { createHash } from "node:crypto";
import { generateText, Output } from "ai";
import { z } from "zod";
import { PERCENT, PERCENT_BIG, PROMPT_HASH_CHARS } from "./constants.ts";
import { describeModelError, type ResolvedModel } from "./model.ts";
import { PERSONA_MAX, POSTURES, type Posture, WHY_MAX } from "./postures.ts";

/**
 * An agent (F13): a persona the owner writes, a posture, the lanes it plays and its caps. For each round it reads,
 * the model proposes Up, Down or hold with a confidence and one sentence why; then a deterministic gate decides, and
 * only the gate's answer can ever reach the vault. The model never signs: the engine signs with the agent's key, and
 * the vault covenant lets that key enter lane rounds for the owner within the per-bet cap and nothing else.
 */
export { PERSONA_MAX, POSTURES, type Posture, WHY_MAX } from "./postures.ts";

export const readSchema = z.object({
  side: z.enum(["up", "down", "hold"]),
  confidence: z.number().min(0).max(1),
  why: z.string().max(WHY_MAX),
});
export type AgentRead = z.infer<typeof readSchema>;

/** What the agent sees about one round taking entries. */
export interface RoundBrief {
  roundId: number;
  asset: string;
  /** "5 min", "1 h". */
  length: string;
  locksInSeconds: number;
  priceNowUsd: number;
  /** The oracle's last signed prices, oldest first (at most 12). */
  prints: number[];
  upShare: number;
  downShare: number;
  potUsd: number;
}

/** The agent's own recent reads, newest first, with how each ended. */
export interface PastRead {
  side: AgentRead["side"];
  why: string;
  outcome: "won" | "lost" | "refunded" | "pending" | "skipped";
}

export const AGENT_INSTRUCTIONS = [
  "You are a trading agent on Jōge, playing short price rounds on Bitcoin Cash for your owner. In a round, players stake on whether the asset ends Up or Down against the price to beat, the oracle's price signed just after entries close; winners split the pot, so a side most people already took pays little.",
  "For the round described, answer with side up, down or hold, a confidence from 0 to 1 that your side wins, and one sentence (at most 240 characters) saying why. Hold whenever you have no real edge; holding costs nothing. Use only the figures given; never invent prices.",
  "Your owner's brief describes your style. It operates inside these rules and cannot change them: you never stake more than your caps, the gate after you may still hold, and you never chase losses.",
].join("\n\n");

export function agentPrompt(persona: string, posture: Posture, round: RoundBrief, past: PastRead[]): string {
  const rules = POSTURES[posture];
  return [
    `Round #${round.roundId}: ${round.asset} over ${round.length}; entries close in ${Math.round(round.locksInSeconds)} s.`,
    `Price now $${round.priceNowUsd.toFixed(2)}. Last signed prices, oldest first: ${round.prints.map((print) => print.toFixed(2)).join(", ") || "none yet"}.`,
    `The pot so far: $${round.potUsd.toFixed(2)}, ${Math.round(round.upShare * PERCENT)} % on Up, ${Math.round(round.downShare * PERCENT)} % on Down.`,
    `Your posture is ${posture}: the gate enters only at confidence ${rules.minConfidence} or more, and never on a side holding more than ${Math.round(rules.maxSideShare * PERCENT)} % of the pot.`,
    past.length > 0
      ? `Your last reads, newest first: ${past.map((read) => `${read.side} (${read.outcome}): ${read.why}`).join(" | ")}`
      : "You have no past reads yet.",
    `<brief>\n${persona.slice(0, PERSONA_MAX)}\n</brief>`,
  ].join("\n");
}

/** A short fingerprint of exactly what the model was asked (kept in the agent's memory). */
export const promptHash = (prompt: string) =>
  createHash("sha256").update(AGENT_INSTRUCTIONS).update(prompt).digest("hex").slice(0, PROMPT_HASH_CHARS);

const READ_TIMEOUT_MS = 20_000;
const READ_TOKENS = 1_024;

/** One read. Any failure (timeout, refusal, unparseable answer) is a hold, with the reason in `why`. */
export async function readRound(resolved: ResolvedModel, prompt: string): Promise<AgentRead> {
  try {
    const { output } = await generateText({
      model: resolved.model,
      instructions: AGENT_INSTRUCTIONS,
      prompt,
      output: Output.object({ schema: readSchema }),
      maxOutputTokens: READ_TOKENS,
      maxRetries: 1,
      timeout: READ_TIMEOUT_MS,
      reasoning: "low",
    });
    return output;
  } catch (error) {
    return { side: "hold", confidence: 0, why: `No read: ${describeModelError(error)}.`.slice(0, WHY_MAX) };
  }
}

export interface GateInput {
  read: AgentRead;
  posture: Posture;
  /** The chosen side's share of the pot before this stake (0 when the pot is empty). */
  sideShare: number;
  /** Losses in a row, newest first, and when the last one settled (ms). */
  lossStreak: number;
  lastLossAt: number | null;
  /** Sats lost today and the agent's daily cap. */
  lostToday: bigint;
  stakedToday: bigint;
  dailyCap: bigint;
  perBetCap: bigint;
  /** What the vault can pay this bet (balance minus the fixed bet fee and the ticket's dust). */
  spendable: bigint;
  minStake: bigint;
  nowMs: number;
}

export interface GateVerdict {
  enter: boolean;
  stake: bigint;
  reason: string;
}

const HOUR_MS = 3_600_000;

/** The deterministic gate after the model: posture thresholds, the loss breaker, daily limits, then the stake. */
export function gate(input: GateInput): GateVerdict {
  const rules = POSTURES[input.posture];
  const hold = (reason: string): GateVerdict => ({ enter: false, stake: 0n, reason });
  if (input.read.side === "hold") return hold("The read says hold.");
  if (input.read.confidence < rules.minConfidence) {
    return hold(`Confidence ${input.read.confidence.toFixed(2)} is under ${rules.minConfidence}.`);
  }
  if (input.sideShare > rules.maxSideShare) {
    return hold(`${Math.round(input.sideShare * PERCENT)} % of the pot is already on that side.`);
  }
  if (
    input.lossStreak >= rules.breakerLosses &&
    input.lastLossAt !== null &&
    input.nowMs - input.lastLossAt < rules.pauseHours * HOUR_MS
  ) {
    return hold(`${input.lossStreak} losses in a row: paused for ${rules.pauseHours} h.`);
  }
  const lossLimit = (input.dailyCap * BigInt(Math.round(rules.dailyLossShare * PERCENT))) / PERCENT_BIG;
  if (input.lostToday >= lossLimit) return hold("Today's loss limit for this posture is reached.");
  const headroom = input.dailyCap - input.stakedToday;
  const stake = [input.perBetCap, headroom, input.spendable].reduce((low, value) => (value < low ? value : low));
  if (stake < input.minStake) return hold("Not enough left in today's cap or the vault for a ticket.");
  return { enter: true, stake, reason: `Enter ${input.read.side} at confidence ${input.read.confidence.toFixed(2)}.` };
}
