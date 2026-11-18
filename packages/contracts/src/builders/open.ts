import { binToHex, cashAddressToLockingBytecode, hexToBin } from "@bitauth/libauth";
import {
  ASSET,
  type AssetId,
  CREATION_FEE,
  cleanTitle,
  concat,
  decodeFactory,
  decodeLane,
  encodeFactory,
  encodeGate,
  encodeLane,
  encodeOpen,
  fixedLe,
  GATE_DUST,
  HOUR_SECONDS,
  LANE_BUDGET,
  LANE_GATES,
  LANE_OPENER_FEE_BPS,
  MODE,
  type OpenRound,
  type PriceMessage,
  roundIdOf,
  SIDE_SEED,
  STAKE_CLASS,
  type StakeClass,
  TOKEN_DUST,
  titleChunks,
} from "@joge/sdk";
import type { RoundContracts } from "../contracts.ts";
import type { DollarContracts } from "../dollar.ts";
import { asCashScriptUnlocker, type OpeningContracts } from "../hybrid.ts";
import { commitment, type Funding, nft, type TokenUtxo } from "./shared.ts";

const BOUNDARY_BYTES = 4;

/** An address's locking bytecode (hex), for outputs that carry tokens (they skip CashScript's token-aware check). */
function lockingBytecodeOf(address: string): string {
  const decoded = cashAddressToLockingBytecode(address);
  if (typeof decoded === "string") throw new Error(decoded);
  return binToHex(decoded.bytecode);
}

/** Outputs 1.. of an opening: the master, then its gates (each empty), exactly as the opening contracts require. */
function addRound(
  builder: InstanceType<RoundContracts["TransactionBuilder"]>,
  round: RoundContracts,
  open: OpenRound,
  stakeClass: StakeClass,
  budget: bigint,
) {
  builder.addOutput({
    to: hexToBin(round.open.lockingBytecode),
    amount: budget,
    token: nft(round.category, "mutable", encodeOpen(open)),
  });
  const gateBytecode = stakeClass === "event" ? round.eventGate.lockingBytecode : round.gate.lockingBytecode;
  for (let gateIndex = 0; gateIndex < open.gates; gateIndex += 1) {
    const gate = {
      roundId: open.roundId,
      gateIndex,
      stakeClass,
      outcomes: open.outcomes,
      entrants: 0,
      totals: Array(open.outcomes).fill(0n),
    };
    builder.addOutput({
      to: hexToBin(gateBytecode),
      amount: GATE_DUST,
      token: nft(round.category, "minting", encodeGate(gate)),
    });
  }
}

/** A dollar event's outputs 1..: the master and gates at the dollar contracts, then one seeded sidecar per gate. */
function addDollarRound(
  builder: InstanceType<RoundContracts["TransactionBuilder"]>,
  round: RoundContracts,
  dollar: DollarContracts,
  open: OpenRound,
  budget: bigint,
) {
  builder.addOutput({
    to: hexToBin(dollar.open.lockingBytecode),
    amount: budget,
    token: nft(round.category, "mutable", encodeOpen(open)),
  });
  for (let gateIndex = 0; gateIndex < open.gates; gateIndex += 1) {
    const gate = {
      roundId: open.roundId,
      gateIndex,
      stakeClass: "dollar" as const,
      outcomes: open.outcomes,
      entrants: 0,
      totals: Array(open.outcomes).fill(0n),
    };
    builder.addOutput({
      to: hexToBin(dollar.gate.lockingBytecode),
      amount: GATE_DUST,
      token: nft(round.category, "minting", encodeGate(gate)),
    });
  }
  for (let gateIndex = 0; gateIndex < open.gates; gateIndex += 1) {
    builder.addOutput({
      to: hexToBin(dollar.side.lockingBytecode),
      amount: TOKEN_DUST,
      token: { category: dollar.dollarCategory, amount: SIDE_SEED },
    });
  }
}

export interface LaneOpenParams {
  round: RoundContracts;
  opening: OpeningContracts;
  lane: TokenUtxo;
  /** A grid slot at or after the lane's next lock time (see `nextSlot`). */
  slot: number;
  /** The opener: funds the budget, gets it back after the last payout, plus the lane opener fee. */
  openerPkh: Uint8Array;
  /** Any signed USD/BCH price no older than two lane lengths before `slot`. */
  clock: PriceMessage;
  funding: Funding[];
  change: string | Uint8Array;
  feeRate?: number;
}

