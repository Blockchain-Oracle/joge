"use client";

import {
  broadcast,
  buildDollarLock,
  buildDollarLockTimeout,
  buildDollarSettle,
  buildDollarSettleTimeout,
  buildDollarSweep,
  buildLock,
  buildLockTimeout,
  buildSettle,
  buildSettleTimeout,
  buildSweep,
  type SideUtxo,
  type TokenUtxo,
  utxosAt,
  voidDeadline,
} from "@joge/contracts/browser";
import type { Network, RoundRow } from "@joge/db";
import {
  FEEDS,
  type FeedId,
  feedsOf,
  fetchMessages,
  findBoundaryPair,
  findBySequence,
  hexToBin,
  MAX_SWEEP_BATCH,
  type PriceMessage,
  readLe,
  sortPrices,
} from "@joge/sdk";
import { fulcrum, roundsOf } from "../wallet/chain.ts";
import { ORACLE_WINDOW_SECONDS as WINDOW_SECONDS } from "./constants.ts";

const ORACLE_PAGE = 100;
const ROUND_ID_OFFSET = 1;
const ROUND_ID_BYTES = 4;

export type FinishStep = "lock" | "settle" | "pay";
export type FinishResult = { done: FinishStep; txid: string } | { waiting: string };

/** Signed messages around a moment, straight from General Protocols (CORS-open): no Jōge server involved. */
async function messagesAround(feed: FeedId, at: number): Promise<PriceMessage[]> {
  return sortPrices(
    await fetchMessages({
      publicKey: FEEDS[feed].publicKey,
      minMessageTimestamp: at - WINDOW_SECONDS,
      maxMessageTimestamp: at + WINDOW_SECONDS,
      count: ORACLE_PAGE,
    }),
  );
}

const roundIdOf = (utxo: { token?: { nft?: { commitment: string } } }) =>
  utxo.token?.nft ? Number(readLe(hexToBin(utxo.token.nft.commitment), ROUND_ID_OFFSET, ROUND_ID_BYTES)) : -1;

/** What step a round needs now, given the clock (seconds). */
export function dueStep(round: RoundRow, now: number): FinishStep | null {
  if (round.state === "open" && round.lockTime <= now) return "lock";
  if (round.state === "locked" && round.closeTime <= now) return "settle";
  if ((round.state === "settled" || round.state === "void") && round.masterOutpoint) return "pay";
  return null;
}

/**
 * Finish this round: builds the step a round is due for from live coins and the oracle's signed messages, and
 * broadcasts it. Every client builds the same bytes, so if Jōge's keeper already sent it, this changes nothing.
 */
