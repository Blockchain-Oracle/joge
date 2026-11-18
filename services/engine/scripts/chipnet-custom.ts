// Chipnet only: rounds made through the SolidCash Factory, so the engine is proven on more than lanes. Creates
//   1. a custom ETH up/down round (5 minutes, 1 % creator fee),
//   2. a BTC event with three price ranges around the current price (lock in 8 minutes, closes an hour later),
//   3. a BTC event with a minimum pot nobody reaches (it must refund everyone at lock),
// then enters every outcome of each, and on event 2 enters once more and exits before the lock. The engine's keeper
// does the rest. Uses the player test key (CHIPNET_PLAYER_WIF).
// Usage: node --env-file=.env scripts/chipnet-custom.ts [--events-only]
import {
  buildCreate,
  buildEnter,
  buildExit,
  deploymentFor,
  dollarContracts,
  openingContracts,
  roundContracts,
  type TokenUtxo,
} from "@joge/contracts";
import { createDb } from "@joge/db";
import { decodeFactory, decodeGate, HOUR_SECONDS, type OpenRound, type StakeClass } from "@joge/sdk";
import { broadcast, chainProvider, connectFulcrum, FULCRUM, utxosAt } from "../src/chain/electrum.ts";
import { latest } from "../src/keeper/proofs.ts";
import { KeeperWallet } from "../src/keeper/wallet.ts";

const MS = 1_000;
const MINUTE = 60;
const BUDGET = 20_000n;
const COIN = 60_000n;
const STAKE = 8_000n;
const RANGE_SPREAD = 0.001;
/** Minutes from now until each round locks, and the custom round's length. */
const CUSTOM_LOCK = 6;
const CUSTOM_LENGTH = 5;
const RANGES_LOCK = 8;
const UNMET_LOCK = 7;
const THREADS = { custom: 0x01, ranges: 0x02, unmet: 0x03 } as const;
const CREATOR_FEE_BPS = 100;
const UNMET_MIN_POT = 1_000_000n;
const RANGE_OUTCOMES = [0, 1, 2];
const WAIT_MS = 1_000;
const WAIT_TRIES = 20;

const { DATABASE_URL, CHIPNET_PLAYER_WIF } = process.env;
if (!DATABASE_URL || !CHIPNET_PLAYER_WIF) throw new Error("needs DATABASE_URL and CHIPNET_PLAYER_WIF");
const fulcrum = connectFulcrum(FULCRUM.chipnet);
await fulcrum.connect();
const provider = chainProvider(fulcrum, "chipnet");
const deployment = deploymentFor("chipnet");
const round = roundContracts({
  category: deployment.category,
  provider,
  protocolLockingBytecode: deployment.protocolLockingBytecode,
});
const dollar = dollarContracts(round, {
  dollarCategory: deployment.dollarCategory,
  provider,
  protocolLockingBytecode: deployment.protocolLockingBytecode,
});
const opening = openingContracts(round, provider, deployment.protocolLockingBytecode, dollar);
const { db } = createDb(DATABASE_URL, { max: 2 });
const player = new KeeperWallet(CHIPNET_PLAYER_WIF, "chipnet", fulcrum);

const clock = await latest(db, "USD/BCH");
const btc = await latest(db, "USD/BTC");
if (!clock || !btc) throw new Error("the oracle relay has no prices yet");
const now = Math.floor(Date.now() / MS);
const ofCategory = (coins: Awaited<ReturnType<typeof utxosAt>>) =>
  coins.filter((coin) => coin.token?.category === deployment.category) as unknown as TokenUtxo[];
const threads = ofCategory(await utxosAt(fulcrum, deployment.lockingBytecode.factory));

async function gateOf(lockingBytecode: string, roundId: number, gateIndex: number, after?: string) {
  for (let tries = 0; tries < WAIT_TRIES; tries += 1) {
    const found = ofCategory(await utxosAt(fulcrum, lockingBytecode)).find((utxo) => {
      const state = decodeGate(utxo.token.nft.commitment);
      return state.roundId === roundId && state.gateIndex === gateIndex && (!after || utxo.txid === after);
    });
    if (found) return found;
    await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
  }
  throw new Error(`gate ${gateIndex} of round ${roundId} not visible`);
}

