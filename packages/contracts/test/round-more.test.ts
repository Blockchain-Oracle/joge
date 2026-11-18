// Proof P6 (local part, continued): gold settled from two feeds, a price-range round, and a sweep in two batches.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeGate,
  decodeLocked,
  decodeSweep,
  decodeTicket,
  findBoundaryPair,
  findBySequence,
  type PriceMessage,
} from "@joge/sdk";
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
  const gate = (await gateUtxos(round)).find((utxo) => decodeGate(utxo.token.nft.commitment).gateIndex === gateIndex);
  assert.ok(gate);
  return gate;
}

async function enter(round: Round, who: Player, gateIndex: number, outcome: number, stake: bigint) {
  const builder = buildEnter({
    contracts: round.contracts,
    gate: await gateAt(round, gateIndex),
    funding: [await fund(round, who, stake + 10_000n)],
    outcome,
    stake,
    payoutPkh: who.pkh,
    change: Uint8Array.from(Buffer.from(who.lockingBytecode, "hex")),
  });
  await builder.send();
}

async function allGates(round: Round) {
  return Promise.all(Array.from({ length: round.open.gates }, (_, index) => gateAt(round, index)));
}

for (const testKit of KITS) {
  describe(testKit.kit.name, () => {
    describe("P6 · gold, settled from USD/BCH and XAU/BCH together", () => {
      it("locks and settles on two feeds and pays the winners", async () => {
        const usd = fixtures("latest-usd-bch.json");
        const xau = fixtures("latest-xau-bch.json");
        const times = boundaries(usd, 30, 60);
        const xauLock = findBoundaryPair(xau, times.lockTime);
        const xauClose = findBoundaryPair(xau, times.closeTime);
        assert.ok(xauLock && xauClose, "the XAU/BCH fixture covers the round");
        const xauStrike = findBySequence(xau, xauLock.first.dataSequence + 1) as PriceMessage;
        const round = await newRound(
          {
            asset: "GOLD",
            stakeClass: "hourly",
            lockTime: times.lockTime,
            closeTime: times.closeTime,
            gates: 2,
          },
          testKit,
        );
        await enter(round, player("ana"), 0, 0, 200_000n);
        await enter(round, player("ben"), 1, 1, 300_000n);
        await sendMeasured(
          "lockGold (2 gates)",
          buildLock({
            contracts: round.contracts,
            master: round.master,
            gates: await allGates(round),
            proof: times.lock,
            xauProof: xauLock,
          }),
          testKit.kit.name,
        );
        const [locked] = await utxosAt(round, round.contracts.locked.lockingBytecode);
        assert.ok(locked);
        assert.equal(decodeLocked(locked.token.nft.commitment).xauLockSequence, xauLock.first.dataSequence);
        const { builder, strikePrice, closePrice, outcome } = buildSettle({
          contracts: round.contracts,
          master: locked,
          strike: times.strike,
          close: times.close,
          xau: { strike: xauStrike, close: xauClose },
          protocolLockingBytecode: round.protocol.lockingBytecode,
        });
        await sendMeasured("settleGold", builder, testKit.kit.name);
        const dollars = (value: bigint) => (Number(value) / 10_000).toFixed(2);
        console.log(`gold $${dollars(strikePrice)} → $${dollars(closePrice)} per oz: winner ${outcome.winner}`);
        const [settled] = await utxosAt(round, round.contracts.sweep.lockingBytecode);
        assert.ok(settled);
        const tickets = await utxosAt(round, round.contracts.ticket.lockingBytecode);
        await sendMeasured(
          "sweep (2 tickets)",
          buildSweep({ contracts: round.contracts, master: settled, tickets }).builder,
          testKit.kit.name,
        );
      });
    });

    describe("P6 · price ranges (an event-style round)", () => {
      it("pays the range the close lands in", async () => {
        const prices = fixtures("latest-usd-btc.json");
        const times = boundaries(prices, 20, 30);
        const close = times.close.first.price;
        const boundariesAround = [close - 5_000, close + 5_000];
        const round = await newRound(
          {
            mode: "ranges",
            outcomes: 3,
            boundaries: boundariesAround,
            stakeClass: "event",
            lockTime: times.lockTime,
            closeTime: times.closeTime,
            gates: 1,
            creatorFeeBps: 300,
          },
          testKit,
        );
        const middle = player("middle");
        await enter(round, player("low"), 0, 0, 1_000_000n);
        await enter(round, middle, 0, 1, 2_000_000n);
        await enter(round, player("high"), 0, 2, 3_000_000n);
        await sendMeasured(
          "lock (1 gate, ranges)",
          buildLock({
            contracts: round.contracts,
            master: round.master,
            gates: await allGates(round),
            proof: times.lock,
          }),
          testKit.kit.name,
        );
        const [locked] = await utxosAt(round, round.contracts.locked.lockingBytecode);
        assert.ok(locked);
        const { builder, outcome } = buildSettle({
          contracts: round.contracts,
          master: locked,
          strike: times.strike,
          close: times.close,
          protocolLockingBytecode: round.protocol.lockingBytecode,
        });
        await sendMeasured("settle (ranges, both fees)", builder, testKit.kit.name);
        assert.equal(outcome.winner, 1, "the close sits inside the middle range");
        assert.equal(outcome.protocolFee, 120_000n, "2 % of a 6,000,000-sat pot");
        assert.equal(outcome.creatorFee, 180_000n, "3 % creator fee");
        const [settled] = await utxosAt(round, round.contracts.sweep.lockingBytecode);
        assert.ok(settled);
        const tickets = await utxosAt(round, round.contracts.ticket.lockingBytecode);
        const { payouts, batch } = buildSweep({ contracts: round.contracts, master: settled, tickets });
        const winnerIndex = batch.findIndex((utxo) => decodeTicket(utxo.token.nft.commitment).outcome === 1);
        assert.equal(
          payouts[winnerIndex],
          6_000_000n - 300_000n + 1_200n - 250n,
          "the only winner takes the pot after fees",
        );
        await sendMeasured(
          "sweep (3 tickets, ranges)",
          buildSweep({ contracts: round.contracts, master: settled, tickets }).builder,
          testKit.kit.name,
        );
      });
    });

    describe("P6 · sweep in batches", () => {
      it("pays the same amounts whatever the batching, then burns the master", async () => {
        const prices = fixtures("latest-usd-eth.json");
        const times = boundaries(prices, 40, 15);
        const round = await newRound(
          { asset: "ETH", lockTime: times.lockTime, closeTime: times.closeTime, gates: 2 },
          testKit,
        );
        for (const [index, stake] of [60_000n, 70_000n, 80_000n, 90_000n].entries()) {
          await enter(round, player(`p${index}`), index % 2, index % 2, stake);
        }
        await buildLock({
          contracts: round.contracts,
          master: round.master,
          gates: await allGates(round),
          proof: times.lock,
        }).send();
        const [locked] = await utxosAt(round, round.contracts.locked.lockingBytecode);
        assert.ok(locked);
        await buildSettle({
          contracts: round.contracts,
          master: locked,
          strike: times.strike,
          close: times.close,
          protocolLockingBytecode: round.protocol.lockingBytecode,
        }).builder.send();
        const [settled] = await utxosAt(round, round.contracts.sweep.lockingBytecode);
        assert.ok(settled);
        const before = decodeSweep(settled.token.nft.commitment);
        const tickets = await utxosAt(round, round.contracts.ticket.lockingBytecode);
        const all = buildSweep({ contracts: round.contracts, master: settled, tickets }).payouts;
        const first = buildSweep({ contracts: round.contracts, master: settled, tickets: tickets.slice(0, 3) });
        await first.builder.send();
        const [midway] = await utxosAt(round, round.contracts.sweep.lockingBytecode);
        assert.ok(midway, "the master carries on with one ticket left");
        assert.equal(decodeSweep(midway.token.nft.commitment).remaining, before.remaining - 3);
        const second = buildSweep({
          contracts: round.contracts,
          master: midway,
          tickets: await utxosAt(round, round.contracts.ticket.lockingBytecode),
        });
        await second.builder.send();
        const batched = new Map(
          [...first.batch, ...second.batch].map((utxo, index) => [
            `${utxo.txid}:${utxo.vout}`,
            [...first.payouts, ...second.payouts][index],
          ]),
        );
        const single = buildSweep({ contracts: round.contracts, master: settled, tickets }).batch;
        for (const [index, utxo] of single.entries())
          assert.equal(batched.get(`${utxo.txid}:${utxo.vout}`), all[index]);
        assert.equal(
          (await utxosAt(round, round.contracts.sweep.lockingBytecode)).length,
          0,
          "master burned after the last batch",
        );
      });
    });

    describe("P6 · fee calibration (gold, ranges)", () => {
      it("every lifecycle fee covers at least 1 sat per byte", () => {
        for (const row of sizes) {
          const rate = Number(row.fee) / row.bytes;
          console.log(
            `${row.step.padEnd(28)} ${String(row.bytes).padStart(6)} B  fee ${String(row.fee).padStart(6)}  ${rate.toFixed(2)} sat/B`,
          );
          assert.ok(rate >= 1, `${row.step} pays ${rate.toFixed(2)} sat/B`);
        }
      });
    });
  });
}
