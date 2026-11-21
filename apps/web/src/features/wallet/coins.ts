"use client";

import { deploymentFor, scripthashOf, utxosAt } from "@joge/contracts/browser";
import type { Network } from "@joge/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWorld } from "../shell/world.tsx";
import { fulcrum } from "./chain.ts";
import type { WalletKey } from "./keys.ts";
import { scanWallet } from "./scan.ts";
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
    queryFn: async (): Promise<Scan> => {
      const pool = await fulcrum(network);
      const scan = await scanWallet(pool, keyAt);
      const lists = await Promise.all(
        scan.used.map(async (key) =>
          // Plain coins, and the dollar token (dollar events stake it); no other token is ever spent from here.
          (await utxosAt(pool, key.lockingBytecode))
            .filter(
              (coin) => !coin.token || (dollarCategory && coin.token.category === dollarCategory && !coin.token.nft),
            )
            .map((coin) => ({ ...coin, key })),
        ),
      );
      const coins = lists.flat();
      const first = keys.filter((key) => key.index < WATCHED_PER_PATH);
      const holding = coins.map((coin) => coin.key);
      const watch = [...new Set([...first, ...scan.ahead, ...holding].map((key) => key.lockingBytecode))].slice(
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

  const all = query.data?.coins ?? [];
  const plain = all.filter((coin) => !coin.token);
  const dollars = all.filter((coin) => coin.token);
  const balance = plain.reduce((sum, coin) => sum + coin.satoshis, 0n);
  /** Dollar-token units (cents) the wallet holds. */
  const dollarBalance = dollars.reduce((sum, coin) => sum + (coin.token?.amount ?? 0n), 0n);
  return { ...query, data: query.data ? plain : undefined, dollars, balance, dollarBalance };
}
