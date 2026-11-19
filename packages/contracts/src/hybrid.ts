import { hexToBin, swapEndianness } from "@bitauth/libauth";
import { FEEDS } from "@joge/sdk";
import { Contract as SolidContract } from "@solidcash/solidcash";
import type { NetworkProvider, Unlocker } from "cashscript";
import agentVault from "../artifacts/solidcash/AgentVault.ts";
import factory from "../artifacts/solidcash/Factory.ts";
import laneThread from "../artifacts/solidcash/LaneThread.ts";
import type { RoundContracts } from "./contracts.ts";
import type { DollarContracts } from "./dollar.ts";

/**
 * Hybrid: the contracts players' money touches are CashScript (`roundContracts`); SolidCash writes the
 * factory, the lane threads and the agent vaults. Every transaction is built with CashScript's TransactionBuilder;
 * SolidCash contract inputs join it through `asCashScriptUnlocker`, while SolidCash still produces their unlocking
 * bytecode (and any signature over its own function body).
 */
interface SolidUnlocker {
  generateUnlockingBytecode: Unlocker["generateUnlockingBytecode"];
}

/** SolidCash's Unlocker also carries `generateLockingBytecode`; CashScript's builder needs only this one method. */
export const asCashScriptUnlocker = (unlocker: SolidUnlocker): Unlocker => ({
  generateUnlockingBytecode: (options) => unlocker.generateUnlockingBytecode(options),
});

/** What we use of a SolidCash contract: where it lives and its spending functions. */
export interface SolidCovenant {
  lockingBytecode: string;
  unlock: Record<string, (...args: unknown[]) => SolidUnlocker>;
}

// SolidCash's Contract needs a provider for UTXO reads only; ours is a CashScript provider of the same shape.
const solid = (artifact: unknown, args: unknown[], provider: NetworkProvider): SolidCovenant =>
  new SolidContract(artifact as never, args as never, { provider: provider as never }) as unknown as SolidCovenant;

/** The clock for lane and factory openings: any signed USD/BCH price (the longest-committed feed). */
export const CLOCK_FEED = FEEDS["USD/BCH"];

export function openingContracts(
  round: RoundContracts,
  provider: NetworkProvider,
  protocolLockingBytecode: string,
  dollar: DollarContracts,
) {
  const raw = swapEndianness(round.category);
  const lanes = solid(
    laneThread,
    [hexToBin(raw), hexToBin(round.open.lockingBytecode), hexToBin(round.gate.lockingBytecode), CLOCK_FEED.publicKey],
    provider,
  );
  const factoryContract = solid(
    factory,
    [
      hexToBin(raw),
      hexToBin(round.open.lockingBytecode),
      hexToBin(round.gate.lockingBytecode),
      hexToBin(round.eventGate.lockingBytecode),
      hexToBin(protocolLockingBytecode),
      CLOCK_FEED.publicKey,
      hexToBin(dollar.open.lockingBytecode),
      hexToBin(dollar.gate.lockingBytecode),
      hexToBin(dollar.side.lockingBytecode),
      hexToBin(swapEndianness(dollar.dollarCategory)),
    ],
    provider,
  );
  return { lanes, factory: factoryContract };
}

export type OpeningContracts = ReturnType<typeof openingContracts>;

export interface VaultTerms {
  ownerPkh: Uint8Array;
  /** The agent's compressed public key (held by the agent runner). */
  agentKey: Uint8Array;
  perBetCap: bigint;
}

/** One agent's budget box: its address depends on the owner, the agent key and the cap. */
export const agentVaultContract = (round: RoundContracts, provider: NetworkProvider, terms: VaultTerms) =>
  solid(agentVault, [terms.ownerPkh, terms.agentKey, terms.perBetCap, hexToBin(round.gate.lockingBytecode)], provider);
