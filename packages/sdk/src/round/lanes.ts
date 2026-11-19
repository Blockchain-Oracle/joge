import { byte, concat, fixedLe, hexToBin, readLe } from "./bytes.ts";
import { ASSET, type AssetId } from "./constants.ts";

/**
 * The opening side of category K (SolidCash contracts: lane threads and the factory). Mirrors
 * packages/contracts/solidcash/opening.scash; the contract is the authority.
 */
export const TAG_FACTORY = 0x04;
export const TAG_LANE = 0x05;
export const LANE_GATES = 2;
export const LANE_BUDGET = 20_000n;
export const LANE_OPENER_FEE_BPS = 50;
export const CREATION_FEE = 2_000n;
export const MIN_BUDGET = 10_000n;
export const MAX_GATES = 4;
export const HOUR_SECONDS = 3_600;
export const MIN_ROUND_SECONDS = 180;
export const MAX_ROUND_SECONDS = 2_592_000;
export const MAX_EVENT_ADVANCE = 2_592_000;
/** A lane opens at most this many lane lengths ahead of the oracle clock. */
export const LANE_ADVANCE_LENGTHS = 2;
/** What an agent vault pays the miner per bet (fixed in AgentVault.scash). */
export const AGENT_BET_FEE = 1_500n;
/** Feeds' committed end dates (oracle metadata 2026-11-16). */
export const FEED_END: Record<AssetId, number> = {
  BTC: 1_800_014_400,
  ETH: 1_800_014_400,
  GOLD: 1_800_014_400,
  BCH: 1_839_412_800,
};

export interface Lane {
  /** Thread byte: the high byte of every round id this lane opens. */
  thread: number;
  asset: AssetId;
  seconds: number;
}

const SHORT_LANES = [180, 300, 900];
const SHORT_ASSETS: AssetId[] = ["BTC", "ETH", "BCH"];
const HOURLY_ASSETS: AssetId[] = ["BTC", "ETH", "BCH", "GOLD"];
const FIRST_LANE_THREAD = 0x10;

/** The 13 lanes: 3, 5 and 15 minutes on BTC, ETH and BCH; an hour on BTC, ETH, BCH and gold. */
export const LANES: Lane[] = [
  ...SHORT_ASSETS.flatMap((asset) => SHORT_LANES.map((seconds) => ({ asset, seconds }))),
  ...HOURLY_ASSETS.map((asset) => ({ asset, seconds: HOUR_SECONDS })),
].map((lane, index) => ({ ...lane, thread: FIRST_LANE_THREAD + index }));

/** Factory threads (custom rounds and events): thread bytes 0x01–0x03. */
export const FACTORY_THREADS = [0x01, 0x02, 0x03];

const COUNTER_BYTES = 3;
const LANE_SECONDS_BYTES = 2;
const TIME_BYTES = 4;
const LANE = { thread: 1, asset: 2, seconds: 3, nextLock: 5, counter: 9 } as const;
const FACTORY = { thread: 1, counter: 2 } as const;

export interface LaneState extends Lane {
  nextLock: number;
  counter: number;
}

export const encodeLane = (lane: LaneState): Uint8Array =>
  concat(
    byte(TAG_LANE),
    byte(lane.thread),
    byte(ASSET[lane.asset]),
    fixedLe(lane.seconds, LANE_SECONDS_BYTES),
    fixedLe(lane.nextLock, TIME_BYTES),
    fixedLe(lane.counter, COUNTER_BYTES),
  );

export function decodeLane(value: Uint8Array | string): LaneState {
  const bytes = typeof value === "string" ? hexToBin(value) : value;
  if (bytes[0] !== TAG_LANE) throw new Error("not a lane thread");
  const assetIndex = bytes[LANE.asset] ?? 0;
  const asset = (Object.keys(ASSET) as AssetId[]).find((key) => ASSET[key] === assetIndex);
  if (!asset) throw new Error(`unknown asset ${assetIndex}`);
  return {
    thread: bytes[LANE.thread] ?? 0,
    asset,
    seconds: Number(readLe(bytes, LANE.seconds, LANE_SECONDS_BYTES)),
    nextLock: Number(readLe(bytes, LANE.nextLock, TIME_BYTES)),
    counter: Number(readLe(bytes, LANE.counter, COUNTER_BYTES)),
  };
}

export const encodeFactory = (thread: number, counter: number): Uint8Array =>
  concat(byte(TAG_FACTORY), byte(thread), fixedLe(counter, COUNTER_BYTES));

export function decodeFactory(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? hexToBin(value) : value;
  if (bytes[0] !== TAG_FACTORY) throw new Error("not a factory thread");
  return { thread: bytes[FACTORY.thread] ?? 0, counter: Number(readLe(bytes, FACTORY.counter, COUNTER_BYTES)) };
}

const BYTE = 256;
/**
 * Round ids carry their opener: the contracts write the thread byte, then the thread's 3-byte counter, so read as the
 * 4-byte little-endian round id that is `thread + counter × 256`.
 */
export const roundIdOf = (thread: number, counter: number): number => thread + counter * BYTE;

/** The lane's first grid slot at or after `time` (grid = multiples of the lane length since the Unix epoch). */
export const gridSlotAtOrAfter = (seconds: number, time: number): number => Math.ceil(time / seconds) * seconds;

/** An opened round keeps at least this long for entries before its lock. */
export const MIN_ENTRY_LEAD_SECONDS = 60;

/**
 * The slot a lane should open next: its next lock time, or (if the lane fell idle) the first grid slot that still
 * leaves a minute for entries. It stays within the lane contract's limit of two lane lengths past the oracle clock.
 */
export const nextSlot = (lane: LaneState, now: number): number =>
  Math.max(lane.nextLock, gridSlotAtOrAfter(lane.seconds, now + MIN_ENTRY_LEAD_SECONDS));
