"use client";

import type { FaucetState } from "@joge/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWorld } from "../shell/world.tsx";
import { useWallet } from "../wallet/wallet-context.tsx";

/** What the faucet says about this wallet's latest claim (null state: never asked). */
export interface FaucetView {
  state: FaucetState | null;
  sats: number | null;
  txid: string | null;
  /** When the address may ask again (after a paid claim). */
  nextAt: number | null;
  error?: string;
}

/**
 * A wallet counts as funded past the faucet's top-up threshold (FAUCET_THRESHOLD_SATS in @joge/db, about $1), so a
 * near-empty wallet is still offered the free coins (his test: $0.13 counted as funded and he never got them).
 */
export const FUNDED_SATS = 500_000n;

const POLL_MS = 2_000;
const url = (address?: string) =>
  `/api/faucet?network=chipnet${address ? `&address=${encodeURIComponent(address)}` : ""}`;

/**
 * Chipnet test coins for the paired wallet (S09R): one tap asks, the engine pays within seconds; while it is on its
 * way the claim is polled. Only on chipnet (the route does not exist on mainnet).
 */
export function useFaucet() {
  const world = useWorld();
  const { payout } = useWallet();
  const address = world === "chipnet" ? payout?.address : undefined;
  const client = useQueryClient();
  const key = ["faucet", address];
  const query = useQuery({
    queryKey: key,
    enabled: Boolean(address),
    queryFn: async (): Promise<FaucetView> => (await fetch(url(address))).json(),
    refetchInterval: (current) => (current.state.data?.state === "pending" ? POLL_MS : false),
  });
  const ask = useMutation({
    mutationFn: async (): Promise<FaucetView> => {
      const response = await fetch(url(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address }),
      });
      return response.json();
    },
    onSuccess: (view) => {
      client.setQueryData(key, view);
      // Coins arrive through the wallet's own address subscription; this only makes the first read sooner.
      if (view.state === "pending") void client.invalidateQueries({ queryKey: key });
    },
  });
  return {
    available: Boolean(address),
    view: query.data ?? null,
    asking: ask.isPending,
    claim: () => ask.mutate(),
  };
}
