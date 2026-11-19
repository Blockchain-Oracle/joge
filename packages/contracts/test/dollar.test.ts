// Dollar events: a dollar event made by the SolidCash factory, entered, left, locked, settled and swept in a
// dollar token held by sidecars — then the attacks the sidecar design must stop.
import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { binToHex, hexToBin } from "@bitauth/libauth";
import {
  decodeLocked,
  decodeOpen,
  decodeSweep,
  encodeFactory,
  type OpenRound,
  type PriceMessage,
  SIDE_SEED,
} from "@joge/sdk";
import { MockNetworkProvider, randomUtxo, SignatureTemplate } from "cashscript";
import {
  buildCreate,
  buildDollarEnter,
  buildDollarExit,
  buildDollarLock,
  buildDollarSettle,
  buildDollarSweep,
  type SideUtxo,
  type TokenUtxo,
} from "../src/builders.ts";
import { roundContracts } from "../src/contracts.ts";
import { dollarContracts } from "../src/dollar.ts";
import { openingContracts } from "../src/hybrid.ts";
import { boundaries, fixtures, measure, type Player, player, refused } from "./harness.ts";

/** Sends a lifecycle transaction and records its size and fee (printed at the end, like the round tests). */
const sizes: Array<{ step: string; bytes: number; fee: bigint }> = [];
async function sendMeasured(step: string, builder: Parameters<typeof measure>[0] & { send(): Promise<unknown> }) {
  const { bytes, fee } = await measure(builder);
  sizes.push({ step, bytes, fee });
  if (Number(fee) < bytes) throw new Error(`${step}: ${bytes} bytes but only ${fee} sats of fee`);
  await builder.send();
}

const btc = fixtures("latest-usd-btc.json");
const clock = fixtures("latest-usd-bch.json").at(-1) as PriceMessage;
const times = boundaries(btc, 30, 60);
const randomCategory = () => binToHex(crypto.getRandomValues(new Uint8Array(32)));

function chain() {
  const provider = new MockNetworkProvider();
  const protocol = player("protocol");
  const category = randomCategory();
  const dollarCategory = randomCategory();
  const round = roundContracts({ category, provider, protocolLockingBytecode: protocol.lockingBytecode });
  const dollar = dollarContracts(round, {
    dollarCategory,
    provider,
    protocolLockingBytecode: protocol.lockingBytecode,
  });
  const opening = openingContracts(round, provider, protocol.lockingBytecode, dollar);
  const thread = provider.addUtxo(opening.factory.lockingBytecode, {
    ...randomUtxo({ satoshis: 1_000n }),
    token: { category, amount: 0n, nft: { capability: "minting" as const, commitment: binToHex(encodeFactory(1, 0)) } },
  }) as TokenUtxo;
  const sats = (who: Player, satoshis: bigint) => ({
    utxo: provider.addUtxo(who.lockingBytecode, randomUtxo({ satoshis })),
    unlocker: new SignatureTemplate(who.key).unlockP2PKH(),
  });
  const dollars = (who: Player, amount: bigint) => ({
    utxo: provider.addUtxo(who.lockingBytecode, {
      ...randomUtxo({ satoshis: 1_000n }),
      token: { category: dollarCategory, amount },
    }),
    unlocker: new SignatureTemplate(who.key).unlockP2PKH(),
  });
  const at = async <T>(lockingBytecode: string) => (await provider.getUtxosForLockingBytecode(lockingBytecode)) as T[];
  return { provider, protocol, round, dollar, opening, thread, sats, dollars, at };
}
type Chain = ReturnType<typeof chain>;

/** A three-range dollar event around the close, so range 0 wins: everything below the closing price + 1. */
async function createEvent(c: Chain, creator: Player, thread = c.thread) {
  const close = times.close.first.price;
  const open: Omit<OpenRound, "roundId"> = {
    asset: "BTC",
    mode: "ranges",
    outcomes: 3,
    gates: 2,
    lockTime: times.lockTime,
    closeTime: times.closeTime,
    creatorFeeBps: 100,
    creatorPkh: creator.pkh,
    minPot: 0n,
    minEntrants: 0,
    boundaries: [close + 1, close + 2],
  };
  const { builder, open: full } = buildCreate({
    round: c.round,
    opening: c.opening,
    thread,
    open,
    stakeClass: "dollar",
    budget: 20_000n,
    clock,
    protocolLockingBytecode: c.protocol.lockingBytecode,
    funding: [c.sats(creator, 100_000n), c.dollars(creator, 50n)],
    change: hexToBin(creator.lockingBytecode),
    dollar: c.dollar,
  });
  await builder.send();
  return full;
}

