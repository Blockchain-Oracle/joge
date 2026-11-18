import { binToHex, hexToBin } from "@bitauth/libauth";
import { FINAL_SEQUENCE, type PriceMessage, TIMEOUT_SEQUENCE } from "@joge/sdk";
import type { SpendableUtxo, Unlocker } from "cashscript";
import type { RoundContracts } from "../contracts.ts";

const P2PKH_PREFIX = "76a914";
const P2PKH_SUFFIX = "88ac";
export const p2pkh = (pkh: Uint8Array): Uint8Array => hexToBin(`${P2PKH_PREFIX}${binToHex(pkh)}${P2PKH_SUFFIX}`);

export type TokenUtxo = SpendableUtxo & {
  token: NonNullable<SpendableUtxo["token"]> & { nft: { capability: string; commitment: string } };
};

export const commitment = (utxo: TokenUtxo): string => utxo.token.nft.commitment;

export const nft = (category: string, capability: "none" | "mutable" | "minting", bytes: Uint8Array) => ({
  category,
  amount: 0n,
  nft: { capability, commitment: binToHex(bytes) },
});

/** Lifecycle inputs take this sequence: one valid variant per transaction (see rules.cash). */
export const final = { sequence: FINAL_SEQUENCE };
/** Timeout paths need a non-final sequence so the node enforces their locktime. */
export const timeout = { sequence: TIMEOUT_SEQUENCE };

/**
 * The lock burns every gate's minting NFT and the sweep burns tickets (and the master after the last one), on purpose.
 * SolidCash's SDK refuses an NFT burn unless told; CashScript's ignores the option.
 */
export const BURNS_NFTS = { allowImplicitNftBurn: true } as Record<string, unknown>;

/** Canonical batch order: ascending outpoint, so two clients build the same sweep. */
export const byOutpoint = (a: SpendableUtxo, b: SpendableUtxo) =>
  a.txid === b.txid ? a.vout - b.vout : a.txid < b.txid ? -1 : 1;

/** Lane gates and event gates are different contracts over the same category; pick the one this UTXO sits at. */
export const gateContractOf = (contracts: RoundContracts, gate: SpendableUtxo) =>
  gate.lockingBytecode === contracts.eventGate.lockingBytecode ? contracts.eventGate : contracts.gate;

export interface Funding {
  utxo: SpendableUtxo;
  unlocker: Unlocker;
}

export interface BoundaryProof {
  previous: PriceMessage;
  first: PriceMessage;
}
