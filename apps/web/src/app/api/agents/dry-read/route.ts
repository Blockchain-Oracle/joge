import { agentPrompt, describeModelError, gate, MODEL_HINT, promptHash, readRound, resolveModel } from "@joge/brain";
import { lobby } from "@joge/db";
import { HOUR_SECONDS, MAX_STAKE, MIN_STAKE } from "@joge/sdk";
import { agentDraftSchema } from "@/server/agents";
import { DRY_READ_HOUSE, DRY_READ_PER_IP } from "@/server/constants";
import { database, networkOf, nowSeconds } from "@/server/db";
import { recentPrices } from "@/server/prices";
import { allow, clientIp } from "@/server/rate";

const BAD_REQUEST = 400;
const TOO_MANY = 429;
const UNAVAILABLE = 503;
const SATS_PER_BCH = 100_000_000;
const MINUTE_SECONDS = 60;

const bodySchema = agentDraftSchema.pick({
  persona: true,
  posture: true,
  lanes: true,
  perBetCap: true,
  dailyCap: true,
});

/**
 * Dry read: one real model call with the draft brief on the soonest round taking entries in its lanes, then what the
 * gate would do. Nothing is sent and nothing is stored.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Write a brief and pick lanes first." }, { status: BAD_REQUEST });
  const resolved = resolveModel();
  if (!resolved) return Response.json({ error: MODEL_HINT }, { status: UNAVAILABLE });
  if (!allow("dry-read", clientIp(request), DRY_READ_PER_IP) || !allow("dry-read", "house", DRY_READ_HOUSE)) {
    return Response.json({ error: "One dry read every few seconds. Try again shortly." }, { status: TOO_MANY });
  }
  const draft = parsed.data;
  const now = nowSeconds();
  const lane = (await lobby(database.db, networkOf(request), now))
    .filter((candidate) => draft.lanes.includes(candidate.thread) && candidate.next)
    .sort((a, b) => (a.next?.lockTime ?? 0) - (b.next?.lockTime ?? 0))[0];
  const round = lane?.next;
  if (!lane || !round)
    return Response.json(
      { error: "None of these lanes has a round taking entries right now." },
      { status: UNAVAILABLE },
    );
  const pot = round.totals.reduce((sum, total) => sum + total, 0);
  const prints = await recentPrices(round.asset);
  const bchUsd = (await recentPrices("BCH")).at(-1) ?? 0;
  const brief = {
    roundId: round.roundId,
    asset: round.asset,
    length: lane.seconds >= HOUR_SECONDS ? `${lane.seconds / HOUR_SECONDS} h` : `${lane.seconds / MINUTE_SECONDS} min`,
    locksInSeconds: round.lockTime - now,
    priceNowUsd: prints.at(-1) ?? 0,
    prints,
    upShare: pot > 0 ? (round.totals[0] ?? 0) / pot : 0,
    downShare: pot > 0 ? (round.totals[1] ?? 0) / pot : 0,
    potUsd: (pot / SATS_PER_BCH) * bchUsd,
  };
  const prompt = agentPrompt(draft.persona, draft.posture, brief, []);
  try {
    const read = await readRound(resolved, prompt);
    const cap = MAX_STAKE[lane.seconds >= HOUR_SECONDS ? "hourly" : "short"];
    const perBetCap = BigInt(draft.perBetCap) < cap ? BigInt(draft.perBetCap) : cap;
    const verdict = gate({
      read,
      posture: draft.posture,
      sideShare: read.side === "up" ? brief.upShare : read.side === "down" ? brief.downShare : 0,
      lossStreak: 0,
      lastLossAt: null,
      lostToday: 0n,
      stakedToday: 0n,
      dailyCap: BigInt(draft.dailyCap),
      perBetCap,
      spendable: perBetCap,
      minStake: MIN_STAKE,
      nowMs: Date.now(),
    });
    return Response.json({
      round: { roundId: round.roundId, asset: round.asset, laneSeconds: lane.seconds, lockTime: round.lockTime },
      read,
      gate: { enter: verdict.enter, stake: verdict.stake.toString(), reason: verdict.reason },
      model: resolved.id,
      promptHash: promptHash(prompt),
    });
  } catch (error) {
    return Response.json({ error: `The dry read failed: ${describeModelError(error)}.` }, { status: UNAVAILABLE });
  }
}
