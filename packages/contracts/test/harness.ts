// Shared set-up for the round tests: a mock chain of either contract language, players with keys, a round minted
// straight into the mock (the factory comes in S01), and real General Protocols messages from the fixtures.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { binToHex, encodeLockingBytecodeP2pkh, generatePrivateKey, hash160, secp256k1 } from "@bitauth/libauth";
import {
  type AssetId,
  encodeGate,
  encodeOpen,
  type FeedId,
  findBoundaryPair,
  findBySequence,
  type OpenRound,
  type PriceMessage,
  type StakeClass,
  sortPrices,
} from "@joge/sdk";
import type { Utxo } from "cashscript";
import type { TokenUtxo } from "../src/builders.ts";
import { roundContracts } from "../src/contracts.ts";
import { CASHSCRIPT, type TestKit } from "./kits.ts";

export const fixtures = (file: string): PriceMessage[] =>
  sortPrices(
    (
      JSON.parse(readFileSync(join(import.meta.dirname, "fixtures", file), "utf8")) as {
        feed: FeedId;
        messages: never[];
      }
    ).messages,
  );

export interface Player {
  name: string;
  key: Uint8Array;
  pkh: Uint8Array;
  lockingBytecode: string;
}

export function player(name: string): Player {
  const key = generatePrivateKey();
  const pkh = hash160(secp256k1.derivePublicKeyCompressed(key) as Uint8Array);
  return { name, key, pkh, lockingBytecode: binToHex(encodeLockingBytecodeP2pkh(pkh)) };
}

const randomHex = (bytes: number) => binToHex(crypto.getRandomValues(new Uint8Array(bytes)));

export interface RoundSetup {
  asset?: AssetId;
  mode?: OpenRound["mode"];
  outcomes?: number;
  boundaries?: number[];
  gates?: number;
  stakeClass?: StakeClass;
  lockTime: number;
  closeTime: number;
  creatorFeeBps?: number;
  minPot?: bigint;
  minEntrants?: number;
  budget?: bigint;
  /** Satoshis each gate starts with (attack tests start a gate near its cap). */
  gateValue?: bigint;
}

export const GATE_DUST = 1_000n;
export const DEFAULT_BUDGET = 20_000n;

export async function newRound(setup: RoundSetup, testKit: TestKit = CASHSCRIPT) {
  const provider = testKit.newProvider();
  const creator = player("creator");
  const protocol = player("protocol");
  const category = randomHex(32);
  const contracts = roundContracts({
    category,
    provider,
    protocolLockingBytecode: protocol.lockingBytecode,
    kit: testKit.kit,
  });
  const outcomes = setup.outcomes ?? 2;
  const gates = setup.gates ?? 2;
  const open: OpenRound = {
    roundId: 1,
    asset: setup.asset ?? "BTC",
    mode: setup.mode ?? "updown",
    outcomes,
    gates,
    lockTime: setup.lockTime,
    closeTime: setup.closeTime,
    creatorFeeBps: setup.creatorFeeBps ?? 100,
    creatorPkh: creator.pkh,
    minPot: setup.minPot ?? 0n,
    minEntrants: setup.minEntrants ?? 0,
    boundaries: setup.boundaries ?? [],
  };
  const nft = (capability: "mutable" | "minting", commitment: Uint8Array) => ({
    category,
    amount: 0n,
    nft: { capability, commitment: binToHex(commitment) },
  });
  const add = async (address: string, utxo: Utxo) => (await provider.addUtxo(address, utxo)) as TokenUtxo;
  const master = await add(contracts.open.lockingBytecode, {
    ...testKit.randomUtxo({ satoshis: setup.budget ?? DEFAULT_BUDGET }),
    token: nft("mutable", encodeOpen(open)),
  });
  const gateUtxos: TokenUtxo[] = [];
  for (let gateIndex = 0; gateIndex < gates; gateIndex += 1) {
    const state = {
      roundId: 1,
      gateIndex,
      stakeClass: setup.stakeClass ?? "short",
      outcomes,
      entrants: 0,
      totals: Array(outcomes).fill(0n),
    };
    gateUtxos.push(
      await add(state.stakeClass === "event" ? contracts.eventGate.lockingBytecode : contracts.gate.lockingBytecode, {
        ...testKit.randomUtxo({ satoshis: setup.gateValue ?? GATE_DUST }),
        token: nft("minting", encodeGate(state)),
      }),
    );
  }
  return { provider, contracts, testKit, creator, protocol, open, master, gates: gateUtxos };
}

export type Round = Awaited<ReturnType<typeof newRound>>;

/** Gives a player a coin and returns it as a funding input signed by their key. */
export async function fund(round: Round, who: Player, satoshis: bigint) {
  const utxo = await round.provider.addUtxo(who.lockingBytecode, round.testKit.randomUtxo({ satoshis }));
  return { utxo, unlocker: new round.testKit.SignatureTemplate(who.key).unlockP2PKH() };
}

/** Current UTXOs at a contract or player, read back from the mock chain. */
export const utxosAt = async (round: Round, lockingBytecode: string) =>
  (await round.provider.getUtxosForLockingBytecode(lockingBytecode)) as TokenUtxo[];

/** A lock time inside a gap of the fixture, and the close `minutes` later, with every proof the round needs. */
export function boundaries(prices: PriceMessage[], lockIndex: number, minutes: number) {
  const previous = prices[lockIndex - 1] as PriceMessage;
  const first = prices[lockIndex] as PriceMessage;
  const lockTime = previous.timestamp + 1;
  const closeTime = lockTime + minutes * 60;
  const lock = findBoundaryPair(prices, lockTime);
  const close = findBoundaryPair(prices, closeTime);
  const strike = findBySequence(prices, first.dataSequence + 1);
  if (!lock || !close || !strike) throw new Error("fixture does not cover this round");
  return { lockTime, closeTime, lock, close, strike };
}

const HEX_CHARS_PER_BYTE = 2;

interface Measurable {
  build(): string | Promise<string>;
  inputs: Array<{ satoshis: bigint }>;
  outputs: Array<{ amount: bigint }>;
}

/** Size and miner fee of a built transaction, for either SDK. */
export async function measure(builder: Measurable) {
  const bytes = (await builder.build()).length / HEX_CHARS_PER_BYTE;
  const fee =
    builder.inputs.reduce((sum, input) => sum + input.satoshis, 0n) -
    builder.outputs.reduce((sum, output) => sum + output.amount, 0n);
  return { bytes, fee };
}

/** Expects the contract to refuse the transaction (sync in CashScript's SDK, async in SolidCash's). */
export async function refused(builder: { debug(): unknown }, reason: RegExp) {
  await (await import("node:assert/strict")).default.rejects(async () => builder.debug(), reason);
}

/** Every gate of the round, wherever it sits: lane gates and event gates are different contracts. */
export const gateUtxos = async (round: Round) => [
  ...(await utxosAt(round, round.contracts.gate.lockingBytecode)),
  ...(await utxosAt(round, round.contracts.eventGate.lockingBytecode)),
];
