// Chipnet only: a dollar event (F11) made the way the app makes one, played by three wallets in the test dollar. It
//   1. sends the two derived test wallets satoshis and test dollars from the player key when they run low;
//   2. asks the running web app's /api/create to build a three-range BTC dollar event (entries close in ~6 minutes,
//      decided an hour later, needs 3 entries), signs the creator's coins the way a paired wallet does, broadcasts it;
//   3. has each wallet enter a different range in dollars, with its own coins.
// The engine's keeper locks, settles and pays it in the dollar token. Needs the web app on WEB_URL and test dollars
// on the player key (packages/contracts/scripts/test-dollar.ts with DOLLAR_TO set to the player's address).
// Usage: node --env-file=.env scripts/chipnet-dollar-event.ts
import {
  binToHex,
  decodePrivateKeyWif,
  encodeDataPush,
  encodePrivateKeyWif,
  encodeTransaction,
  flattenBinArray,
  generateSigningSerializationBCH,
  hash256,
  hexToBin,
  type Input,
  type Output,
  secp256k1,
  sha256,
  type TransactionCommon,
  utf8ToBin,
} from "@bitauth/libauth";
import {
  buildDollarEnter,
  deploymentFor,
  dollarContracts,
  type Funding,
  roundContracts,
  type SideUtxo,
  type TokenUtxo,
} from "@joge/contracts";
import { createDb } from "@joge/db";
import { decodeGate, HOUR_SECONDS } from "@joge/sdk";
import { SignatureTemplate, TransactionBuilder } from "cashscript";
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
/** Stakes in test-dollar cents, one per wallet: $2.50, $1.00, $0.75. */
const FIRST_STAKE = 250n;
const SECOND_STAKE = 100n;
const THIRD_STAKE = 75n;
const STAKES = [FIRST_STAKE, SECOND_STAKE, THIRD_STAKE];
const SATS_COIN = 12_000n;
const CREATE_COIN = 30_000n;
const TOP_UP_SATS = 20_000n;
const TOP_UP_DOLLARS = 1_000n;
const LOW_SATS = 8_000n;
const TOKEN_DUST = 1_000n;
const SIGHASH_ALL_FORKID = 0x41;
const WAIT_MS = 1_000;
const WAIT_TRIES = 30;
const TITLE = "Where will Bitcoin close? (dollars)";

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
const dollar = dollarContracts(round, {
  dollarCategory: deployment.dollarCategory,
  provider,
  protocolLockingBytecode: deployment.protocolLockingBytecode,
});
const { db } = createDb(DATABASE_URL, { max: 2 });

const playerKey = decodePrivateKeyWif(CHIPNET_PLAYER_WIF);
if (typeof playerKey === "string") throw new Error(playerKey);
const derivedKey = (label: string) => sha256.hash(flattenBinArray([playerKey.privateKey, utf8ToBin(label)]));
const keys = [playerKey.privateKey, derivedKey("joge-chipnet-wallet-2"), derivedKey("joge-chipnet-wallet-3")];
const wallets = keys.map((key) => new KeeperWallet(encodePrivateKeyWif(key, "testnet"), "chipnet", fulcrum));
const [creator] = wallets as [KeeperWallet, KeeperWallet, KeeperWallet];

/** A wallet's test-dollar coins, largest first, as funding it signs. */
async function dollarCoins(index: number): Promise<Funding[]> {
  const wallet = wallets[index] as KeeperWallet;
  const coins = (await utxosAt(fulcrum, wallet.lockingBytecode)).filter(
    (coin) => coin.token?.category === deployment.dollarCategory && !coin.token.nft,
  );
  return coins
    .sort((a, b) => ((b.token?.amount ?? 0n) > (a.token?.amount ?? 0n) ? 1 : -1))
    .map((utxo) => ({ utxo, unlocker: new SignatureTemplate(keys[index] as Uint8Array).unlockP2PKH() }));
}

// 1. Satoshis and test dollars for the two derived wallets.
const low: KeeperWallet[] = [];
for (const [index, wallet] of wallets.entries()) {
  if (index === 0) continue;
  const held = (await dollarCoins(index)).reduce((sum, coin) => sum + (coin.utxo.token?.amount ?? 0n), 0n);
  if ((await wallet.balance()) < LOW_SATS || held < TOP_UP_DOLLARS / 2n) low.push(wallet);
}
if (low.length > 0) {
  const sats = await creator.coins(TOP_UP_SATS * BigInt(low.length) + SATS_COIN);
  const [tokens] = await dollarCoins(0);
  if (!sats || !tokens?.utxo.token) throw new Error("the player key needs satoshis and test dollars");
  const builder = new TransactionBuilder({ provider });
  for (const coin of [...sats, tokens]) builder.addInput(coin.utxo, coin.unlocker);
  for (const wallet of low) {
    builder.addOutput({ to: hexToBin(wallet.lockingBytecode), amount: TOP_UP_SATS });
    builder.addOutput({
      to: hexToBin(wallet.lockingBytecode),
      amount: TOKEN_DUST,
      token: { category: deployment.dollarCategory, amount: TOP_UP_DOLLARS },
    });
  }
  const left = tokens.utxo.token.amount - TOP_UP_DOLLARS * BigInt(low.length);
  builder.addOutput({
    to: hexToBin(creator.lockingBytecode),
    amount: TOKEN_DUST,
    token: { category: deployment.dollarCategory, amount: left },
  });
  const hex = builder.addBchChangeOutputIfNeeded({ to: creator.address, feeRate: 1 }).build();
  console.log(`funded ${low.length} test wallet(s) with sats and test dollars: ${await broadcast(fulcrum, hex)}`);
  creator.track(hex);
  await new Promise((resolve) => setTimeout(resolve, WAIT_MS * 2));
}

