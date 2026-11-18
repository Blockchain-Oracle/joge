import { hexToBin } from "@bitauth/libauth";
import { decodeLocked, encodeSweep, GOLD_FACTOR, type PriceMessage, SETTLE_FEE, settle } from "@joge/sdk";
import type { RoundContracts } from "../contracts.ts";
import { voidDeadline } from "./lock.ts";
import { type BoundaryProof, commitment, final, nft, p2pkh, type TokenUtxo, timeout } from "./shared.ts";

const GOLD_FACTOR_BIG = BigInt(GOLD_FACTOR);
const goldPrice = (usd: number, xau: number): bigint => (BigInt(usd) * GOLD_FACTOR_BIG) / BigInt(xau);

export interface SettleParams {
  contracts: RoundContracts;
  master: TokenUtxo;
  /** The strike: the oracle's message S + 1 (USD/BCH for gold). */
  strike: PriceMessage;
  /** The canonical pair at T_close (USD/BCH for gold). */
  close: BoundaryProof;
  /** Gold only: the XAU/BCH strike and close pair. */
  xau?: { strike: PriceMessage; close: BoundaryProof };
  protocolLockingBytecode: string;
}

/** Settle: the locked master alone → the sweep record, plus the protocol and creator fees when large enough. */
export function buildSettle({ contracts, master, strike, close, xau, protocolLockingBytecode }: SettleParams) {
  const round = decodeLocked(commitment(master));
  const isGold = round.asset === "GOLD";
  if (isGold && !xau) throw new Error("gold settles with the XAU/BCH strike and close too");
  const strikePrice = isGold && xau ? goldPrice(strike.price, xau.strike.price) : BigInt(strike.price);
  const closePrice = isGold && xau ? goldPrice(close.first.price, xau.close.first.price) : BigInt(close.first.price);
  const outcome = settle(round, strikePrice, closePrice);
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
      ? contracts.locked.unlock.settleGold(
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
      : contracts.locked.unlock.settle(
          strike.message,
          strike.signature,
          close.previous.message,
          close.previous.signature,
          close.first.message,
          close.first.signature,
        );
  const builder = new contracts.TransactionBuilder({ provider: contracts.locked.provider })
    .addInput(master, unlock, final)
    .addOutput({
      to: hexToBin(contracts.sweep.lockingBytecode),
      amount: master.satoshis - outcome.protocolFee - outcome.creatorFee - SETTLE_FEE,
      token: nft(contracts.category, "mutable", record),
    });
  if (outcome.protocolFee > 0n) {
    builder.addOutput({ to: hexToBin(protocolLockingBytecode), amount: outcome.protocolFee });
  }
  if (outcome.creatorFee > 0n) builder.addOutput({ to: p2pkh(round.creatorPkh), amount: outcome.creatorFee });
  return { builder, outcome, strikePrice, closePrice };
}

/** Nobody could settle (an oracle gap breaks every pair): after T_close + timeout, the locked master → void, refunds. */
export function buildSettleTimeout({ contracts, master }: { contracts: RoundContracts; master: TokenUtxo }) {
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
  return new contracts.TransactionBuilder({ provider: contracts.locked.provider })
    .setLocktime(voidDeadline(round.closeTime))
    .addInput(master, contracts.locked.unlock.timeoutVoid(), timeout)
    .addOutput({
      to: hexToBin(contracts.sweep.lockingBytecode),
      amount: master.satoshis - SETTLE_FEE,
      token: nft(contracts.category, "mutable", record),
    });
}
