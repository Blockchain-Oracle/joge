import { type Fulcrum, type ListedUtxo, scripthashOf, utxosAt } from "@joge/contracts/browser";
import { GAP_LIMIT, MAX_SCAN_PER_PATH, PATHS, type PathName, type WalletKey } from "./keys.ts";

/** Fresh addresses kept past each path's last used one: where the wallet puts its next deposit. */
const AHEAD = 3;

/** Addresses seen used once stay used: later reads skip asking about them. */
const knownUsed = new Set<string>();
/** Each path's last used address at the previous read (keyed by the path's first address): re-reads start there. */
const lastUsedOf = new Map<string, number>();

/** Has this address ever held a coin (confirmed or in the mempool)? */
async function everUsed(pool: Fulcrum, lockingBytecode: string): Promise<boolean> {
  if (knownUsed.has(lockingBytecode)) return true;
  const hash = scripthashOf(lockingBytecode);
  const used = await pool
    .request("blockchain.scripthash.get_first_use", [hash])
    .then((first) => first !== null)
    // A server without Fulcrum's first-use call answers the same question with the address's history.
    .catch(async () => ((await pool.request("blockchain.scripthash.get_history", [hash])) as unknown[]).length > 0);
  if (used) knownUsed.add(lockingBytecode);
  return used;
}

export interface Holding {
  key: WalletKey;
  utxos: ListedUtxo[];
}

export interface WalletRead {
  /** The addresses holding coins, with their coins. */
  holdings: Holding[];
  /** The fresh addresses just past each path's last used one. */
  ahead: WalletKey[];
}

type KeyAt = (path: PathName, index: number) => WalletKey | null;

/**
 * One path of the wallet, read the way the wallet itself discovers it: addresses are checked until GAP_LIMIT unused
 * ones in a row follow the last used one. Built for one round trip on most wallets (measured: the old 20-address read
 * took ~350 ms, a batch-by-batch scan ~1,030 ms): the first window covers two gaps past the last address used at the
 * previous read, and coins are read in the same burst wherever they are likely (addresses already known used, and the
 * first gap); only a used address found further out costs one more round trip.
 */
async function readPath(pool: Fulcrum, keyAt: KeyAt, name: PathName): Promise<WalletRead> {
  const first = keyAt(name, 0);
  if (!first) return { holdings: [], ahead: [] };
  const reads = new Map<number, Promise<Holding>>();
  const read = (key: WalletKey) => {
    if (!reads.has(key.index))
      reads.set(
        key.index,
        utxosAt(pool, key.lockingBytecode).then((utxos) => ({ key, utxos })),
      );
  };
  let lastUsed = -1;
  let from = 0;
  let to = (lastUsedOf.get(first.lockingBytecode) ?? -1) + 1 + 2 * GAP_LIMIT;
  while (from < to && from < MAX_SCAN_PER_PATH) {
    const keys = Array.from({ length: to - from }, (_, offset) => keyAt(name, from + offset)).filter(
      (key): key is WalletKey => key !== null,
    );
    if (keys.length === 0) break;
    for (const key of keys) if (key.index < GAP_LIMIT || knownUsed.has(key.lockingBytecode)) read(key);
    const seen = await Promise.all(keys.map((key) => everUsed(pool, key.lockingBytecode)));
    keys.forEach((key, at) => {
      if (!seen[at]) return;
      lastUsed = key.index;
      read(key);
    });
    from = to;
    to = Math.min(lastUsed + 1 + GAP_LIMIT, MAX_SCAN_PER_PATH);
  }
  lastUsedOf.set(first.lockingBytecode, lastUsed);
  const holdings = (await Promise.all(reads.values())).filter((holding) => holding.utxos.length > 0);
  const ahead = Array.from({ length: AHEAD }, (_, offset) => keyAt(name, lastUsed + 1 + offset)).filter(
    (key): key is WalletKey => key !== null,
  );
  return { holdings, ahead };
}

/** The whole HD wallet, every path at once: where its coins are, and where its next deposit will land. */
export async function readWallet(pool: Fulcrum, keyAt: KeyAt): Promise<WalletRead> {
  const paths = await Promise.all(PATHS.map(({ name }) => readPath(pool, keyAt, name)));
  return { holdings: paths.flatMap((path) => path.holdings), ahead: paths.flatMap((path) => path.ahead) };
}
