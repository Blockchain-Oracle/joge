// Proof P1: the CashScript oracle module against real General Protocols boundaries (latest two hours of each feed and
// the 2026-06-12 slow window), plus every message a contract must refuse.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { FEEDS, type FeedId, findBoundaryPair, findBySequence, type PriceMessage, sortPrices } from "@joge/sdk";
import { Contract, MockNetworkProvider, randomUtxo, TransactionBuilder, type Unlocker } from "cashscript";
import artifact from "../artifacts/OracleProbe.ts";

const here = import.meta.dirname;
const load = (file: string) =>
  JSON.parse(readFileSync(join(here, "fixtures", file), "utf8")) as { feed: FeedId; messages: never[] };

const FIXTURES = [
  "latest-usd-btc.json",
  "latest-usd-eth.json",
  "latest-usd-bch.json",
  "latest-xau-bch.json",
  "slow-usd-bch-2026-06-12.json",
];
const PER_FIXTURE = 10;

function probe(feed: FeedId) {
  const provider = new MockNetworkProvider();
  const contract = new Contract(artifact, [FEEDS[feed].publicKey], { provider });
  const utxo = provider.addUtxo(contract.address, randomUtxo({ satoshis: 10_000n }));
  const spend = (unlocker: Unlocker) =>
    new TransactionBuilder({ provider }).addInput(utxo, unlocker).addOutput({ to: contract.address, amount: 9_000n });
  return { contract, spend };
}

const boundaryArgs = (previous: PriceMessage, first: PriceMessage, boundary: number, expected: number) =>
  [previous.message, previous.signature, first.message, first.signature, BigInt(boundary), BigInt(expected)] as const;

/** Boundaries spread over the fixture, preferring the slowest gaps so the slow window is really exercised. */
function boundaries(prices: PriceMessage[]): number[] {
  const gaps = prices.slice(1).map((first, index) => ({ first, previous: prices[index] as PriceMessage }));
  const consecutive = gaps.filter(({ first, previous }) => first.dataSequence === previous.dataSequence + 1);
  const slowest = [...consecutive].sort(
    (a, b) => b.first.timestamp - b.previous.timestamp - (a.first.timestamp - a.previous.timestamp),
  );
  const step = Math.max(1, Math.floor(consecutive.length / PER_FIXTURE));
  const spread = consecutive.filter((_, index) => index % step === 0);
  const picked = [...slowest.slice(0, 3), ...spread].slice(0, PER_FIXTURE);
  // A boundary strictly inside the gap, as a real T_lock on the minute grid would fall.
  return picked.map(
    ({ previous, first }) => previous.timestamp + Math.ceil((first.timestamp - previous.timestamp) / 2),
  );
}

const usage: Array<{ feed: string; opCost: number; budget: number }> = [];

describe("P1 · oracle module accepts the canonical pair at real boundaries", () => {
  for (const file of FIXTURES) {
    const { feed, messages } = load(file);
    const prices = sortPrices(messages);
    it(`${file}: ${PER_FIXTURE} boundaries`, () => {
      const { contract, spend } = probe(feed);
      for (const boundary of boundaries(prices)) {
        const pair = findBoundaryPair(prices, boundary);
        assert.ok(pair, `no pair for ${boundary}`);
        const tx = spend(
          contract.unlock.boundary(...boundaryArgs(pair.previous, pair.first, boundary, pair.first.dataSequence)),
        );
        tx.debug();
        const [input] = tx.getVmResourceUsage();
        if (input) usage.push({ feed: file, opCost: input.operationCost, budget: input.maximumOperationCost });
      }
    });
  }
});

describe("P1 · strike is the message after the lock message", () => {
  it("accepts S+1 with its price and refuses any other sequence", () => {
    const { feed, messages } = load("latest-usd-btc.json");
    const prices = sortPrices(messages);
    const { contract, spend } = probe(feed);
    const lock = prices[40] as PriceMessage;
    const strike = findBySequence(prices, lock.dataSequence + 1);
    assert.ok(strike);
    spend(
      contract.unlock.strike(strike.message, strike.signature, BigInt(strike.dataSequence), BigInt(strike.price)),
    ).debug();
    assert.throws(() =>
      spend(
        contract.unlock.strike(strike.message, strike.signature, BigInt(lock.dataSequence + 2), BigInt(strike.price)),
      ).debug(),
    );
  });
});

describe("P1 · refusals", () => {
  const { feed, messages } = load("latest-usd-btc.json");
  const prices = sortPrices(messages);
  const at = (index: number) => prices[index] as PriceMessage;
  const { contract, spend } = probe(feed);
  const run = (previous: PriceMessage, first: PriceMessage, boundary: number, expected = first.dataSequence) =>
    spend(contract.unlock.boundary(...boundaryArgs(previous, first, boundary, expected))).debug();

  it("refuses non-consecutive messages", () => {
    assert.throws(() => run(at(10), at(12), at(11).timestamp), /must be consecutive/);
  });
  it("refuses a pair whose previous message is already past the boundary (not the first message)", () => {
    assert.throws(() => run(at(11), at(12), at(10).timestamp + 1), /previous message must be before the boundary/);
  });
  it("refuses a pair entirely before the boundary", () => {
    assert.throws(() => run(at(10), at(11), at(12).timestamp), /first message must be at or after the boundary/);
  });
  // A wrong signature does not return false: NULLFAIL aborts the script inside checkDataSig.
  const SIGNATURE_FAILURE = /oracle signature does not verify|NULLFAIL|signature/i;
  it("refuses a message signed by another feed's oracle", () => {
    const eth = sortPrices(load("latest-usd-eth.json").messages);
    const previous = eth[10] as PriceMessage;
    const first = eth[11] as PriceMessage;
    assert.throws(() => run(previous, first, first.timestamp), SIGNATURE_FAILURE);
  });
  it("refuses a tampered price", () => {
    const first = at(11);
    const tampered = { ...first, message: `${first.message.slice(0, 24)}ffff${first.message.slice(28)}` };
    assert.throws(() => run(at(10), tampered, first.timestamp), SIGNATURE_FAILURE);
  });
  it("refuses a wrong-length message", () => {
    const first = at(11);
    assert.throws(() => run(at(10), { ...first, message: `${first.message}00` }, first.timestamp), /must be 16 bytes/);
  });
});

describe("P1 · measurements", () => {
  it("prints op-cost per boundary proof", () => {
    const worst = usage.reduce((max, row) => Math.max(max, row.opCost), 0);
    const budget = usage[0]?.budget ?? 0;
    console.log(
      `boundary proofs: ${usage.length}; worst op-cost ${worst} of ${budget} (${((100 * worst) / budget).toFixed(1)}%)`,
    );
    assert.ok(usage.length >= 50);
  });
});
