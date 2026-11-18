import { hexToBin } from "@bitauth/libauth";
import {
  BPS,
  decodeGate,
  decodeTicket,
  EVENT_EXIT_FEE_BPS,
  encodeGate,
  encodeTicket,
  TICKET_DUST,
  TOKEN_DUST,
} from "@joge/sdk";
import type { SpendableUtxo } from "cashscript";
import type { RoundContracts } from "../contracts.ts";
import type { DollarContracts } from "../dollar.ts";
import { commitment, type Funding, nft, p2pkh, type TokenUtxo } from "./shared.ts";

/** A sidecar: the dollar token at the sidecar contract (fungible only, no NFT). */
export type SideUtxo = SpendableUtxo & { token: NonNullable<SpendableUtxo["token"]> };

export const dollars = (dollar: DollarContracts, amount: bigint) => ({ category: dollar.dollarCategory, amount });
const tokensIn = (dollar: DollarContracts, coins: SpendableUtxo[]) =>
  coins.reduce((sum, coin) => (coin.token?.category === dollar.dollarCategory ? sum + coin.token.amount : sum), 0n);
export const sideOut = (dollar: DollarContracts, amount: bigint) => ({
  to: hexToBin(dollar.side.lockingBytecode),
  amount: TOKEN_DUST,
  token: dollars(dollar, amount),
});

export interface DollarEnterParams {
  contracts: RoundContracts;
  dollar: DollarContracts;
  gate: TokenUtxo;
  /** The gate's sidecar (it shares the gate's outpoint transaction). */
  side: SideUtxo;
  /** The player's coins: dollars for the stake, satoshis for the ticket's dust and the fee. */
  funding: Funding[];
  outcome: number;
  stake: bigint;
  payoutPkh: Uint8Array;
  /** Where leftover dollars and satoshis go (locking bytecode, so no token-aware address is needed). */
  change: Uint8Array;
  feeRate?: number;
}

/** A dollar entry: gate + sidecar + the player's coins → gate, sidecar with the stake added, ticket, change. */
export function buildDollarEnter(params: DollarEnterParams) {
  const { contracts, dollar, gate, side, funding, outcome, stake, payoutPkh, change, feeRate = 1 } = params;
  const state = decodeGate(commitment(gate));
  const leftover = tokensIn(
    dollar,
    funding.map((coin) => coin.utxo),
  );
  if (leftover < stake) throw new Error("not enough dollars for this stake");
  const next = {
    ...state,
    entrants: state.entrants + 1,
    totals: state.totals.map((total, index) => (index === outcome ? total + stake : total)),
  };
  const ticket = { roundId: state.roundId, gateIndex: state.gateIndex, outcome, stake, payoutPkh };
  const builder = new contracts.TransactionBuilder({ provider: dollar.gate.provider })
    .addInput(gate, dollar.gate.unlock.enter(BigInt(outcome), stake, payoutPkh))
    .addInput(side, dollar.side.unlock.move());
  for (const coin of funding) builder.addInput(coin.utxo, coin.unlocker);
  builder
    .addOutput({
      to: hexToBin(dollar.gate.lockingBytecode),
      amount: gate.satoshis,
      token: nft(contracts.category, "minting", encodeGate(next)),
    })
    .addOutput({ ...sideOut(dollar, side.token.amount + stake), amount: side.satoshis })
    .addOutput({
      to: hexToBin(contracts.ticket.lockingBytecode),
      amount: TICKET_DUST,
      token: nft(contracts.category, "none", encodeTicket(ticket)),
    });
  if (leftover > stake) builder.addOutput({ to: change, amount: TOKEN_DUST, token: dollars(dollar, leftover - stake) });
  return builder.addBchChangeOutputIfNeeded({ to: change, feeRate });
}

export interface DollarExitParams {
  contracts: RoundContracts;
  dollar: DollarContracts;
  gate: TokenUtxo;
  side: SideUtxo;
  ticket: TokenUtxo;
  /** A coin from the ticket's payout address; its owner signs (SIGHASH_ALL) to authorise the exit. */
  ownerCoin: Funding;
  feeRate?: number;
}

/** Leaving a dollar event before the lock: the stake back in dollars less the exit fee, which stays in the sidecar. */
export function buildDollarExit({ contracts, dollar, gate, side, ticket, ownerCoin, feeRate = 1 }: DollarExitParams) {
  const state = decodeGate(commitment(gate));
  const entry = decodeTicket(commitment(ticket));
  const fee = (entry.stake * EVENT_EXIT_FEE_BPS) / BPS;
  const next = {
    ...state,
    entrants: state.entrants - 1,
    totals: state.totals.map((total, index) => (index === entry.outcome ? total - entry.stake : total)),
  };
  const owner = p2pkh(entry.payoutPkh);
  return new contracts.TransactionBuilder({ provider: dollar.gate.provider })
    .addInput(gate, dollar.gate.unlock.exit())
    .addInput(side, dollar.side.unlock.move())
    .addInput(ticket, contracts.ticket.unlock.spend())
    .addInput(ownerCoin.utxo, ownerCoin.unlocker)
    .addOutput({
      to: hexToBin(dollar.gate.lockingBytecode),
      amount: gate.satoshis,
      token: nft(contracts.category, "minting", encodeGate(next)),
    })
    .addOutput({ ...sideOut(dollar, side.token.amount - entry.stake + fee), amount: side.satoshis })
    .addOutput({ to: owner, amount: ticket.satoshis, token: dollars(dollar, entry.stake - fee) })
    .addBchChangeOutputIfNeeded({ to: owner, feeRate });
}