const gateOf = async (c: Chain, index: number) => {
  const gates = await c.at<TokenUtxo>(c.dollar.gate.lockingBytecode);
  const found = gates.find((gate) => hexToBin(gate.token.nft.commitment)[5] === index);
  assert.ok(found, `gate ${index}`);
  return found;
};
/** A gate's sidecar is the one made in the same transaction as the gate. */
const sideOf = async (c: Chain, gate: TokenUtxo) => {
  const sides = await c.at<SideUtxo>(c.dollar.side.lockingBytecode);
  const found = sides.find((side) => side.txid === gate.txid);
  assert.ok(found, "the gate's sidecar");
  return found;
};

async function enter(c: Chain, who: Player, gateIndex: number, outcome: number, stake: bigint) {
  const gate = await gateOf(c, gateIndex);
  await buildDollarEnter({
    contracts: c.round,
    dollar: c.dollar,
    gate,
    side: await sideOf(c, gate),
    funding: [c.dollars(who, stake + 7n), c.sats(who, 10_000n)],
    outcome,
    stake,
    payoutPkh: who.pkh,
    change: hexToBin(who.lockingBytecode),
  }).send();
}

const tokensAt = async (c: Chain, who: Player) =>
  (await c.at<SideUtxo>(who.lockingBytecode))
    .filter((utxo) => utxo.token?.category === c.dollar.dollarCategory)
    .reduce((sum, utxo) => sum + utxo.token.amount, 0n);

describe("a dollar event, end to end", () => {
  it("opens with seeded sidecars, takes dollar entries and an exit, locks, settles and pays in dollars", async () => {
    const c = chain();
    const [creator, alice, bob, carol, dave] = ["creator", "alice", "bob", "carol", "dave"].map(player) as [
      Player,
      Player,
      Player,
      Player,
      Player,
    ];
    const open = await createEvent(c, creator);
    const sides = await c.at<SideUtxo>(c.dollar.side.lockingBytecode);
    assert.equal(sides.length, 2, "one sidecar per gate");
    assert.ok(sides.every((side) => side.token.amount === SIDE_SEED));
    assert.deepEqual(
      decodeOpen((await c.at<TokenUtxo>(c.dollar.open.lockingBytecode))[0]?.token.nft.commitment ?? ""),
      open,
    );

    await enter(c, alice, 0, 0, 1_000n);
    await enter(c, bob, 1, 1, 500n);
    await enter(c, carol, 0, 2, 300n);
    await enter(c, dave, 1, 1, 200n);
    // Dave leaves: 3 % (6 cents) stays in the pot, 194 comes back in dollars.
    const gate1 = await gateOf(c, 1);
    const daveTicket = (await c.at<TokenUtxo>(c.round.ticket.lockingBytecode)).find((ticket) =>
      ticket.token.nft.commitment.endsWith(binToHex(dave.pkh)),
    );
    assert.ok(daveTicket);
    await buildDollarExit({
      contracts: c.round,
      dollar: c.dollar,
      gate: gate1,
      side: await sideOf(c, gate1),
      ticket: daveTicket,
      ownerCoin: c.sats(dave, 5_000n),
    }).send();
    assert.equal(await tokensAt(c, dave), 7n + 194n);

    const master = (await c.at<TokenUtxo>(c.dollar.open.lockingBytecode))[0] as TokenUtxo;
    const gates = [await gateOf(c, 0), await gateOf(c, 1)];
    await sendMeasured(
      "lock (2 gates, 2 sidecars)",
      buildDollarLock({
        contracts: c.round,
        dollar: c.dollar,
        master,
        gates,
        sides: await c.at<SideUtxo>(c.dollar.side.lockingBytecode),
        proof: times.lock,
      }),
    );
    const locked = (await c.at<TokenUtxo>(c.dollar.locked.lockingBytecode))[0] as TokenUtxo;
    const lockedRound = decodeLocked(locked.token.nft.commitment);
    assert.equal(lockedRound.pot, 1_806n, "every stake plus Dave's exit fee");
    assert.deepEqual(lockedRound.totals, [1_000n, 500n, 300n]);
    const [pot] = await c.at<SideUtxo>(c.dollar.side.lockingBytecode);
    assert.equal(pot?.token.amount, 1_806n + 2n * SIDE_SEED, "one pot sidecar holds every dollar and both seeds");

    const { builder, outcome } = buildDollarSettle({
      contracts: c.round,
      dollar: c.dollar,
      master: locked,
      side: pot as SideUtxo,
      strike: times.strike,
      close: times.close,
      protocolLockingBytecode: c.protocol.lockingBytecode,
    });
    await sendMeasured("settle (2 dollar fees)", builder);
    assert.equal(outcome.winner, 0, "the close is below the first edge");
    assert.equal(outcome.protocolFee, 36n);
    assert.equal(outcome.creatorFee, 18n);
    assert.equal(await tokensAt(c, c.protocol), 36n, "the protocol fee is paid in dollars");

    const swept = (await c.at<TokenUtxo>(c.dollar.sweep.lockingBytecode))[0] as TokenUtxo;
    assert.equal(decodeSweep(swept.token.nft.commitment).remaining, 3);
    const { builder: sweepBuilder } = buildDollarSweep({
      contracts: c.round,
      dollar: c.dollar,
      master: swept,
      side: (await c.at<SideUtxo>(c.dollar.side.lockingBytecode))[0] as SideUtxo,
      tickets: await c.at<TokenUtxo>(c.round.ticket.lockingBytecode),
    });
    await sendMeasured("sweep (3 tickets, last batch)", sweepBuilder);
    assert.equal(await tokensAt(c, alice), 7n + 1_752n, "the winner takes the pot after fees");
    assert.equal(await tokensAt(c, bob), 7n, "a miss gets no dollars");
    assert.equal(await tokensAt(c, creator), 50n - 2n + 18n + 2n, "creator: change, fee and the seeds back");
    assert.equal((await c.at<SideUtxo>(c.dollar.side.lockingBytecode)).length, 0, "the sidecar is spent out");
  });
});

