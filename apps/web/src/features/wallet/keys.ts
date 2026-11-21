import { binToHex, decodeCashAddress, encodeCashAddress, hash160 } from "@bitauth/libauth";
import type { Network } from "@joge/db";

/** HD paths WizardConnect wallets share (hdwalletv1): child 0 receive, child 1 change. */
export const PATHS = [
  { name: "receive", child: 0 },
  { name: "change", child: 1 },
] as const;
export type PathName = (typeof PATHS)[number]["name"];

/** How many addresses per path the page derives up front (payout, change, the address lists sent to our server). */
export const ADDRESSES_PER_PATH = 10;

/**
 * Unused addresses in a row that end the coin scan of a path: the standard BIP-44 gap limit, the one Cashonize and
 * Electron Cash use. HD wallets take a fresh address for every deposit and every change output, so a busy wallet
 * holds its coins far past the first few (Jeremy's report: a paired Cashonize read as empty).
 */
export const GAP_LIMIT = 20;

/** Never scan further than this into one path, however busy the wallet. */
export const MAX_SCAN_PER_PATH = 2_000;

type GetPubkey = (child: number, index: bigint) => Uint8Array | undefined;
type Path = (typeof PATHS)[number];

/** One address of the wallet, derived from the key it shared (null if the wallet did not share that path). */
export function walletKey(getPubkey: GetPubkey, path: Path, index: number, network: Network): WalletKey | null {
  const pubkey = getPubkey(path.child, BigInt(index));
  if (!pubkey) return null;
  const pkhBytes = hash160(pubkey);
  const pkh = binToHex(pkhBytes);
  return {
    path: path.name,
    index,
    pubkey,
    pkh,
    address: encodeCashAddress({ prefix: cashPrefix(network), type: "p2pkh", payload: pkhBytes }).address,
    lockingBytecode: `76a914${pkh}88ac`,
  };
}

export interface WalletKey {
  path: PathName;
  index: number;
  pubkey: Uint8Array;
  pkh: string;
  address: string;
  lockingBytecode: string;
}

export const cashPrefix = (network: Network) => (network === "mainnet" ? "bitcoincash" : "bchtest");

/**
 * The token-aware form of a P2PKH cash address (the same key, a "z…" address): wallets send CashTokens such as PUSD
 * only to these. Returns the address unchanged if it cannot be read.
 */
export function tokenAddress(address: string): string {
  const decoded = decodeCashAddress(address);
  if (typeof decoded === "string") return address;
  return encodeCashAddress({ prefix: decoded.prefix, type: "p2pkhWithTokens", payload: decoded.payload }).address;
}

/** The wallet's addresses from the keys it shared (the dapp derives them; the wallet never sends addresses). */
export function walletKeys(getPubkey: GetPubkey, network: Network): WalletKey[] {
  return PATHS.flatMap((path) =>
    Array.from({ length: ADDRESSES_PER_PATH }, (_, index) => walletKey(getPubkey, path, index, network)).filter(
      (key): key is WalletKey => key !== null,
    ),
  );
}
