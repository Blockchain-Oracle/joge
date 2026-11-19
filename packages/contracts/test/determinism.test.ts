// Two clients that see the same chain build byte-identical lock, settle and sweep
// transactions — fresh contract objects, fresh builders, same inputs — so any keeper or browser can broadcast them
// without ever conflicting. (Variants with another sequence, locktime, output or fee are refused: attacks.test.ts.)
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeGate } from "@joge/sdk";
import { buildEnter, buildLock, buildSettle, buildSweep, type TokenUtxo } from "../src/builders.ts";
import { roundContracts } from "../src/contracts.ts";
import { boundaries, fixtures, fund, gateUtxos, newRound, player, type Round, utxosAt } from "./harness.ts";
import { KITS } from "./kits.ts";

const times = boundaries(fixtures("latest-usd-btc.json"), 30, 10);

/** A second client: its own contract objects for the same round, built from scratch. */
const otherClient = (round: Round) =>
  roundContracts({
    category: round.contracts.category,
    provider: round.provider,
    protocolLockingBytecode: round.protocol.lockingBytecode,
    kit: round.testKit.kit,
  });

const hexOf = async (builder: { build(): string | Promise<string> }) => builder.build();

for (const testKit of KITS) {
  describe(`${testKit.kit.name} · byte-identical lifecycle transactions`, () => {
    it("lock, settle and sweep come out the same from two independent clients", async () => {
      const round = await newRound({ lockTime: times.lockTime, closeTime: times.closeTime, gates: 2 }, testKit);
      for (const [index, stake] of [40_000n, 60_000n].entries()) {
        const who = player(`p${index}`);
        const gates = await gateUtxos(round);
        const gate = gates.find((utxo) => decodeGate(utxo.token.nft.commitment).gateIndex === index) as TokenUtxo;
        await buildEnter({
          contracts: round.contracts,
          gate,
          funding: [await fund(round, who, stake + 10_000n)],
          outcome: index,
          stake,
          payoutPkh: who.pkh,
          change: Uint8Array.from(Buffer.from(who.lockingBytecode, "hex")),
        }).send();
      }
      const other = otherClient(round);
      const gates = await gateUtxos(round);

      const lockA = buildLock({ contracts: round.contracts, master: round.master, gates, proof: times.lock });
      const lockB = buildLock({
        contracts: other,
        master: round.master,
        gates: [...gates].reverse(),
        proof: times.lock,
      });
      assert.equal(await hexOf(lockA), await hexOf(lockB), "lock");
      await lockA.send();

      const [locked] = await utxosAt(round, round.contracts.locked.lockingBytecode);
      assert.ok(locked);
      const settleArgs = { master: locked, strike: times.strike, close: times.close };
      const protocol = round.protocol.lockingBytecode;
      const settleA = buildSettle({
        contracts: round.contracts,
        ...settleArgs,
        protocolLockingBytecode: protocol,
      }).builder;
      const settleB = buildSettle({ contracts: other, ...settleArgs, protocolLockingBytecode: protocol }).builder;
      assert.equal(await hexOf(settleA), await hexOf(settleB), "settle");
      await settleA.send();

      const [settled] = await utxosAt(round, round.contracts.sweep.lockingBytecode);
      assert.ok(settled);
      const tickets = await utxosAt(round, round.contracts.ticket.lockingBytecode);
      const sweepA = buildSweep({ contracts: round.contracts, master: settled, tickets }).builder;
      const sweepB = buildSweep({ contracts: other, master: settled, tickets: [...tickets].reverse() }).builder;
      assert.equal(await hexOf(sweepA), await hexOf(sweepB), "sweep (batch order is canonical: ascending outpoint)");
    });
  });
}
