"use client";

import { hashTransaction, hexToBin } from "@bitauth/libauth";
import { broadcast, buildEnter, type TokenUtxo, utxosAt } from "@joge/contracts/browser";
import type { Network } from "@joge/db";
import { decodeGate, TICKET_DUST } from "@joge/sdk";
import { placeholderP2PKHUnlocker } from "cashscript";
import { fulcrum, roundsOf } from "../wallet/chain.ts";
import type { WalletCoin } from "../wallet/coins.ts";
import type { WalletKey } from "../wallet/keys.ts";
import type { InputPath } from "../wallet/wallet-context.tsx";
import { ENTRY_FEE_ALLOWANCE } from "./constants.ts";

/** What an entry needs on top of the stake: the ticket's dust and the network fee (≈1 sat/byte, two inputs). */
export const ENTRY_OVERHEAD = TICKET_DUST + ENTRY_FEE_ALLOWANCE;
const MAX_FUNDING = 6;

export interface EntryRequest {
  /** CashScript's WalletConnect object (the wallet shows it and signs its own inputs). */
  transaction: unknown;
  inputPaths: InputPath[];
  spent: string[];
}

/** Coins that cover `needed`, largest first. */
export function pickCoins(coins: WalletCoin[], needed: bigint): WalletCoin[] | null {
  const picked: WalletCoin[] = [];
  let total = 0n;
  for (const coin of [...coins].sort((a, b) => (b.satoshis > a.satoshis ? 1 : -1))) {
    if (total >= needed || picked.length >= MAX_FUNDING) break;
    picked.push(coin);
    total += coin.satoshis;
  }
  return total >= needed ? picked : null;
}

/**
 * Builds a player's entry from live chain reads: a random gate of the round (spreads simultaneous entries across
 * gates), the wallet's coins as funding (signed by the wallet), the ticket paying the wallet's receive address.
 */
export async function buildEntry({
  network,
  roundId,
  eventRound,
  outcome,
  stake,
  coins,
  payout,
  change,
  prompt,
}: {
  network: Network;
  roundId: number;
  eventRound: boolean;
  outcome: number;
  stake: bigint;
  coins: WalletCoin[];
  payout: WalletKey;
  change: WalletKey;
  prompt: string;
}): Promise<EntryRequest> {
  const { round, deployment } = await roundsOf(network);
  const pool = await fulcrum(network);
  const gateBytecode = eventRound ? round.eventGate.lockingBytecode : round.gate.lockingBytecode;
  const gates = (await utxosAt(pool, gateBytecode)).filter(
    (utxo) =>
      utxo.token?.category === deployment.category &&
      utxo.token.nft &&
      decodeGate(utxo.token.nft.commitment).roundId === roundId,
  ) as unknown as TokenUtxo[];
  const gate = gates[Math.floor(Math.random() * gates.length)];
  if (!gate) throw new Error("This round is no longer taking entries");
  const funding = pickCoins(coins, stake + ENTRY_OVERHEAD);
  if (!funding) throw new Error("Not enough in your wallet for this stake");
  const builder = buildEnter({
    contracts: round,
    gate,
    funding: funding.map((coin) => ({ utxo: coin, unlocker: placeholderP2PKHUnlocker(coin.key.address) })),
    outcome,
    stake,
    payoutPkh: hexToBin(payout.pkh),
    change: change.address,
  });
  return {
    transaction: builder.generateWcTransactionObject({ broadcast: false, userPrompt: prompt }),
    inputPaths: funding.map((coin, index): InputPath => [index + 1, coin.key.path, coin.key.index]),
    spent: funding.map((coin) => `${coin.txid}:${coin.vout}`),
  };
}

/** The txid of a signed transaction (known before broadcast, so the journal never loses it). */
export const txidOf = (signedHex: string) => hashTransaction(hexToBin(signedHex));

/** A broadcast that failed because the gate (or a coin) was spent first: someone entered at the same moment. */
export const lostRace = (message: string) =>
  /missing ?inputs|missingorspent|txn-mempool-conflict|conflict|already spent/i.test(message);

export async function sendEntry(network: Network, signedHex: string) {
  return broadcast(await fulcrum(network), signedHex);
}
