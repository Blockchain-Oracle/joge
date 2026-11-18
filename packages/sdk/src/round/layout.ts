import { byte, concat, fixedLe, hexToBin, readLe } from "./bytes.ts";
import {
  ASSET,
  type AssetId,
  LAYOUT,
  MAX_OUTCOMES,
  MODE,
  STAKE_CLASS,
  STATE,
  type StakeClass,
  TAG,
  VOID_WINNER,
  WALLET_SAFE_COMMITMENT_BYTES,
} from "./constants.ts";

const NIBBLE = 16;
const ROUND_ID_BYTES = 4;
const TIME_BYTES = 4;
const FEE_BPS_BYTES = 2;
const PKH_BYTES = 20;
const MIN_POT_BYTES = 5;
const MIN_ENTRANTS_BYTES = 2;
const COUNT_BYTES = 3;
const SEQUENCE_BYTES = 4;

export type Mode = keyof typeof MODE;

export interface GateState {
  roundId: number;
  gateIndex: number;
  stakeClass: StakeClass;
  outcomes: number;
  entrants: number;
  totals: bigint[];
}

export interface TicketState {
  roundId: number;
  gateIndex: number;
  outcome: number;
  stake: bigint;
  payoutPkh: Uint8Array;
}

export interface OpenRound {
  roundId: number;
  asset: AssetId;
  mode: Mode;
  outcomes: number;
  gates: number;
  lockTime: number;
  closeTime: number;
  creatorFeeBps: number;
  creatorPkh: Uint8Array;
  minPot: bigint;
  minEntrants: number;
  /** RANGES mode: N − 1 ascending price boundaries; outcome k wins when boundary[k−1] ≤ close < boundary[k]. */
  boundaries: number[];
}

export interface LockedRound extends Omit<OpenRound, "gates" | "lockTime" | "minPot" | "minEntrants"> {
  lockSequence: number;
  xauLockSequence: number;
  pot: bigint;
  entrants: number;
  totals: bigint[];
}

export interface SweepRound {
  roundId: number;
  state: "settled" | "void";
  /** Winning outcome, or null when void. */
  winner: number | null;
  /** Pot after fees (zero when void: stakes are refunded). */
  pot: bigint;
  winnerTotal: bigint;
  remaining: number;
  creatorPkh: Uint8Array;
}

const assetName = (index: number): AssetId => {
  const name = (Object.keys(ASSET) as AssetId[]).find((key) => ASSET[key] === index);
  if (name === undefined) throw new Error(`unknown asset ${index}`);
  return name;
};
const className = (index: number): StakeClass => {
  const name = (Object.keys(STAKE_CLASS) as StakeClass[]).find((key) => STAKE_CLASS[key] === index);
  if (name === undefined) throw new Error(`unknown stake class ${index}`);
  return name;
};
const modeName = (index: number): Mode => (index === MODE.ranges ? "ranges" : "updown");
const asBytes = (value: Uint8Array | string): Uint8Array => (typeof value === "string" ? hexToBin(value) : value);
const num = (bytes: Uint8Array, offset: number, width: number): number => Number(readLe(bytes, offset, width));

function checkOutcomes(outcomes: number) {
  if (!Number.isInteger(outcomes) || outcomes < 2 || outcomes > MAX_OUTCOMES) {
    throw new RangeError(`a round has 2 to ${MAX_OUTCOMES} outcomes`);
  }
}

export function encodeGate(gate: GateState): Uint8Array {
  checkOutcomes(gate.outcomes);
  const out = concat(
    byte(TAG.gate),
    fixedLe(gate.roundId, ROUND_ID_BYTES),
    byte(gate.gateIndex),
    byte(STAKE_CLASS[gate.stakeClass] * NIBBLE + gate.outcomes),
    fixedLe(gate.entrants, COUNT_BYTES),
    ...gate.totals.map((total) => fixedLe(total, LAYOUT.gate.total)),
  );
  if (out.length > WALLET_SAFE_COMMITMENT_BYTES) throw new RangeError("gate commitment over the wallet-safe 40 bytes");
  return out;
}

export function decodeGate(value: Uint8Array | string): GateState {
  const bytes = asBytes(value);
  if (bytes[0] !== TAG.gate) throw new Error("not a gate commitment");
  const classAndOutcomes = bytes[LAYOUT.gate.classAndOutcomes] ?? 0;
  const outcomes = classAndOutcomes % NIBBLE;
  return {
    roundId: num(bytes, LAYOUT.gate.roundId, ROUND_ID_BYTES),
    gateIndex: bytes[LAYOUT.gate.gateIndex] ?? 0,
    stakeClass: className(Math.floor(classAndOutcomes / NIBBLE)),
    outcomes,
    entrants: num(bytes, LAYOUT.gate.entrants, LAYOUT.gate.entrantsWidth),
    totals: Array.from({ length: outcomes }, (_, outcome) =>
      readLe(bytes, LAYOUT.gate.totals + outcome * LAYOUT.gate.total, LAYOUT.gate.total),
    ),
  };
}

