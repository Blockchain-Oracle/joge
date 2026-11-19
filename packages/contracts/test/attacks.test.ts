// The adversarial review's attacks, in both contract languages. Each starts from a valid transaction built
// by our builders and changes one thing; the contract itself must refuse it, with its own reason.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { binToHex } from "@bitauth/libauth";
import { decodeGate, encodeGate, encodeTicket, findBySequence, type PriceMessage } from "@joge/sdk";
import { buildEnter, buildLock, buildSettle, buildSweep, type TokenUtxo } from "../src/builders.ts";
import {
  boundaries,
  fixtures,
  fund,
  gateUtxos,
  newRound,
  type Player,
  player,
  type Round,
  refused,
  utxosAt,
} from "./harness.ts";
import { KITS, type TestKit } from "./kits.ts";

const bytecode = (hex: string) => Uint8Array.from(Buffer.from(hex, "hex"));
type Mutable = { amount: bigint; to: string | Uint8Array; token?: { nft?: { commitment: string } } };
const out = (builder: { outputs: unknown[] }, index: number) => builder.outputs[index] as Mutable;

async function gateAt(round: Round, gateIndex: number): Promise<TokenUtxo> {
  const gate = (await gateUtxos(round)).find((utxo) => decodeGate(utxo.token.nft.commitment).gateIndex === gateIndex);
  assert.ok(gate);
  return gate;
}

async function enterBuilder(round: Round, who: Player, gateIndex: number, outcome: number, stake: bigint) {
  return buildEnter({
    contracts: round.contracts,
    gate: await gateAt(round, gateIndex),
    funding: [await fund(round, who, stake + 10_000n)],
    outcome,
    stake,
    payoutPkh: who.pkh,
    change: bytecode(who.lockingBytecode),
  });
}

const prices = fixtures("latest-usd-btc.json");
const times = boundaries(prices, 30, 10);
const alice = player("alice");
const bob = player("bob");
const mallory = player("mallory");

async function enteredRound(testKit: TestKit) {
  const round = await newRound({ lockTime: times.lockTime, closeTime: times.closeTime, gates: 2 }, testKit);
  await (await enterBuilder(round, alice, 0, 0, 100_000n)).send();
  await (await enterBuilder(round, bob, 1, 1, 50_000n)).send();
  return round;
}

const lockOf = async (round: Round) =>
  buildLock({
    contracts: round.contracts,
    master: round.master,
    gates: [await gateAt(round, 0), await gateAt(round, 1)],
    proof: times.lock,
  });

const smuggle = (builder: { inputs: unknown[] }, round: Round, victim: TokenUtxo) =>
  builder.inputs.push({ ...victim, unlocker: round.contracts.ticket.unlock.spend() });

