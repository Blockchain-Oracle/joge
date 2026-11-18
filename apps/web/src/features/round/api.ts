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

/** Where a transaction can be seen on a public explorer. */
export const EXPLORER: Record<Network, string> = {
  chipnet: "https://chipnet.imaginary.cash/tx/",
  mainnet: "https://explorer.bch.ninja/tx/",
};

/** Where an address can be seen on a public explorer. */
export const ADDRESS_EXPLORER: Record<Network, string> = {
  chipnet: "https://chipnet.imaginary.cash/address/",
  mainnet: "https://explorer.bch.ninja/address/",
};
