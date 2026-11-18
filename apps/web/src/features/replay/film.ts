import type { RoundFilm } from "@joge/db";
import { PROTOCOL_FEE_BPS, TICKET_DUST, toDollars } from "@joge/sdk";
import type { Cue } from "@/kit";

/**
 * A round's film (after Senryo's replay film, `packages/calls/src/film.ts`): a decided round laid out once as a
 * timeline, so every frame is a pure function of film time and seeking is exact.
 *   0 → ENTRIES_MS            the entry window, entries dropping in as they were made
 *   → + LOCK_MS               the lock: the line to beat draws across
 *   → + run                   lock → close, R = 6 s + 4 s per decade of minutes (5 min ≈ 9 s, 1 h ≈ 13 s)
 *   → + HOLD_MS               the verdict stamps in and holds (the poster frame)
 * The soundtrack is the terminal's own cues over that timeline (no music): a favourable step climbs the profit ladder,
 * a second step against plays the adverse blip, the lock says go, the close stamps, the verdict plays for "you".
 */
export const ENTRIES_MS = 1_800;
export const LOCK_MS = 600;
export const HOLD_MS = 2_200;
const RUN_MIN_MS = 6_000;
const RUN_MAX_MS = 18_000;
const RUN_PER_DECADE_MS = 4_000;
const MINUTE_MS = 60_000;
const SECOND_MS = 1_000;
const BPS = 10_000n;
const SATS_PER_BCH = 100_000_000;
/** Sounds share 160 ms buckets (the strongest wins), so a compressed minute climbs rather than buzzes. */
const BUCKET_MS = 160;
const LADDER_TOP = 10;
const ADVERSE_FROM = 2;
const VERDICT_AFTER_MS = 240;
/** Entry drops get their own quieter bucket so a busy round patters instead of roaring. */
const ENTRY_BUCKET_MS = 120;

export type Side = 0 | 1;

export interface Film {
  roundId: number;
  asset: RoundFilm["round"]["asset"];
  laneSeconds: number | null;
  fromMs: number;
  lockMs: number;
  closeMs: number;
  toMs: number;
  runMs: number;
  totalMs: number;
  strike: number | null;
  close: number | null;
  winner: Side | null;
  voided: boolean;
  times: number[];
  prices: number[];
  prints: Array<[number, number]>;
  entries: Array<{ at: number; filmAt: number; side: Side; stake: number; mine: boolean; net: number | null }>;
  /** The focus player's side: their tickets' side, or null when they have none (or both). */
  side: Side | null;
  low: number;
  high: number;
  cues: Array<{ at: number; cue: Cue; step: number }>;
  bchUsd: number;
}

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export const runFor = (lockMs: number, closeMs: number) =>
  clamp(
    RUN_MIN_MS + RUN_PER_DECADE_MS * Math.log10(Math.max(1, (closeMs - lockMs) / MINUTE_MS)),
    RUN_MIN_MS,
    RUN_MAX_MS,
  );

/** Market time at film time `t`. */
export function marketAt(film: Film, t: number): number {
  if (t <= ENTRIES_MS) return film.fromMs + (film.lockMs - film.fromMs) * (t / ENTRIES_MS);
  if (t <= ENTRIES_MS + LOCK_MS) return film.lockMs;
  const k = clamp((t - ENTRIES_MS - LOCK_MS) / film.runMs, 0, 1);
  return film.lockMs + (film.closeMs - film.lockMs) * k;
}

/** Film time at market time `ms` (the inverse of `marketAt`). */
export function filmAt(film: Pick<Film, "fromMs" | "lockMs" | "closeMs" | "runMs">, ms: number): number {
  if (ms <= film.lockMs)
    return clamp(((ms - film.fromMs) / Math.max(1, film.lockMs - film.fromMs)) * ENTRIES_MS, 0, ENTRIES_MS);
  return ENTRIES_MS + LOCK_MS + clamp((ms - film.lockMs) / Math.max(1, film.closeMs - film.lockMs), 0, 1) * film.runMs;
}

/** The price at market time `ms`, between path points. */
export function priceAt(film: Film, ms: number): number | null {
  const { times, prices } = film;
  if (times.length === 0) return null;
  if (ms <= (times[0] ?? 0)) return prices[0] ?? null;
  for (let i = 1; i < times.length; i++) {
    const t1 = times[i] ?? 0;
    if (ms <= t1) {
      const t0 = times[i - 1] ?? t1;
      const p0 = prices[i - 1] ?? 0;
      const p1 = prices[i] ?? p0;
      return p0 + (p1 - p0) * ((ms - t0) / Math.max(1, t1 - t0));
    }
  }
  return prices.at(-1) ?? null;
}

/** Up and Down pots (sats) entered by film time `t`. */
export function potsAt(film: Film, t: number): [number, number] {
  let up = 0;
  let down = 0;
  for (const entry of film.entries) {
    if (entry.filmAt > t) break;
    if (entry.side === 0) up += entry.stake;
    else down += entry.stake;
  }
  return [up, down];
}

/**
 * The focus player's result if the round ended at film time `t` (sats): their tickets on the side ahead share the pot
 * after the protocol fee; the other side's are lost. At the end it is what the chain actually paid.
 */
export function resultAt(film: Film, t: number): number | null {
  const mine = film.entries.filter((entry) => entry.mine);
  if (mine.length === 0 || film.strike === null) return null;
  if (t >= film.totalMs - HOLD_MS && mine.every((entry) => entry.net !== null)) {
    return mine.reduce((sum, entry) => sum + (entry.net ?? 0), 0);
  }
  if (t < ENTRIES_MS + LOCK_MS) return null;
  const price = priceAt(film, marketAt(film, t)) ?? film.strike;
  const ahead: Side = price >= film.strike ? 0 : 1;
  const [up, down] = potsAt(film, Number.POSITIVE_INFINITY);
  const pot = up + down;
  const net = Number((BigInt(Math.round(pot)) * (BPS - PROTOCOL_FEE_BPS)) / BPS);
  const aheadTotal = ahead === 0 ? up : down;
  return mine.reduce(
    (sum, entry) =>
      sum + (entry.side === ahead && aheadTotal > 0 ? (entry.stake * net) / aheadTotal - entry.stake : -entry.stake),
    0,
  );
}

