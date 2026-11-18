// Proofs P3 and P9 on chipnet, with a real phone wallet over WizardConnect. Run it in a terminal you can see:
//   node scripts/wallet-probe.ts
// It shows a pairing QR; scan it with the wallet (set to chipnet). For each variant it opens a fresh round (funded by
// the dev key from dev-key.ts) and asks the wallet to sign a real entry; then it asks for a sign-in proof: a signed
// transaction that can never be mined (locktime in 2100), verified here. Results go to runs/wallet-<name>.json.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  binToHex,
  createVirtualMachineBCH,
  decodeTransaction,
  encodeCashAddress,
  hash160,
  hexToBin,
  stringify,
} from "@bitauth/libauth";
import { encodeGate, encodeOpen, type OpenRound, type StakeClass } from "@joge/sdk";
import { initiateDappRelay } from "@wizardconnect/core";
import { DappConnectionManager } from "@wizardconnect/dapp";
import {
  type ContractType,
  ElectrumNetworkProvider,
  placeholderP2PKHUnlocker,
  SignatureTemplate,
  type SpendableUtxo,
  TransactionBuilder,
} from "cashscript";
import { renderUnicodeCompact } from "uqr";
import { buildEnter, type TokenUtxo } from "../src/builders.ts";
import { roundContracts } from "../src/contracts.ts";
import { chipnetKey } from "./dev-key.ts";

const EXPLORER = "https://chipnet.imaginary.cash/tx/";
const PATHS = [
  { name: "receive", child: 0 },
  { name: "change", child: 1 },
] as const;
const ADDRESSES_TO_SCAN = 5;
const MIN_WALLET_COIN = 40_000n;
/** Test sats the dev key sends a paired chipnet wallet that has none. */
const WALLET_TOP_UP = 100_000n;
const STAKE = 10_000n;
const MASTER_BUDGET = 20_000n;
const GATE_DUST = 1_000n;
/** A genesis coin must fund the master, the gate and the fee. */
const GENESIS_COIN = 30_000n;
const POLL_MS = 10_000;
const NEVER = 4_102_444_800; // 2100-01-01T00:00:00Z: a sign-in proof can never be mined
const NON_FINAL = 0xfffffffe;
const PROOF_FEE = 600n;
const HOUR = 3_600;
const MS = 1_000;
const NONCE_BYTES = 16;
// Range boundaries for the 40-byte test round, in US cents (BTC around $64,000).
const FIRST_BOUNDARY = 6_000_000;
const BOUNDARY_STEP = 100_000;

interface Variant {
  label: string;
  outcomes: number;
  stakeClass: StakeClass;
  ticketType: ContractType;
}
const VARIANTS: Variant[] = [
  { label: "up/down, 20-byte gate, P2SH32 ticket", outcomes: 2, stakeClass: "short", ticketType: "p2sh32" },
  { label: "6 ranges, 40-byte gate (Selene's limit)", outcomes: 6, stakeClass: "event", ticketType: "p2sh32" },
  { label: "up/down, P2S ticket (no address)", outcomes: 2, stakeClass: "short", ticketType: "p2s" },
];

const provider = new ElectrumNetworkProvider("chipnet");
const dev = new SignatureTemplate(chipnetKey());
const devPkh = hash160(dev.publicKey);
const cash = (pkh: Uint8Array) => encodeCashAddress({ prefix: "bchtest", type: "p2pkh", payload: pkh }).address;
const devAddress = cash(devPkh);
/**
 * WizardConnect carries requests as JSON over its relay; wallets parse libauth's extended JSON, where bigints and bytes
 * are tagged strings (`<bigint: 1000n>`, `<Uint8Array: 0x…>`). CashScript's object holds raw bigints and Uint8Arrays.
 */
const relaySafe = (transaction: unknown) => JSON.parse(stringify(transaction)) as never;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const results: Array<{ check: string; outcome: string; txid?: string }> = [];

async function devCoinAtZero(): Promise<SpendableUtxo> {
  const coins = (await provider.getUtxos(devAddress)).filter((utxo) => !utxo.token);
  const atZero = coins.find((utxo) => utxo.vout === 0 && utxo.satoshis >= GENESIS_COIN);
  if (atZero) return atZero;
  if (coins.length === 0) throw new Error(`fund the dev key ${devAddress} with chipnet coins first`);
  const pay = new TransactionBuilder({ provider });
  for (const coin of coins) pay.addInput(coin, dev.unlockP2PKH());
  const { txid } = await pay.addBchChangeOutputIfNeeded({ to: devAddress, feeRate: 1 }).send();
  const fresh = (await provider.getUtxos(devAddress)).find((utxo) => utxo.txid === txid && utxo.vout === 0);
  if (!fresh) throw new Error("self-payment not visible yet");
  return fresh;
}

