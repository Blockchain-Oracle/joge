// Hybrid: SolidCash lane threads, factory and agent vault opening and feeding the CashScript round
// contracts in the same transactions — each path, and the attacks that must fail.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { binToHex, generatePrivateKey, secp256k1 } from "@bitauth/libauth";
import {
  decodeGate,
  decodeLane,
  decodeOpen,
  decodeTicket,
  encodeFactory,
  encodeLane,
  gridSlotAtOrAfter,
  type OpenRound,
  type PriceMessage,
} from "@joge/sdk";
import { SignatureTemplate as SolidSignatureTemplate } from "@solidcash/solidcash";
import { MockNetworkProvider, randomUtxo, SignatureTemplate } from "cashscript";
import {
  buildCreate,
  buildEnter,
  buildLaneOpen,
  buildVaultBet,
  buildVaultWithdraw,
  type TokenUtxo,
} from "../src/builders.ts";
import { roundContracts } from "../src/contracts.ts";
import { dollarContracts } from "../src/dollar.ts";
import { agentVaultContract, openingContracts } from "../src/hybrid.ts";
import { fixtures, player } from "./harness.ts";

/**
 * CashScript's debugger cannot evaluate SolidCash inputs ("custom unlocker"), so a refusal is proven on the mock chain
 * itself: the transaction is a one-change twin of one the chain accepts, and the chain rejects it at exactly the
 * SolidCash contract's input. The rule each test targets is named in the test.
 */
async function rejectedAt(builder: { send(): Promise<unknown> }, inputIndex: number) {
  await assert.rejects(builder.send(), new RegExp(`error in evaluating input index ${inputIndex}:`));
}

const clock = fixtures("latest-usd-bch.json").at(-1) as PriceMessage;
const LANE_SECONDS = 300;
const bytecode = (hex: string) => Uint8Array.from(Buffer.from(hex, "hex"));

function chain() {
  const provider = new MockNetworkProvider();
  const protocol = player("protocol");
  const category = binToHex(crypto.getRandomValues(new Uint8Array(32)));
  const round = roundContracts({ category, provider, protocolLockingBytecode: protocol.lockingBytecode });
  const dollar = dollarContracts(round, {
    dollarCategory: binToHex(crypto.getRandomValues(new Uint8Array(32))),
    provider,
    protocolLockingBytecode: protocol.lockingBytecode,
  });
  const opening = openingContracts(round, provider, protocol.lockingBytecode, dollar);
  const minting = (commitment: Uint8Array) => ({
    category,
    amount: 0n,
    nft: { capability: "minting" as const, commitment: binToHex(commitment) },
  });
  const nextLock = gridSlotAtOrAfter(LANE_SECONDS, clock.timestamp);
  const lane = provider.addUtxo(opening.lanes.lockingBytecode, {
    ...randomUtxo({ satoshis: 1_000n }),
    token: minting(encodeLane({ thread: 0x10, asset: "BTC", seconds: LANE_SECONDS, nextLock, counter: 0 })),
  }) as TokenUtxo;
  const factory = provider.addUtxo(opening.factory.lockingBytecode, {
    ...randomUtxo({ satoshis: 1_000n }),
    token: minting(encodeFactory(0x01, 0)),
  }) as TokenUtxo;
  const coin = (who: { lockingBytecode: string; key: Uint8Array }, satoshis: bigint) => ({
    utxo: provider.addUtxo(who.lockingBytecode, randomUtxo({ satoshis })),
    unlocker: new SignatureTemplate(who.key).unlockP2PKH(),
  });
  return { provider, protocol, round, opening, lane, factory, nextLock, coin };
}

