import { CONTRACT_NAMES, type ContractName, contractIndex, type Deployment } from "@joge/contracts";
import {
  CHANNEL,
  chainCursors,
  type Database,
  gates,
  lanes,
  type Network,
  notify,
  rounds,
  tickets,
  transactions,
} from "@joge/db";
import { decodeLane } from "@joge/sdk";
import { and, asc, eq, inArray, isNull, lt } from "drizzle-orm";
import {
  DROP_GRACE_MS,
  FETCH_PARALLEL,
  INDEXER_SAFETY_EVERY_MS,
  LOOKUP_CHUNK,
  REORG_DEPTH,
  SECOND_MS,
} from "../constants.ts";
import { errorText, logger } from "../log.ts";
import { beat, every, sleep } from "../runtime.ts";
import { type DecodedTx, decodeTx } from "./decode.ts";
import { type Fulcrum, scripthashOf, utxosAt } from "./electrum.ts";
import { applyTransaction } from "./project.ts";

const log = logger("indexer");
/** A server's answer for a transaction it has never seen (Fulcrum: "No transaction matching the requested hash"). */
const TX_NOT_FOUND = /no transaction matching|not found|unknown transaction/i;

interface HistoryEntry {
  tx_hash: string;
  height: number;
}

interface Watched {
  contract: ContractName;
  lockingBytecode: string;
  scripthash: string;
}

/** Orders a batch so every parent is applied before its children (Kahn's algorithm; confirmed first, then by height). */
function parentsFirst(batch: Array<{ tx: DecodedTx; height: number | null }>) {
  const byId = new Map(batch.map((item) => [item.tx.txid, item]));
  const rank = (height: number | null) => (height === null ? Number.MAX_SAFE_INTEGER : height);
  const pending = [...batch].sort((a, b) => rank(a.height) - rank(b.height));
  const done = new Set<string>();
  const ordered: typeof batch = [];
  while (pending.length > 0) {
    const index = pending.findIndex((item) =>
      item.tx.inputs.every((outpoint) => {
        const parent = outpoint.slice(0, outpoint.indexOf(":"));
        return !byId.has(parent) || done.has(parent);
      }),
    );
    const [next] = pending.splice(index === -1 ? 0 : index, 1);
    if (!next) break;
    done.add(next.tx.txid);
    ordered.push(next);
  }
  return ordered;
}

const heightOf = (height: number): number | null => (height > 0 ? height : null);

/**
 * The chain indexer: watches the 8 covenant addresses of category K on Fulcrum, reads each new transaction once, and
 * applies it to the read model in parent-first order. Notifications trigger a sync; a timer syncs anyway. Unconfirmed
 * transactions that vanish (double-spent or reorganised away) are marked dropped and their rounds replayed without them.
 */
export class Indexer {
  readonly #watched: Watched[];
  readonly #contracts: Map<string, ContractName>;
  #dirty = true;
  #wake: (() => void) | undefined;
  #tip = 0;

  private readonly database: Database;
  private readonly fulcrum: Fulcrum;
  private readonly network: Network;
  private readonly deployment: Deployment;