export const satsToUsd = (film: Film, sats: number) => (sats / SATS_PER_BCH) * film.bchUsd;

/** Lays a round out as a film; `focus` holds the payout key hashes whose tickets are "yours". */
export function filmOf(data: RoundFilm, focus: Set<string>, bchUsd: number): Film | null {
  const { round } = data;
  const lockMs = round.lockTime * SECOND_MS;
  const closeMs = round.closeTime * SECOND_MS;
  const fromMs = lockMs - (round.laneSeconds ?? (closeMs - lockMs) / 2) * SECOND_MS;
  const path = data.path.filter(([ms]) => ms >= fromMs - MINUTE_MS && ms <= closeMs + MINUTE_MS);
  if (path.length < 2) return null;
  const strike = round.strikePrice === null ? null : toDollars(round.asset, round.strikePrice);
  const close = round.closePrice === null ? null : toDollars(round.asset, round.closePrice);
  // The path ends on the settling price (Senryo: the head stops where OUT lands).
  const times = path.map(([ms]) => ms).filter((ms) => ms <= closeMs);
  const prices = path.slice(0, times.length).map(([, price]) => price);
  if (close !== null) {
    times.push(closeMs);
    prices.push(close);
  }
  const runMs = runFor(lockMs, closeMs);
  const timing = { fromMs, lockMs, closeMs, runMs };
  const entries = data.entries.map((entry) => ({
    at: entry.at,
    filmAt: Math.min(filmAt(timing, entry.at), ENTRIES_MS),
    side: (entry.outcome === 0 ? 0 : 1) as Side,
    stake: entry.stake,
    mine: focus.has(entry.payoutPkh),
    net: entry.payoutSats === null ? null : entry.payoutSats - entry.stake - Number(TICKET_DUST),
  }));
  entries.sort((a, b) => a.filmAt - b.filmAt);
  const sides = new Set(entries.filter((entry) => entry.mine).map((entry) => entry.side));
  const levels = [...prices, ...(strike === null ? [] : [strike])];
  const film: Film = {
    roundId: round.roundId,
    asset: round.asset,
    laneSeconds: round.laneSeconds,
    fromMs,
    lockMs,
    closeMs,
    toMs: closeMs,
    runMs,
    totalMs: ENTRIES_MS + LOCK_MS + runMs + HOLD_MS,
    strike,
    close,
    winner: round.state === "settled" && round.winner !== null ? (round.winner === 0 ? 0 : 1) : null,
    voided: round.state === "void",
    times,
    prices,
    prints: data.prints.filter(([ms]) => ms >= fromMs && ms <= closeMs),
    entries,
    side: sides.size === 1 ? ([...sides][0] ?? null) : null,
    low: Math.min(...levels),
    high: Math.max(...levels),
    cues: [],
    bchUsd,
  };
  film.cues = soundtrack(film);
  return film;
}

/** The film's cues: entries patter, go at the lock, the profit ladder and adverse blips, the stamp, the verdict. */
function soundtrack(film: Film): Film["cues"] {
  const cues: Film["cues"] = [{ at: 0, cue: "open", step: 0 }];
  const drops = new Map<number, Film["cues"][number]>();
  for (const entry of film.entries) {
    const bucket = Math.floor(entry.filmAt / ENTRY_BUCKET_MS);
    if (!drops.has(bucket)) drops.set(bucket, { at: entry.filmAt, cue: "tap", step: 0 });
  }
  cues.push(...drops.values(), { at: ENTRIES_MS, cue: "go", step: 0 });
  // Favourable means toward the focus player's side (Up when they have none).
  const sign = film.side === 1 ? -1 : 1;
  const steps = new Map<number, Film["cues"][number]>();
  let run = 0;
  let against = 0;
  for (let i = 1; i < film.times.length; i++) {
    const ms = film.times[i] ?? 0;
    if (ms <= film.lockMs) continue;
    const move = ((film.prices[i] ?? 0) - (film.prices[i - 1] ?? 0)) * sign;
    if (move === 0) continue;
    const at = filmAt(film, ms);
    let next: Film["cues"][number] | null = null;
    if (move > 0) {
      run += 1;
      against = 0;
      next = { at, cue: "profit", step: Math.min(LADDER_TOP, run - 1) };
    } else {
      against += 1;
      run = 0;
      if (against >= ADVERSE_FROM) next = { at, cue: "adverse", step: 0 };
    }
    if (!next) continue;
    const bucket = Math.floor(at / BUCKET_MS);
    const held = steps.get(bucket);
    const strength = (c: Film["cues"][number]) => (c.cue === "profit" ? 1 + c.step : 0);
    if (!held || strength(next) > strength(held)) steps.set(bucket, next);
  }
  cues.push(...steps.values());
  const end = film.totalMs - HOLD_MS;
  cues.push({ at: end, cue: "stamp", step: 0 });
  const mine = film.entries.filter((entry) => entry.mine);
  if (mine.length > 0) {
    const won = !film.voided && mine.some((entry) => entry.side === film.winner);
    cues.push({ at: end + VERDICT_AFTER_MS, cue: film.voided ? "fill" : won ? "win" : "loss", step: 0 });
  }
  return cues.sort((a, b) => a.at - b.at);
}
