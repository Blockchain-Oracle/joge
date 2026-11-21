"use client";

import {
  chainProvider,
  connectFulcrum,
  type Deployment,
  type DollarContracts,
  deploymentFor,
  dollarContracts,
  FULCRUM,
  type Fulcrum,
  type RoundContracts,
  roundContracts,
} from "@joge/contracts/browser";
import type { Network } from "@joge/db";

/**
 * The browser's own chain access: one Fulcrum pool per world, connected on first use. Every transaction the page builds
 * reads live coins from here, never from Jōge's database, so the page works even if our server is gone.
 */
const pools = new Map<Network, Promise<Fulcrum>>();
const contracts = new Map<Network, { deployment: Deployment; round: RoundContracts; dollar: DollarContracts }>();

/** A page never waits longer than this for the chain servers: past it the read fails and can be tried again. */
const CONNECT_TIMEOUT_MS = 10_000;

export function fulcrum(network: Network): Promise<Fulcrum> {
  let pool = pools.get(network);
  if (!pool) {
    const created = connectFulcrum(FULCRUM[network]);
    pool = Promise.race([
      created.connect().then(() => created),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("The chain servers didn't answer")), CONNECT_TIMEOUT_MS),
      ),
    ]);
    // A pool that failed to connect is dropped, so the next read starts a fresh one instead of waiting on it.
    pool.catch(() => {
      pools.delete(network);
      void created.close().catch(() => undefined);
    });
    pools.set(network, pool);
  }
  return pool;
}

/** The round covenants of a world, built once (they need a provider; reads go through the same pool). */
export async function roundsOf(network: Network) {
  const known = contracts.get(network);
  if (known) return known;
  const deployment = deploymentFor(network);
  const provider = chainProvider(await fulcrum(network), network);
  const round = roundContracts({
    category: deployment.category,
    provider,
    protocolLockingBytecode: deployment.protocolLockingBytecode,
  });
  const dollar = dollarContracts(round, {
    dollarCategory: deployment.dollarCategory,
    provider,
    protocolLockingBytecode: deployment.protocolLockingBytecode,
  });
  const built = { deployment, round, dollar };
  contracts.set(network, built);
  return built;
}
