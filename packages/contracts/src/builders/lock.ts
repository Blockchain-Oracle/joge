import { hexToBin } from "@bitauth/libauth";
import {
  decodeGate,
  decodeOpen,
  encodeLocked,
  encodeSweep,
  lockFee,
  type OpenRound,
  potFromGates,
  SETTLE_TIMEOUT,
  voidAtLock,
} from "@joge/sdk";
import type { RoundContracts } from "../contracts.ts";
import {
  type BoundaryProof,
  BURNS_NFTS,
  commitment,
  final,
  gateContractOf,
  nft,
  type TokenUtxo,
  timeout,
} from "./shared.ts";

export interface LockParams {
  contracts: RoundContracts;
  master: TokenUtxo;
  gates: TokenUtxo[];
  proof: BoundaryProof;
  /** Gold only: the XAU/BCH pair (`proof` is then the USD/BCH pair). */
  xauProof?: BoundaryProof;
}

/** What the gates add up to at lock: totals per outcome, entrants and the pot (gate value beyond creation dust). */
function merged(open: OpenRound, gates: TokenUtxo[]) {
  const ordered = [...gates].sort((a, b) => decodeGate(commitment(a)).gateIndex - decodeGate(commitment(b)).gateIndex);
  if (ordered.length !== open.gates) throw new Error(`round has ${open.gates} gates, got ${ordered.length}`);
  const states = ordered.map((gate) => decodeGate(commitment(gate)));
  const totals = Array.from({ length: open.outcomes }, (_, outcome) =>
    states.reduce((sum, state) => sum + (state.totals[outcome] ?? 0n), 0n),
  );
  const entrants = states.reduce((sum, state) => sum + state.entrants, 0);
  const pot = potFromGates(ordered.map((gate) => gate.satoshis));
  return { ordered, totals, entrants, pot };
}

const voidRecord = (open: OpenRound, entrants: number) =>
  encodeSweep({
    roundId: open.roundId,
    state: "void",
    winner: null,
    pot: 0n,
    winnerTotal: 0n,
    remaining: entrants,
    creatorPkh: open.creatorPkh,
  });

/** Lock: master + every gate in gate order → the locked round, or the void round when it cannot be decided. */
export function buildLock({ contracts, master, gates, proof, xauProof }: LockParams) {
  const open = decodeOpen(commitment(master));
  const { ordered, totals, entrants, pot } = merged(open, gates);
  const isVoid = voidAtLock(totals, pot, entrants, open.minPot, open.minEntrants);
  const { previous, first } = proof;
  let unlock: ReturnType<typeof contracts.open.unlock.lock>;
  if (open.asset === "GOLD") {
    if (!xauProof) throw new Error("gold needs the XAU/BCH pair too");
    unlock = contracts.open.unlock.lockGold(
      previous.message,
      previous.signature,
      first.message,
      first.signature,
      xauProof.previous.message,
      xauProof.previous.signature,
      xauProof.first.message,
      xauProof.first.signature,
    );
  } else {
    unlock = contracts.open.unlock.lock(previous.message, previous.signature, first.message, first.signature);
  }
  const record = isVoid
    ? voidRecord(open, entrants)
    : encodeLocked({
        ...open,
        lockSequence: first.dataSequence,
        xauLockSequence: xauProof?.first.dataSequence ?? 0,
        pot,
        entrants,
        totals,
      });
  const builder = new contracts.TransactionBuilder({ provider: contracts.open.provider, ...BURNS_NFTS }).addInput(
    master,
    unlock,
    final,
  );
  for (const gate of ordered) builder.addInput(gate, gateContractOf(contracts, gate).unlock.merge(), final);
  return builder.addOutput({
    to: hexToBin(isVoid ? contracts.sweep.lockingBytecode : contracts.locked.lockingBytecode),
    amount:
      [master, ...ordered].reduce((sum, utxo) => sum + utxo.satoshis, 0n) -
      lockFee(open.gates, decodeGate(commitment(ordered[0] as TokenUtxo)).stakeClass),
    token: nft(contracts.category, "mutable", record),
  });
}

/** The deadline after which a round that could not lock or settle may be voided by anyone. */
export const voidDeadline = (closeTime: number) => closeTime + SETTLE_TIMEOUT;

/** Oracle outage: after T_close + timeout, master + every gate → a void round (everyone refunded). */
export function buildLockTimeout({ contracts, master, gates }: Omit<LockParams, "proof" | "xauProof">) {
  const open = decodeOpen(commitment(master));
  const { ordered, entrants } = merged(open, gates);
  const builder = new contracts.TransactionBuilder({ provider: contracts.open.provider, ...BURNS_NFTS })
    .setLocktime(voidDeadline(open.closeTime))
    .addInput(master, contracts.open.unlock.lockTimeout(), timeout);
  for (const gate of ordered) builder.addInput(gate, gateContractOf(contracts, gate).unlock.merge(), final);
  return builder.addOutput({
    to: hexToBin(contracts.sweep.lockingBytecode),
    amount:
      [master, ...ordered].reduce((sum, utxo) => sum + utxo.satoshis, 0n) -
      lockFee(open.gates, decodeGate(commitment(ordered[0] as TokenUtxo)).stakeClass),
    token: nft(contracts.category, "mutable", voidRecord(open, entrants)),
  });
}
