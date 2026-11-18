import { hexToBin } from "@bitauth/libauth";
import {
  decodeGate,
  decodeLocked,
  decodeOpen,
  decodeSweep,
  decodeTicket,
  dollarLockFee,
  dollarSettle,
  dollarShare,
  encodeLocked,
  encodeSweep,
  GOLD_FACTOR,
  MAX_SWEEP_BATCH,
  type OpenRound,
  type PriceMessage,
  potFromSides,
  SETTLE_FEE,
  SIDE_FEE,
  SWEEP_FEE_BASE,
  SWEEP_FEE_PER_TICKET,
  SWEEP_PAD_PER_TICKET,
  TOKEN_DUST,
  voidAtLock,
} from "@joge/sdk";
import type { RoundContracts } from "../contracts.ts";
import type { DollarContracts } from "../dollar.ts";
import { dollars, type SideUtxo, sideOut } from "./dollar-entry.ts";
import { voidDeadline } from "./lock.ts";
import {
  type BoundaryProof,
  BURNS_NFTS,
  byOutpoint,
  commitment,
  final,
  nft,
  p2pkh,
  type TokenUtxo,
  timeout,
} from "./shared.ts";

/** Dollar events' lifecycle (F11): lock, settle and sweep with the round's dollars in its sidecars. */

const GOLD_FACTOR_BIG = BigInt(GOLD_FACTOR);
const goldPrice = (usd: number, xau: number): bigint => (BigInt(usd) * GOLD_FACTOR_BIG) / BigInt(xau);

export interface DollarLockParams {
  contracts: RoundContracts;
  dollar: DollarContracts;
  master: TokenUtxo;
  gates: TokenUtxo[];
  /** One sidecar per gate (any order: they merge; the builder sorts them by outpoint so every client agrees). */
  sides: SideUtxo[];
  proof: BoundaryProof;
  xauProof?: BoundaryProof;
}

