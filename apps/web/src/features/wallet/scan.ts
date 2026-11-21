import { type Fulcrum, scripthashOf } from "@joge/contracts/browser";
import { GAP_LIMIT, MAX_SCAN_PER_PATH, PATHS, type PathName, type WalletKey } from "./keys.ts";

/** Fresh addresses kept past each path's last used one: where the wallet puts its next deposit. */
const AHEAD = 3;

/** Addresses seen used once stay used: later scans skip asking about them. */
const knownUsed = new Set<string>();

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

export interface WalletScan {
  /** Every address the wallet has used, on every path. */
  used: WalletKey[];
  /** The fresh addresses just past each path's last used one. */
  ahead: WalletKey[];
}

/**
 * The whole HD wallet, not its first addresses: each path is read in batches until GAP_LIMIT unused addresses in a
 * row, the way the wallet itself discovers its coins.
 */
export async function scanWallet(
  pool: Fulcrum,
  keyAt: (path: PathName, index: number) => WalletKey | null,
): Promise<WalletScan> {
  const paths = await Promise.all(
    PATHS.map(async ({ name }) => {
      const used: WalletKey[] = [];
      let lastUsed = -1;
      let unused = 0;
      for (let start = 0; unused < GAP_LIMIT && start < MAX_SCAN_PER_PATH; start += GAP_LIMIT) {
        const batch = Array.from({ length: GAP_LIMIT }, (_, offset) => keyAt(name, start + offset)).filter(
          (key): key is WalletKey => key !== null,
        );
        if (batch.length === 0) break;
        const seen = await Promise.all(batch.map((key) => everUsed(pool, key.lockingBytecode)));
        batch.forEach((key, at) => {
          if (seen[at]) {
            used.push(key);
            lastUsed = key.index;
            unused = 0;
          } else unused += 1;
        });
      }
      const ahead = Array.from({ length: AHEAD }, (_, offset) => keyAt(name, lastUsed + 1 + offset)).filter(
        (key): key is WalletKey => key !== null,
      );
      return { used, ahead };
    }),
  );
  return { used: paths.flatMap((path) => path.used), ahead: paths.flatMap((path) => path.ahead) };
}