describe("a lane thread opens the next round", () => {
  it("opens the slot, moves the lane on, and the round takes entries", async () => {
    const c = chain();
    const opener = player("opener");
    const { builder, open } = buildLaneOpen({
      round: c.round,
      opening: c.opening,
      lane: c.lane,
      slot: c.nextLock,
      openerPkh: opener.pkh,
      clock,
      funding: [c.coin(opener, 100_000n)],
      change: bytecode(opener.lockingBytecode),
    });
    await builder.send();
    const [lane] = (await c.provider.getUtxosForLockingBytecode(c.opening.lanes.lockingBytecode)) as TokenUtxo[];
    assert.ok(lane);
    assert.equal(decodeLane(lane.token.nft.commitment).nextLock, c.nextLock + LANE_SECONDS);
    const [master] = (await c.provider.getUtxosForLockingBytecode(c.round.open.lockingBytecode)) as TokenUtxo[];
    assert.ok(master);
    assert.deepEqual(decodeOpen(master.token.nft.commitment), open);
    const gates = (await c.provider.getUtxosForLockingBytecode(c.round.gate.lockingBytecode)) as TokenUtxo[];
    assert.equal(gates.length, 2);
    const ana = player("ana");
    const gate = gates[0] as TokenUtxo;
    await buildEnter({
      contracts: c.round,
      gate,
      funding: [c.coin(ana, 30_000n)],
      outcome: 0,
      stake: 10_000n,
      payoutPkh: ana.pkh,
      change: bytecode(ana.lockingBytecode),
    }).send();
    const [ticket] = (await c.provider.getUtxosForLockingBytecode(c.round.ticket.lockingBytecode)) as TokenUtxo[];
    assert.ok(ticket);
    assert.equal(decodeTicket(ticket.token.nft.commitment).roundId, open.roundId);
  });

  it("refuses a slot that is already opened, off the grid, or too far ahead of the clock", async () => {
    const c = chain();
    const opener = player("opener");
    const openAt = (slot: number) =>
      buildLaneOpen({
        round: c.round,
        opening: c.opening,
        lane: c.lane,
        slot,
        openerPkh: opener.pkh,
        clock,
        funding: [c.coin(opener, 100_000n)],
        change: bytecode(opener.lockingBytecode),
      }).builder;
    await rejectedAt(openAt(c.nextLock - LANE_SECONDS), 0);
    await rejectedAt(openAt(c.nextLock + 7), 0);
    await rejectedAt(openAt(c.nextLock + 3 * LANE_SECONDS), 0);
  });

  it("refuses a round record the lane did not write (another fee)", async () => {
    const c = chain();
    const opener = player("opener");
    const { builder, open } = buildLaneOpen({
      round: c.round,
      opening: c.opening,
      lane: c.lane,
      slot: c.nextLock,
      openerPkh: opener.pkh,
      clock,
      funding: [c.coin(opener, 100_000n)],
      change: bytecode(opener.lockingBytecode),
    });
    const master = builder.outputs[1] as { token: { nft: { commitment: string } } };
    const greedy: OpenRound = { ...open, creatorFeeBps: 300 };
    const { encodeOpen } = await import("@joge/sdk");
    master.token.nft.commitment = binToHex(encodeOpen(greedy));
    await rejectedAt(builder, 0); // the open record must be exact
  });
});

describe("the factory creates custom rounds and events", () => {
  const event = (overrides: Partial<Omit<OpenRound, "roundId">> = {}): Omit<OpenRound, "roundId"> => ({
    asset: "BTC",
    mode: "ranges",
    outcomes: 3,
    gates: 1,
    lockTime: clock.timestamp + 3_600,
    closeTime: clock.timestamp + 3 * 3_600,
    creatorFeeBps: 100,
    creatorPkh: player("creator").pkh,
    minPot: 100_000n,
    minEntrants: 2,
    boundaries: [6_000_000, 6_500_000],
    ...overrides,
  });
  const create = (
    c: ReturnType<typeof chain>,
    open: Omit<OpenRound, "roundId">,
    stakeClass: "short" | "hourly" | "event" = "event",
  ) => {
    const creator = player("creator");
    return buildCreate({
      round: c.round,
      opening: c.opening,
      thread: c.factory,
      open,
      stakeClass,
      budget: 20_000n,
      clock,
      protocolLockingBytecode: c.protocol.lockingBytecode,
      funding: [c.coin(creator, 100_000n)],
      change: bytecode(creator.lockingBytecode),
    }).builder;
  };

  it("creates an event: master, event gates and the creation fee", async () => {
    const c = chain();
    await create(c, event()).send();
    const gates = (await c.provider.getUtxosForLockingBytecode(c.round.eventGate.lockingBytecode)) as TokenUtxo[];
    assert.equal(gates.length, 1);
    assert.equal(decodeGate((gates[0] as TokenUtxo).token.nft.commitment).stakeClass, "event");
    const fees = await c.provider.getUtxosForLockingBytecode(c.protocol.lockingBytecode);
    assert.equal(fees[0]?.satoshis, 2_000n);
  });

  it("refuses every rule break", async () => {
    const c = chain();
    await rejectedAt(create(c, event({ creatorFeeBps: 400 })), 0); // creator fee above 3 %
    await rejectedAt(create(c, event({ closeTime: clock.timestamp + 3_600 + 120 }), "short"), 0); // 3 minutes to 30 days
    await rejectedAt(create(c, event({ closeTime: clock.timestamp + 3_600 + 1_800 })), 0); // keep the short-lane caps
    const shortGold = event({
      asset: "GOLD",
      mode: "updown",
      outcomes: 2,
      boundaries: [],
      closeTime: clock.timestamp + 5_400,
    });
    await rejectedAt(create(c, shortGold, "short"), 0); // gold rounds last at least an hour
    await rejectedAt(create(c, event({ boundaries: [6_500_000, 6_000_000] })), 0); // boundaries rise strictly
    await rejectedAt(create(c, event({ lockTime: 1_800_000_000, closeTime: 1_800_014_401 })), 0); // not committed that far
    await rejectedAt(
      create(c, event({ lockTime: clock.timestamp + 40 * 86_400, closeTime: clock.timestamp + 41 * 86_400 })),
      0,
    ); // too early to open
  });
});

