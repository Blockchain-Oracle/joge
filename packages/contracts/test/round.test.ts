// Whole rounds on the local VM — entries, lock, settle and sweep with real oracle messages —
// with every payout checked against the SDK's maths and every lifecycle fee checked against its transaction size.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeGate, decodeLocked, decodeSweep, decodeTicket, settle, ticketPayout } from "@joge/sdk";
import type { TransactionBuilder } from "cashscript";
import { buildEnter, buildLock, buildSettle, buildSweep, type TokenUtxo } from "../src/builders.ts";
import {
  boundaries,
  fixtures,
  fund,
  gateUtxos,
  measure,
  newRound,
  type Player,
  player,
  type Round,
  utxosAt,
} from "./harness.ts";
import { KITS } from "./kits.ts";

const sizes: Array<{ kit: string; step: string; bytes: number; fee: bigint }> = [];

async function sendMeasured(step: string, builder: TransactionBuilder, kit = "CashScript") {
  const { bytes, fee } = await measure(builder);
  await builder.send();
  sizes.push({ kit, step, bytes, fee });
}

async function gateAt(round: Round, gateIndex: number): Promise<TokenUtxo> {
  const gates = await gateUtxos(round);
  const gate = gates.find((utxo) => decodeGate(utxo.token.nft.commitment).gateIndex === gateIndex);
  assert.ok(gate, `gate ${gateIndex} not found`);
  return gate;
}

async function enter(round: Round, who: Player, gateIndex: number, outcome: number, stake: bigint) {
  const coin = await fund(round, who, stake + 10_000n);
  const builder = buildEnter({
    contracts: round.contracts,
    gate: await gateAt(round, gateIndex),
    funding: [coin],
    outcome,
    stake,
    payoutPkh: who.pkh,
    change: Uint8Array.from(Buffer.from(who.lockingBytecode, "hex")),
  });
  await sendMeasured(`enter (gate ${gateIndex})`, builder);
}

for (const testKit of KITS) {
  describe(testKit.kit.name, () => {
    describe("a BTC up/down round, start to finish, on the local VM", () => {
      it("enters, locks, settles and pays every ticket exactly", async () => {
        const prices = fixtures("latest-usd-btc.json");
        const times = boundaries(prices, 30, 10);
        const round = await newRound({ lockTime: times.lockTime, closeTime: times.closeTime, gates: 2 }, testKit);
        const alice = player("alice");
        const bob = player("bob");
        const carol = player("carol");
        await enter(round, alice, 0, 0, 100_000n);
        await enter(round, bob, 1, 1, 50_000n);
        await enter(round, carol, 0, 0, 30_000n);

        const lockBuilder = buildLock({
          contracts: round.contracts,
          master: round.master,
          gates: [await gateAt(round, 0), await gateAt(round, 1)],
          proof: times.lock,
        });
        await sendMeasured("lock (2 gates)", lockBuilder, testKit.kit.name);
        const [locked] = await utxosAt(round, round.contracts.locked.lockingBytecode);
        assert.ok(locked, "round is locked");
        const lockedRound = decodeLocked(locked.token.nft.commitment);
        assert.equal(lockedRound.pot, 180_000n);
        assert.deepEqual(lockedRound.totals, [130_000n, 50_000n]);
        assert.equal(lockedRound.lockSequence, times.lock.first.dataSequence);

        const { builder: settleBuilder, outcome } = buildSettle({
          contracts: round.contracts,
          master: locked,
          strike: times.strike,
          close: times.close,
          protocolLockingBytecode: round.protocol.lockingBytecode,
        });
        await sendMeasured("settle", settleBuilder, testKit.kit.name);
        const expected = settle(lockedRound, BigInt(times.strike.price), BigInt(times.close.first.price));
        assert.deepEqual(outcome, expected);
        const [settled] = await utxosAt(round, round.contracts.sweep.lockingBytecode);
        assert.ok(settled);
        const sweepRound = decodeSweep(settled.token.nft.commitment);
        console.log(
          `strike ${times.strike.price} → close ${times.close.first.price}: ${sweepRound.state}, winner ${sweepRound.winner}`,
        );

        const tickets = await utxosAt(round, round.contracts.ticket.lockingBytecode);
        assert.equal(tickets.length, 3);
        const {
          builder: sweepBuilder,
          payouts,
          batch,
        } = buildSweep({ contracts: round.contracts, master: settled, tickets });
        await sendMeasured("sweep (3 tickets)", sweepBuilder, testKit.kit.name);
        batch.forEach((utxo, index) => {
          const ticket = decodeTicket(utxo.token.nft.commitment);
          assert.equal(payouts[index], ticketPayout(sweepRound, ticket, utxo.satoshis));
        });
        assert.equal(
          (await utxosAt(round, round.contracts.sweep.lockingBytecode)).length,
          0,
          "master burned after the last ticket",
        );
        if (sweepRound.state === "settled") {
          const winners = tickets
            .map((utxo) => decodeTicket(utxo.token.nft.commitment))
            .filter((t) => t.outcome === sweepRound.winner);
          const shares = winners.reduce((sum, t) => sum + (t.stake * sweepRound.pot) / sweepRound.winnerTotal, 0n);
          assert.ok(shares <= sweepRound.pot, "winners never get more than the pot");
        }
      });
    });

    describe("void at lock", () => {
      it("refunds everyone when only one side has stakes", async () => {
        const prices = fixtures("latest-usd-btc.json");
        const times = boundaries(prices, 50, 5);
        const round = await newRound({ lockTime: times.lockTime, closeTime: times.closeTime, gates: 1 }, testKit);
        const alice = player("alice");
        const bob = player("bob");
        await enter(round, alice, 0, 0, 20_000n);
        await enter(round, bob, 0, 0, 40_000n);
        await sendMeasured(
          "lock → void (1 gate)",
          buildLock({
            contracts: round.contracts,
            master: round.master,
            gates: [await gateAt(round, 0)],
            proof: times.lock,
          }),
          testKit.kit.name,
        );
        const [voided] = await utxosAt(round, round.contracts.sweep.lockingBytecode);
        assert.ok(voided);
        assert.equal(decodeSweep(voided.token.nft.commitment).state, "void");
        const tickets = await utxosAt(round, round.contracts.ticket.lockingBytecode);
        const { payouts, batch } = buildSweep({ contracts: round.contracts, master: voided, tickets });
        const stakes = batch.map((utxo) => decodeTicket(utxo.token.nft.commitment).stake);
        for (const [index, payout] of payouts.entries())
          assert.equal(payout, (stakes[index] as bigint) + 1_200n - 250n);
        await buildSweep({ contracts: round.contracts, master: voided, tickets }).builder.send();
      });
    });

    describe("fee calibration", () => {
      it("every lifecycle fee covers at least 1 sat per byte", () => {
        for (const row of sizes) {
          const rate = Number(row.fee) / row.bytes;
          console.log(
            `${row.step.padEnd(22)} ${String(row.bytes).padStart(6)} B  fee ${String(row.fee).padStart(6)}  ${rate.toFixed(2)} sat/B`,
          );
          assert.ok(rate >= 1, `${row.step} pays ${rate.toFixed(2)} sat/B`);
        }
      });
    });
  });
}
