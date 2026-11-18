import type { AssetId, FeedId } from "@joge/sdk";
import type { Network, RoundState, TxKind } from "./schema.ts";

/**
 * Postgres LISTEN/NOTIFY channels: the engine writes a row, then notifies; the web app's one SSE endpoint listens and
 * fans out to browsers. Payloads stay tiny (NOTIFY caps them at 8,000 bytes): clients refetch details by id.
 */
export const CHANNEL = {
  oracle: "joge_oracle",
  price: "joge_price",
  round: "joge_round",
  agent: "joge_agent",
} as const;

export type Channel = (typeof CHANNEL)[keyof typeof CHANNEL];

/** A new signed oracle print. */
export interface OracleNotice {
  feed: FeedId;
  dataSequence: number;
  timestamp: number;
  price: number;
}

/** The indicative live price (coalesced to at most one per second per asset). */
export interface PriceNotice {
  asset: AssetId;
  price: number;
  /** Unix milliseconds. */
  at: number;
}

/** A round changed: a new round, an entry, a lock, a settle or a sweep. */
export interface RoundNotice {
  network: Network;
  roundId: number;
  state: RoundState;
  kind: TxKind;
  txid: string;
}

export interface NoticeOf {
  [CHANNEL.oracle]: OracleNotice;
  [CHANNEL.price]: PriceNotice;
  [CHANNEL.round]: RoundNotice;
  [CHANNEL.agent]: AgentNotice;
}

/** An agent read a round: its page and the agents list refetch. */
export interface AgentNotice {
  network: Network;
  agentId: number;
  roundId: number;
  verdict: "enter" | "hold";
}
