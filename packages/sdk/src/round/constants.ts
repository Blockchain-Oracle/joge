/**
 * Mirrors packages/contracts/cashscript/rules.cash. Change both together; the contract is the authority.
 */

export const TAG = { master: 0x01, gate: 0x02, ticket: 0x03 } as const;
export const STATE = { open: 0, locked: 1, settled: 2, void: 3 } as const;
export type RoundState = (typeof STATE)[keyof typeof STATE];

export const ASSET = { BTC: 0, ETH: 1, BCH: 2, GOLD: 3 } as const;
export type AssetId = keyof typeof ASSET;

export const MODE = { updown: 0, ranges: 1 } as const;
export const OUTCOME = { up: 0, down: 1 } as const;
export const MAX_OUTCOMES = 6;
export const VOID_WINNER = 0xff;

export const STAKE_CLASS = { short: 0, hourly: 1, event: 2, dollar: 3 } as const;
export type StakeClass = keyof typeof STAKE_CLASS;

export const MIN_STAKE = 5_000n;
/** Satoshis per entry, except `dollar`: dollar-token units (cents; see round/dollar.ts). */
export const MAX_STAKE: Record<StakeClass, bigint> = {
  short: 500_000n,
  hourly: 5_000_000n,
  event: 25_000_000n,
  dollar: 5_000n,
};
export const GATE_CAP: Record<StakeClass, bigint> = {
  short: 10_000_000n,
  hourly: 100_000_000n,
  event: 500_000_000n,
  dollar: 100_000n,
};

export const TICKET_DUST = 1_200n;
/** Every gate is created holding exactly this; the lock counts anything beyond it as pot. */
export const GATE_DUST = 1_000n;
/** Share of a stake kept in the gate when an event entrant leaves before the lock (joins the winners' pot). */
export const EVENT_EXIT_FEE_BPS = 300n;
export const MIN_FEE_OUTPUT = 1_000n;
export const LOCK_FEE_BASE = 1_600n;
export const LOCK_FEE_PER_GATE = 700n;
/** Event gates are nearly twice a lane gate's size, so a lock pays more per event gate (mirrors rules.cash). */
export const EVENT_LOCK_FEE_PER_GATE = 1_100n;
export const SETTLE_FEE = 2_200n;
export const SWEEP_FEE_BASE = 1_000n;
export const SWEEP_FEE_PER_TICKET = 250n;
/** Zero bytes of padding per swept ticket (buys operation-cost budget); mirrors rules.cash. */
export const SWEEP_PAD_PER_TICKET = 32;
/** Tickets per sweep transaction by convention: stays under the 10,000-byte unlocking limit with room to spare. */
export const MAX_SWEEP_BATCH = 200;
export const PROTOCOL_FEE_BPS = 200n;
export const MAX_CREATOR_FEE_BPS = 300n;
export const BPS = 10_000n;

export const FINAL_SEQUENCE = 0xffffffff;
export const TIMEOUT_SEQUENCE = 0xfffffffe;
export const TX_VERSION = 2;
export const SETTLE_TIMEOUT = 21_600;

/** Commitment byte layout (offsets and widths) — one place, used by codecs and by the indexer. */
export const LAYOUT = {
  master: { roundId: 1, state: 5, asset: 6, modeAndOutcomes: 7, gates: 8 },
  gate: { roundId: 1, gateIndex: 5, classAndOutcomes: 6, entrants: 7, totals: 10, total: 5, entrantsWidth: 3 },
  ticket: { roundId: 1, gateIndex: 5, outcome: 6, stake: 7, stakeWidth: 5, payoutPkh: 12, length: 32 },
  open: {
    headerEnd: 9,
    lockTime: 9,
    closeTime: 13,
    feeBps: 17,
    creatorPkh: 19,
    minPot: 39,
    minEntrants: 44,
    bounds: 46,
  },
  locked: {
    closeTime: 8,
    feeBps: 12,
    creatorPkh: 14,
    lockSequence: 34,
    xauLockSequence: 38,
    pot: 42,
    entrants: 48,
    totals: 51,
  },
  sweep: { winner: 6, pot: 7, winnerTotal: 13, remaining: 19, creatorPkh: 22, length: 42 },
  boundaryWidth: 4,
  potWidth: 6,
} as const;

/** Selene refuses to sign a spend of an input whose NFT commitment is longer than this (decision D3c). */
export const WALLET_SAFE_COMMITMENT_BYTES = 40;