for (const testKit of KITS) {
  describe(testKit.kit.name, () => {
    describe("entering", () => {
      let round: Round;
      before(async () => {
        round = await enteredRound(testKit);
      });
      it("refuses a stake below the minimum or above the short-lane cap", async () => {
        await refused(await enterBuilder(round, mallory, 0, 0, 1_000n), /stake outside this round's bounds/);
        await refused(await enterBuilder(round, mallory, 0, 0, 600_000n), /stake outside this round's bounds/);
      });
      it("refuses an outcome the round does not have", async () => {
        await refused(await enterBuilder(round, mallory, 0, 2, 10_000n), /no such outcome/);
      });
      it("refuses inflated totals", async () => {
        const builder = await enterBuilder(round, mallory, 0, 0, 10_000n);
        const gate = decodeGate(out(builder, 0).token?.nft?.commitment ?? "");
        const inflated = { ...gate, totals: gate.totals.map((total) => total + 1_000_000n) };
        (out(builder, 0).token?.nft as { commitment: string }).commitment = binToHex(encodeGate(inflated));
        await refused(builder, /gate totals must add this stake/);
      });
      it("refuses a ticket that claims more stake than was paid", async () => {
        const builder = await enterBuilder(round, mallory, 0, 0, 10_000n);
        const forged = encodeTicket({ roundId: 1, gateIndex: 0, outcome: 0, stake: 400_000n, payoutPkh: mallory.pkh });
        (out(builder, 1).token?.nft as { commitment: string }).commitment = binToHex(forged);
        await refused(builder, /ticket must record round, gate, outcome, stake and payee/);
      });
      it("refuses a ticket sent anywhere but the ticket contract", async () => {
        const builder = await enterBuilder(round, mallory, 0, 0, 10_000n);
        out(builder, 1).to = bytecode(mallory.lockingBytecode);
        await refused(builder, /output 1 must be the ticket/);
      });
      it("refuses an extra NFT minted from the gate", async () => {
        const builder = await enterBuilder(round, mallory, 0, 0, 10_000n);
        const ticket = builder.outputs[1];
        assert.ok(ticket?.token);
        builder.outputs.splice(2, 0, {
          to: bytecode(mallory.lockingBytecode),
          amount: 1_000n,
          token: { ...ticket.token },
        });
        // Pay for the extra bytes from the change so the contract, not the SDK's fee check, is what refuses.
        out(builder, 3).amount -= 3_000n;
        await refused(builder, /at most gate, ticket and change/);
      });
      it("refuses another player's ticket smuggled in as funding", async () => {
        const [victim] = await utxosAt(round, round.contracts.ticket.lockingBytecode);
        assert.ok(victim);
        const builder = await enterBuilder(round, mallory, 0, 0, 10_000n);
        smuggle(builder, round, victim);
        builder.outputs.push({ to: bytecode(mallory.lockingBytecode), amount: victim.satoshis, token: victim.token });
        out(builder, 2).amount -= 2_000n;
        // Any of the gate's token rules may fire first; each is the contract refusing the theft.
        await refused(
          builder,
          /at most gate, ticket and change|funding inputs carry no tokens|change carries no tokens/,
        );
      });
      it("refuses a stake that would overfill the gate", async () => {
        const full = await newRound(
          { lockTime: times.lockTime, closeTime: times.closeTime, gates: 1, gateValue: 9_800_000n },
          testKit,
        );
        await refused(await enterBuilder(full, mallory, 0, 0, 300_000n), /gate is full/);
      });
    });

    describe("locking", () => {
      let round: Round;
      before(async () => {
        round = await enteredRound(testKit);
      });
      it("refuses a lock that leaves a gate open", async () => {
        const partial = await lockOf(round);
        const [left] = partial.inputs.splice(2, 1);
        out(partial, 0).amount -= left?.satoshis ?? 0n;
        await refused(partial, /every gate, and nothing else, must be merged/);
      });
      it("refuses gates out of order", async () => {
        const builder = await lockOf(round);
        const [first, second] = [builder.inputs[1], builder.inputs[2]];
        assert.ok(first && second);
        builder.inputs[1] = second;
        builder.inputs[2] = first;
        await refused(builder, /gates must be in gate order/);
      });
      it("refuses a ticket smuggled into the lock", async () => {
        const [victim] = await utxosAt(round, round.contracts.ticket.lockingBytecode);
        assert.ok(victim);
        const builder = await lockOf(round);
        smuggle(builder, round, victim);
        await refused(builder, /every gate, and nothing else|moves only with its settled master/);
      });
      it("refuses a lock before the oracle has signed past T_lock", async () => {
        const early = { previous: prices[20] as PriceMessage, first: prices[21] as PriceMessage };
        const builder = buildLock({
          contracts: round.contracts,
          master: round.master,
          gates: [await gateAt(round, 0), await gateAt(round, 1)],
          proof: early,
        });
        await refused(builder, /first message must be at or after the boundary/);
      });
      it("refuses a lock that takes more than its fixed fee", async () => {
        const builder = await lockOf(round);
        out(builder, 0).amount -= 50_000n;
        await refused(builder, /fixed lock fee/);
      });
      it("refuses a second variant of the same lock (other sequence or locktime)", async () => {
        const sequenceVariant = await lockOf(round);
        (sequenceVariant.inputs[0] as { options?: { sequence: number } }).options = { sequence: 0xfffffffe };
        await refused(sequenceVariant, /fixed sequence/);
        const locktimeVariant = await lockOf(round);
        locktimeVariant.locktime = 1;
        await refused(locktimeVariant, /lock carries no locktime/);
      });
    });

    describe("settling and sweeping", () => {
      let round: Round;
      let locked: TokenUtxo;
      before(async () => {
        round = await enteredRound(testKit);
        await (await lockOf(round)).send();
        const [master] = await utxosAt(round, round.contracts.locked.lockingBytecode);
        assert.ok(master);
        locked = master;
      });
      const settleWith = (strike: PriceMessage) =>
        buildSettle({
          contracts: round.contracts,
          master: locked,
          strike,
          close: times.close,
          protocolLockingBytecode: round.protocol.lockingBytecode,
        }).builder;

      it("refuses any strike other than the message after the lock message", async () => {
        const later = findBySequence(prices, times.strike.dataSequence + 1) as PriceMessage;
        await refused(settleWith(later), /strike must be the message after the lock message/);
      });
      it("refuses a settlement that names the other side as winner", async () => {
        const builder = settleWith(times.strike);
        const nft = out(builder, 0).token?.nft as { commitment: string };
        const winner = nft.commitment.slice(12, 14) === "00" ? "01" : "00";
        nft.commitment = nft.commitment.slice(0, 12) + winner + nft.commitment.slice(14);
        await refused(builder, /settlement record must be exact/);
      });
      it("refuses an extra output or a smuggled ticket", async () => {
        const extra = settleWith(times.strike);
        extra.outputs.push({ to: bytecode(mallory.lockingBytecode), amount: 1_000n });
        out(extra, 0).amount -= 1_000n;
        await refused(extra, /no other outputs|fixed settle fee/);
        const [victim] = await utxosAt(round, round.contracts.ticket.lockingBytecode);
        assert.ok(victim);
        const smuggled = settleWith(times.strike);
        smuggle(smuggled, round, victim);
        // Let SolidCash's SDK pass the burn so the contract, not the SDK, is what refuses.
        (smuggled.options as unknown as Record<string, unknown>).allowImplicitNftBurn = true;
        await refused(smuggled, /settlement spends only the master|moves only with its settled master/);
      });
      it("refuses a creator fee above the 3 % cap, even if a forged round carried one", async () => {
        const greedy = await newRound(
          { lockTime: times.lockTime, closeTime: times.closeTime, gates: 1, creatorFeeBps: 400 },
          testKit,
        );
        await (await enterBuilder(greedy, alice, 0, 0, 100_000n)).send();
        await (await enterBuilder(greedy, bob, 0, 1, 100_000n)).send();
        await buildLock({
          contracts: greedy.contracts,
          master: greedy.master,
          gates: [await gateAt(greedy, 0)],
          proof: times.lock,
        }).send();
        const [master] = await utxosAt(greedy, greedy.contracts.locked.lockingBytecode);
        assert.ok(master);
        await assert.rejects(async () => {
          const { builder } = buildSettle({
            contracts: greedy.contracts,
            master,
            strike: times.strike,
            close: times.close,
            protocolLockingBytecode: greedy.protocol.lockingBytecode,
          });
          await builder.debug();
        }, /creator fee above the cap/);
      });

      describe("sweeping", () => {
        let settled: TokenUtxo;
        let tickets: TokenUtxo[];
        before(async () => {
          await settleWith(times.strike).send();
          const [master] = await utxosAt(round, round.contracts.sweep.lockingBytecode);
          assert.ok(master);
          settled = master;
          tickets = await utxosAt(round, round.contracts.ticket.lockingBytecode);
        });
        const sweepOf = (batch: TokenUtxo[]) =>
          buildSweep({ contracts: round.contracts, master: settled, tickets: batch }).builder;

        it("refuses a payout larger than the ticket's share", async () => {
          const builder = sweepOf(tickets);
          out(builder, 1).amount += 1_000n;
          out(builder, 0).amount -= 1_000n;
          await refused(builder, /payout amount/);
        });
        it("refuses a payout to anyone but the ticket's owner", async () => {
          const builder = sweepOf(tickets);
          out(builder, 1).to = bytecode(mallory.lockingBytecode);
          await refused(builder, /output pays the ticket's owner/);
        });
        it("refuses burning the master while tickets are left", async () => {
          const builder = sweepOf(tickets.slice(0, 1));
          builder.outputs[0] = { to: bytecode(round.creator.lockingBytecode), amount: out(builder, 0).amount };
          await refused(builder, /carries on, or goes back to its creator after the last ticket/);
        });
        it("refuses a sweep that takes no ticket", async () => {
          await refused(sweepOf([]), /a sweep takes at least one ticket/);
        });
        it("refuses a ticket from another round of the same category", async () => {
          const forgedTicket = encodeTicket({
            roundId: 2,
            gateIndex: 0,
            outcome: 0,
            stake: 50_000n,
            payoutPkh: mallory.pkh,
          });
          const forged = (await round.provider.addUtxo(round.contracts.ticket.lockingBytecode, {
            ...round.testKit.randomUtxo({ satoshis: 1_200n }),
            token: {
              category: round.contracts.category,
              amount: 0n,
              nft: { capability: "none", commitment: binToHex(forgedTicket) },
            },
          })) as TokenUtxo;
          await refused(sweepOf([forged]), /another round/);
        });
      });
    });
  });
}
