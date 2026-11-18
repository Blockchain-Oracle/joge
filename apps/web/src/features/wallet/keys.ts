import { binToHex, decodeCashAddress, encodeCashAddress, hash160 } from "@bitauth/libauth";
import type { Network } from "@joge/db";

/** HD paths WizardConnect wallets share (hdwalletv1): child 0 receive, child 1 change. */
export const PATHS = [
  { name: "receive", child: 0 },
  { name: "change", child: 1 },
] as const;
export type PathName = (typeof PATHS)[number]["name"];

/** How many addresses per path the page scans for coins. */
export const ADDRESSES_PER_PATH = 10;

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
export function walletKeys(
  getPubkey: (child: number, index: bigint) => Uint8Array | undefined,
  network: Network,
): WalletKey[] {
  return PATHS.flatMap((path) =>
    Array.from({ length: ADDRESSES_PER_PATH }, (_, index) => index).flatMap((index): WalletKey[] => {
      const pubkey = getPubkey(path.child, BigInt(index));
      if (!pubkey) return [];
      const pkhBytes = hash160(pubkey);
      const pkh = binToHex(pkhBytes);
      return [
        {
          path: path.name,
          index,
          pubkey,
          pkh,
          address: encodeCashAddress({ prefix: cashPrefix(network), type: "p2pkh", payload: pkhBytes }).address,
          lockingBytecode: `76a914${pkh}88ac`,
        },
      ];
    }),
  );
}
