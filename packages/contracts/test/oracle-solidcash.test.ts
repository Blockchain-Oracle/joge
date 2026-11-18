// Proof P2: the same oracle module in SolidCash 0.51.0 (native mode), run through SolidCash's own SDK against the same
// real boundaries as P1, plus a reproduction of the evmCompat endianness trap.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { FEEDS, type FeedId, findBoundaryPair, findBySequence, type PriceMessage, sortPrices } from "@joge/sdk";
import { compileString } from "@solidcash/solidc";
import { Contract, type NetworkProvider, randomUtxo, TransactionBuilder } from "@solidcash/solidcash";
import { MockNetworkProvider } from "@solidcash/solidcash/network/mock";
import artifact from "../artifacts/solidcash-bakeoff/OracleProbe.ts";

// SolidCash 0.51.0's MockNetworkProvider does not satisfy its own NetworkProvider type under
// `exactOptionalPropertyTypes` (optional members typed without `| undefined`); the runtime object is the right shape.
const mockProvider = () => new MockNetworkProvider() as unknown as NetworkProvider & MockNetworkProvider;

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

async function probe(feed: FeedId) {
  const provider = mockProvider();
  const contract = new Contract(artifact, [FEEDS[feed].publicKey], { provider });
  const utxo = await provider.addUtxo(contract.address, randomUtxo({ satoshis: 10_000n }));
  // biome-ignore lint/suspicious/noExplicitAny: SolidCash's Unlocker type is not exported from the package root.
  const spend = (unlocker: any) =>
    new TransactionBuilder({ provider }).addInput(utxo, unlocker).addOutput({ to: contract.address, amount: 9_000n });
  return { contract, spend };
}

function boundaries(prices: PriceMessage[]): number[] {
  const gaps = prices.slice(1).map((first, index) => ({ first, previous: prices[index] as PriceMessage }));
  const consecutive = gaps.filter(({ first, previous }) => first.dataSequence === previous.dataSequence + 1);
  const slowest = [...consecutive].sort(
    (a, b) => b.first.timestamp - b.previous.timestamp - (a.first.timestamp - a.previous.timestamp),
  );
  const step = Math.max(1, Math.floor(consecutive.length / PER_FIXTURE));
  const picked = [...slowest.slice(0, 3), ...consecutive.filter((_, index) => index % step === 0)].slice(
    0,
    PER_FIXTURE,
  );
  return picked.map(
    ({ previous, first }) => previous.timestamp + Math.ceil((first.timestamp - previous.timestamp) / 2),
  );
}

const usage: number[] = [];
let budget = 0;

describe("P2 · SolidCash oracle module accepts the canonical pair at real boundaries", () => {
  for (const file of FIXTURES) {
    it(`${file}: ${PER_FIXTURE} boundaries`, async () => {
      const { feed, messages } = load(file);
      const prices = sortPrices(messages);
      const { contract, spend } = await probe(feed);
      for (const boundary of boundaries(prices)) {
        const pair = findBoundaryPair(prices, boundary);
        assert.ok(pair);
        const { previous, first } = pair;
        const tx = spend(
          contract.unlock.boundary(
            previous.message,
            previous.signature,
            first.message,
            first.signature,
            BigInt(boundary),
            BigInt(first.dataSequence),
          ),
        );
        await tx.debug();
        const [input] = await tx.getVmResourceUsage();
        if (input) {
          usage.push(input.operationCost);
          budget = input.maximumOperationCost;
        }
      }
    });
  }
});

describe("P2 · SolidCash refusals", () => {
  it("refuses non-consecutive messages, wrong boundaries and another feed's signature", async () => {
    const prices = sortPrices(load("latest-usd-btc.json").messages);
    const at = (index: number) => prices[index] as PriceMessage;
    const { contract, spend } = await probe("USD/BTC");
    const run = (previous: PriceMessage, first: PriceMessage, boundary: number) =>
      spend(
        contract.unlock.boundary(
          previous.message,
          previous.signature,
          first.message,
          first.signature,
          BigInt(boundary),
          BigInt(first.dataSequence),
        ),
      ).debug();
    await assert.rejects(async () => run(at(10), at(12), at(11).timestamp), /consecutive/);
    await assert.rejects(async () => run(at(11), at(12), at(10).timestamp + 1), /before the boundary/);
    await assert.rejects(async () => run(at(10), at(11), at(12).timestamp), /at or after the boundary/);
    const eth = sortPrices(load("latest-usd-eth.json").messages);
    await assert.rejects(async () =>
      run(eth[10] as PriceMessage, eth[11] as PriceMessage, (eth[11] as PriceMessage).timestamp),
    );
    const strike = findBySequence(prices, at(40).dataSequence + 1);
    assert.ok(strike);
    await spend(
      contract.unlock.strike(strike.message, strike.signature, BigInt(strike.dataSequence), BigInt(strike.price)),
    ).debug();
  });
});

describe("P2 · evmCompat endianness trap", () => {
  // In evmCompat, `int(bytes4)` does not compile; the way to an integer is through uint32, which reads big-endian.
  const source = `pragma solidity ^0.8.0;
contract Endian() {
    function check(bytes message, uint256 expected) {
        require(uint256(uint32(bytes4(message.slice(0, 4)))) == expected);
    }
}`;
  it("reads a little-endian oracle timestamp as a different number", async () => {
    const evm = compileString(source, { evmCompat: true });
    const provider = mockProvider();
    const contract = new Contract(evm, [], { provider });
    const check = contract.unlock.check;
    assert.ok(check);
    const utxo = await provider.addUtxo(contract.address, randomUtxo({ satoshis: 10_000n }));
    const message = sortPrices(load("latest-usd-btc.json").messages)[0] as PriceMessage;
    const littleEndian = BigInt(message.timestamp);
    const bigEndian = BigInt(`0x${message.message.slice(0, 8)}`);
    const run = (expected: bigint) =>
      new TransactionBuilder({ provider })
        .addInput(utxo, check(message.message, expected))
        .addOutput({ to: contract.address, amount: 9_000n })
        .debug();
    await assert.rejects(async () => run(littleEndian));
    await run(bigEndian);
    console.log(`evmCompat reads timestamp ${message.timestamp} as ${bigEndian}`);
  });
});

describe("P2 · measurements", () => {
  it("prints op-cost per boundary proof", () => {
    const worst = Math.max(...usage);
    console.log(
      `SolidCash boundary proofs: ${usage.length}; worst op-cost ${worst} of ${budget} (${((100 * worst) / budget).toFixed(1)}%)`,
    );
    assert.ok(usage.length >= 50);
  });
});
