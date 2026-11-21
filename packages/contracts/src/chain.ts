import { binToHex, hexToBin, sha256 } from "@bitauth/libauth";
import { fallback } from "@rpckit/fallback/electrum-cash";
import { webSocket } from "@rpckit/websocket/electrum-cash";
import type { Network as CashScriptNetwork, NetworkProvider, SpendableUtxo } from "cashscript";
import type { Network } from "./deployments.ts";

/** Public Fulcrum servers (WebSocket), checked 2026-11-16. FULCRUM_URLS overrides. */
export const FULCRUM: Record<Network, string[]> = {
  chipnet: ["wss://chipnet.bch.ninja:50004", "wss://chipnet.imaginary.cash:50004"],
  mainnet: ["wss://bch.imaginary.cash:50004", "wss://fulcrum.greyh.at:50004", "wss://bch.loping.net:50004"],
};

const REQUEST_TIMEOUT_MS = 20_000;
const KEEP_ALIVE_MS = 30_000;
const RECONNECT = { delay: 2_000, attempts: 1_000 };
const CLIENT_NAME = "joge-engine";

/** The Electrum calls the engine makes (results are shaped by each caller). */
export interface Fulcrum {
  connect(): Promise<void>;
  close(): Promise<void>;
  request(method: string, params?: unknown[]): Promise<unknown>;
  subscribe(method: string, params: unknown[], onData: (data: unknown) => void): Promise<() => Promise<void>>;
}

/** One connection pool over several Fulcrum servers: health-ranked failover, keep-alive, and subscriptions restored. */
export function connectFulcrum(urls: string[]): Fulcrum {
  const sockets = urls.map((url) =>
    webSocket(url, {
      timeout: REQUEST_TIMEOUT_MS,
      keepAlive: KEEP_ALIVE_MS,
      reconnect: RECONNECT,
      clientName: CLIENT_NAME,
    }),
  );
  const [first, ...rest] = sockets;
  if (!first) throw new Error("no Fulcrum servers configured");
  // eagerConnect: connected as soon as the fastest server is, the rest join in the background. Without it, connect()
  // waited for every server, so one slow or down server (each retries for half an hour) held every read on the page.
  const pool =
    rest.length === 0
      ? first
      : fallback([first, ...rest] as [typeof first, typeof first], { rank: true, eagerConnect: true });
  return pool as unknown as Fulcrum;
}

/** Electrum's address key: sha256 of the locking bytecode, byte-reversed. */
export const scripthashOf = (lockingBytecode: string): string =>
  binToHex(sha256.hash(hexToBin(lockingBytecode)).reverse());

export type ListedUtxo = SpendableUtxo & { lockingBytecode: string; height: number };

/** Unspent coins (tokens included) at a locking bytecode, shaped like CashScript's. */
export async function utxosAt(fulcrum: Fulcrum, lockingBytecode: string): Promise<ListedUtxo[]> {
  const listed = (await fulcrum.request("blockchain.scripthash.listunspent", [
    scripthashOf(lockingBytecode),
    "include_tokens",
  ])) as Array<{
    tx_hash: string;
    tx_pos: number;
    value: number;
    height: number;
    token_data?: {
      amount: string;
      category: string;
      nft?: { capability: "none" | "mutable" | "minting"; commitment: string };
    };
  }>;
  return listed.map((utxo) => ({
    txid: utxo.tx_hash,
    vout: utxo.tx_pos,
    satoshis: BigInt(utxo.value),
    lockingBytecode,
    height: utxo.height,
    ...(utxo.token_data ? { token: { ...utxo.token_data, amount: BigInt(utxo.token_data.amount) } } : {}),
  })) as ListedUtxo[];
}

export const broadcast = async (fulcrum: Fulcrum, hex: string): Promise<string> =>
  (await fulcrum.request("blockchain.transaction.broadcast", [hex])) as string;

/**
 * CashScript's NetworkProvider over the same Fulcrum pool, so contracts and builders need no second connection. The
 * engine builds with `build()` and broadcasts itself; reads go through `utxosAt`.
 */
export function chainProvider(fulcrum: Fulcrum, network: Network): NetworkProvider {
  const lockingBytecodeOf = (address: string): never => {
    throw new Error(`the engine reads by locking bytecode, not address (${address})`);
  };
  return {
    network: network as CashScriptNetwork,
    getUtxos: async (address) => lockingBytecodeOf(address),
    getUtxosForLockingBytecode: (lockingBytecode) =>
      utxosAt(fulcrum, typeof lockingBytecode === "string" ? lockingBytecode : binToHex(lockingBytecode)),
    getBlockHeight: async () =>
      ((await fulcrum.request("blockchain.headers.get_tip", [])) as { height: number }).height,
    getRawTransaction: async (txid) => (await fulcrum.request("blockchain.transaction.get", [txid, false])) as string,
    sendRawTransaction: (hex) => broadcast(fulcrum, hex),
  };
}
