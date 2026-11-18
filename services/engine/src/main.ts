import { deploymentFor } from "@joge/contracts";
import { createDb } from "@joge/db";
import { runMigrations } from "@joge/db/migrate";
import { AgentRunner } from "./agents/runner.ts";
import { connectFulcrum, FULCRUM } from "./chain/electrum.ts";
import { Indexer } from "./chain/indexer.ts";
import { readEnv } from "./env.ts";
import { Keeper } from "./keeper/keeper.ts";
import { KeeperWallet } from "./keeper/wallet.ts";
import { errorText, logger } from "./log.ts";
import { runOracleRelay } from "./oracle/relay.ts";
import { runPaths } from "./paths.ts";
import { runPriceRelay } from "./price/kraken.ts";
import { runPush } from "./push/push.ts";

/**
 * Jōge's engine, one process: oracle relay, indicative price relay, chain indexer and keeper (ENGINE_COMPONENTS picks
 * a subset). Nothing it does needs trust: the indexer only reads, and every keeper step is a transaction anyone could
 * build and broadcast.
 */
const log = logger("engine");
const env = readEnv();
const database = createDb(env.DATABASE_URL);
await runMigrations(database.db);
log.info("starting", { network: env.JOGE_NETWORK, components: env.components.join(",") });

const controller = new AbortController();
const { signal } = controller;
const stop = (reason: string) => {
  if (signal.aborted) return;
  log.info("stopping", { reason });
  controller.abort();
};
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

/**
 * rpckit's WebSocket transport (2.2.0) reconnects inside a promise nobody awaits (`void handleDisconnect()`), so a
 * Fulcrum server that is still down when it retries leaves an unhandled rejection, which Node treats as fatal. The
 * fallback pool keeps serving from the other servers and the socket retries on its own, so a transport error is
 * logged and survived. Any other unhandled rejection is a real bug: stop cleanly so it is seen.
 */
const TRANSPORT_ERROR = /websocket (error|disconnected)|ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up|timed? ?out/i;
process.on("unhandledRejection", (reason) => {
  const message = errorText(reason);
  if (TRANSPORT_ERROR.test(message)) {
    log.warn("Fulcrum connection dropped; failing over", { error: message });
    return;
  }
  log.warn("unhandled rejection", { error: message });
  stop("unhandled rejection");
});

const tasks: Array<Promise<void>> = [];
const run = (name: string, task: () => Promise<void>) =>
  tasks.push(
    task().catch((error) => {
      log.warn(`${name} stopped`, { error: errorText(error) });
      stop(`${name} failed`);
    }),
  );

if (env.components.includes("oracle")) run("oracle", () => runOracleRelay(database, signal));
if (env.components.includes("price")) run("price", () => runPriceRelay(database, signal));
if (env.components.includes("paths")) run("paths", () => runPaths(database, env.JOGE_NETWORK, signal));
if (env.components.includes("push")) {
  const vapid =
    env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT
      ? { publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY, subject: env.VAPID_SUBJECT }
      : null;
  run("push", () => runPush(database, env.JOGE_NETWORK, vapid, signal));
}

const needsChain = ["indexer", "keeper", "agents"].some((name) => env.components.includes(name as never));
const fulcrum = needsChain ? connectFulcrum(env.FULCRUM_URLS ?? FULCRUM[env.JOGE_NETWORK]) : undefined;
if (fulcrum) {
  await fulcrum.connect();
  const deployment = deploymentFor(env.JOGE_NETWORK);
  if (env.components.includes("indexer")) {
    const indexer = new Indexer(database, fulcrum, env.JOGE_NETWORK, deployment);
    run("indexer", () => indexer.run(signal));
  }
  if (env.components.includes("keeper")) {
    const wallet = env.KEEPER_WIF ? new KeeperWallet(env.KEEPER_WIF, env.JOGE_NETWORK, fulcrum) : undefined;
    // "all", "none" (finish what is in flight, open nothing new), or a list of lane thread numbers.
    const lanes =
      env.KEEPER_LANES === "all"
        ? "all"
        : env.KEEPER_LANES === "none"
          ? new Set<number>()
          : new Set(env.KEEPER_LANES.split(",").map((thread) => Number(thread.trim())));
    const keeper = new Keeper(
      database,
      fulcrum,
      env.JOGE_NETWORK,
      deployment,
      wallet,
      lanes,
      env.KEEPER_DEMAND === "on",
    );
    run("keeper", () => keeper.run(signal));
  }
  if (env.components.includes("agents")) {
    const runner = new AgentRunner(
      database,
      fulcrum,
      env.JOGE_NETWORK,
      deployment,
      env.AGENT_XPRV,
      env.AGENT_MAX_CALLS_PER_HOUR,
    );
    run("agents", () => runner.run(signal));
  }
}

await Promise.all(tasks);
await fulcrum?.close();
await database.sql.end({ timeout: 5 });
log.info("stopped");
process.exit(signal.aborted ? 0 : 1);
