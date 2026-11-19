// Chipnet only: real entries into every lane round, so the engine's lock → settle → sweep path runs with two-sided
// pots. Its own test key (CHIPNET_PLAYER_WIF in services/engine/.env, created on first run) is
// topped up from KEEPER_WIF when low; every payout goes back to the player key. Test coins only, never mainnet.
// Usage: node --env-file=.env scripts/chipnet-players.ts
import { appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { encodePrivateKeyWif, generatePrivateKey } from "@bitauth/libauth";
import { buildEnter, deploymentFor, roundContracts, type TokenUtxo } from "@joge/contracts";
import { createDb, rounds } from "@joge/db";
import { decodeGate } from "@joge/sdk";
import { TransactionBuilder } from "cashscript";
import { and, eq, gt } from "drizzle-orm";
import { broadcast, chainProvider, connectFulcrum, FULCRUM, utxosAt } from "../src/chain/electrum.ts";
import { KeeperWallet } from "../src/keeper/wallet.ts";

const ENV_FILE = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
const MIN_BALANCE = 100_000n;
const TOP_UP = 400_000n;
const ENTRY_COIN = 40_000n;
const STAKE_MIN = 5_000;
const STAKE_SPREAD = 10_000;
/** Stop entering a round this close to its lock (the keeper locks right after the boundary). */
const LEAD_SECONDS = 20;
const POLL_MS = 10_000;
const MS = 1_000;

if (!process.env.CHIPNET_PLAYER_WIF) {
  const wif = encodePrivateKeyWif(generatePrivateKey(), "testnet");
  appendFileSync(ENV_FILE, `CHIPNET_PLAYER_WIF=${wif}\n`);
  process.env.CHIPNET_PLAYER_WIF = wif;
}
const { DATABASE_URL, KEEPER_WIF, CHIPNET_PLAYER_WIF } = process.env;
if (!DATABASE_URL || !KEEPER_WIF || !CHIPNET_PLAYER_WIF) throw new Error("needs DATABASE_URL and KEEPER_WIF");

// Same guard as the engine (src/main.ts): rpckit 2.2.0 can leave an unhandled rejection when a Fulcrum server stays
// down during its own reconnect; the fallback pool keeps serving, so a transport error is logged, not fatal.
process.on("unhandledRejection", (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  if (/websocket (error|disconnected)|ECONNRESET|ETIMEDOUT|ENOTFOUND|timed? ?out/i.test(message)) {
    console.warn(`Fulcrum connection dropped; failing over: ${message}`);
    return;
  }
  console.error(`unhandled rejection: ${message}`);
  process.exit(1);
});
const fulcrum = connectFulcrum(FULCRUM.chipnet);
await fulcrum.connect();
const deployment = deploymentFor("chipnet");
const contracts = roundContracts({
  category: deployment.category,
  provider: chainProvider(fulcrum, "chipnet"),
  protocolLockingBytecode: deployment.protocolLockingBytecode,
});
const { db } = createDb(DATABASE_URL, { max: 2 });
const player = new KeeperWallet(CHIPNET_PLAYER_WIF, "chipnet", fulcrum);
const keeper = new KeeperWallet(KEEPER_WIF, "chipnet", fulcrum);
console.log(`player ${player.address}`);

if ((await player.balance()) < MIN_BALANCE) {
  const coins = await keeper.coins(TOP_UP + ENTRY_COIN);
  if (coins) {
    const builder = new TransactionBuilder({ provider: chainProvider(fulcrum, "chipnet") });
    for (const coin of coins) builder.addInput(coin.utxo, coin.unlocker);
    const hex = builder
      .addOutput({ to: player.address, amount: TOP_UP })
      .addBchChangeOutputIfNeeded({ to: keeper.address, feeRate: 1 })
      .build();
    console.log(`topped up ${TOP_UP} sats: ${await broadcast(fulcrum, hex)}`);
    player.track(hex);
  } else {
    console.warn("the keeper key is too low to top the player up: playing with what is left");
  }
}

const entered = new Set<string>();
for (;;) {
  const now = Math.floor(Date.now() / MS);
  const open = await db
    .select()
    .from(rounds)
    .where(and(eq(rounds.network, "chipnet"), eq(rounds.state, "open"), gt(rounds.lockTime, now + LEAD_SECONDS)));
  const gates = (await utxosAt(fulcrum, deployment.lockingBytecode.gate)) as Array<TokenUtxo & { txid: string }>;
  for (const round of open) {
    for (const outcome of [0, 1]) {
      const key = `${round.roundId}:${outcome}`;
      if (entered.has(key)) continue;
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
        entered.add(key);
        console.log(
          `${round.asset} ${round.laneSeconds}s round ${round.roundId} ${outcome === 0 ? "up  " : "down"} ${stake} ${txid}`,
        );
      } catch (error) {
        for (const coin of funding) player.release(coin);
        console.warn(`round ${round.roundId} ${outcome}: ${(error as Error).message.split("\n")[0]}`);
      }
    }
  }
  await new Promise((resolve) => setTimeout(resolve, POLL_MS));
}
