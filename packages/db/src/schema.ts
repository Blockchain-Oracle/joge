import type { AssetId, FeedId, StakeClass } from "@joge/sdk";
import {
  bigint,
  bigserial,
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createdAt, network, updatedAt } from "./columns.ts";

/**
 * Jōge's read model. The chain is the truth: every row below is either a General Protocols message, a raw transaction
 * of category K, or a projection rebuilt from those transactions. Mainnet and chipnet are separate worlds that share
 * one database (each chain row carries its network); oracle messages and the indicative price line are the same for both.
 * Satoshi amounts fit a JS number (21 M BCH < 2^53 sats), so they are read as numbers.
 */

export type Network = "mainnet" | "chipnet";
export type RoundState = "open" | "locked" | "settled" | "void";
export type VoidReason =
  | "no-entries"
  | "one-sided"
  | "below-minimum"
  | "tie"
  | "no-winner"
  | "lock-timeout"
  | "settle-timeout";
export type TicketStatus = "live" | "won" | "lost" | "refunded" | "exited";
export type TxKind =
  | "genesis"
  | "lane-open"
  | "create"
  | "enter"
  | "exit"
  | "lock"
  | "lock-timeout"
  | "settle"
  | "settle-timeout"
  | "sweep"
  | "vault-bet"
  | "other";
export type GateContract = "gate" | "eventGate" | "dollarGate";
export type JobStatus = "running" | "sent" | "failed";

const sats = () => bigint({ mode: "number" });
const roundId = () => bigint({ mode: "number" });

/** Every signed price message of the four feeds Jōge settles on (metadata messages are skipped). */
export const oracleMessages = pgTable(
  "oracle_messages",
  {
    feed: text().$type<FeedId>().notNull(),
    messageSequence: integer().notNull(),
    dataSequence: integer().notNull(),
    /** Unix seconds, as signed. */
    timestamp: integer().notNull(),
    /** As signed: scaled by the feed's price scaling. */
    price: integer().notNull(),
    message: text().notNull(),
    signature: text().notNull(),
    receivedAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.feed, t.messageSequence] }),
    index("oracle_feed_time").on(t.feed, t.timestamp),
    index("oracle_feed_data").on(t.feed, t.dataSequence),
  ],
);

/** The indicative live line between oracle prints (never used for settlement): at most one tick per second per asset. */
export const priceTicks = pgTable(
  "price_ticks",
  {
    asset: text().$type<AssetId>().notNull(),
    at: timestamp({ withTimezone: true, precision: 3 }).notNull(),
    price: doublePrecision().notNull(),
  },
  (t) => [primaryKey({ columns: [t.asset, t.at] })],
);

/** Every transaction that moves a category-K token, kept raw so the projections can always be rebuilt. */
export const transactions = pgTable(
  "transactions",
  {
    network: network(),
    txid: text().notNull(),
    /** Order the indexer applied it in (parents before children), so a round can be replayed. */
    seq: bigserial({ mode: "number" }).notNull(),
    kind: text().$type<TxKind>().notNull(),
    roundId: roundId(),
    /** Null while unconfirmed. */
    height: integer(),
    hex: text().notNull(),
    /** Gone from the chain and the mempool (double-spent or reorganised away); its effects were rolled back. */
    dropped: boolean().notNull().default(false),
    firstSeen: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.network, t.txid] }), index("transactions_round").on(t.network, t.roundId)],
);

/** The 13 lane threads: the next grid slot each lane may open. */
export const lanes = pgTable(
  "lanes",
  {
    network: network(),
    thread: smallint().notNull(),
    asset: text().$type<AssetId>().notNull(),
    seconds: integer().notNull(),
    nextLock: integer().notNull(),
    counter: integer().notNull(),
    outpoint: text().notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.network, t.thread] })],
);