// 2. The dollar event, built by the app's own route and signed like a wallet signs.
const btc = await latest(db, "USD/BTC");
if (!btc) throw new Error("the oracle relay has no BTC price yet");
const lockTime = Math.ceil((Math.floor(Date.now() / MS) + LOCK_IN_MINUTES * MINUTE) / MINUTE) * MINUTE;
const sats = await creator.coins(CREATE_COIN);
const [seeds] = await dollarCoins(0);
if (!sats || !seeds?.utxo.token) throw new Error("the player key needs satoshis and test dollars to create");
const coin = ({ utxo }: Funding) => ({
  txid: utxo.txid,
  vout: utxo.vout,
  satoshis: utxo.satoshis.toString(),
  address: creator.address,
  ...(utxo.token ? { dollars: utxo.token.amount.toString() } : {}),
});
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
      dollars: true,
    },
    creatorPkh: binToHex(creator.pkh),
    coins: [...sats, seeds].map(coin),
    change: creator.address,
  }),
});
const answer = (await response.json()) as { transaction?: string; roundId?: number; error?: string };
if (!response.ok || !answer.transaction || answer.roundId === undefined) throw new Error(answer.error ?? "no answer");
const { transaction, sourceOutputs } = fromWire<{
  transaction: TransactionCommon<Input, Output>;
  sourceOutputs: Array<Output & { lockingBytecode: Uint8Array }>;
}>(answer.transaction);
const publicKey = secp256k1.derivePublicKeyCompressed(playerKey.privateKey);
if (typeof publicKey === "string") throw new Error(publicKey);
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
  input.unlockingBytecode = flattenBinArray([
    encodeDataPush(flattenBinArray([signature, Uint8Array.of(SIGHASH_ALL_FORKID)])),
    encodeDataPush(publicKey),
  ]);
});
const createHex = binToHex(encodeTransaction(transaction));
console.log(`created dollar event ${answer.roundId} through /api/create: ${await broadcast(fulcrum, createHex)}`);
const roundId = answer.roundId;

// 3. Each wallet enters its own range in test dollars, at alternating gates.
async function gateAndSide(gateIndex: number) {
  for (let tries = 0; tries < WAIT_TRIES; tries += 1) {
    const gate = (await utxosAt(fulcrum, dollar.gate.lockingBytecode)).find((utxo) => {
      if (utxo.token?.category !== deployment.category || !utxo.token.nft) return false;
      const state = decodeGate(utxo.token.nft.commitment);
      return state.roundId === roundId && state.gateIndex === gateIndex;
    }) as TokenUtxo | undefined;
    const side = gate
      ? ((await utxosAt(fulcrum, dollar.side.lockingBytecode)).find(
          (utxo) => utxo.txid === gate.txid && utxo.token?.category === deployment.dollarCategory,
        ) as SideUtxo | undefined)
      : undefined;
    if (gate && side) return { gate, side };
    await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
  }
  throw new Error(`gate ${gateIndex} of event ${roundId} and its sidecar are not visible`);
}

for (const [outcome, wallet] of wallets.entries()) {
  const { gate, side } = await gateAndSide(outcome % 2);
  const stake = STAKES[outcome] as bigint;
  const [tokens] = await dollarCoins(outcome);
  const satsCoin = await wallet.coin(SATS_COIN);
  if (!tokens || !satsCoin) throw new Error(`${wallet.address} lacks test dollars or satoshis`);
  const hex = buildDollarEnter({
    contracts: round,
    dollar,
    gate,
    side,
    funding: [tokens, satsCoin],
    outcome,
    stake,
    payoutPkh: wallet.pkh,
    change: hexToBin(wallet.lockingBytecode),
  }).build();
  console.log(
    `  wallet ${outcome + 1} entered range ${outcome + 1} with ${stake} cents: ${await broadcast(fulcrum, hex)}`,
  );
  wallet.track(hex);
  await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
}
console.log(`dollar event ${roundId}: ${WEB_URL}/e/${roundId}`);
process.exit(0);
