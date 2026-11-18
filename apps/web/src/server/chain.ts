import "server-only";
import {
  chainProvider,
  connectFulcrum,
  deploymentFor,
  dollarContracts,
  FULCRUM,
  type Fulcrum,
  openingContracts,
  roundContracts,
} from "@joge/contracts";
import type { Network } from "@joge/db";

/**
 * The server's chain access, for the one transaction a page cannot build itself: creating a custom round runs the
 * SolidCash factory, which never ships to a page. Reads are live from Fulcrum (never the database), and the server
 * signs nothing: the creator's wallet signs its own coins.
 */
const store = globalThis as typeof globalThis & { jogeFulcrum?: Map<Network, Promise<Fulcrum>> };
const pools = store.jogeFulcrum ?? new Map<Network, Promise<Fulcrum>>();
store.jogeFulcrum = pools;

export function serverFulcrum(network: Network): Promise<Fulcrum> {
  let pool = pools.get(network);
  if (!pool) {
    const created = connectFulcrum(FULCRUM[network]);
    pool = created.connect().then(() => created);
    pool.catch(() => pools.delete(network));
    pools.set(network, pool);
  }
  return pool;
}

/** The round covenants and the opening covenants (factory, lane threads) of a world. */
export async function serverContracts(network: Network) {
  const deployment = deploymentFor(network);
  const provider = chainProvider(await serverFulcrum(network), network);
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
  const opening = openingContracts(round, provider, deployment.protocolLockingBytecode, dollar);
  return { deployment, round, dollar, opening };
}
