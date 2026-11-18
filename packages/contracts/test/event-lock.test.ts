// Regression (found on chipnet 2026-11-17, event 514): an event's gates are nearly twice a lane gate's size, so a
// two-gate event's lock and lock-timeout cost more than 1,600 + 700 per gate; they could never relay, freezing the
// event. Every event lock and lock-timeout must pay at least 1 sat per byte, for every gate count the factory allows.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeGate } from "@joge/sdk";
import { buildEnter, buildLock, buildLockTimeout, type TokenUtxo } from "../src/builders.ts";
import { boundaries, fixtures, fund, gateUtxos, measure, newRound, player, type Round } from "./harness.ts";

const btc = fixtures("latest-usd-btc.json");
const times = boundaries(btc, 30, 60);
const MAX_GATES = 4;

async function eventWithEntries(gates: number): Promise<Round> {
  const round = await newRound({ lockTime: times.lockTime, closeTime: times.closeTime, gates, stakeClass: "event" });
  for (const gateIndex of Array.from({ length: gates }, (_, index) => index)) {
    const gate = (await gateUtxos(round)).find(
      (utxo) => decodeGate(utxo.token.nft.commitment).gateIndex === gateIndex,
    ) as TokenUtxo;
    const who = player(`p${gateIndex}`);
    await buildEnter({
      contracts: round.contracts,
      gate,
      funding: [await fund(round, who, 50_000n)],
      outcome: gateIndex % 2,
      stake: 10_000n,
      payoutPkh: who.pkh,
      change: Uint8Array.from(Buffer.from(who.lockingBytecode, "hex")),
    }).send();
  }
  return round;
}

describe("event locks pay their way at every gate count", () => {
  for (let gates = 1; gates <= MAX_GATES; gates += 1) {
    it(`${gates} event gate(s): lock and lock-timeout pay at least 1 sat/byte`, async () => {
      const round = await eventWithEntries(gates);
      const lock = buildLock({
        contracts: round.contracts,
        master: round.master,
        gates: await gateUtxos(round),
        proof: times.lock,
      });
      const { bytes, fee } = await measure(lock);
      assert.ok(fee >= BigInt(bytes), `lock: ${bytes} bytes, ${fee} sats`);
      const timeout = buildLockTimeout({
        contracts: round.contracts,
        master: round.master,
        gates: await gateUtxos(round),
      });
      const late = await measure(timeout);
      assert.ok(late.fee >= BigInt(late.bytes), `lock-timeout: ${late.bytes} bytes, ${late.fee} sats`);
      await lock.send();
    });
  }
});