export function encodeTicket(ticket: TicketState): Uint8Array {
  if (ticket.payoutPkh.length !== PKH_BYTES) throw new RangeError("payout pubkey hash must be 20 bytes");
  return concat(
    byte(TAG.ticket),
    fixedLe(ticket.roundId, ROUND_ID_BYTES),
    byte(ticket.gateIndex),
    byte(ticket.outcome),
    fixedLe(ticket.stake, LAYOUT.ticket.stakeWidth),
    ticket.payoutPkh,
  );
}

export function decodeTicket(value: Uint8Array | string): TicketState {
  const bytes = asBytes(value);
  if (bytes[0] !== TAG.ticket || bytes.length !== LAYOUT.ticket.length) throw new Error("not a ticket commitment");
  return {
    roundId: num(bytes, LAYOUT.ticket.roundId, ROUND_ID_BYTES),
    gateIndex: bytes[LAYOUT.ticket.gateIndex] ?? 0,
    outcome: bytes[LAYOUT.ticket.outcome] ?? 0,
    stake: readLe(bytes, LAYOUT.ticket.stake, LAYOUT.ticket.stakeWidth),
    payoutPkh: bytes.slice(LAYOUT.ticket.payoutPkh, LAYOUT.ticket.length),
  };
}

const boundaryBytes = (boundaries: number[]) => boundaries.map((value) => fixedLe(value, LAYOUT.boundaryWidth));
const readBoundaries = (bytes: Uint8Array, start: number, count: number) =>
  Array.from({ length: count }, (_, index) => num(bytes, start + index * LAYOUT.boundaryWidth, LAYOUT.boundaryWidth));

export function encodeOpen(round: OpenRound): Uint8Array {
  checkOutcomes(round.outcomes);
  if (round.mode === "updown" && round.outcomes !== 2) throw new RangeError("up/down rounds have two outcomes");
  if (round.mode === "ranges" && round.boundaries.length !== round.outcomes - 1) {
    throw new RangeError("ranges need one boundary fewer than outcomes");
  }
  return concat(
    byte(TAG.master),
    fixedLe(round.roundId, ROUND_ID_BYTES),
    byte(STATE.open),
    byte(ASSET[round.asset]),
    byte(MODE[round.mode] * NIBBLE + round.outcomes),
    byte(round.gates),
    fixedLe(round.lockTime, TIME_BYTES),
    fixedLe(round.closeTime, TIME_BYTES),
    fixedLe(round.creatorFeeBps, FEE_BPS_BYTES),
    round.creatorPkh,
    fixedLe(round.minPot, MIN_POT_BYTES),
    fixedLe(round.minEntrants, MIN_ENTRANTS_BYTES),
    ...(round.mode === "ranges" ? boundaryBytes(round.boundaries) : []),
  );
}

export function decodeLocked(value: Uint8Array | string): LockedRound {
  const bytes = asBytes(value);
  if (bytes[0] !== TAG.master || bytes[LAYOUT.master.state] !== STATE.locked) throw new Error("not a locked round");
  const modeAndOutcomes = bytes[LAYOUT.master.modeAndOutcomes] ?? 0;
  const outcomes = modeAndOutcomes % NIBBLE;
  const mode = modeName(Math.floor(modeAndOutcomes / NIBBLE));
  const totalsStart = LAYOUT.locked.totals;
  const boundsStart = totalsStart + outcomes * LAYOUT.gate.total;
  return {
    roundId: num(bytes, LAYOUT.master.roundId, ROUND_ID_BYTES),
    asset: assetName(bytes[LAYOUT.master.asset] ?? 0),
    mode,
    outcomes,
    closeTime: num(bytes, LAYOUT.locked.closeTime, TIME_BYTES),
    creatorFeeBps: num(bytes, LAYOUT.locked.feeBps, FEE_BPS_BYTES),
    creatorPkh: bytes.slice(LAYOUT.locked.creatorPkh, LAYOUT.locked.creatorPkh + PKH_BYTES),
    lockSequence: num(bytes, LAYOUT.locked.lockSequence, SEQUENCE_BYTES),
    xauLockSequence: num(bytes, LAYOUT.locked.xauLockSequence, SEQUENCE_BYTES),
    pot: readLe(bytes, LAYOUT.locked.pot, LAYOUT.potWidth),
    entrants: num(bytes, LAYOUT.locked.entrants, COUNT_BYTES),
    totals: Array.from({ length: outcomes }, (_, outcome) =>
      readLe(bytes, totalsStart + outcome * LAYOUT.gate.total, LAYOUT.gate.total),
    ),
    boundaries: mode === "ranges" ? readBoundaries(bytes, boundsStart, outcomes - 1) : [],
  };
}

