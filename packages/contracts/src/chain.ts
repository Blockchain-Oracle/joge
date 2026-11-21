import { binToHex, decodeTransaction, hexToBin, sha256 } from "@bitauth/libauth";
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
/** How long a read on every server waits for the rest once one has answered. */
const EVERY_SERVER_GRACE_MS = 4_000;
/** How many generations of missing parents a lagging server is caught up on after one broadcast. */
const CATCH_UP_DEPTH = 50;
/** A server's refusal for a parent it has not seen (BCHN: "bad-txns-inputs-missingorspent", "Missing inputs"). */
const MISSING_INPUTS = /missing ?inputs|inputs-missingorspent/i;

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

/** Every server behind a pool (the pool itself when it has only one). */
export function serversOf(fulcrum: Fulcrum): Fulcrum[] {
  const servers = (fulcrum as unknown as { transports?: Fulcrum[] }).transports;
  return servers && servers.length > 1 ? servers : [fulcrum];
}

/**
 * One read on every server at once: the answers that came back (all of them, or those in by `graceMs` after the
 * first, so a slow or down server never holds the read up), the refusals, and how many servers had not answered.
 */
export function fromEveryServer<T>(
  fulcrum: Fulcrum,
  read: (server: Fulcrum) => Promise<T>,
  graceMs = EVERY_SERVER_GRACE_MS,
): Promise<{ answers: T[]; errors: unknown[]; silent: number }> {
  const servers = serversOf(fulcrum);
  return new Promise((resolve) => {
    const answers: T[] = [];
    const errors: unknown[] = [];
    let silent = servers.length;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      clearTimeout(timer);
      resolve({ answers: [...answers], errors: [...errors], silent });
    };
    for (const server of servers) {
      read(server).then(
        (value) => {
          answers.push(value);
          silent -= 1;
          if (silent === 0) finish();
          else if (answers.length === 1) timer = setTimeout(finish, graceMs);
        },
        (error: unknown) => {
          errors.push(error);
          silent -= 1;
          if (silent === 0) finish();
        },
      );
    }
  });
}

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error);

/**
 * Sends a transaction to every server in the pool at once and returns at the first that takes it. Chipnet nodes pass
 * unconfirmed transactions on poorly: one sent to a single server stayed unknown to the others, so explorers built on
 * them said "Failed to load transaction" until it was mined, and the next transaction spending it was refused there
 * ("Missing inputs"). A server that refuses for missing inputs while another takes it is then caught up in the
 * background: it is handed the parents it lacks, oldest first, and the transaction again. (21 Nov: one keeper coin
 * that never reached chipnet.imaginary.cash left ten hours of chipnet unmined, held by one server only.)
 */
export async function broadcast(fulcrum: Fulcrum, hex: string): Promise<string> {
  const servers = serversOf(fulcrum);
  const send = (server: Fulcrum) => server.request("blockchain.transaction.broadcast", [hex]) as Promise<string>;
  if (servers.length < 2) return send(fulcrum);
  const attempts = servers.map(send);
  let txid: string;
  try {
    txid = await Promise.any(attempts);
  } catch (error) {
    // Every server refused: the first server's own reason (a conflict, missing inputs) is the one to show.
    throw error instanceof AggregateError ? error.errors[0] : error;
  }
  void Promise.allSettled(attempts).then((results) => {
    const holder = servers[results.findIndex((result) => result.status === "fulfilled")];
    if (!holder) return;
    results.forEach((result, index) => {
      const lagging = servers[index];
      if (lagging && result.status === "rejected" && MISSING_INPUTS.test(messageOf(result.reason)))
        void catchUp(holder, lagging, hex).catch(() => undefined);
    });
  });
  return txid;
}

/** Hands `lagging` the unconfirmed ancestors of a transaction it lacks, from `holder`, parents first, then the transaction. */
async function catchUp(holder: Fulcrum, lagging: Fulcrum, hex: string) {
  const ordered: string[] = [];
  const looked = new Set<string>();
  const visit = async (txHex: string, depth: number): Promise<void> => {
    if (depth > CATCH_UP_DEPTH) throw new Error("ancestry too deep to catch up");
    const tx = decodeTransaction(hexToBin(txHex));
    if (typeof tx === "string") return;
    for (const input of tx.inputs) {
      const parent = binToHex(input.outpointTransactionHash);
      if (looked.has(parent)) continue;
      looked.add(parent);
      const known = await lagging.request("blockchain.transaction.get_height", [parent]).then(
        () => true,
        () => false,
      );
      if (!known)
        await visit((await holder.request("blockchain.transaction.get", [parent, false])) as string, depth + 1);
    }
    ordered.push(txHex);
  };
  await visit(hex, 0);
  for (const each of ordered) await lagging.request("blockchain.transaction.broadcast", [each]).catch(() => undefined);
}

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
