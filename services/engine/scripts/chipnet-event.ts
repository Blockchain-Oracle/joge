// Chipnet only: an event made the way the app makes one, played by three wallets. It
//   1. asks the running web app's /api/create to build a three-range BTC event (entries close in about 6 minutes,
//      decided an hour later, needs 3 entries), signs the creator's coins the way a paired wallet does, broadcasts it;
//   2. funds two more test wallets from the player key (derived from it, chipnet only) when they run low;
//   3. has each of the three wallets enter a different range, with its own coins and its own payout address.
// The engine's keeper locks, settles and pays it. Needs the web app on WEB_URL (default http://localhost:3300).
// Usage: node --env-file=.env scripts/chipnet-event.ts
import {
  binToHex,
  decodePrivateKeyWif,
  encodeDataPush,
  encodePrivateKeyWif,
  encodeTransaction,
  flattenBinArray,
  generateSigningSerializationBCH,
  hash256,
  type Input,
  type Output,
  secp256k1,
  sha256,
  type TransactionCommon,
  utf8ToBin,
} from "@bitauth/libauth";
import { buildEnter, deploymentFor, roundContracts, type TokenUtxo } from "@joge/contracts";
import { createDb } from "@joge/db";
import { decodeGate, HOUR_SECONDS } from "@joge/sdk";
import { TransactionBuilder } from "cashscript";
import { fromWire } from "../../../apps/web/src/lib/wire.ts";
import { broadcast, chainProvider, connectFulcrum, FULCRUM, utxosAt } from "../src/chain/electrum.ts";
import { latest } from "../src/keeper/proofs.ts";
import { KeeperWallet } from "../src/keeper/wallet.ts";

const MS = 1_000;
const MINUTE = 60;
const LOCK_IN_MINUTES = 6;
const RANGE_SPREAD = 0.001;
const MIN_ENTRANTS = 3;
const CREATOR_FEE_BPS = 100;
const STAKE = 8_000n;
const ENTRY_COIN = 12_000n;
const CREATE_COIN = 30_000n;
const TOP_UP = 40_000n;
const LOW_BALANCE = 25_000n;
const SIGHASH_ALL_FORKID = 0x41;
const WAIT_MS = 1_000;
const WAIT_TRIES = 30;
const TITLE = "Where will Bitcoin close this hour?";

const { DATABASE_URL, CHIPNET_PLAYER_WIF, WEB_URL = "http://localhost:3300" } = process.env;
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
const { db } = createDb(DATABASE_URL, { max: 2 });

// Three wallets: the player key, and two test keys derived from it (sha256 of the key and a label).
const playerKey = decodePrivateKeyWif(CHIPNET_PLAYER_WIF);
if (typeof playerKey === "string") throw new Error(playerKey);
const derivedWif = (label: string) =>
  encodePrivateKeyWif(sha256.hash(flattenBinArray([playerKey.privateKey, utf8ToBin(label)])), "testnet");
const wallets = [
  new KeeperWallet(CHIPNET_PLAYER_WIF, "chipnet", fulcrum),
  new KeeperWallet(derivedWif("joge-chipnet-wallet-2"), "chipnet", fulcrum),
  new KeeperWallet(derivedWif("joge-chipnet-wallet-3"), "chipnet", fulcrum),
] as const;
const [creator] = wallets;