export const rounds = pgTable(
  "rounds",
  {
    network: network(),
    roundId: roundId().notNull(),
    /** The thread byte that opened it: 0x10–0x1C lanes, 0x01–0x03 the factory. */
    thread: smallint().notNull(),
    /** The lane length in seconds, or null for a custom round or event. */
    laneSeconds: integer(),
    /** A custom round's title, as its creator wrote it on chain (OP_RETURN in the create transaction). */
    title: text(),
    asset: text().$type<AssetId>().notNull(),
    mode: text().$type<"updown" | "ranges">().notNull(),
    outcomes: smallint().notNull(),
    gates: smallint().notNull(),
    stakeClass: text().$type<StakeClass>(),
    lockTime: integer().notNull(),
    closeTime: integer().notNull(),
    creatorFeeBps: smallint().notNull(),
    creatorPkh: text().notNull(),
    minPot: sats().notNull(),
    minEntrants: integer().notNull(),
    boundaries: jsonb().$type<number[]>().notNull().default([]),
    state: text().$type<RoundState>().notNull(),
    voidReason: text().$type<VoidReason>(),
    entrants: integer().notNull().default(0),
    /** Stake per outcome (from the gates while open, from the locked record after). */
    totals: jsonb().$type<number[]>().notNull(),
    pot: sats().notNull().default(0),
    lockSequence: integer(),
    xauLockSequence: integer(),
    /** As settled (gold: USD/BCH × 10^7 ÷ XAU/BCH). */
    strikePrice: bigint({ mode: "number" }),
    closePrice: bigint({ mode: "number" }),
    winner: smallint(),
    /** The pot after fees that winners share (zero when void: stakes are refunded). */
    netPot: sats(),
    winnerTotal: sats(),
    /** Tickets still to be paid by sweeps. */
    remaining: integer(),
    masterOutpoint: text(),
    masterValue: sats(),
    openTxid: text().notNull(),
    lockTxid: text(),
    settleTxid: text(),
    finalTxid: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.network, t.roundId] }),
    index("rounds_state_lock").on(t.network, t.state, t.lockTime),
    index("rounds_thread_lock").on(t.network, t.thread, t.lockTime),
  ],
);

export const gates = pgTable(
  "gates",
  {
    network: network(),
    roundId: roundId().notNull(),
    gateIndex: smallint().notNull(),
    contract: text().$type<GateContract>().notNull(),
    stakeClass: text().$type<StakeClass>().notNull(),
    entrants: integer().notNull(),
    totals: jsonb().$type<number[]>().notNull(),
    value: sats().notNull(),
    /** Dollar events: what the gate's sidecar holds, in dollar-token units (cents), seed included. */
    dollars: bigint({ mode: "number" }),
    /** The gate's current coin; null once the lock merged it into the master. */
    outpoint: text(),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.network, t.roundId, t.gateIndex] })],
);

export const tickets = pgTable(
  "tickets",
  {
    network: network(),
    outpoint: text().notNull(),
    roundId: roundId().notNull(),
    gateIndex: smallint().notNull(),
    outcome: smallint().notNull(),
    stake: sats().notNull(),
    payoutPkh: text().notNull(),
    value: sats().notNull(),
    enterTxid: text().notNull(),
    status: text().$type<TicketStatus>().notNull(),
    payoutTxid: text(),
    /** What the ticket's payout address received when it was swept (or refunded on exit). */
    payoutSats: sats(),
    enteredAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.network, t.outpoint] }),
    index("tickets_round").on(t.network, t.roundId),
    index("tickets_payout").on(t.network, t.payoutPkh),
  ],
);

/** How far each watched address's history has been read (confirmed height), so restarts fetch only what is new. */
export const chainCursors = pgTable(
  "chain_cursors",
  {
    network: network(),
    scripthash: text().notNull(),
    contract: text().notNull(),
    height: integer().notNull().default(0),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.network, t.scripthash] })],
);

/** The keeper's claims: one row per lifecycle step, so two engines (or a restart) never do the same work twice. */
export const keeperJobs = pgTable(
  "keeper_jobs",
  {
    network: network(),
    key: text().notNull(),
    kind: text().notNull(),
    roundId: roundId(),
    status: text().$type<JobStatus>().notNull(),
    txid: text(),
    error: text(),
    attempts: integer().notNull().default(0),
    leaseUntil: timestamp({ withTimezone: true }).notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.network, t.key] }), index("keeper_jobs_round").on(t.network, t.roundId)],
);