/** Opens a lane's round: lane thread (input 0) + the opener's coins → lane moved on, master, gates, change. */
export function buildLaneOpen({
  round,
  opening,
  lane,
  slot,
  openerPkh,
  clock,
  funding,
  change,
  feeRate = 1,
}: LaneOpenParams) {
  const state = decodeLane(commitment(lane));
  const stakeClass: StakeClass = state.seconds >= HOUR_SECONDS ? "hourly" : "short";
  const open: OpenRound = {
    roundId: roundIdOf(state.thread, state.counter),
    asset: state.asset,
    mode: "updown",
    outcomes: 2,
    gates: LANE_GATES,
    lockTime: slot,
    closeTime: slot + state.seconds,
    creatorFeeBps: LANE_OPENER_FEE_BPS,
    creatorPkh: openerPkh,
    minPot: 0n,
    minEntrants: 0,
    boundaries: [],
  };
  const unlock = opening.lanes.unlock.open;
  if (!unlock) throw new Error("LaneThread has no open function");
  const builder = new round.TransactionBuilder({ provider: round.open.provider }).addInput(
    lane,
    asCashScriptUnlocker(unlock(BigInt(slot), openerPkh, clock.message, clock.signature)),
  );
  for (const coin of funding) builder.addInput(coin.utxo, coin.unlocker);
  builder.addOutput({
    to: hexToBin(opening.lanes.lockingBytecode),
    amount: lane.satoshis,
    token: nft(
      round.category,
      "minting",
      encodeLane({ ...state, nextLock: slot + state.seconds, counter: state.counter + 1 }),
    ),
  });
  addRound(builder, round, open, stakeClass, LANE_BUDGET);
  return { builder: builder.addBchChangeOutputIfNeeded({ to: change, feeRate }), open };
}

export interface CreateParams {
  round: RoundContracts;
  opening: OpeningContracts;
  thread: TokenUtxo;
  /** The custom round or event (its round id comes from the factory thread). */
  open: Omit<OpenRound, "roundId">;
  stakeClass: StakeClass;
  budget: bigint;
  clock: PriceMessage;
  protocolLockingBytecode: string;
  funding: Funding[];
  change: string | Uint8Array;
  feeRate?: number;
  /** Written on chain as an OP_RETURN after the creation fee (see `titleChunks`); omitted when empty. */
  title?: string | undefined;
  /** Dollar events only (stake class `dollar`): the dollar contracts; the funding must include dollars for the seeds. */
  dollar?: DollarContracts | undefined;
}

const boundaryBytes = (boundaries: number[]) => concat(...boundaries.map((value) => fixedLe(value, BOUNDARY_BYTES)));

/** Creates a custom round or event: factory thread (input 0) + coins → factory moved on, master, gates, creation fee. */
export function buildCreate(params: CreateParams) {
  const { round, opening, thread, open, stakeClass, budget, clock, protocolLockingBytecode, funding, change } = params;
  const state = decodeFactory(commitment(thread));
  const full: OpenRound = { ...open, roundId: roundIdOf(state.thread, state.counter) };
  const asset: AssetId = open.asset;
  const create = opening.factory.unlock.create;
  if (!create) throw new Error("Factory has no create function");
  const unlock = create(
    BigInt(ASSET[asset]),
    BigInt(MODE[open.mode]),
    BigInt(open.outcomes),
    BigInt(open.gates),
    BigInt(STAKE_CLASS[stakeClass]),
    BigInt(open.lockTime),
    BigInt(open.closeTime),
    BigInt(open.creatorFeeBps),
    open.creatorPkh,
    open.minPot,
    BigInt(open.minEntrants),
    open.mode === "ranges" ? boundaryBytes(open.boundaries) : new Uint8Array(),
    budget,
    clock.message,
    clock.signature,
  );
  const builder = new round.TransactionBuilder({ provider: round.open.provider }).addInput(
    thread,
    asCashScriptUnlocker(unlock),
  );
  for (const coin of funding) builder.addInput(coin.utxo, coin.unlocker);
  builder.addOutput({
    to: hexToBin(opening.factory.lockingBytecode),
    amount: thread.satoshis,
    token: nft(round.category, "minting", encodeFactory(state.thread, state.counter + 1)),
  });
  const { dollar } = params;
  let leftover = 0n;
  if (stakeClass === "dollar") {
    if (!dollar) throw new Error("a dollar event needs the dollar contracts");
    addDollarRound(builder, round, dollar, full, budget);
    const held = funding.reduce(
      (sum, coin) => (coin.utxo.token?.category === dollar.dollarCategory ? sum + coin.utxo.token.amount : sum),
      0n,
    );
    leftover = held - SIDE_SEED * BigInt(full.gates);
    if (leftover < 0n) throw new Error("a dollar event needs a cent of the dollar token per gate for its sidecars");
  } else {
    addRound(builder, round, full, stakeClass, budget);
  }
  builder.addOutput({ to: hexToBin(protocolLockingBytecode), amount: CREATION_FEE });
  if (params.title && cleanTitle(params.title)) builder.addOpReturnOutput(titleChunks(params.title));
  if (dollar && leftover > 0n) {
    const to = typeof change === "string" ? hexToBin(lockingBytecodeOf(change)) : change;
    builder.addOutput({ to, amount: TOKEN_DUST, token: { category: dollar.dollarCategory, amount: leftover } });
  }
  return { builder: builder.addBchChangeOutputIfNeeded({ to: change, feeRate: params.feeRate ?? 1 }), open: full };
}
