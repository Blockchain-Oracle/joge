"use client";

import { binToHex, decodeTransaction, hexToBin } from "@bitauth/libauth";
import { deploymentFor, scripthashOf, type utxosAt } from "@joge/contracts/browser";
import type { Network } from "@joge/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWorld } from "../shell/world.tsx";
import { fulcrum } from "./chain.ts";
import type { WalletKey } from "./keys.ts";
import { readWallet } from "./scan.ts";
import { useWallet } from "./wallet-context.tsx";

/** A plain coin the wallet holds, with the key that signs it. */
export type WalletCoin = Awaited<ReturnType<typeof utxosAt>>[number] & { key: WalletKey };

/** The dollar token of a world's deployment, or undefined before that world has one (mainnet until its genesis). */
function dollarCategoryOf(network: Network): string | undefined {
  try {
    return deploymentFor(network).dollarCategory;
  } catch {
    return undefined;
  }
}

/** The first addresses of each path, always watched (payouts and the page's own change land there). */
const WATCHED_PER_PATH = 3;
/** At most this many address subscriptions per wallet. */
const MAX_WATCHED = 40;
/** A read that has not finished by now fails (and offers Try again) rather than spinning. */
const READ_TIMEOUT_MS = 15_000;

/**
 * Coins this page just spent (txid:vout), left out of every list until a read no longer finds them. The read after a
 * spend lands a moment later; a tap in between would otherwise build on a spent coin and be refused (his report:
 * "Not entered" on every tap after the first).
 */
const spent = new Set<string>();
const outpoint = (txid: string, vout: number) => `${txid}:${vout}`;

/** Records the coins a signed transaction spends, so the next one never reuses them. */
export function markSpent(signedHex: string) {
  const transaction = decodeTransaction(hexToBin(signedHex));
  if (typeof transaction === "string") return;
  for (const input of transaction.inputs)
    spent.add(outpoint(binToHex(input.outpointTransactionHash), input.outpointIndex));
}

interface Scan {
  coins: WalletCoin[];
  /** Addresses whose changes refresh the coins live. */
  watch: string[];
}

/**
 * The wallet's spendable coins, read from Fulcrum (not our database): plain coins as `data`, dollar-token coins as
 * `dollars`. The whole wallet is read, not its first addresses: each path is scanned to the gap limit, so coins on
 * any deposit or change address count. Kept live by Fulcrum's address notifications on the first addresses, every
 * address holding coins and the next fresh ones, so a payout, a spend or a deposit shows up without polling.
 */
export function useWalletCoins() {
  const network = useWorld();
  const { keys, keyAt } = useWallet();
  const client = useQueryClient();
  const queryKey = ["coins", network, keys.map((key) => key.pkh).join(",")];
  const dollarCategory = dollarCategoryOf(network);

  const query = useQuery({
    queryKey,
    enabled: keys.length > 0,
    // One quick retry, then "Couldn't read your wallet · Try again" instead of a long silent wait.
    retry: 1,
    queryFn: async (): Promise<Scan> => {
      const read = await Promise.race([
        fulcrum(network).then((pool) => readWallet(pool, keyAt)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Reading your wallet took too long")), READ_TIMEOUT_MS),
        ),
      ]);
      // Plain coins, and the dollar token (dollar events stake it); no other token is ever spent from here.
      const coins = read.holdings.flatMap(({ key, utxos }) =>
        utxos
          .filter(
            (coin) => !coin.token || (dollarCategory && coin.token.category === dollarCategory && !coin.token.nft),
          )
          .map((coin) => ({ ...coin, key })),
      );
      // A spend this page made has landed once the read no longer finds its coin.
      const found = new Set(coins.map((coin) => outpoint(coin.txid, coin.vout)));
      for (const each of spent) if (!found.has(each)) spent.delete(each);
      const first = keys.filter((key) => key.index < WATCHED_PER_PATH);
      const holding = coins.map((coin) => coin.key);
      const watch = [...new Set([...first, ...read.ahead, ...holding].map((key) => key.lockingBytecode))].slice(
        0,
        MAX_WATCHED,
      );
      return { coins, watch };
    },
  });

  const watchKey = (query.data?.watch ?? []).join(",");
  useEffect(() => {
    if (!watchKey) return;
    let cancelled = false;
    const stops: Array<() => Promise<void>> = [];
    void (async () => {
      const pool = await fulcrum(network);
      for (const lockingBytecode of watchKey.split(",")) {
        if (cancelled) return;
        // The subscription answers at once with the address's current state, which the scan already read; only a
        // change after that refreshes the coins (40 instant answers would otherwise restart the scan 40 times).
        let current = true;
        const stop = await pool.subscribe("blockchain.scripthash.subscribe", [scripthashOf(lockingBytecode)], () => {
          if (!current) void client.invalidateQueries({ queryKey: ["coins", network] });
        });
        current = false;
        stops.push(stop);
      }
    })();
    return () => {
      cancelled = true;
      for (const stop of stops) void stop();
    };
  }, [watchKey, network, client]);

  const all = (query.data?.coins ?? []).filter((coin) => !spent.has(outpoint(coin.txid, coin.vout)));
  const plain = all.filter((coin) => !coin.token);
  const dollars = all.filter((coin) => coin.token);
  const balance = plain.reduce((sum, coin) => sum + coin.satoshis, 0n);
  /** Dollar-token units (cents) the wallet holds. */
  const dollarBalance = dollars.reduce((sum, coin) => sum + (coin.token?.amount ?? 0n), 0n);
  return { ...query, data: query.data ? plain : undefined, dollars, balance, dollarBalance };
}