export async function finishRound(network: Network, round: RoundRow, now: number): Promise<FinishResult> {
  const step = dueStep(round, now);
  if (!step) return { waiting: "Nothing is due yet" };
  const { round: contracts, dollar, deployment } = await roundsOf(network);
  const pool = await fulcrum(network);
  const live = async (lockingBytecode: string) =>
    (await utxosAt(pool, lockingBytecode)).filter(
      (utxo) => utxo.token?.category === deployment.category && roundIdOf(utxo) === round.roundId,
    ) as unknown as TokenUtxo[];
  // A dollar event's dollars sit in sidecars made in the same transaction as its gates or master.
  const isDollar = round.stakeClass === "dollar";
  const sidesOf = async (txids: string[]) =>
    (await utxosAt(pool, dollar.side.lockingBytecode)).filter(
      (utxo) => utxo.token?.category === deployment.dollarCategory && !utxo.token.nft && txids.includes(utxo.txid),
    ) as unknown as SideUtxo[];
  const [main, xau] = feedsOf(round.asset) as [FeedId, FeedId | undefined];
  const send = async (hex: string, done: FinishStep): Promise<FinishResult> => ({
    done,
    txid: await broadcast(pool, hex),
  });

  if (step === "lock") {
    const [master] = await live(isDollar ? dollar.open.lockingBytecode : contracts.open.lockingBytecode);
    const gates = isDollar
      ? await live(dollar.gate.lockingBytecode)
      : [...(await live(contracts.gate.lockingBytecode)), ...(await live(contracts.eventGate.lockingBytecode))];
    if (!master) return { waiting: "The round's coin is not visible yet" };
    const sides = isDollar ? await sidesOf([master.txid, ...gates.map((gate) => gate.txid)]) : [];
    const proof = findBoundaryPair(await messagesAround(main, round.lockTime), round.lockTime);
    const xauProof = xau ? findBoundaryPair(await messagesAround(xau, round.lockTime), round.lockTime) : undefined;
    if (proof && (!xau || xauProof)) {
      const gold = xauProof ? { xauProof } : {};
      return send(
        isDollar
          ? buildDollarLock({ contracts, dollar, master, gates, sides, proof, ...gold }).build()
          : buildLock({ contracts, master, gates, proof, ...gold }).build(),
        "lock",
      );
    }
    if (now > voidDeadline(round.closeTime)) {
      return send(
        isDollar
          ? buildDollarLockTimeout({ contracts, dollar, master, gates, sides }).build()
          : buildLockTimeout({ contracts, master, gates }).build(),
        "lock",
      );
    }
    return { waiting: "Waiting for the oracle's first price after the lock" };
  }

  if (step === "settle") {
    const [master] = await live(isDollar ? dollar.locked.lockingBytecode : contracts.locked.lockingBytecode);
    if (!master || round.lockSequence === null) return { waiting: "The locked round is not visible yet" };
    const [side] = isDollar ? await sidesOf([master.txid]) : [];
    if (isDollar && !side) return { waiting: "The event's pot is not visible yet" };
    const atLock = await messagesAround(main, round.lockTime);
    const atClose = await messagesAround(main, round.closeTime);
    const strike = findBySequence([...atLock, ...atClose], round.lockSequence + 1);
    const close = findBoundaryPair(atClose, round.closeTime);
    let gold = {};
    if (xau && round.xauLockSequence) {
      const xauAtLock = await messagesAround(xau, round.lockTime);
      const xauAtClose = await messagesAround(xau, round.closeTime);
      const xauStrike = findBySequence([...xauAtLock, ...xauAtClose], round.xauLockSequence + 1);
      const xauClose = findBoundaryPair(xauAtClose, round.closeTime);
      if (!xauStrike || !xauClose) return { waiting: "Waiting for gold's closing prices" };
      gold = { xau: { strike: xauStrike, close: xauClose } };
    }
    if (strike && close) {
      const settle = {
        contracts,
        master,
        strike,
        close,
        protocolLockingBytecode: deployment.protocolLockingBytecode,
        ...gold,
      };
      return send(
        isDollar && side
          ? buildDollarSettle({ ...settle, dollar, side }).builder.build()
          : buildSettle(settle).builder.build(),
        "settle",
      );
    }
    if (now > voidDeadline(round.closeTime)) {
      return send(
        isDollar && side
          ? buildDollarSettleTimeout({ contracts, dollar, master, side }).build()
          : buildSettleTimeout({ contracts, master }).build(),
        "settle",
      );
    }
    return { waiting: "Waiting for the oracle's closing price" };
  }

  const [master] = await live(isDollar ? dollar.sweep.lockingBytecode : contracts.sweep.lockingBytecode);
  if (!master) return { waiting: "The settled round is not visible yet" };
  const tickets = (await live(contracts.ticket.lockingBytecode))
    .sort((a, b) => (a.txid === b.txid ? a.vout - b.vout : a.txid < b.txid ? -1 : 1))
    .slice(0, MAX_SWEEP_BATCH);
  if (isDollar) {
    const [side] = await sidesOf([master.txid]);
    if (!side) return { waiting: "The event's pot is not visible yet" };
    return send(buildDollarSweep({ contracts, dollar, master, side, tickets }).builder.build(), "pay");
  }
  return send(buildSweep({ contracts, master, tickets }).builder.build(), "pay");
}