/** One heartbeat per engine component for /status (oracle relay, price relay, indexer, keeper). */
export const heartbeats = pgTable("heartbeats", {
  component: text().primaryKey(),
  detail: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  at: updatedAt(),
});

export type AgentPosture = "guarded" | "balanced" | "active" | "partner";
export type AgentMode = "ask" | "auto";
export type AgentStatus = "active" | "paused";
export type ReadVerdict = "reading" | "enter" | "hold";
export type ProposalState = "open" | "taken" | "passed" | "expired";

/**
 * Agents (F13): a persona, a posture, the lanes it plays and its caps, owned by an address. Its id is also the index
 * of its key under the agent master key (the web server derives public keys only; the engine signs), and its vault is
 * the AgentVault covenant for (owner, that key, the per-bet cap, the lane gate).
 */
export const agents = pgTable(
  "agents",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    network: network(),
    ownerPkh: text().notNull(),
    name: text().notNull(),
    persona: text().notNull(),
    posture: text().$type<AgentPosture>().notNull(),
    /** Lane thread numbers it plays. */
    lanes: jsonb().$type<number[]>().notNull(),
    perBetCap: sats().notNull(),
    dailyCap: sats().notNull(),
    mode: text().$type<AgentMode>().notNull(),
    status: text().$type<AgentStatus>().notNull().default("active"),
    agentPubkey: text().notNull(),
    vaultLockingBytecode: text().notNull(),
    /** The vault's balance as last read from the chain (the agents page ranks by money entrusted). */
    vaultSats: sats().notNull().default(0),
    copiedFrom: bigint({ mode: "number" }),
    /** The face the owner picked in the studio (a DiceBear seed); empty means the agent's key is the seed. */
    avatarSeed: text().notNull().default(""),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("agents_owner").on(t.network, t.ownerPkh)],
);

/**
 * An agent's memory: one row per round it read. The model's call and why, then the gate's verdict; a filled entry's
 * transaction (on its own) or an ask-me-first proposal (the owner signs it through the normal ticket).
 */
export const agentReads = pgTable(
  "agent_reads",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    network: network(),
    agentId: bigint({ mode: "number" }).notNull(),
    roundId: roundId().notNull(),
    side: text().$type<"up" | "down" | "hold">(),
    confidence: doublePrecision(),
    why: text(),
    model: text(),
    promptHash: text(),
    verdict: text().$type<ReadVerdict>().notNull(),
    reason: text(),
    stake: sats(),
    txid: text(),
    proposal: text().$type<ProposalState>(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("agent_reads_once").on(t.agentId, t.roundId),
    index("agent_reads_recent").on(t.network, t.createdAt),
  ],
);

/**
 * Web Push (F20): one row per browser that asked to be told about its rounds, with the payout addresses it plays from.
 * Results are public on chain, so no signature is needed to listen; `since` keeps anything older from being announced.
 */
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    endpoint: text().primaryKey(),
    network: network(),
    p256dh: text().notNull(),
    auth: text().notNull(),
    /** Payout key hashes (40 hex) this browser plays from: its wallet's receive addresses. */
    pkhs: text().array().notNull(),
    since: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("push_network").on(t.network)],
);

/** What each browser was already told, so a notice goes out exactly once (Owarine's push_sent). */
export const pushSent = pgTable(
  "push_sent",
  {
    endpoint: text().notNull(),
    /** "round:<id>" or "proposal:<id>". */
    item: text().notNull(),
    sentAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.endpoint, t.item] })],
);

/**
 * A round's price path, kept once it is decided (the live ticks are pruned after three hours): about two hundred
 * points from when entries opened to just past the close, so every round can be replayed (the round film) for good.
 */
export const roundPaths = pgTable(
  "round_paths",
  {
    network: network(),
    roundId: roundId().notNull(),
    /** [Unix ms, price in dollars] pairs, oldest first. */
    points: jsonb().$type<Array<[number, number]>>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.network, t.roundId] })],
);

export * from "./schema-ops.ts";
