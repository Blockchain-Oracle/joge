"use client";

import { deploymentFor, utxosAt } from "@joge/contracts/browser";
import type { Network } from "@joge/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWorld } from "../shell/world.tsx";
import { fulcrum } from "./chain.ts";
import type { WalletKey } from "./keys.ts";
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

/** Addresses watched live (the rest are re-read whenever these change or a round moves). */
const WATCHED_PER_PATH = 3;

/**
 * The wallet's spendable coins, read from Fulcrum (not our database): plain coins as `data`, dollar-token coins as
 * `dollars`. Kept live by Fulcrum's address notifications on
 * the first few receive and change addresses, so a payout or change shows up without polling.
 */
export function useWalletCoins() {
  const network = useWorld();
  const { keys } = useWallet();
  const client = useQueryClient();
  const queryKey = ["coins", network, keys.map((key) => key.pkh).join(",")];
  const dollarCategory = dollarCategoryOf(network);

  const query = useQuery({
    queryKey,
    enabled: keys.length > 0,
    queryFn: async (): Promise<WalletCoin[]> => {
      const pool = await fulcrum(network);
      const lists = await Promise.all(
        keys.map(async (key) =>
          // Plain coins, and the dollar token (dollar events stake it); no other token is ever spent from here.
          (await utxosAt(pool, key.lockingBytecode))
            .filter(
              (coin) => !coin.token || (dollarCategory && coin.token.category === dollarCategory && !coin.token.nft),
            )
            .map((coin) => ({ ...coin, key })),
        ),
      );
      return lists.flat();
    },
  });

  const watchKey = keys
    .filter((key) => key.index < WATCHED_PER_PATH)
    .map((key) => key.pkh)
    .join(",");
  useEffect(() => {
    if (!watchKey) return;
    let cancelled = false;
    const stops: Array<() => Promise<void>> = [];
    void (async () => {
      const pool = await fulcrum(network);
      const { scripthashOf } = await import("@joge/contracts/browser");
      for (const pkh of watchKey.split(",")) {
        if (cancelled) return;
        const stop = await pool.subscribe("blockchain.scripthash.subscribe", [scripthashOf(`76a914${pkh}88ac`)], () =>
          client.invalidateQueries({ queryKey: ["coins", network] }),
        );
        stops.push(stop);
      }
    })();
    return () => {
      cancelled = true;
      for (const stop of stops) void stop();
    };
  }, [watchKey, network, client]);

  const all = query.data ?? [];
  const plain = all.filter((coin) => !coin.token);
  const dollars = all.filter((coin) => coin.token);
  const balance = plain.reduce((sum, coin) => sum + coin.satoshis, 0n);
  /** Dollar-token units (cents) the wallet holds. */
  const dollarBalance = dollars.reduce((sum, coin) => sum + (coin.token?.amount ?? 0n), 0n);
  return { ...query, data: query.data ? plain : undefined, dollars, balance, dollarBalance };
}
