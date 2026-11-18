// Creates category K: one token-genesis transaction that mints the 3 factory threads and the 13 lane threads, then
// records every contract's locking bytecode in deployments/<network>.json for the engine and the app. Dollar events
// stake the token in DOLLAR_CATEGORY (chipnet: the test dollar from scripts/test-dollar.ts; mainnet: ParyonUSD).
//   chipnet: DOLLAR_CATEGORY=<category> node scripts/genesis.ts
//   mainnet: NETWORK=mainnet GENESIS_WIF=… PROTOCOL_ADDRESS=bitcoincash:… node --env-file=… scripts/genesis.ts
//            prints what it would send and stops; it broadcasts only with CONFIRM_MAINNET=yes (the user's go-ahead).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { binToHex, cashAddressToLockingBytecode, encodeCashAddress, hash160, hexToBin } from "@bitauth/libauth";
import { encodeFactory, encodeLane, FACTORY_THREADS, gridSlotAtOrAfter, LANES, PUSD_CATEGORY } from "@joge/sdk";
import { ElectrumNetworkProvider, SignatureTemplate, TransactionBuilder } from "cashscript";
import { roundContracts } from "../src/contracts.ts";
import { dollarContracts } from "../src/dollar.ts";
import { openingContracts } from "../src/hybrid.ts";
import { chipnetKey } from "./dev-key.ts";

const THREAD_DUST = 1_000n;
const GENESIS_COIN = 50_000n;
const MS = 1_000;

const network = process.env.NETWORK === "mainnet" ? "mainnet" : "chipnet";
const live = network === "chipnet" || process.env.CONFIRM_MAINNET === "yes";
const EXPLORER = network === "mainnet" ? "https://explorer.bch.ninja/tx/" : "https://chipnet.imaginary.cash/tx/";
const provider = new ElectrumNetworkProvider(network);
const wif = network === "mainnet" ? process.env.GENESIS_WIF : chipnetKey();
if (!wif) throw new Error("set GENESIS_WIF (the mainnet key that pays for the genesis)");
const signer = new SignatureTemplate(wif);
const pkh = hash160(signer.publicKey);
const address = encodeCashAddress({
  prefix: network === "mainnet" ? "bitcoincash" : "bchtest",
  type: "p2pkh",
  payload: pkh,
}).address;
/** Where the 2 % protocol fee goes: the genesis key on chipnet; on mainnet the owner's own address. */
function protocolBytecode(): string {
  if (network === "chipnet") return `76a914${binToHex(pkh)}88ac`;
  const target = process.env.PROTOCOL_ADDRESS ?? "";
  const decoded = cashAddressToLockingBytecode(target);
  if (typeof decoded === "string" || !target.startsWith("bitcoincash:")) {
    throw new Error("set PROTOCOL_ADDRESS to the mainnet address that receives the protocol fee");
  }
  return binToHex(decoded.bytecode);
}
const protocolLockingBytecode = protocolBytecode();

async function genesisCoin() {
  const coins = (await provider.getUtxos(address)).filter((utxo) => !utxo.token);
  const atZero = coins.find((utxo) => utxo.vout === 0 && utxo.satoshis >= GENESIS_COIN);
  if (atZero) return atZero;
  const held = coins.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
  if (!live) {
    console.log(`dry run (${network}): ${address} holds ${held} sats; genesis needs one coin of ${GENESIS_COIN}+`);
    console.log("nothing sent; set CONFIRM_MAINNET=yes to create category K");
    process.exit(0);
  }
  const pay = new TransactionBuilder({ provider });
  for (const coin of coins) pay.addInput(coin, signer.unlockP2PKH());
  const { txid } = await pay.addBchChangeOutputIfNeeded({ to: address, feeRate: 1 }).send();
  const fresh = (await provider.getUtxos(address)).find((utxo) => utxo.txid === txid && utxo.vout === 0);
  if (!fresh) throw new Error("self-payment not visible yet");
  return fresh;
}

const CATEGORY_HEX = /^[0-9a-f]{64}$/;
const dollarCategory = process.env.DOLLAR_CATEGORY ?? (network === "mainnet" ? PUSD_CATEGORY : "");
if (!CATEGORY_HEX.test(dollarCategory)) throw new Error("set DOLLAR_CATEGORY (run scripts/test-dollar.ts first)");
const coin = await genesisCoin();
const category = coin.txid;
const round = roundContracts({ category, provider, protocolLockingBytecode });
const dollar = dollarContracts(round, { dollarCategory, provider, protocolLockingBytecode });
const opening = openingContracts(round, provider, protocolLockingBytecode, dollar);
const now = Math.floor(Date.now() / MS);
const minting = (commitment: Uint8Array) => ({
  category,
  amount: 0n,
  nft: { capability: "minting" as const, commitment: binToHex(commitment) },
});

const genesis = new TransactionBuilder({ provider }).addInput(coin, signer.unlockP2PKH());
for (const thread of FACTORY_THREADS) {
  genesis.addOutput({
    to: hexToBin(opening.factory.lockingBytecode),
    amount: THREAD_DUST,
    token: minting(encodeFactory(thread, 0)),
  });
}
const lanes = LANES.map((lane) => ({
  ...lane,
  nextLock: gridSlotAtOrAfter(lane.seconds, now + lane.seconds),
  counter: 0,
}));
for (const lane of lanes) {
  genesis.addOutput({
    to: hexToBin(opening.lanes.lockingBytecode),
    amount: THREAD_DUST,
    token: minting(encodeLane(lane)),
  });
}
if (!live) {
  console.log(`dry run (${network}): genesis from ${address} ready (${lanes.length} lanes); nothing sent`);
  console.log("set CONFIRM_MAINNET=yes to broadcast it");
  process.exit(0);
}
const { txid } = await genesis.addBchChangeOutputIfNeeded({ to: address, feeRate: 1 }).send();
console.log(`genesis ${EXPLORER}${txid}`);
console.log(`category ${category}: ${FACTORY_THREADS.length} factory threads, ${lanes.length} lane threads`);

const deployment = {
  network,
  category,
  genesisTxid: txid,
  createdAt: new Date(now * MS).toISOString(),
  protocolLockingBytecode,
  dollarCategory,
  lockingBytecode: {
    gate: round.gate.lockingBytecode,
    eventGate: round.eventGate.lockingBytecode,
    ticket: round.ticket.lockingBytecode,
    masterOpen: round.open.lockingBytecode,
    masterLocked: round.locked.lockingBytecode,
    masterSweep: round.sweep.lockingBytecode,
    laneThread: opening.lanes.lockingBytecode,
    factory: opening.factory.lockingBytecode,
    dollarGate: dollar.gate.lockingBytecode,
    dollarSide: dollar.side.lockingBytecode,
    dollarMasterOpen: dollar.open.lockingBytecode,
    dollarMasterLocked: dollar.locked.lockingBytecode,
    dollarMasterSweep: dollar.sweep.lockingBytecode,
  },
  factoryThreads: FACTORY_THREADS,
  lanes: lanes.map(({ thread, asset, seconds }) => ({ thread, asset, seconds })),
};
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "deployments");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, `${network}.json`), `${JSON.stringify(deployment, null, 2)}\n`);
console.log(`wrote deployments/${network}.json`);
process.exit(0);