async function create(threadIndex: number, open: Omit<OpenRound, "roundId">, stakeClass: StakeClass) {
  const thread = threads.find((utxo) => decodeFactory(utxo.token.nft.commitment).thread === threadIndex);
  const funding = await player.coin(COIN);
  if (!thread || !funding) throw new Error("no factory thread or player coin");
  const built = buildCreate({
    round,
    opening,
    thread,
    open,
    stakeClass,
    budget: BUDGET,
    clock: clock as NonNullable<typeof clock>,
    protocolLockingBytecode: deployment.protocolLockingBytecode,
    funding: [funding],
    change: player.address,
  });
  const hex = built.builder.build();
  const txid = await broadcast(fulcrum, hex);
  player.track(hex);
  console.log(`created round ${built.open.roundId} (${open.asset} ${open.mode}, ${stakeClass}) ${txid}`);
  return built.open;
}

/** Enters `outcome` and returns the entry's txid (the gate's next coin lives there). */
async function enter(open: OpenRound, gateLockingBytecode: string, gateIndex: number, outcome: number, after?: string) {
  const gate = await gateOf(gateLockingBytecode, open.roundId, gateIndex, after);
  const funding = await player.coin(COIN);
  if (!funding) throw new Error("no player coin");
  const hex = buildEnter({
    contracts: round,
    gate,
    funding: [funding],
    outcome,
    stake: STAKE,
    payoutPkh: player.pkh,
    change: player.address,
  }).build();
  const txid = await broadcast(fulcrum, hex);
  player.track(hex);
  console.log(`  entered round ${open.roundId} outcome ${outcome} ${txid}`);
  return txid;
}

const base = { creatorPkh: player.pkh, minEntrants: 0, minPot: 0n, boundaries: [] as number[] };

// `--events-only` skips the custom round (step 1) and runs the two events.
const EVENTS_ONLY = process.argv.includes("--events-only");

// 1. A custom ETH up/down round: two gates, one entry per side.
if (!EVENTS_ONLY) {
  const custom = await create(
    THREADS.custom,
    {
      ...base,
      asset: "ETH",
      mode: "updown",
      outcomes: 2,
      gates: 2,
      lockTime: now + CUSTOM_LOCK * MINUTE,
      closeTime: now + (CUSTOM_LOCK + CUSTOM_LENGTH) * MINUTE,
      creatorFeeBps: CREATOR_FEE_BPS,
    },
    "short",
  );
  await enter(custom, round.gate.lockingBytecode, 0, 0);
  await enter(custom, round.gate.lockingBytecode, 1, 1);
}

// 2. A three-range BTC event around the current price; every range entered, then one extra entry exits.
const low = Math.round(btc.price * (1 - RANGE_SPREAD));
const high = Math.round(btc.price * (1 + RANGE_SPREAD));
const ranges = await create(
  THREADS.ranges,
  {
    ...base,
    asset: "BTC",
    mode: "ranges",
    outcomes: RANGE_OUTCOMES.length,
    gates: 1,
    lockTime: now + RANGES_LOCK * MINUTE,
    closeTime: now + RANGES_LOCK * MINUTE + HOUR_SECONDS,
    creatorFeeBps: CREATOR_FEE_BPS,
    minEntrants: 2,
    boundaries: [low, high],
  },
  "event",
);
let last: string | undefined;
for (const outcome of RANGE_OUTCOMES) last = await enter(ranges, round.eventGate.lockingBytecode, 0, outcome, last);
last = await enter(ranges, round.eventGate.lockingBytecode, 0, 1, last);
const gate = await gateOf(round.eventGate.lockingBytecode, ranges.roundId, 0, last);
const tickets = ofCategory(await utxosAt(fulcrum, round.ticket.lockingBytecode));
const leaving = tickets.find((utxo) => utxo.txid === last);
const ownerCoin = await player.coin(COIN);
if (!leaving || !ownerCoin) throw new Error("the ticket to exit is not visible");
const exitHex = buildExit({ contracts: round, gate, ticket: leaving, ownerCoin }).build();
console.log(`  exited round ${ranges.roundId} before lock ${await broadcast(fulcrum, exitHex)}`);
player.track(exitHex);

// 3. An event whose minimum pot nobody reaches: refunded at lock.
const unmet = await create(
  THREADS.unmet,
  {
    ...base,
    asset: "BTC",
    mode: "updown",
    outcomes: 2,
    gates: 1,
    lockTime: now + UNMET_LOCK * MINUTE,
    closeTime: now + UNMET_LOCK * MINUTE + HOUR_SECONDS,
    creatorFeeBps: 0,
    minPot: UNMET_MIN_POT,
  },
  "event",
);
last = await enter(unmet, round.eventGate.lockingBytecode, 0, 0);
await enter(unmet, round.eventGate.lockingBytecode, 0, 1, last);
console.log(`player ${player.address} · ranges below ${low}, ${low}–${high}, above ${high}`);
process.exit(0);
