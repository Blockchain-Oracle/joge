import { binToHex, decodeTransaction, hashTransaction, hexToBin } from "@bitauth/libauth";
import type { ContractName } from "@joge/contracts";

export interface DecodedOutput {
  vout: number;
  lockingBytecode: string;
  value: number;
  /** Set when the output holds a category-K token at one of our covenants. */
  contract?: ContractName;
  commitment?: string;
  /** Set when the output holds the dollar token (a dollar event's sidecar, payout, refund or fee): units (cents). */
  dollars?: number;
}

export interface DecodedTx {
  txid: string;
  hex: string;
  locktime: number;
  /** Spent outpoints as `txid:vout`. */
  inputs: string[];
  outputs: DecodedOutput[];
}

export const outpointOf = (txid: string, vout: number) => `${txid}:${vout}`;

/**
 * Decodes a raw transaction and marks each output holding a category-K NFT at one of our covenants. libauth keeps
 * outpoint hashes and token categories in display byte order, as Fulcrum and explorers show them.
 */
export function decodeTx(
  hex: string,
  category: string,
  contracts: Map<string, ContractName>,
  dollarCategory?: string,
): DecodedTx {
  const bin = hexToBin(hex);
  const decoded = decodeTransaction(bin);
  if (typeof decoded === "string") throw new Error(`undecodable transaction: ${decoded}`);
  return {
    txid: hashTransaction(bin),
    hex,
    locktime: decoded.locktime,
    inputs: decoded.inputs.map((input) => outpointOf(binToHex(input.outpointTransactionHash), input.outpointIndex)),
    outputs: decoded.outputs.map((output, vout) => {
      const lockingBytecode = binToHex(output.lockingBytecode);
      const contract = contracts.get(lockingBytecode);
      const ours = output.token?.nft && binToHex(output.token.category) === category && contract;
      const dollars =
        output.token && !output.token.nft && dollarCategory && binToHex(output.token.category) === dollarCategory
          ? Number(output.token.amount)
          : undefined;
      return {
        vout,
        lockingBytecode,
        value: Number(output.valueSatoshis),
        ...(ours && output.token?.nft ? { contract, commitment: binToHex(output.token.nft.commitment) } : {}),
        ...(dollars === undefined ? {} : { dollars, ...(contract === "dollarSide" ? { contract } : {}) }),
      };
    }),
  };
}
