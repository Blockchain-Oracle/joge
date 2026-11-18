"use client";

import {
  binToHex,
  encodeCashAddress,
  encodeDataPush,
  encodeTransaction,
  flattenBinArray,
  generateSigningSerializationBCH,
  hash160,
  hash256,
  type Input,
  type Output,
  secp256k1,
  stringify,
  type TransactionCommon,
} from "@bitauth/libauth";
import type { Network } from "@joge/db";
import { useSyncExternalStore } from "react";
import { deskPrivateKey } from "@/lib/desk-key";
import { fromWire } from "@/lib/wire";
import { cashPrefix, type WalletKey } from "../wallet/keys.ts";

/**
 * The judge desk (F14, D14; Mitoshi's sealed desk made simpler for BCH): the judge link carries a 32-byte secret in its
 * fragment (never sent to a server); the page derives one funded key from it and signs the wallet's inputs itself, the
 * same way a paired wallet would. Every judge with the link shares the wallet. Nothing here can send coins anywhere but
 * into rounds the player chooses: the app offers no withdraw for the desk.
 */
const STORE = "joge:desk";
const SIGHASH_ALL_FORKID = 0x41;
const FRAGMENT = /(?:^#|&)k=([0-9a-f]{64})(?:&|$)/i;

const listeners = new Set<() => void>();
const read = () => {
  try {
    return localStorage.getItem(STORE);
  } catch {
    return null;
  }
};
const notify = () => {
  for (const listener of listeners) listener();
};

/** The desk secret held by this browser, or null. */
export const useDeskSecret = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => null,
  );

export function keepDesk(secret: string) {
  try {
    localStorage.setItem(STORE, secret.toLowerCase());
  } catch {
    // Still works for this page.
  }
  notify();
}

/** Gives the wallet back: this browser forgets the desk (the coins stay for the next judge). */
export function leaveDesk() {
  try {
    localStorage.removeItem(STORE);
    localStorage.removeItem(STEPS_STORE);
  } catch {
    // Nothing to forget.
  }
  notify();
}

/** The secret in a judge link or its fragment ("#k=<64 hex>"), or null. */
export function secretOf(link: string): string | null {
  const hash = link.includes("#") ? link.slice(link.indexOf("#")) : `#${link}`;
  return FRAGMENT.exec(hash)?.[1]?.toLowerCase() ?? null;
}

/** The desk as the wallet's one address (receive 0; change returns there too). */
export function deskKey(secret: string, network: Network): WalletKey {
  const pubkey = secp256k1.derivePublicKeyCompressed(deskPrivateKey(secret));
  if (typeof pubkey === "string") throw new Error(pubkey);
  const pkhBytes = hash160(pubkey);
  const pkh = binToHex(pkhBytes);
  return {
    path: "receive",
    index: 0,
    pubkey,
    pkh,
    address: encodeCashAddress({ prefix: cashPrefix(network), type: "p2pkh", payload: pkhBytes }).address,
    lockingBytecode: `76a914${pkh}88ac`,
  };
}

/**
 * Signs the given inputs of a CashScript WalletConnect object exactly as a paired wallet does (Schnorr, SIGHASH_ALL
 * with FORKID) and returns the transaction hex for the page to broadcast.
 */
export function signAsDesk(secret: string, request: unknown, inputs: number[]): string {
  const privateKey = deskPrivateKey(secret);
  const publicKey = secp256k1.derivePublicKeyCompressed(privateKey);
  if (typeof publicKey === "string") throw new Error(publicKey);
  const { transaction, sourceOutputs } = fromWire<{
    transaction: TransactionCommon<Input, Output>;
    sourceOutputs: Array<Output & { lockingBytecode: Uint8Array }>;
  }>(stringify(request));
  for (const inputIndex of inputs) {
    const serialization = generateSigningSerializationBCH(
      { inputIndex, sourceOutputs, transaction },
      {
        coveredBytecode: sourceOutputs[inputIndex]?.lockingBytecode ?? new Uint8Array(),
        signingSerializationType: Uint8Array.of(SIGHASH_ALL_FORKID),
      },
    );
    const signature = secp256k1.signMessageHashSchnorr(privateKey, hash256(serialization));
    if (typeof signature === "string") throw new Error(signature);
    const input = transaction.inputs[inputIndex];
    if (!input) throw new Error(`The transaction has no input ${inputIndex}.`);
    input.unlockingBytecode = flattenBinArray([
      encodeDataPush(flattenBinArray([signature, Uint8Array.of(SIGHASH_ALL_FORKID)])),
      encodeDataPush(publicKey),
    ]);
  }
  return binToHex(encodeTransaction(transaction));
}

/* The judge's path (Mitoshi's three steps): two are read from the chain, one is marked when it happens here. */
const STEPS_STORE = "joge:desk-steps";
const stepListeners = new Set<() => void>();
const readSteps = () => {
  try {
    return localStorage.getItem(STEPS_STORE) ?? "[]";
  } catch {
    return "[]";
  }
};

export type DeskStep = "proof";

/** Marks a browse-only step done (only while a desk is open). */
export function markDeskStep(step: DeskStep) {
  if (!read()) return;
  const done = new Set(JSON.parse(readSteps()) as string[]);
  if (done.has(step)) return;
  done.add(step);
  try {
    localStorage.setItem(STEPS_STORE, JSON.stringify([...done]));
  } catch {
    // Kept for this page only.
  }
  for (const listener of stepListeners) listener();
}

export const useDeskSteps = () =>
  new Set(
    JSON.parse(
      useSyncExternalStore(
        (listener) => {
          stepListeners.add(listener);
          return () => stepListeners.delete(listener);
        },
        readSteps,
        () => "[]",
      ),
    ) as string[],
  );