/** A fresh round of one variant, opened by the dev key (lock time an hour away: nobody locks it in this probe). */
async function openRound(variant: Variant) {
  const coin = await devCoinAtZero();
  const category = coin.txid;
  const contracts = roundContracts({
    category,
    provider,
    protocolLockingBytecode: binToHex(hexToBin(`76a914${binToHex(devPkh)}88ac`)),
    ticketType: variant.ticketType,
  });
  const lockTime = Math.floor(Date.now() / MS) + HOUR;
  const ranges = variant.outcomes > 2;
  const round: OpenRound = {
    roundId: 1,
    asset: "BTC",
    mode: ranges ? "ranges" : "updown",
    outcomes: variant.outcomes,
    gates: 1,
    lockTime,
    closeTime: lockTime + HOUR,
    creatorFeeBps: 0,
    creatorPkh: devPkh,
    minPot: 0n,
    minEntrants: 0,
    boundaries: ranges
      ? Array.from({ length: variant.outcomes - 1 }, (_, index) => FIRST_BOUNDARY + index * BOUNDARY_STEP)
      : [],
  };
  const gate = {
    roundId: 1,
    gateIndex: 0,
    stakeClass: variant.stakeClass,
    outcomes: variant.outcomes,
    entrants: 0,
    totals: Array(variant.outcomes).fill(0n),
  };
  const nft = (capability: "mutable" | "minting", commitment: Uint8Array) => ({
    category,
    amount: 0n,
    nft: { capability, commitment: binToHex(commitment) },
  });
  await new TransactionBuilder({ provider })
    .addInput(coin, dev.unlockP2PKH())
    .addOutput({
      to: hexToBin(contracts.open.lockingBytecode),
      amount: MASTER_BUDGET,
      token: nft("mutable", encodeOpen(round)),
    })
    .addOutput({
      to: hexToBin(contracts.gate.lockingBytecode),
      amount: GATE_DUST,
      token: nft("minting", encodeGate(gate)),
    })
    .addBchChangeOutputIfNeeded({ to: devAddress, feeRate: 1 })
    .send();
  const [gateUtxo] = (await provider.getUtxosForLockingBytecode(contracts.gate.lockingBytecode)) as TokenUtxo[];
  if (!gateUtxo) throw new Error("gate not visible yet");
  return { contracts, gate: gateUtxo };
}

async function pair() {
  const dapp = new DappConnectionManager("Jōge · chipnet wallet probe", undefined, { session: false });
  const relay = initiateDappRelay((payload) => dapp.updateConnection(payload.client, payload.status));
  dapp.attachRelay(relay);
  console.log("\nScan with your wallet (on chipnet):\n");
  console.log(renderUnicodeCompact(relay.qrUri));
  console.log(`\nOr paste into the wallet: ${relay.uri}\n`);
  await new Promise<void>((resolve) => dapp.once("walletready", () => resolve()));
  console.log(`Paired with ${dapp.walletName ?? "a wallet"}`);
  return { dapp, relay };
}

/** The first wallet coin big enough to stake from, with the WizardConnect path that signs it. */
async function walletCoin(dapp: DappConnectionManager) {
  for (;;) {
    const candidates = PATHS.flatMap((path) =>
      Array.from({ length: ADDRESSES_TO_SCAN }, (_, index) => {
        const pubkey = dapp.getPubkey(path.child, BigInt(index));
        return pubkey ? { pkh: hash160(pubkey), path: [path.name, index] as const } : undefined;
      }).filter((candidate) => candidate !== undefined),
    );
    const found = await Promise.all(
      candidates.map(async (candidate) => {
        const address = cash(candidate.pkh);
        const coin = (await provider.getUtxos(address)).find((utxo) => !utxo.token && utxo.satoshis >= MIN_WALLET_COIN);
        return coin ? { ...candidate, coin, address } : undefined;
      }),
    );
    const first = found.find((entry) => entry !== undefined);
    if (first) return first;
    const receive = dapp.getPubkey(0, 0n);
    if (!receive) throw new Error("the wallet shared no receive key");
    await topUp(cash(hash160(receive)));
    await sleep(POLL_MS);
  }
}

