import { hexToBin, swapEndianness } from "@bitauth/libauth";
import { FEEDS } from "@joge/sdk";
import { Contract, type ContractType, type NetworkProvider, TransactionBuilder } from "cashscript";
import eventGate from "../artifacts/EventGate.ts";
import gate from "../artifacts/Gate.ts";
import masterLocked from "../artifacts/MasterLocked.ts";
import masterOpen from "../artifacts/MasterOpen.ts";
import masterSweep from "../artifacts/MasterSweep.ts";
import ticket from "../artifacts/Ticket.ts";

const cashscriptArtifacts = { gate, eventGate, ticket, masterOpen, masterLocked, masterSweep };

/**
 * A contract language: its SDK's Contract and TransactionBuilder plus the five compiled artifacts. SolidCash's SDK is
 * a fork of CashScript's with the same API, so the S00 bake-off runs the same builders and tests over both kits.
 * Typed as CashScript; a SolidCash kit is passed in by the tests.
 */
export interface Kit {
  name: string;
  Contract: typeof Contract;
  TransactionBuilder: typeof TransactionBuilder;
  artifacts: typeof cashscriptArtifacts;
}

export const cashscriptKit: Kit = { name: "CashScript", Contract, TransactionBuilder, artifacts: cashscriptArtifacts };

export interface RoundContractsOptions {
  /** Category K in display order (as wallets and explorers show it). */
  category: string;
  provider: NetworkProvider;
  /** Where the protocol fee goes (hex locking bytecode). */
  protocolLockingBytecode: string;
  /** Tickets are P2S by default (no address, half-size sweeps; Cashonize signs it, S00 P3); P2SH32 stays available. */
  ticketType?: ContractType;
  kit?: Kit;
}

/**
 * The five covenants of one category K, built in dependency order so each knows only what it must:
 * Ticket ← MasterSweep ← MasterLocked ← MasterOpen, and Ticket ← Gate / EventGate (authentication is by category, capability,
 * tag and round id, never by a peer's bytecode, so there is no cycle).
 */
export function roundContracts({
  category,
  provider,
  protocolLockingBytecode,
  ticketType = "p2s",
  kit = cashscriptKit,
}: RoundContractsOptions) {
  const raw = swapEndianness(category);
  const oracles = [FEEDS["USD/BTC"], FEEDS["USD/ETH"], FEEDS["USD/BCH"], FEEDS["XAU/BCH"]].map(
    (feed) => feed.publicKey,
  );
  const [btc, eth, bch, xau] = oracles as [string, string, string, string];
  const { artifacts } = kit;
  const Covenant = kit.Contract;

  // CashScript names the address option `contractType`, SolidCash `addressType`; pass both.
  const ticketOptions = { provider, contractType: ticketType, addressType: ticketType } as {
    provider: NetworkProvider;
  };
  const ticketContract = new Covenant(artifacts.ticket, [raw], ticketOptions);
  const sweepContract = new Covenant(artifacts.masterSweep, [raw, hexToBin(ticketContract.lockingBytecode)], {
    provider,
  });
  const lockedContract = new Covenant(
    artifacts.masterLocked,
    [raw, hexToBin(sweepContract.lockingBytecode), hexToBin(protocolLockingBytecode), btc, eth, bch, xau],
    { provider },
  );
  const openContract = new Covenant(
    artifacts.masterOpen,
    [raw, hexToBin(lockedContract.lockingBytecode), hexToBin(sweepContract.lockingBytecode), btc, eth, bch, xau],
    { provider },
  );
  const gateContract = new Covenant(artifacts.gate, [raw, hexToBin(ticketContract.lockingBytecode)], { provider });
  const eventGateContract = new Covenant(artifacts.eventGate, [raw, hexToBin(ticketContract.lockingBytecode)], {
    provider,
  });

  return {
    category,
    kit,
    TransactionBuilder: kit.TransactionBuilder,
    gate: gateContract,
    eventGate: eventGateContract,
    ticket: ticketContract,
    open: openContract,
    locked: lockedContract,
    sweep: sweepContract,
  };
}

export type RoundContracts = ReturnType<typeof roundContracts>;