  constructor(database: Database, fulcrum: Fulcrum, network: Network, deployment: Deployment) {
    this.database = database;
    this.fulcrum = fulcrum;
    this.network = network;
    this.deployment = deployment;
    this.#contracts = contractIndex(deployment);
    // A deployment made before a contract existed (the dollar contracts) simply has nothing there to watch.
    this.#watched = CONTRACT_NAMES.filter((contract) => deployment.lockingBytecode[contract]).map((contract) => {
      const lockingBytecode = deployment.lockingBytecode[contract];
      return { contract, lockingBytecode, scripthash: scripthashOf(lockingBytecode) };
    });
  }

  /** Asks for a sync as soon as the current one finishes. */
  poke = () => {
    this.#dirty = true;
    this.#wake?.();
  };

  async run(signal: AbortSignal) {
    for (const { scripthash } of this.#watched) {
      await this.fulcrum.subscribe("blockchain.scripthash.subscribe", [scripthash], this.poke);
    }
    await this.fulcrum.subscribe("blockchain.headers.subscribe", [], (header) => {
      const [tip] = header as [{ height: number } | undefined];
      if (tip?.height) this.#tip = tip.height;
      this.poke();
    });
    log.info("watching", { network: this.network, addresses: this.#watched.length });
    const safety = every(
      INDEXER_SAFETY_EVERY_MS,
      signal,
      async () => this.poke(),
      () => {},
    );
    while (!signal.aborted) {
      if (!this.#dirty) {
        await new Promise<void>((resolve) => {
          this.#wake = resolve;
          signal.addEventListener("abort", () => resolve(), { once: true });
        });
        this.#wake = undefined;
        continue;
      }
      this.#dirty = false;
      try {
        await this.sync();
      } catch (error) {
        log.warn("sync failed", { error: errorText(error) });
        await sleep(INDEXER_SAFETY_EVERY_MS / 2, signal);
        this.#dirty = true;
      }
    }
    await safety;
  }

  async sync() {
    const { db } = this.database;
    const network = this.network;
    if (this.#tip === 0) {
      this.#tip = ((await this.fulcrum.request("blockchain.headers.get_tip", [])) as { height: number }).height;
    }
    const tip = this.#tip;
    const cursors = new Map(
      (await db.select().from(chainCursors).where(eq(chainCursors.network, network))).map((row) => [
        row.scripthash,
        row.height,
      ]),
    );
    const seen = new Map<string, number | null>();
    for (const { scripthash } of this.#watched) {
      const from = Math.max(0, (cursors.get(scripthash) ?? 0) - REORG_DEPTH);
      const history = (await this.fulcrum.request("blockchain.scripthash.get_history", [
        scripthash,
        from,
      ])) as HistoryEntry[];
      for (const entry of history) seen.set(entry.tx_hash, heightOf(entry.height));
    }

    const known = new Map<string, { height: number | null; dropped: boolean }>();
    const ids = [...seen.keys()];
    for (let start = 0; start < ids.length; start += LOOKUP_CHUNK) {
      const chunk = ids.slice(start, start + LOOKUP_CHUNK);
      for (const row of await db
        .select({ txid: transactions.txid, height: transactions.height, dropped: transactions.dropped })
        .from(transactions)
        .where(and(eq(transactions.network, network), inArray(transactions.txid, chunk)))) {
        known.set(row.txid, row);
      }
    }
    const revived = new Set<number>();
    for (const [txid, height] of seen) {
      const row = known.get(txid);
      if (row && !row.dropped && row.height !== height) {
        await db
          .update(transactions)
          .set({ height })
          .where(and(eq(transactions.network, network), eq(transactions.txid, txid)));
      }
      // A transaction we took for dropped is back in a history (one server had not seen it, or it confirmed): it
      // counts again, and its round is rebuilt with it.
      if (row?.dropped) {
        const [back] = await db
          .update(transactions)
          .set({ dropped: false, height })
          .where(and(eq(transactions.network, network), eq(transactions.txid, txid)))
          .returning({ roundId: transactions.roundId });
        log.warn("transaction back", { txid, roundId: back?.roundId ?? undefined });
        if (back?.roundId !== null && back?.roundId !== undefined) revived.add(back.roundId);
      }
    }
    for (const roundId of revived) await this.replayRound(roundId);

    const fresh = ids.filter((txid) => !known.has(txid));
    const fetched: Array<{ tx: DecodedTx; height: number | null }> = [];
    for (let start = 0; start < fresh.length; start += FETCH_PARALLEL) {
      const chunk = fresh.slice(start, start + FETCH_PARALLEL);
      const raws = await Promise.all(
        chunk.map((txid) => this.fulcrum.request("blockchain.transaction.get", [txid, false]) as Promise<string>),
      );
      raws.forEach((hex, index) => {
        const txid = chunk[index] as string;
        fetched.push({
          tx: decodeTx(hex, this.deployment.category, this.#contracts, this.deployment.dollarCategory),
          height: seen.get(txid) ?? null,
        });
      });
    }
    for (const { tx, height } of parentsFirst(fetched)) await this.apply(tx, height);
    if (fetched.length > 0) log.info("applied", { transactions: fetched.length, tip });

    await this.findDropped(new Set(seen.keys()));
    for (const { scripthash, contract } of this.#watched) {
      await db
        .insert(chainCursors)
        .values({ network, scripthash, contract, height: tip })
        .onConflictDoUpdate({ target: [chainCursors.network, chainCursors.scripthash], set: { height: tip } });
    }
    await this.refreshLanes();
    await beat(this.database, `indexer:${network}`, { tip, at: Math.floor(Date.now() / SECOND_MS) });
  }

  /** Applies one transaction and records it, atomically; then announces the round change. */
  private async apply(tx: DecodedTx, height: number | null) {
    const network = this.network;
    const applied = await this.database.db.transaction(async (q) => {
      const result = await applyTransaction(q, network, tx);
      await q
        .insert(transactions)
        .values({ network, txid: tx.txid, kind: result.kind, roundId: result.roundId, height, hex: tx.hex })
        .onConflictDoNothing();
      return result;
    });
    if (applied.roundId !== null && applied.state) {
      await notify(this.database.sql, CHANNEL.round, {
        network,
        roundId: applied.roundId,
        state: applied.state,
        kind: applied.kind,
        txid: tx.txid,
      });
    }
  }

  /** Unconfirmed transactions no history lists any more: confirm with the server, then drop and replay their rounds. */
  private async findDropped(listed: Set<string>) {
    const { db } = this.database;
    const network = this.network;
    const stale = await db
      .select({ txid: transactions.txid, roundId: transactions.roundId })
      .from(transactions)
      .where(
        and(
          eq(transactions.network, network),
          eq(transactions.dropped, false),
          isNull(transactions.height),
          lt(transactions.firstSeen, new Date(Date.now() - DROP_GRACE_MS)),
        ),
      );
    const affected = new Set<number>();
    for (const { txid, roundId } of stale.filter((row) => !listed.has(row.txid))) {
      // Only a server's clear "no such transaction" counts; any other failure (a dropped socket, a server whose
      // mempool lags) leaves it for the next sync. Height 0 means it is still in the mempool.
      const status = await this.fulcrum.request("blockchain.transaction.get_height", [txid]).then(
        (height) => (height === null ? "gone" : "alive"),
        (error) => (TX_NOT_FOUND.test(errorText(error)) ? "gone" : "unknown"),
      );
      if (status !== "gone") continue;
      log.warn("transaction dropped", { txid, roundId });
      await db
        .update(transactions)
        .set({ dropped: true })
        .where(and(eq(transactions.network, network), eq(transactions.txid, txid)));
      if (roundId !== null) affected.add(roundId);
    }
    for (const roundId of affected) await this.replayRound(roundId);
  }

  /** Rebuilds one round from its surviving transactions, in the order they were first applied. */
  private async replayRound(roundId: number) {
    const network = this.network;
    const kept = await this.database.db
      .select({ hex: transactions.hex })
      .from(transactions)
      .where(and(eq(transactions.network, network), eq(transactions.roundId, roundId), eq(transactions.dropped, false)))
      .orderBy(asc(transactions.seq));
    await this.database.db.transaction(async (q) => {
      const ofRound = <T extends typeof rounds | typeof gates | typeof tickets>(table: T) =>
        and(eq(table.network, network), eq(table.roundId, roundId));
      await q.delete(tickets).where(ofRound(tickets));
      await q.delete(gates).where(ofRound(gates));
      await q.delete(rounds).where(ofRound(rounds));
      for (const { hex } of kept) {
        await applyTransaction(
          q,
          network,
          decodeTx(hex, this.deployment.category, this.#contracts, this.deployment.dollarCategory),
        );
      }
    });
    log.info("round replayed", { roundId, transactions: kept.length });
  }

  /** The lane threads' current state, straight from their coins. */
  private async refreshLanes() {
    const network = this.network;
    const coins = await utxosAt(this.fulcrum, this.deployment.lockingBytecode.laneThread);
    for (const coin of coins) {
      if (coin.token?.category !== this.deployment.category || !coin.token.nft) continue;
      const lane = decodeLane(coin.token.nft.commitment);
      const values = {
        asset: lane.asset,
        seconds: lane.seconds,
        nextLock: lane.nextLock,
        counter: lane.counter,
        outpoint: `${coin.txid}:${coin.vout}`,
      };
      await this.database.db
        .insert(lanes)
        .values({ network, thread: lane.thread, ...values })
        .onConflictDoUpdate({ target: [lanes.network, lanes.thread], set: values });
    }
  }
}