/** Chipnet only: the dev test key sends the paired wallet test coins so the probe needs no faucet trip. */
async function topUp(walletAddress: string) {
  const coins = (await provider.getUtxos(devAddress)).filter((utxo) => !utxo.token);
  const pay = new TransactionBuilder({ provider });
  for (const coin of coins) pay.addInput(coin, dev.unlockP2PKH());
  const { txid } = await pay
    .addOutput({ to: walletAddress, amount: WALLET_TOP_UP })
    .addBchChangeOutputIfNeeded({ to: devAddress, feeRate: 1 })
    .send();
  console.log(`Sent the wallet ${WALLET_TOP_UP} test sats: ${EXPLORER}${txid}`);
}

async function signEntry(dapp: DappConnectionManager, variant: Variant) {
  const { contracts, gate } = await openRound(variant);
  const { coin, address, pkh, path } = await walletCoin(dapp);
  const builder = buildEnter({
    contracts,
    gate,
    funding: [{ utxo: coin, unlocker: placeholderP2PKHUnlocker(address) }],
    outcome: 0,
    stake: STAKE,
    payoutPkh: pkh,
    change: address,
  });
  const transaction = relaySafe(
    builder.generateWcTransactionObject({ broadcast: false, userPrompt: `Jōge chipnet test: ${variant.label}` }),
  );
  console.log(`\nApprove in the wallet: ${variant.label}`);
  try {
    const response = await dapp.signTransaction({
      transaction: transaction as never,
      inputPaths: [[1, path[0], path[1]]],
    });
    if (response.error) throw new Error(response.error);
    const txid = await provider.sendRawTransaction(response.signedTransaction);
    console.log(`signed and broadcast: ${EXPLORER}${txid}`);
    results.push({ check: variant.label, outcome: "signed", txid });
  } catch (error) {
    console.log(`not signed: ${(error as Error).message}`);
    results.push({ check: variant.label, outcome: `refused: ${(error as Error).message}` });
  }
}

/** P9: a signed transaction that can never be mined proves the wallet holds this address (WizardConnect has no message signing). */
async function signInProof(dapp: DappConnectionManager) {
  const { coin, address, path } = await walletCoin(dapp);
  const nonce = binToHex(crypto.getRandomValues(new Uint8Array(NONCE_BYTES)));
  const builder = new TransactionBuilder({ provider })
    .setLocktime(NEVER)
    .addInput(coin, placeholderP2PKHUnlocker(address), { sequence: NON_FINAL })
    .addOpReturnOutput(["joge-sign-in", `0x${nonce}`])
    .addOutput({ to: address, amount: coin.satoshis - PROOF_FEE });
  const transaction = relaySafe(
    builder.generateWcTransactionObject({ broadcast: false, userPrompt: "Jōge sign-in (never broadcast)" }),
  );
  console.log("\nApprove in the wallet: sign-in proof (it can never be mined)");
  try {
    const response = await dapp.signTransaction({
      transaction: transaction as never,
      inputPaths: [[0, path[0], path[1]]],
    });
    if (response.error) throw new Error(response.error);
    const decoded = decodeTransaction(hexToBin(response.signedTransaction));
    if (typeof decoded === "string") throw new Error(decoded);
    const sourceOutputs = [
      {
        lockingBytecode: hexToBin(
          `76a914${binToHex(hash160(dapp.getPubkey(path[0] === "receive" ? 0 : 1, BigInt(path[1])) ?? new Uint8Array()))}88ac`,
        ),
        valueSatoshis: coin.satoshis,
      },
    ];
    const verdict = createVirtualMachineBCH().verify({ transaction: decoded, sourceOutputs });
    const holdsNonce = binToHex(decoded.outputs[0]?.lockingBytecode ?? new Uint8Array()).includes(nonce);
    const ok = verdict === true && decoded.locktime === NEVER && holdsNonce;
    console.log(ok ? "sign-in proof verified" : `sign-in proof rejected: ${String(verdict)}`);
    results.push({ check: "sign-in proof (locktime 2100)", outcome: ok ? "verified" : `rejected: ${String(verdict)}` });
  } catch (error) {
    console.log(`not signed: ${(error as Error).message}`);
    results.push({ check: "sign-in proof (locktime 2100)", outcome: `refused: ${(error as Error).message}` });
  }
}

const { dapp, relay } = await pair();
for (const variant of VARIANTS) await signEntry(dapp, variant);
await signInProof(dapp);
const runs = join(dirname(fileURLToPath(import.meta.url)), "..", "runs");
mkdirSync(runs, { recursive: true });
const wallet = (dapp.walletName ?? "wallet").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
writeFileSync(
  join(runs, `wallet-${wallet}.json`),
  `${JSON.stringify({ wallet: dapp.walletName, results }, null, 2)}\n`,
);
console.log("\nResults:");
for (const row of results) console.log(`  ${row.check}: ${row.outcome}`);
await dapp.sendDisconnect("probe finished");
relay.cleanup();
process.exit(0);
