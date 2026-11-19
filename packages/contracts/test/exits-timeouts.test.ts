// An event entrant leaving before the lock (exit fee joins the winners' pot) and both oracle-outage voids,
// each with the attacks that must fail.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeGate, decodeLocked, decodeSweep, decodeTicket, exitSplit } from "@joge/sdk";
import { SighashType } from "cashscript";
import {
  buildEnter,
  buildExit,
  buildLock,
  buildLockTimeout,
  buildSettle,
  buildSettleTimeout,
  buildSweep,
  type TokenUtxo,
  voidDeadline,
} from "../src/builders.ts";
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

const times = boundaries(fixtures("latest-usd-btc.json"), 30, 10);
const bytecode = (hex: string) => Uint8Array.from(Buffer.from(hex, "hex"));

async function enter(round: Round, who: Player, outcome: number, stake: bigint) {
  const [gate] = await gateUtxos(round);
  assert.ok(gate);
  await buildEnter({
    contracts: round.contracts,
    gate,
    funding: [await fund(round, who, stake + 10_000n)],
    outcome,
    stake,
    payoutPkh: who.pkh,
    change: bytecode(who.lockingBytecode),
  }).send();
}

const ticketOf = async (round: Round, who: Player) =>
  (await utxosAt(round, round.contracts.ticket.lockingBytecode)).find(
    (utxo) =>
      Buffer.from(decodeTicket(utxo.token.nft.commitment).payoutPkh).toString("hex") ===
      Buffer.from(who.pkh).toString("hex"),
  ) as TokenUtxo;

