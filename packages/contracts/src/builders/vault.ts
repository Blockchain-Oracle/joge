import { hexToBin } from "@bitauth/libauth";
import { AGENT_BET_FEE, decodeGate, encodeGate, encodeTicket, TICKET_DUST } from "@joge/sdk";
import type { SpendableUtxo } from "cashscript";
import type { RoundContracts } from "../contracts.ts";
import { asCashScriptUnlocker, type SolidCovenant } from "../hybrid.ts";
import { commitment, type Funding, nft, type TokenUtxo } from "./shared.ts";

export interface VaultBetParams {
  round: RoundContracts;
  vault: SolidCovenant;
  vaultUtxo: SpendableUtxo;
  /** A lane gate (agents enter standard lane rounds only). */
  gate: TokenUtxo;
  outcome: number;
  stake: bigint;
  ownerPkh: Uint8Array;
  /** The agent's signer from SolidCash's SDK (it signs over the vault's own function body). */
  agentSigner: unknown;
}

/** An agent's entry: lane gate (input 0) + the vault (input 1) → gate, the owner's ticket, the vault's change. */
export function buildVaultBet({
  round,
  vault,
  vaultUtxo,
  gate,
  outcome,
  stake,
  ownerPkh,
  agentSigner,
}: VaultBetParams) {
  const state = decodeGate(commitment(gate));
  const next = {
    ...state,
    entrants: state.entrants + 1,
    totals: state.totals.map((total, index) => (index === outcome ? total + stake : total)),
  };
  const bet = vault.unlock.bet;
  if (!bet) throw new Error("AgentVault has no bet function");
  const ticket = { roundId: state.roundId, gateIndex: state.gateIndex, outcome, stake, payoutPkh: ownerPkh };
  return new round.TransactionBuilder({ provider: round.gate.provider })
    .addInput(gate, round.gate.unlock.enter(BigInt(outcome), stake, ownerPkh))
    .addInput(vaultUtxo, asCashScriptUnlocker(bet(agentSigner)))
    .addOutput({
      to: hexToBin(round.gate.lockingBytecode),
      amount: gate.satoshis + stake,
      token: nft(round.category, "minting", encodeGate(next)),
    })
    .addOutput({
      to: hexToBin(round.ticket.lockingBytecode),
      amount: TICKET_DUST,
      token: nft(round.category, "none", encodeTicket(ticket)),
    })
    .addOutput({
      to: hexToBin(vault.lockingBytecode),
      amount: vaultUtxo.satoshis - stake - TICKET_DUST - AGENT_BET_FEE,
    });
}

export interface VaultWithdrawParams {
  round: RoundContracts;
  vault: SolidCovenant;
  vaultUtxo: SpendableUtxo;
  /** The vault's other coins: each checks only that input 1 is the owner's, so one withdrawal takes them all. */
  moreVaultUtxos?: SpendableUtxo[];
  /** A coin from the owner's address, signed SIGHASH_ALL by the owner's wallet: their authority to withdraw. */
  ownerCoin: Funding;
  to: string | Uint8Array;
  feeRate?: number;
}

/** The owner takes the agent's budget back: vault + the owner's coin → everything to the owner. */
export function buildVaultWithdraw({
  round,
  vault,
  vaultUtxo,
  moreVaultUtxos = [],
  ownerCoin,
  to,
  feeRate = 1,
}: VaultWithdrawParams) {
  const withdraw = vault.unlock.withdraw;
  if (!withdraw) throw new Error("AgentVault has no withdraw function");
  const builder = new round.TransactionBuilder({ provider: round.gate.provider })
    .addInput(vaultUtxo, asCashScriptUnlocker(withdraw()))
    .addInput(ownerCoin.utxo, ownerCoin.unlocker);
  for (const utxo of moreVaultUtxos) builder.addInput(utxo, asCashScriptUnlocker(withdraw()));
  return builder.addBchChangeOutputIfNeeded({ to, feeRate });
}
