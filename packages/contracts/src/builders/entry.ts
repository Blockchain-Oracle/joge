import { hexToBin } from "@bitauth/libauth";
import { decodeGate, decodeTicket, encodeGate, encodeTicket, exitSplit, TICKET_DUST } from "@joge/sdk";
import type { RoundContracts } from "../contracts.ts";
import { commitment, type Funding, gateContractOf, nft, p2pkh, type TokenUtxo } from "./shared.ts";

export interface EnterParams {
  contracts: RoundContracts;
  gate: TokenUtxo;
  funding: Funding[];
  outcome: number;
  stake: bigint;
  payoutPkh: Uint8Array;
  change: string | Uint8Array;
  feeRate?: number;
}

/** A player's entry: gate (input 0) + their coins → gate with the stake added, the ticket, change. */
export function buildEnter({ contracts, gate, funding, outcome, stake, payoutPkh, change, feeRate = 1 }: EnterParams) {
  const gateContract = gateContractOf(contracts, gate);
  const state = decodeGate(commitment(gate));
  const next = {
    ...state,
    entrants: state.entrants + 1,
    totals: state.totals.map((total, index) => (index === outcome ? total + stake : total)),
  };
  const ticket = { roundId: state.roundId, gateIndex: state.gateIndex, outcome, stake, payoutPkh };
  const builder = new contracts.TransactionBuilder({ provider: gateContract.provider }).addInput(
    gate,
    gateContract.unlock.enter(BigInt(outcome), stake, payoutPkh),
  );
  for (const coin of funding) builder.addInput(coin.utxo, coin.unlocker);
  return builder
    .addOutput({
      to: hexToBin(gateContract.lockingBytecode),
      amount: gate.satoshis + stake,
      token: nft(contracts.category, "minting", encodeGate(next)),
    })
    .addOutput({
      to: hexToBin(contracts.ticket.lockingBytecode),
      amount: TICKET_DUST,
      token: nft(contracts.category, "none", encodeTicket(ticket)),
    })
    .addBchChangeOutputIfNeeded({ to: change, feeRate });
}

export interface ExitParams {
  contracts: RoundContracts;
  gate: TokenUtxo;
  ticket: TokenUtxo;
  /** A coin from the ticket's payout address; its owner signs (SIGHASH_ALL) to authorise the exit. */
  ownerCoin: Funding;
  feeRate?: number;
}

/** An event entrant leaves before the lock: event gate + ticket + owner's coin → gate without the stake, refund, change. */
export function buildExit({ contracts, gate, ticket, ownerCoin, feeRate = 1 }: ExitParams) {
  const state = decodeGate(commitment(gate));
  const entry = decodeTicket(commitment(ticket));
  const { fee, refund } = exitSplit(entry.stake, ticket.satoshis);
  const next = {
    ...state,
    entrants: state.entrants - 1,
    totals: state.totals.map((total, index) => (index === entry.outcome ? total - entry.stake : total)),
  };
  const owner = p2pkh(entry.payoutPkh);
  return new contracts.TransactionBuilder({ provider: contracts.eventGate.provider })
    .addInput(gate, contracts.eventGate.unlock.exit())
    .addInput(ticket, contracts.ticket.unlock.spend())
    .addInput(ownerCoin.utxo, ownerCoin.unlocker)
    .addOutput({
      to: hexToBin(contracts.eventGate.lockingBytecode),
      amount: gate.satoshis - entry.stake + fee,
      token: nft(contracts.category, "minting", encodeGate(next)),
    })
    .addOutput({ to: owner, amount: refund })
    .addBchChangeOutputIfNeeded({ to: owner, feeRate });
}
