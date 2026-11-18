import type { AssetId } from "@joge/sdk";
import chipnet from "../deployments/chipnet.json" with { type: "json" };
import mainnet from "../deployments/mainnet.json" with { type: "json" };

export type Network = "mainnet" | "chipnet";

/** The covenants of one category K, by role. Every address the engine watches and the app reads. */
export const CONTRACT_NAMES = [
  "gate",
  "eventGate",
  "ticket",
  "masterOpen",
  "masterLocked",
  "masterSweep",
  "laneThread",
  "factory",
  "dollarGate",
  "dollarSide",
  "dollarMasterOpen",
  "dollarMasterLocked",
  "dollarMasterSweep",
] as const;
export type ContractName = (typeof CONTRACT_NAMES)[number];

export interface Deployment {
  network: Network;
  /** Category K in display order. */
  category: string;
  genesisTxid: string;
  createdAt: string;
  protocolLockingBytecode: string;
  /** The dollar token dollar events stake (ParyonUSD on mainnet; a test token on chipnet), in display order. */
  dollarCategory: string;
  lockingBytecode: Record<ContractName, string>;
  factoryThreads: number[];
  lanes: { thread: number; asset: AssetId; seconds: number }[];
}

/**
 * Written by scripts/genesis.ts. mainnet.json holds `null` until the mainnet genesis (stage S09, with the user's
 * go-ahead) writes the real one.
 */
const DEPLOYMENTS: Partial<Record<Network, Deployment>> = {
  chipnet: chipnet as Deployment,
  ...(mainnet ? { mainnet: mainnet as unknown as Deployment } : {}),
};

export function deploymentFor(network: Network): Deployment {
  const deployment = DEPLOYMENTS[network];
  if (!deployment) throw new Error(`no ${network} deployment yet`);
  return deployment;
}

/** Contract role by locking bytecode (hex). */
export const contractIndex = (deployment: Deployment): Map<string, ContractName> =>
  new Map(CONTRACT_NAMES.map((name) => [deployment.lockingBytecode[name], name]));