export function decodeSweep(value: Uint8Array | string): SweepRound {
  const bytes = asBytes(value);
  const state = bytes[LAYOUT.master.state];
  if (bytes[0] !== TAG.master || (state !== STATE.settled && state !== STATE.void))
    throw new Error("not a settled round");
  const winner = bytes[LAYOUT.sweep.winner] ?? VOID_WINNER;
  return {
    roundId: num(bytes, LAYOUT.master.roundId, ROUND_ID_BYTES),
    state: state === STATE.void ? "void" : "settled",
    winner: state === STATE.void ? null : winner,
    pot: readLe(bytes, LAYOUT.sweep.pot, LAYOUT.potWidth),
    winnerTotal: readLe(bytes, LAYOUT.sweep.winnerTotal, LAYOUT.potWidth),
    remaining: num(bytes, LAYOUT.sweep.remaining, COUNT_BYTES),
    creatorPkh: bytes.slice(LAYOUT.sweep.creatorPkh, LAYOUT.sweep.length),
  };
}

/** State byte of any master commitment. */
export const masterState = (value: Uint8Array | string): number => asBytes(value)[LAYOUT.master.state] ?? -1;

export function decodeOpen(value: Uint8Array | string): OpenRound {
  const bytes = asBytes(value);
  if (bytes[0] !== TAG.master || bytes[LAYOUT.master.state] !== STATE.open) throw new Error("not an open round");
  const modeAndOutcomes = bytes[LAYOUT.master.modeAndOutcomes] ?? 0;
  const outcomes = modeAndOutcomes % NIBBLE;
  const mode = modeName(Math.floor(modeAndOutcomes / NIBBLE));
  return {
    roundId: num(bytes, LAYOUT.master.roundId, ROUND_ID_BYTES),
    asset: assetName(bytes[LAYOUT.master.asset] ?? 0),
    mode,
    outcomes,
    gates: bytes[LAYOUT.master.gates] ?? 0,
    lockTime: num(bytes, LAYOUT.open.lockTime, TIME_BYTES),
    closeTime: num(bytes, LAYOUT.open.closeTime, TIME_BYTES),
    creatorFeeBps: num(bytes, LAYOUT.open.feeBps, FEE_BPS_BYTES),
    creatorPkh: bytes.slice(LAYOUT.open.creatorPkh, LAYOUT.open.creatorPkh + PKH_BYTES),
    minPot: readLe(bytes, LAYOUT.open.minPot, MIN_POT_BYTES),
    minEntrants: num(bytes, LAYOUT.open.minEntrants, MIN_ENTRANTS_BYTES),
    boundaries: mode === "ranges" ? readBoundaries(bytes, LAYOUT.open.bounds, outcomes - 1) : [],
  };
}

/** The record MasterOpen's lock writes when the round goes on (mirrors closeGates). */
export function encodeLocked(round: LockedRound): Uint8Array {
  return concat(
    byte(TAG.master),
    fixedLe(round.roundId, ROUND_ID_BYTES),
    byte(STATE.locked),
    byte(ASSET[round.asset]),
    byte(MODE[round.mode] * NIBBLE + round.outcomes),
    fixedLe(round.closeTime, TIME_BYTES),
    fixedLe(round.creatorFeeBps, FEE_BPS_BYTES),
    round.creatorPkh,
    fixedLe(round.lockSequence, SEQUENCE_BYTES),
    fixedLe(round.xauLockSequence, SEQUENCE_BYTES),
    fixedLe(round.pot, LAYOUT.potWidth),
    fixedLe(round.entrants, COUNT_BYTES),
    ...round.totals.map((total) => fixedLe(total, LAYOUT.gate.total)),
    ...(round.mode === "ranges" ? boundaryBytes(round.boundaries) : []),
  );
}

/** The record a settlement (or a void at lock or timeout) writes for the sweep contract. */
export function encodeSweep(round: SweepRound): Uint8Array {
  const isVoid = round.state === "void";
  return concat(
    byte(TAG.master),
    fixedLe(round.roundId, ROUND_ID_BYTES),
    byte(isVoid ? STATE.void : STATE.settled),
    byte(isVoid ? VOID_WINNER : (round.winner ?? VOID_WINNER)),
    fixedLe(isVoid ? 0n : round.pot, LAYOUT.potWidth),
    fixedLe(isVoid ? 0n : round.winnerTotal, LAYOUT.potWidth),
    fixedLe(round.remaining, COUNT_BYTES),
    round.creatorPkh,
  );
}