describe("an agent vault bets for its owner, within its cap", () => {
  const agentKey = generatePrivateKey();
  const agentPub = secp256k1.derivePublicKeyCompressed(agentKey) as Uint8Array;
  let c: ReturnType<typeof chain>;
  const owner = player("owner");
  /** The lane gate as it is now (each accepted bet moves it). */
  const liveGate = async () =>
    ((await c.provider.getUtxosForLockingBytecode(c.round.gate.lockingBytecode)) as TokenUtxo[])[0] as TokenUtxo;
  before(async () => {
    c = chain();
    const opener = player("opener");
    await buildLaneOpen({
      round: c.round,
      opening: c.opening,
      lane: c.lane,
      slot: c.nextLock,
      openerPkh: opener.pkh,
      clock,
      funding: [c.coin(opener, 100_000n)],
      change: bytecode(opener.lockingBytecode),
    }).builder.send();
  });
  const vaultFor = (cap: bigint) => {
    const vault = agentVaultContract(c.round, c.provider, { ownerPkh: owner.pkh, agentKey: agentPub, perBetCap: cap });
    const utxo = c.provider.addUtxo(vault.lockingBytecode, randomUtxo({ satoshis: 200_000n }));
    return { vault, utxo };
  };
  const bet = async (cap: bigint, stake: bigint, signerKey = agentKey, payee = owner.pkh) => {
    const { vault, utxo } = vaultFor(cap);
    return buildVaultBet({
      round: c.round,
      vault,
      vaultUtxo: utxo,
      gate: await liveGate(),
      outcome: 1,
      stake,
      ownerPkh: payee,
      agentSigner: new SolidSignatureTemplate(signerKey),
    });
  };

  it("enters a lane round for the owner and keeps the rest in the vault", async () => {
    const builder = await bet(50_000n, 20_000n);
    await builder.send();
    assert.equal(builder.outputs[2]?.amount, 200_000n - 20_000n - 1_200n - 1_500n);
    const [ticket] = (await c.provider.getUtxosForLockingBytecode(c.round.ticket.lockingBytecode)) as TokenUtxo[];
    assert.ok(ticket);
    assert.deepEqual(decodeTicket(ticket.token.nft.commitment).payoutPkh, owner.pkh);
  });
  it("refuses a stake above the cap, a ticket for anyone else, and any other key", async () => {
    // The vault is input 1.
    await rejectedAt(await bet(10_000n, 20_000n), 1); // stake above the agent's per-bet cap
    await rejectedAt(await bet(50_000n, 20_000n, agentKey, player("mallory").pkh), 1); // the ticket pays the vault's owner
    await rejectedAt(await bet(50_000n, 20_000n, generatePrivateKey()), 1); // only the agent's key bets
  });
  it("lets the owner, and only the owner, withdraw everything", async () => {
    const { vault, utxo } = vaultFor(50_000n);
    await buildVaultWithdraw({
      round: c.round,
      vault,
      vaultUtxo: utxo,
      ownerCoin: c.coin(owner, 5_000n),
      to: bytecode(owner.lockingBytecode),
    }).send();
    const mallory = player("mallory");
    const stolen = vaultFor(50_000n);
    const theft = buildVaultWithdraw({
      round: c.round,
      vault: stolen.vault,
      vaultUtxo: stolen.utxo,
      ownerCoin: c.coin(mallory, 5_000n),
      to: bytecode(mallory.lockingBytecode),
    });
    await rejectedAt(theft, 0); // the owner must co-sign
  });
  it("takes every vault coin back in one withdrawal", async () => {
    const { vault, utxo } = vaultFor(50_000n);
    const second = c.provider.addUtxo(vault.lockingBytecode, randomUtxo({ satoshis: 70_000n }));
    const builder = buildVaultWithdraw({
      round: c.round,
      vault,
      vaultUtxo: utxo,
      moreVaultUtxos: [second],
      ownerCoin: c.coin(owner, 5_000n),
      to: bytecode(owner.lockingBytecode),
    });
    await builder.send();
    const paid = builder.outputs[0]?.amount ?? 0n;
    assert.ok(paid > 200_000n + 70_000n + 5_000n - 2_000n, `owner got ${paid}`);
    const left = await c.provider.getUtxosForLockingBytecode(vault.lockingBytecode);
    assert.ok(!left.some((coin) => coin.txid === utxo.txid || coin.txid === second.txid), "both vault coins spent");
  });
});
