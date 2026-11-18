import { hexToBin } from "@bitauth/libauth";
import {
  decodeSweep,
  decodeTicket,
  encodeSweep,
  MAX_SWEEP_BATCH,
  masterAfterSweep,
  SWEEP_PAD_PER_TICKET,
  ticketPayout,
} from "@joge/sdk";
import type { RoundContracts } from "../contracts.ts";
import { BURNS_NFTS, byOutpoint, commitment, final, nft, p2pkh, type TokenUtxo } from "./shared.ts";

/**
 * Sweep: the settled master + a batch of its tickets (ascending outpoint, at most MAX_SWEEP_BATCH) → one payout per
 * ticket. Fixed zero padding per ticket buys the operation-cost budget the payout loop needs.
 */
export function buildSweep({
  contracts,
  master,
  tickets,
}: {
  contracts: RoundContracts;
  master: TokenUtxo;
  tickets: TokenUtxo[];
}) {
  const round = decodeSweep(commitment(master));
  const batch = [...tickets].sort(byOutpoint);
  if (batch.length > round.remaining) throw new Error("more tickets than the round has left");
  if (batch.length > MAX_SWEEP_BATCH) throw new Error(`sweep at most ${MAX_SWEEP_BATCH} tickets at a time`);
  const decoded = batch.map((utxo) => decodeTicket(commitment(utxo)));
  const payouts = decoded.map((ticket, index) => ticketPayout(round, ticket, (batch[index] as TokenUtxo).satoshis));
  const rest = masterAfterSweep(
    master.satoshis,
    batch.map((utxo) => utxo.satoshis),
    payouts,
  );
  const left = round.remaining - batch.length;
  const builder = new contracts.TransactionBuilder({ provider: contracts.sweep.provider, ...BURNS_NFTS }).addInput(
    master,
    contracts.sweep.unlock.sweep(new Uint8Array(batch.length * SWEEP_PAD_PER_TICKET)),
    final,
  );
  for (const utxo of batch) builder.addInput(utxo, contracts.ticket.unlock.spend(), final);
  builder.addOutput(
    left === 0
      ? { to: p2pkh(round.creatorPkh), amount: rest }
      : {
          to: hexToBin(contracts.sweep.lockingBytecode),
          amount: rest,
          token: nft(contracts.category, "mutable", encodeSweep({ ...round, remaining: left })),
        },
  );
  for (const [index, ticket] of decoded.entries()) {
    builder.addOutput({ to: p2pkh(ticket.payoutPkh), amount: payouts[index] as bigint });
  }
  return { builder, payouts, batch };
}
