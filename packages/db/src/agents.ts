import { and, desc, eq, gte, inArray, isNotNull, ne, sql } from "drizzle-orm";
import type { Db } from "./client.ts";
import { agentReads, agents, type Network, rounds, type TicketStatus, tickets } from "./schema.ts";

export type AgentRow = typeof agents.$inferSelect;
export type AgentReadRow = typeof agentReads.$inferSelect;
export type ReadOutcome = "won" | "lost" | "refunded" | "pending" | "skipped";

export interface MemoryEntry extends AgentReadRow {
  asset: string | null;
  laneSeconds: number | null;
  outcome: ReadOutcome;
  /** What the ticket paid back (sats), once settled. */
  payout: number | null;
}

/** Every agent of a world, most money entrusted first (never by win rate). */
export const listAgents = (db: Db, network: Network) =>
  db
    .select()
    .from(agents)
    .where(and(eq(agents.network, network), ne(agents.vaultLockingBytecode, "")))
    .orderBy(desc(agents.vaultSats), desc(agents.createdAt));

/** The agents of any of a wallet's addresses (a wallet signs in with whichever of its keys holds a coin). */
export const agentsOf = (db: Db, network: Network, owners: string[]) =>
  db
    .select()
    .from(agents)
    .where(and(eq(agents.network, network), inArray(agents.ownerPkh, owners), ne(agents.vaultLockingBytecode, "")))
    .orderBy(desc(agents.createdAt));

export async function agentById(db: Db, network: Network, id: number): Promise<AgentRow | null> {
  const [row] = await db
    .select()
    .from(agents)
    .where(and(eq(agents.network, network), eq(agents.id, id)));
  return row ?? null;
}

const outcomeOf = (status: TicketStatus | undefined): ReadOutcome => {
  if (status === "won" || status === "lost" || status === "refunded") return status;
  return "pending";
};

/**
 * An agent's memory, newest first: each read with how it ended. A filled entry is matched by its transaction; a
 * taken ask-me-first proposal by the owner's ticket in that round; anything else was skipped.
 */
export async function agentMemory(db: Db, network: Network, agent: AgentRow, limit: number): Promise<MemoryEntry[]> {
  const reads = await db
    .select({ read: agentReads, asset: rounds.asset, laneSeconds: rounds.laneSeconds })
    .from(agentReads)
    .leftJoin(rounds, and(eq(rounds.network, agentReads.network), eq(rounds.roundId, agentReads.roundId)))
    .where(and(eq(agentReads.network, network), eq(agentReads.agentId, agent.id)))
    .orderBy(desc(agentReads.createdAt))
    .limit(limit);
  const roundIds = reads.map(({ read }) => read.roundId);
  const owned =
    roundIds.length === 0
      ? []
      : await db
          .select({
            roundId: tickets.roundId,
            enterTxid: tickets.enterTxid,
            status: tickets.status,
            payoutSats: tickets.payoutSats,
          })
          .from(tickets)
          .where(
            and(
              eq(tickets.network, network),
              eq(tickets.payoutPkh, agent.ownerPkh),
              inArray(tickets.roundId, roundIds),
            ),
          );
  return reads.map(({ read, asset, laneSeconds }) => {
    const ticket = read.txid
      ? owned.find((row) => row.enterTxid === read.txid)
      : read.proposal === "taken" || read.proposal === "open"
        ? owned.find((row) => row.roundId === read.roundId)
        : undefined;
    const filled = read.verdict === "enter" && (read.txid !== null || ticket !== undefined);
    return {
      ...read,
      asset,
      laneSeconds,
      outcome: filled ? outcomeOf(ticket?.status) : "skipped",
      payout: ticket?.payoutSats ?? null,
    };
  });
}

/** Model calls made for agents in the last hour, house-wide (the runner's budget). */
export async function agentCallsSince(db: Db, network: Network, since: Date): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(agentReads)
    .where(and(eq(agentReads.network, network), gte(agentReads.createdAt, since), isNotNull(agentReads.model)));
  return row?.count ?? 0;
}

/** Saves a new agent; its key and vault are filled in by `setAgentKeys` once its id (the key's index) is known. */
export async function insertAgent(db: Db, values: typeof agents.$inferInsert): Promise<AgentRow> {
  const [row] = await db.insert(agents).values(values).returning();
  if (!row) throw new Error("the agent was not saved");
  return row;
}

export async function setAgentKeys(db: Db, id: number, agentPubkey: string, vaultLockingBytecode: string) {
  const [row] = await db.update(agents).set({ agentPubkey, vaultLockingBytecode }).where(eq(agents.id, id)).returning();
  if (!row) throw new Error("the agent was not saved");
  return row;
}

/** Removes an agent whose key could not be set up (so no half-made agent is ever listed). */
export const deleteAgent = (db: Db, id: number) => db.delete(agents).where(eq(agents.id, id));

export async function updateAgent(
  db: Db,
  id: number,
  patch: Partial<typeof agents.$inferInsert>,
): Promise<AgentRow | null> {
  const [row] = await db.update(agents).set(patch).where(eq(agents.id, id)).returning();
  return row ?? null;
}

export async function agentReadById(db: Db, network: Network, id: number): Promise<AgentReadRow | null> {
  const [row] = await db
    .select()
    .from(agentReads)
    .where(and(eq(agentReads.network, network), eq(agentReads.id, id)));
  return row ?? null;
}

export const setProposal = (db: Db, id: number, proposal: "taken" | "passed") =>
  db.update(agentReads).set({ proposal }).where(eq(agentReads.id, id));

/** One decision in the feed across every agent: the read, its agent's name and face, and how it ended. */
export interface FeedDecision extends MemoryEntry {
  agentName: string;
  agentFace: string;
}

/**
 * The latest decisions of every agent in a world (the agents page's live feed): read, round and ending in one query.
 * The ending comes from the round itself: a bet whose side won, lost, or was refunded; a hold is "skipped".
 */
export async function latestDecisions(db: Db, network: Network, limit: number): Promise<FeedDecision[]> {
  const rows = await db
    .select({
      read: agentReads,
      agentName: agents.name,
      agentFace: sql<string>`coalesce(nullif(${agents.avatarSeed}, ''), ${agents.agentPubkey})`,
      asset: rounds.asset,
      laneSeconds: rounds.laneSeconds,
      state: rounds.state,
      winner: rounds.winner,
    })
    .from(agentReads)
    .innerJoin(agents, and(eq(agents.network, agentReads.network), eq(agents.id, agentReads.agentId)))
    .leftJoin(rounds, and(eq(rounds.network, agentReads.network), eq(rounds.roundId, agentReads.roundId)))
    .where(eq(agentReads.network, network))
    .orderBy(desc(agentReads.createdAt))
    .limit(limit);
  return rows.map(({ read, agentName, agentFace, asset, laneSeconds, state, winner }) => {
    const bet = read.verdict === "enter" && (read.txid !== null || read.proposal === "taken");
    const side = read.side === "up" ? 0 : read.side === "down" ? 1 : null;
    const outcome: ReadOutcome = !bet
      ? "skipped"
      : state === "void"
        ? "refunded"
        : state === "settled"
          ? winner === side
            ? "won"
            : "lost"
          : "pending";
    return { ...read, agentName, agentFace, asset, laneSeconds, outcome, payout: null };
  });
}