after(() => {
  for (const size of sizes) console.log(`dollar ${size.step}: ${size.bytes} bytes, fee ${size.fee} sats`);
});

describe("attacks on the sidecars fail", () => {
  it("refuses a sibling sidecar passed as funding (it would leave a gate without its sidecar)", async () => {
    const c = chain();
    const creator = player("creator");
    const mallory = player("mallory");
    await createEvent(c, creator);
    const gate = await gateOf(c, 0);
    const sides = await c.at<SideUtxo>(c.dollar.side.lockingBytecode);
    const own = await sideOf(c, gate);
    const sibling = sides.find((side) => side.vout !== own.vout) as SideUtxo;
    const builder = buildDollarEnter({
      contracts: c.round,
      dollar: c.dollar,
      gate,
      side: own,
      funding: [
        c.dollars(mallory, 100n),
        c.sats(mallory, 10_000n),
        { utxo: sibling, unlocker: c.dollar.side.unlock.move() },
      ],
      outcome: 0,
      stake: 100n,
      payoutPkh: mallory.pkh,
      change: hexToBin(mallory.lockingBytecode),
    });
    await refused(builder, /no other sidecar may be spent here/);
  });

  it("refuses a fake sidecar made as change (it could be swapped in at the lock)", async () => {
    const c = chain();
    const mallory = player("mallory");
    await createEvent(c, player("creator"));
    const gate = await gateOf(c, 0);
    const builder = buildDollarEnter({
      contracts: c.round,
      dollar: c.dollar,
      gate,
      side: await sideOf(c, gate),
      funding: [c.dollars(mallory, 150n), c.sats(mallory, 10_000n)],
      outcome: 0,
      stake: 100n,
      payoutPkh: mallory.pkh,
      change: hexToBin(c.dollar.side.lockingBytecode),
    });
    await refused(builder, /no other sidecar may be made here/);
  });

  it("refuses another event's sidecar beside this event's gate", async () => {
    const c = chain();
    const creator = player("creator");
    const mallory = player("mallory");
    await createEvent(c, creator);
    const firstGate = await gateOf(c, 0);
    const firstSide = await sideOf(c, firstGate);
    // A second event from the same factory thread: its sidecars share nothing with the first event's gates.
    const [thread] = await c.at<TokenUtxo>(c.opening.factory.lockingBytecode);
    await createEvent(c, creator, thread);
    const otherSide = (await c.at<SideUtxo>(c.dollar.side.lockingBytecode)).find(
      (side) => side.txid !== firstSide.txid,
    ) as SideUtxo;
    const builder = buildDollarEnter({
      contracts: c.round,
      dollar: c.dollar,
      gate: firstGate,
      side: otherSide,
      funding: [c.dollars(mallory, 100n), c.sats(mallory, 10_000n)],
      outcome: 0,
      stake: 100n,
      payoutPkh: mallory.pkh,
      change: hexToBin(mallory.lockingBytecode),
    });
    // The sidecar's last statement is its check, so the refusal names the contract and input, not the message.
    await refused(builder, /TokenSide.cash:\d+ Error in transaction at input 1/);
  });

  it("refuses a lock that leaves a sidecar behind", async () => {
    const c = chain();
    await createEvent(c, player("creator"));
    await enter(c, player("alice"), 0, 0, 100n);
    await enter(c, player("bob"), 1, 1, 100n);
    const master = (await c.at<TokenUtxo>(c.dollar.open.lockingBytecode))[0] as TokenUtxo;
    const sides = await c.at<SideUtxo>(c.dollar.side.lockingBytecode);
    assert.throws(
      () =>
        buildDollarLock({
          contracts: c.round,
          dollar: c.dollar,
          master,
          gates: [],
          sides: sides.slice(0, 1),
          proof: times.lock,
        }),
      /gates/,
    );
  });
});