describe("leaving an event before the lock", () => {
  const event = () =>
    newRound({ lockTime: times.lockTime, closeTime: times.closeTime, gates: 1, stakeClass: "event", creatorFeeBps: 0 });

  it("refunds the stake minus 3 %, and the fee reaches the winners", async () => {
    const round = await event();
    const [ana, ben, cal] = [player("ana"), player("ben"), player("cal")];
    await enter(round, ana, 0, 1_000_000n);
    await enter(round, ben, 1, 1_000_000n);
    await enter(round, cal, 0, 2_000_000n);
    const [gate] = await gateUtxos(round);
    assert.ok(gate);
    const calTicket = await ticketOf(round, cal);
    const { refund, fee } = exitSplit(2_000_000n, calTicket.satoshis);
    const exit = buildExit({
      contracts: round.contracts,
      gate,
      ticket: calTicket,
      ownerCoin: await fund(round, cal, 5_000n),
    });
    await exit.send();
    assert.equal(exit.outputs[1]?.amount, refund);
    const [after] = await gateUtxos(round);
    assert.ok(after);
    assert.deepEqual(decodeGate(after.token.nft.commitment).totals, [1_000_000n, 1_000_000n]);
    assert.equal(after.satoshis, gate.satoshis - 2_000_000n + fee, "the fee stays in the gate");

    await buildLock({ contracts: round.contracts, master: round.master, gates: [after], proof: times.lock }).send();
    const [locked] = await utxosAt(round, round.contracts.locked.lockingBytecode);
    assert.ok(locked);
    assert.equal(decodeLocked(locked.token.nft.commitment).pot, 2_000_000n + fee, "the pot includes the exit fee");
  });

  it("refuses an exit authorised by anyone but the ticket's owner", async () => {
    const round = await event();
    const [ana, ben, mallory] = [player("ana"), player("ben"), player("mallory")];
    await enter(round, ana, 0, 1_000_000n);
    await enter(round, ben, 1, 1_000_000n);
    const [gate] = await gateUtxos(round);
    assert.ok(gate);
    const exit = buildExit({
      contracts: round.contracts,
      gate,
      ticket: await ticketOf(round, ana),
      ownerCoin: await fund(round, mallory, 5_000n),
    });
    await refused(exit, /the ticket's owner must co-sign/);
  });

  it("refuses an owner signature that does not cover every output", async () => {
    const round = await event();
    const [ana, ben] = [player("ana"), player("ben")];
    await enter(round, ana, 0, 1_000_000n);
    await enter(round, ben, 1, 1_000_000n);
    const [gate] = await gateUtxos(round);
    assert.ok(gate);
    const coin = await fund(round, ana, 5_000n);
    const partial = new round.testKit.SignatureTemplate(
      ana.key,
      SighashType.SIGHASH_ALL | SighashType.SIGHASH_ANYONECANPAY,
    );
    const exit = buildExit({
      contracts: round.contracts,
      gate,
      ticket: await ticketOf(round, ana),
      ownerCoin: { utxo: coin.utxo, unlocker: partial.unlockP2PKH() },
    });
    await refused(exit, /the owner's signature must cover every output/);
  });

  it("refuses an exit from a round that is not an event", async () => {
    const round = await newRound({ lockTime: times.lockTime, closeTime: times.closeTime, gates: 1 });
    const ana = player("ana");
    await enter(round, ana, 0, 100_000n);
    // Put the lane round's gate behind the event-gate contract to reach `exit` at all: the class check still refuses.
    const [laneGate] = await gateUtxos(round);
    assert.ok(laneGate);
    const disguised = (await round.provider.addUtxo(round.contracts.eventGate.lockingBytecode, {
      ...round.testKit.randomUtxo({ satoshis: laneGate.satoshis }),
      token: laneGate.token,
    })) as TokenUtxo;
    const exit = buildExit({
      contracts: round.contracts,
      gate: disguised,
      ticket: await ticketOf(round, ana),
      ownerCoin: await fund(round, ana, 5_000n),
    });
    await refused(exit, /only events allow leaving before the lock|another round or gate/);
  });
});

describe("oracle outages void the round", () => {
  it("voids an unlocked round after the deadline and refunds everyone", async () => {
    const round = await newRound({ lockTime: times.lockTime, closeTime: times.closeTime, gates: 2 });
    await enter(round, player("ana"), 0, 50_000n);
    await enter(round, player("ben"), 1, 70_000n);
    const timeoutLock = buildLockTimeout({
      contracts: round.contracts,
      master: round.master,
      gates: await gateUtxos(round),
    });
    assert.equal(timeoutLock.locktime, voidDeadline(times.closeTime));
    await timeoutLock.send();
    const [voided] = await utxosAt(round, round.contracts.sweep.lockingBytecode);
    assert.ok(voided);
    assert.equal(decodeSweep(voided.token.nft.commitment).state, "void");
    const tickets = await utxosAt(round, round.contracts.ticket.lockingBytecode);
    const { payouts, batch } = buildSweep({ contracts: round.contracts, master: voided, tickets });
    for (const [index, utxo] of batch.entries()) {
      assert.equal(payouts[index], decodeTicket(utxo.token.nft.commitment).stake + 1_200n - 250n);
    }
  });

  it("refuses the outage void before its deadline or with a final sequence", async () => {
    const round = await newRound({ lockTime: times.lockTime, closeTime: times.closeTime, gates: 2 });
    await enter(round, player("ana"), 0, 50_000n);
    const early = buildLockTimeout({ contracts: round.contracts, master: round.master, gates: await gateUtxos(round) });
    early.locktime = voidDeadline(times.closeTime) - 1;
    await refused(early, /locktime is exactly the deadline|too early|locktime/i);
    const finalSequence = buildLockTimeout({
      contracts: round.contracts,
      master: round.master,
      gates: await gateUtxos(round),
    });
    (finalSequence.inputs[0] as { options?: { sequence: number } }).options = { sequence: 0xffffffff };
    // With a final sequence the network ignores the locktime, so the time check itself fails first.
    await refused(finalSequence, /too early to void|fixed sequence that enforces the locktime/);
  });

  it("voids a locked round nobody could settle, and refuses it before the deadline", async () => {
    const round = await newRound({ lockTime: times.lockTime, closeTime: times.closeTime, gates: 1 });
    await enter(round, player("ana"), 0, 50_000n);
    await enter(round, player("ben"), 1, 70_000n);
    await buildLock({
      contracts: round.contracts,
      master: round.master,
      gates: await gateUtxos(round),
      proof: times.lock,
    }).send();
    const [locked] = await utxosAt(round, round.contracts.locked.lockingBytecode);
    assert.ok(locked);
    const early = buildSettleTimeout({ contracts: round.contracts, master: locked });
    early.locktime -= 1;
    await refused(early, /locktime is exactly the deadline|too early|locktime/i);
    await buildSettleTimeout({ contracts: round.contracts, master: locked }).send();
    const [voided] = await utxosAt(round, round.contracts.sweep.lockingBytecode);
    assert.ok(voided);
    assert.equal(decodeSweep(voided.token.nft.commitment).state, "void");
    // A void after lock can still be settled? No: the master has moved; settling the old UTXO is impossible.
    assert.throws(() =>
      buildSettle({
        contracts: round.contracts,
        master: voided,
        strike: times.strike,
        close: times.close,
        protocolLockingBytecode: round.protocol.lockingBytecode,
      }),
    );
  });
});