function mergedDollars(open: OpenRound, gates: TokenUtxo[], sides: SideUtxo[]) {
  const ordered = [...gates].sort((a, b) => decodeGate(commitment(a)).gateIndex - decodeGate(commitment(b)).gateIndex);
  if (ordered.length !== open.gates) throw new Error(`event has ${open.gates} gates, got ${ordered.length}`);
  if (sides.length !== open.gates) throw new Error(`event has ${open.gates} sidecars, got ${sides.length}`);
  const states = ordered.map((gate) => decodeGate(commitment(gate)));
  const totals = Array.from({ length: open.outcomes }, (_, outcome) =>
    states.reduce((sum, state) => sum + (state.totals[outcome] ?? 0n), 0n),
  );
  const entrants = states.reduce((sum, state) => sum + state.entrants, 0);
  const sorted = [...sides].sort(byOutpoint);
  const held = sorted.reduce((sum, side) => sum + side.token.amount, 0n);
  return { ordered, sorted, totals, entrants, held, pot: potFromSides(sorted.map((side) => side.token.amount)) };
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

const masterAfterLock = (master: TokenUtxo, gates: TokenUtxo[], open: OpenRound) =>
  master.satoshis +
  gates.reduce((sum, gate) => sum + gate.satoshis, 0n) +
  BigInt(open.gates - 1) * TOKEN_DUST -
  dollarLockFee(open.gates);

/** Lock: master + every gate in gate order + every sidecar → the locked (or void) master and one pot sidecar. */
export function buildDollarLock({ contracts, dollar, master, gates, sides, proof, xauProof }: DollarLockParams) {
  const open = decodeOpen(commitment(master));
  const { ordered, sorted, totals, entrants, held, pot } = mergedDollars(open, gates, sides);
  const isVoid = voidAtLock(totals, pot, entrants, open.minPot, open.minEntrants);
  const { previous, first } = proof;
  let unlock: ReturnType<typeof dollar.open.unlock.lock>;
  if (open.asset === "GOLD") {
    if (!xauProof) throw new Error("gold needs the XAU/BCH pair too");
    unlock = dollar.open.unlock.lockGold(
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
    unlock = dollar.open.unlock.lock(previous.message, previous.signature, first.message, first.signature);
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
  const builder = new contracts.TransactionBuilder({ provider: dollar.open.provider, ...BURNS_NFTS }).addInput(
    master,
    unlock,
    final,
  );
  for (const gate of ordered) builder.addInput(gate, dollar.gate.unlock.merge(), final);
  for (const side of sorted) builder.addInput(side, dollar.side.unlock.move(), final);
  return builder
    .addOutput({
      to: hexToBin(isVoid ? dollar.sweep.lockingBytecode : dollar.locked.lockingBytecode),
      amount: masterAfterLock(master, ordered, open),
      token: nft(contracts.category, "mutable", record),
    })
    .addOutput(sideOut(dollar, held));
}

/** Oracle outage: after T_close + timeout, master + gates + sidecars → a void round and one pot sidecar (refunds). */
export function buildDollarLockTimeout({
  contracts,
  dollar,
  master,
  gates,
  sides,
}: Omit<DollarLockParams, "proof" | "xauProof">) {
  const open = decodeOpen(commitment(master));
  const { ordered, sorted, entrants, held } = mergedDollars(open, gates, sides);
  const builder = new contracts.TransactionBuilder({ provider: dollar.open.provider, ...BURNS_NFTS })
    .setLocktime(voidDeadline(open.closeTime))
    .addInput(master, dollar.open.unlock.lockTimeout(), timeout);
  for (const gate of ordered) builder.addInput(gate, dollar.gate.unlock.merge(), final);
  for (const side of sorted) builder.addInput(side, dollar.side.unlock.move(), final);
  return builder
    .addOutput({
      to: hexToBin(dollar.sweep.lockingBytecode),
      amount: masterAfterLock(master, ordered, open),
      token: nft(contracts.category, "mutable", voidRecord(open, entrants)),
    })
    .addOutput(sideOut(dollar, held));
}

export interface DollarSettleParams {
  contracts: RoundContracts;
  dollar: DollarContracts;
  master: TokenUtxo;
  side: SideUtxo;
  strike: PriceMessage;
  close: BoundaryProof;
  xau?: { strike: PriceMessage; close: BoundaryProof };
  protocolLockingBytecode: string;
}

/** Settle: master + pot sidecar → the sweep record and the sidecar less the fees, then the fees in dollars. */
export function buildDollarSettle(params: DollarSettleParams) {
  const { contracts, dollar, master, side, strike, close, xau, protocolLockingBytecode } = params;
  const round = decodeLocked(commitment(master));
  const isGold = round.asset === "GOLD";
  if (isGold && !xau) throw new Error("gold settles with the XAU/BCH strike and close too");
  const strikePrice = isGold && xau ? goldPrice(strike.price, xau.strike.price) : BigInt(strike.price);
  const closePrice = isGold && xau ? goldPrice(close.first.price, xau.close.first.price) : BigInt(close.first.price);
  const outcome = dollarSettle(round, strikePrice, closePrice);
  const record = encodeSweep({
    roundId: round.roundId,
    state: outcome.winner === null ? "void" : "settled",
    winner: outcome.winner,
    pot: outcome.pot,
    winnerTotal: outcome.winnerTotal,
    remaining: round.entrants,
    creatorPkh: round.creatorPkh,
  });
  const unlock =
    isGold && xau
      ? dollar.locked.unlock.settleGold(
          strike.message,
          strike.signature,
          xau.strike.message,
          xau.strike.signature,
          close.previous.message,
          close.previous.signature,
          close.first.message,
          close.first.signature,
          xau.close.previous.message,
          xau.close.previous.signature,
          xau.close.first.message,
          xau.close.first.signature,
        )
      : dollar.locked.unlock.settle(
          strike.message,
          strike.signature,
          close.previous.message,
          close.previous.signature,
          close.first.message,
          close.first.signature,
        );
  const feeOutputs = BigInt((outcome.protocolFee > 0n ? 1 : 0) + (outcome.creatorFee > 0n ? 1 : 0));
  const builder = new contracts.TransactionBuilder({ provider: dollar.locked.provider })
    .addInput(master, unlock, final)
    .addInput(side, dollar.side.unlock.move(), final)
    .addOutput({
      to: hexToBin(dollar.sweep.lockingBytecode),
      amount: master.satoshis - feeOutputs * TOKEN_DUST - SETTLE_FEE - SIDE_FEE,
      token: nft(contracts.category, "mutable", record),
    })
    .addOutput(sideOut(dollar, side.token.amount - outcome.protocolFee - outcome.creatorFee));
  if (outcome.protocolFee > 0n) {
    builder.addOutput({
      to: hexToBin(protocolLockingBytecode),
      amount: TOKEN_DUST,
      token: dollars(dollar, outcome.protocolFee),
    });
  }
  if (outcome.creatorFee > 0n) {
    builder.addOutput({ to: p2pkh(round.creatorPkh), amount: TOKEN_DUST, token: dollars(dollar, outcome.creatorFee) });
  }
  return { builder, outcome, strikePrice, closePrice };
}

/** Nobody could settle: after T_close + timeout, master + pot sidecar → void (everyone refunded in dollars). */
export function buildDollarSettleTimeout({
  contracts,
  dollar,
  master,
  side,
}: Pick<DollarSettleParams, "contracts" | "dollar" | "master" | "side">) {
  const round = decodeLocked(commitment(master));
  const record = encodeSweep({
    roundId: round.roundId,
    state: "void",
    winner: null,
    pot: 0n,
    winnerTotal: 0n,
    remaining: round.entrants,
    creatorPkh: round.creatorPkh,
  });
  return new contracts.TransactionBuilder({ provider: dollar.locked.provider })
    .setLocktime(voidDeadline(round.closeTime))
    .addInput(master, dollar.locked.unlock.timeoutVoid(), timeout)
    .addInput(side, dollar.side.unlock.move(), timeout)
    .addOutput({
      to: hexToBin(dollar.sweep.lockingBytecode),
      amount: master.satoshis - SETTLE_FEE - SIDE_FEE,
      token: nft(contracts.category, "mutable", record),
    })
    .addOutput(sideOut(dollar, side.token.amount));
}

/**
 * Sweep: master + pot sidecar + a batch of tickets (ascending outpoint) → one payout per ticket: dollars to winners
 * (or to everyone, on a void) plus each ticket's dust back less its share of the fee. The last batch sends the master's
 * satoshis and the sidecar's leftover dollars to the creator.
 */
export function buildDollarSweep({
  contracts,
  dollar,
  master,
  side,
  tickets,
}: {
  contracts: RoundContracts;
  dollar: DollarContracts;
  master: TokenUtxo;
  side: SideUtxo;
  tickets: TokenUtxo[];
}) {
  const round = decodeSweep(commitment(master));
  const batch = [...tickets].sort(byOutpoint);
  if (batch.length > round.remaining) throw new Error("more tickets than the round has left");
  if (batch.length > MAX_SWEEP_BATCH) throw new Error(`sweep at most ${MAX_SWEEP_BATCH} tickets at a time`);
  const decoded = batch.map((utxo) => decodeTicket(commitment(utxo)));
  const shares = decoded.map((ticket) => dollarShare(round, ticket));
  const dust = batch.map((utxo) => utxo.satoshis - SWEEP_FEE_PER_TICKET);
  const tickets_ = BigInt(batch.length);
  const rest =
    master.satoshis -
    SWEEP_FEE_BASE -
    SIDE_FEE -
    tickets_ * SWEEP_FEE_PER_TICKET +
    batch.reduce((sum, utxo) => sum + utxo.satoshis, 0n) -
    dust.reduce((sum, value) => sum + value, 0n);
  const dollarsLeft = side.token.amount - shares.reduce((sum, share) => sum + share, 0n);
  const left = round.remaining - batch.length;
  const builder = new contracts.TransactionBuilder({ provider: dollar.sweep.provider, ...BURNS_NFTS })
    .addInput(master, dollar.sweep.unlock.sweep(new Uint8Array(batch.length * SWEEP_PAD_PER_TICKET)), final)
    .addInput(side, dollar.side.unlock.move(), final);
  for (const utxo of batch) builder.addInput(utxo, contracts.ticket.unlock.spend(), final);
  if (left === 0) {
    const creator = p2pkh(round.creatorPkh);
    builder
      .addOutput({ to: creator, amount: rest })
      .addOutput({ to: creator, amount: side.satoshis, token: dollars(dollar, dollarsLeft) });
  } else {
    builder
      .addOutput({
        to: hexToBin(dollar.sweep.lockingBytecode),
        amount: rest,
        token: nft(contracts.category, "mutable", encodeSweep({ ...round, remaining: left })),
      })
      .addOutput(sideOut(dollar, dollarsLeft));
  }
  for (const [index, ticket] of decoded.entries()) {
    const share = shares[index] ?? 0n;
    builder.addOutput({
      to: p2pkh(ticket.payoutPkh),
      amount: dust[index] as bigint,
      ...(share > 0n ? { token: dollars(dollar, share) } : {}),
    });
  }
  return { builder, shares, batch };
}
