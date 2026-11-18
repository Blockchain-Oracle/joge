// Mainnet: four team wallets play a few real rounds against each other so the leaderboard is not empty
// on a first look. Each is derived from the keeper's key, funded once from the keeper with a few cents, and
// enters opposite sides of the same round (one Up, one Down) with stakes of one to three cents; every payout goes back
// to its own wallet. It keeps the markets it plays awake through the live app, like a visitor's page does.
// Usage: WEB_URL=https://… ROUNDS=2 node --env-file=.env.mainnet scripts/mainnet-players.ts   (CONFIRM_MAINNET=yes)
import { decodePrivateKeyWif, encodePrivateKeyWif, flattenBinArray, sha256, utf8ToBin } from "@bitauth/libauth";
import { buildEnter, deploymentFor, roundContracts, type TokenUtxo } from "@joge/contracts";
import { decodeGate } from "@joge/sdk";
import { TransactionBuilder } from "cashscript";
import { broadcast, chainProvider, connectFulcrum, FULCRUM, utxosAt } from "../src/chain/electrum.ts";
import { KeeperWallet } from "../src/keeper/wallet.ts";

const PLAYERS = 4;
const FUND_EACH = 70_000n;
const ENTRY_COIN = 20_000n;
const STAKE_MIN = 5_000;
const STAKE_SPREAD = 10_000;
/** BTC and ETH every 5 minutes (their lane threads). */
const LANE_THREADS = { btc5: 17, eth5: 20 } as const;
const MARKETS: number[] = [LANE_THREADS.btc5, LANE_THREADS.eth5];
/** Enter only while at least this long remains before the lock. */
const LEAD_SECONDS = 45;
const POLL_MS = 15_000;
const WAKE_EVERY_MS = 60_000;
const MS = 1_000;

const { KEEPER_WIF, WEB_URL = "", ROUNDS = "2", CONFIRM_MAINNET } = process.env;
if (!KEEPER_WIF) throw new Error("needs KEEPER_WIF (services/engine/.env.mainnet)");
if (!WEB_URL.startsWith("https://")) throw new Error("set WEB_URL to the live https web app");
const keeperKey = decodePrivateKeyWif(KEEPER_WIF);
if (typeof keeperKey === "string") throw new Error(keeperKey);
const wifFor = (index: number) =>
  encodePrivateKeyWif(
    sha256.hash(flattenBinArray([keeperKey.privateKey, utf8ToBin(`joge-mainnet-player-${index}`)])),
    "mainnet",
  );

const fulcrum = connectFulcrum(FULCRUM.mainnet);
await fulcrum.connect();
const provider = chainProvider(fulcrum, "mainnet");
const deployment = deploymentFor("mainnet");
const contracts = roundContracts({
  category: deployment.category,
  provider,
  protocolLockingBytecode: deployment.protocolLockingBytecode,
});
const keeper = new KeeperWallet(KEEPER_WIF, "mainnet", fulcrum);
const players = Array.from({ length: PLAYERS }, (_, index) => new KeeperWallet(wifFor(index + 1), "mainnet", fulcrum));
for (const player of players) console.log(`player ${player.address}: ${await player.balance()} sats`);

const short = (await Promise.all(players.map((player) => player.balance()))).some((balance) => balance < ENTRY_COIN);
if (CONFIRM_MAINNET !== "yes") {
  console.log(`dry run: would ${short ? `fund each with ${FUND_EACH} sats and ` : ""}play ${ROUNDS} rounds per market`);
  process.exit(0);
}
if (short) {
  const coins = await keeper.coins(FUND_EACH * BigInt(PLAYERS));
  if (!coins) throw new Error("the keeper cannot fund the players");
  const builder = new TransactionBuilder({ provider });
  for (const coin of coins) builder.addInput(coin.utxo, coin.unlocker);
  for (const player of players) builder.addOutput({ to: player.address, amount: FUND_EACH });
  const hex = builder.addBchChangeOutputIfNeeded({ to: keeper.address, feeRate: 1 }).build();
  console.log(`funded ${PLAYERS} players with ${FUND_EACH} sats each: ${await broadcast(fulcrum, hex)}`);
  for (const player of players) player.track(hex);
}

type Lane = { thread: number; asset: string; next: { roundId: number; lockTime: number } | null };
const lobby = async (): Promise<Lane[]> =>
  ((await (await fetch(`${WEB_URL}/api/lobby?network=mainnet`)).json()) as { lanes: Lane[] }).lanes;
const wake = () =>
  Promise.all(
    MARKETS.map((thread) =>
      fetch(`${WEB_URL}/api/lanes/${thread}/wake?network=mainnet`, { method: "POST" }).catch(() => undefined),
    ),
  );

const played = new Map<number, number>();
const done = new Set<number>();
let pair = 0;
let lastWake = 0;
const target = Number(ROUNDS);
while (MARKETS.some((thread) => (played.get(thread) ?? 0) < target)) {
  if (Date.now() - lastWake > WAKE_EVERY_MS) {
    await wake();
    lastWake = Date.now();
  }
  const now = Math.floor(Date.now() / MS);
  const gates = (await utxosAt(fulcrum, deployment.lockingBytecode.gate)) as Array<TokenUtxo & { txid: string }>;
  for (const lane of await lobby()) {
    const round = lane.next;
    if (!MARKETS.includes(lane.thread) || !round || done.has(round.roundId)) continue;
    if ((played.get(lane.thread) ?? 0) >= target || round.lockTime - now < LEAD_SECONDS) continue;
    const up = players[pair % PLAYERS];
    const down = players[(pair + 1) % PLAYERS];
    if (!up || !down) continue;
    let entries = 0;
    for (const [outcome, player] of [
      [0, up],
      [1, down],
    ] as const) {
      // One gate per side, so the two entries never chain on the same gate coin.
      const gate = gates.find((utxo) => {
        const state = decodeGate(utxo.token.nft.commitment);
        return state.roundId === round.roundId && state.gateIndex === outcome;
      });
      const funding = gate ? await player.coins(ENTRY_COIN) : undefined;
      if (!gate || !funding) continue;
      try {
        const stake = BigInt(STAKE_MIN + Math.floor(Math.random() * STAKE_SPREAD));
        const hex = buildEnter({
          contracts,
          gate,
          funding,
          outcome,
          stake,
          payoutPkh: player.pkh,
          change: player.address,
        }).build();
        const txid = await broadcast(fulcrum, hex);
        player.track(hex);
        entries += 1;
        console.log(`${lane.asset} round ${round.roundId} ${outcome === 0 ? "Up  " : "Down"} ${stake} sats ${txid}`);
      } catch (error) {
        for (const coin of funding) player.release(coin);
        console.warn(`round ${round.roundId} ${outcome}: ${(error as Error).message.split("\n")[0]}`);
      }
    }
    if (entries > 0) {
      done.add(round.roundId);
      played.set(lane.thread, (played.get(lane.thread) ?? 0) + 1);
      pair += 1;
    }
  }
  await new Promise((resolve) => setTimeout(resolve, POLL_MS));
}
console.log("played: the rounds settle at their close and pay the winners' wallets");
process.exit(0);
