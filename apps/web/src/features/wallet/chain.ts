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

export function fulcrum(network: Network): Promise<Fulcrum> {
  let pool = pools.get(network);
  if (!pool) {
    const created = connectFulcrum(FULCRUM[network]);
    pool = created.connect().then(() => created);
    pool.catch(() => pools.delete(network));
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
