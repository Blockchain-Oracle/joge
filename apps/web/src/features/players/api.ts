import { binToHex, decodeCashAddress, encodeCashAddress, hexToBin } from "@bitauth/libauth";
import type { Network, PlayerDay, PlayerTotals } from "@joge/db";
import { queryOptions } from "@tanstack/react-query";
import type { TicketRow } from "../portfolio/ticket-row.tsx";
import { cashPrefix } from "../wallet/keys.ts";

export type Period = "day" | "week" | "all";

export interface ProfileResponse {
  pkh: string;
  totals: PlayerTotals | null;
  rank: number | null;
  streak: number;
  bestStreak: number;
  days: PlayerDay[];
  tickets: TicketRow[];
}

const json = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return (await response.json()) as T;
};

/** The best players of a period, by money won (refreshed when a round settles: LiveSync invalidates "players"). */
export const leaderboardQuery = (network: Network, period: Period) =>
  queryOptions({
    queryKey: ["players", network, "board", period],
    queryFn: () =>
      json<{ players: PlayerTotals[] }>(`/api/leaderboard?network=${network}&period=${period}`).then(
        (body) => body.players,
      ),
  });

export const profileQuery = (network: Network, pkh: string) =>
  queryOptions({
    queryKey: ["players", network, "profile", pkh],
    queryFn: () => json<ProfileResponse>(`/api/players/${pkh}?network=${network}`),
  });

const PKH = /^[0-9a-f]{40}$/;

/** A player's address for display and links ("qz3f…" without the prefix in URLs). */
export const addressOf = (network: Network, pkh: string) =>
  encodeCashAddress({ prefix: cashPrefix(network), type: "p2pkh", payload: hexToBin(pkh) }).address;
export const bareAddress = (address: string) => address.split(":").pop() ?? address;
export const profileHref = (network: Network, pkh: string) => `/u/${bareAddress(addressOf(network, pkh))}`;

/** The payout key hash behind a profile URL: a bare or prefixed P2PKH address, or the 40-hex hash itself. */
export function pkhOf(network: Network, value: string): string | null {
  const lower = decodeURIComponent(value).toLowerCase();
  if (PKH.test(lower)) return lower;
  const decoded = decodeCashAddress(lower.includes(":") ? lower : `${cashPrefix(network)}:${lower}`);
  if (typeof decoded === "string" || decoded.type !== "p2pkh") return null;
  return binToHex(decoded.payload);
}