// 1. The event, built by the app's own route and signed like a wallet signs (inputs 1.., P2PKH, SIGHASH_ALL).
const btc = await latest(db, "USD/BTC");
if (!btc) throw new Error("the oracle relay has no BTC price yet");
const now = Math.floor(Date.now() / MS);
const lockTime = Math.ceil((now + LOCK_IN_MINUTES * MINUTE) / MINUTE) * MINUTE;
const funding = await creator.coins(CREATE_COIN);
if (!funding) throw new Error(`the player key ${creator.address} has too little to create an event`);
const response = await fetch(`${WEB_URL}/api/create`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    network: "chipnet",
    asset: "BTC",
    lockTime,
    closeTime: lockTime + HOUR_SECONDS,
    creatorFeeBps: CREATOR_FEE_BPS,
    title: TITLE,
    event: {
      mode: "ranges",
      boundaries: [Math.round(btc.price * (1 - RANGE_SPREAD)), Math.round(btc.price * (1 + RANGE_SPREAD))],
      minPot: 0,
      minEntrants: MIN_ENTRANTS,
    },
    creatorPkh: binToHex(creator.pkh),
    coins: funding.map(({ utxo }) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      satoshis: utxo.satoshis.toString(),
      address: creator.address,
    })),
    change: creator.address,
  }),
});
const answer = (await response.json()) as { transaction?: string; roundId?: number; error?: string };
if (!response.ok || !answer.transaction || answer.roundId === undefined) throw new Error(answer.error ?? "no answer");
const request = fromWire<{
  transaction: TransactionCommon<Input, Output>;
  sourceOutputs: Array<Output & { lockingBytecode: Uint8Array }>;
}>(answer.transaction);
const { transaction, sourceOutputs } = request;
transaction.inputs.forEach((input, inputIndex) => {
  if (inputIndex === 0) return;
  const serialization = generateSigningSerializationBCH(
    { inputIndex, sourceOutputs, transaction },
    {
      coveredBytecode: sourceOutputs[inputIndex]?.lockingBytecode ?? new Uint8Array(),
      signingSerializationType: Uint8Array.of(SIGHASH_ALL_FORKID),
    },
  );
  const signature = secp256k1.signMessageHashSchnorr(playerKey.privateKey, hash256(serialization));
  if (typeof signature === "string") throw new Error(signature);
  const publicKey = secp256k1.derivePublicKeyCompressed(playerKey.privateKey);
  if (typeof publicKey === "string") throw new Error(publicKey);
  input.unlockingBytecode = flattenBinArray([
    encodeDataPush(flattenBinArray([signature, Uint8Array.of(SIGHASH_ALL_FORKID)])),
    encodeDataPush(publicKey),
  ]);
});
const createHex = binToHex(encodeTransaction(transaction));
console.log(`created event ${answer.roundId} through /api/create: ${await broadcast(fulcrum, createHex)}`);
creator.track(createHex);
const roundId = answer.roundId;

// 2. Two more wallets, funded from the player key when they run low.
const low = [];
for (const wallet of wallets.slice(1)) if ((await wallet.balance()) < LOW_BALANCE) low.push(wallet);
if (low.length > 0) {
  const coins = await creator.coins(TOP_UP * BigInt(low.length) + ENTRY_COIN);
  if (!coins) throw new Error("the player key cannot fund the other wallets");
  const builder = new TransactionBuilder({ provider });
  for (const coin of coins) builder.addInput(coin.utxo, coin.unlocker);
  for (const wallet of low) builder.addOutput({ to: wallet.address, amount: TOP_UP });
  const hex = builder.addBchChangeOutputIfNeeded({ to: creator.address, feeRate: 1 }).build();
  console.log(`funded ${low.length} test wallet(s): ${await broadcast(fulcrum, hex)}`);
  creator.track(hex);
  for (const wallet of low) wallet.track(hex);
}

// 3. Each wallet enters its own range, at alternating gates.
async function gateOf(gateIndex: number) {
  for (let tries = 0; tries < WAIT_TRIES; tries += 1) {
    const found = (await utxosAt(fulcrum, round.eventGate.lockingBytecode)).find((utxo) => {
      if (utxo.token?.category !== deployment.category || !utxo.token.nft) return false;
      const state = decodeGate(utxo.token.nft.commitment);
      return state.roundId === roundId && state.gateIndex === gateIndex;
    });
    if (found) return found as unknown as TokenUtxo;
    await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
  }
  throw new Error(`gate ${gateIndex} of event ${roundId} not visible`);
}

for (const [outcome, wallet] of wallets.entries()) {
  const gateIndex = outcome % 2;
  const coin = await wallet.coin(ENTRY_COIN);
  if (!coin) throw new Error(`${wallet.address} has no coin for its entry`);
  const hex = buildEnter({
    contracts: round,
    gate: await gateOf(gateIndex),
    funding: [coin],
    outcome,
    stake: STAKE,
    payoutPkh: wallet.pkh,
    change: wallet.address,
  }).build();
  console.log(
    `  wallet ${outcome + 1} (${wallet.address}) entered range ${outcome + 1}: ${await broadcast(fulcrum, hex)}`,
  );
  wallet.track(hex);
  // The next entry on this gate must spend the gate coin this one made.
  await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
}
console.log(`event ${roundId}: ${WEB_URL}/e/${roundId}`);
process.exit(0);
