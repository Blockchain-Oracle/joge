"use client";

import { encodeCashAddress, hexToBin } from "@bitauth/libauth";
import { POSTURES, type Posture } from "@joge/brain/postures";
import type { Network } from "@joge/db";
import { LANES } from "@joge/sdk";
import { laneLabel, usd } from "../rounds/format.ts";
import { useMoney } from "../rounds/money.ts";
import { cashPrefix } from "../wallet/keys.ts";
import { PERCENT } from "./constants.ts";

export const laneOf = (thread: number) => LANES.find((lane) => lane.thread === thread);

const LABELS: Record<Posture, string> = {
  guarded: "Careful",
  balanced: "Balanced",
  active: "Bold",
  partner: "Partner",
};

/** Each posture in a few words, written from the numbers the runner's gate enforces. */
export const POSTURE_COPY: Record<Posture, { label: string; line: string }> = Object.fromEntries(
  (Object.keys(POSTURES) as Posture[]).map((posture) => {
    const rules = POSTURES[posture];
    return [
      posture,
      {
        label: LABELS[posture],
        line:
          posture === "partner"
            ? "Takes the empty side, so a lone call still plays"
            : `${Math.round(rules.minConfidence * PERCENT)}%+ sure · rests after ${rules.breakerLosses} losses`,
      },
    ];
  }),
) as Record<Posture, { label: string; line: string }>;

export const MODE_COPY = {
  ask: { label: "Asks you", tag: "Asks you", line: "Proposes; you tap" },
  auto: { label: "Plays alone", tag: "Plays alone", line: "From its vault, inside its caps" },
} as const;

/** Sats in US dollars at the live BCH price (shared with every money figure in the app). */
export const useSatsUsd = useMoney;

/** A P2PKH owner's cash address. */
export const ownerAddress = (network: Network, pkh: string) =>
  encodeCashAddress({ prefix: cashPrefix(network), type: "p2pkh", payload: hexToBin(pkh) }).address;

const ADDRESS_HEAD = 6;
const ADDRESS_TAIL = 4;

/** "qz3f…8k2m" without the prefix. */
export const shortAddress = (address: string) => {
  const bare = address.split(":").pop() ?? address;
  return `${bare.slice(0, ADDRESS_HEAD)}…${bare.slice(-ADDRESS_TAIL)}`;
};

/** "$1" for whole dollars, "$0.10" for cents. */
export const chipUsd = (dollars: number) => (Number.isInteger(dollars) ? `$${dollars}` : usd(dollars));

export const laneName = (thread: number) => {
  const lane = laneOf(thread);
  return lane ? `${lane.asset} ${laneLabel(lane.seconds)}` : `lane ${thread}`;
};
