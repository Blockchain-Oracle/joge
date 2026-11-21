import type { Network, roundView } from "@joge/db";
import { queryOptions } from "@tanstack/react-query";
import { NOT_FOUND } from "./constants.ts";

export type RoundViewResponse = NonNullable<Awaited<ReturnType<typeof roundView>>>;

export const roundQuery = (network: Network, roundId: number) =>
  queryOptions({
    queryKey: ["round", network, roundId],
    queryFn: async (): Promise<RoundViewResponse | null> => {
      const response = await fetch(`/api/rounds/${roundId}?network=${network}`);
      if (response.status === NOT_FOUND) return null;
      if (!response.ok) throw new Error(`round ${roundId} answered ${response.status}`);
      return (await response.json()) as RoundViewResponse;
    },
  });

/**
 * The public explorer: Selene's, on both worlds. It reads the same servers Jōge sends to, so a transaction shows the
 * moment it is sent, unconfirmed included; the chipnet explorer used before ran on a node that never heard of Jōge's
 * unconfirmed transactions ("Failed to load transaction" until a block, his report).
 */
const EXPLORER_BASE = "https://explorer.selene.cash";

/** A transaction on the public explorer. */
export const txLink = (network: Network, txid: string) => `${EXPLORER_BASE}/tx/${txid}?network=${network}`;

/** An address on the public explorer. */
export const addressLink = (network: Network, address: string) =>
  `${EXPLORER_BASE}/address/${address}?network=${network}`;
