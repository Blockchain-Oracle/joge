// Mainnet: the team's two Partner agents (the owner funded the keeper for them). A team owner key, derived from the
// keeper's so it never races the keeper for coins, signs in through the live web app the way a paired wallet does,
// creates each partner (no model: it takes the empty side of a lone call, within its caps) and funds its vault.
// Run once, after genesis and with the mainnet web app live; fund the owner first with scripts/mainnet-send.ts.
// Usage: WEB_URL=https://… node --env-file=.env.mainnet scripts/mainnet-partners.ts   (CONFIRM_MAINNET=yes to act)
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
  stringify,
  type TransactionCommon,
  utf8ToBin,
} from "@bitauth/libauth";
import { deploymentFor, roundContracts } from "@joge/contracts";
import { placeholderP2PKHUnlocker, TransactionBuilder } from "cashscript";
import { SIGN_IN_FEE, SIGN_IN_LOCKTIME, SIGN_IN_SEQUENCE, SIGN_IN_TAG } from "../../../apps/web/src/lib/sign-in.ts";
import { fromWire } from "../../../apps/web/src/lib/wire.ts";
import { broadcast, chainProvider, connectFulcrum, FULCRUM } from "../src/chain/electrum.ts";
import { KeeperWallet } from "../src/keeper/wallet.ts";

/** Every market: BTC, ETH, BCH 5 min and gold hourly (their lane threads). */
const LANE_THREADS = { btc5: 17, eth5: 20, bch5: 23, gold60: 28 } as const;
const MARKETS = [LANE_THREADS.btc5, LANE_THREADS.eth5, LANE_THREADS.bch5, LANE_THREADS.gold60];
/** A partner matches a lone call up to this (about 20 cents) and stakes at most this much a day. */
const PER_BET = 100_000;
const DAILY = 2_000_000;
const VAULT_FUND = 500_000n;
const PARTNERS = [
  { name: "Tomo", face: "tomo" },
  { name: "Kumo", face: "kumo" },
];
const SIGHASH_ALL_FORKID = 0x41;
const _POLL_MS = 15_000;
const MINUTE_MS = 60_000;
/** About three 5-minute rounds: time for the runner to read one inside its window. */
const WAIT_ROUNDS_MINUTES = 14;
const _WAIT_ROUNDS_MS = WAIT_ROUNDS_MINUTES * MINUTE_MS;
const _PERCENT = 100;
/** A sign-in proof's coin must cover its fee and leave a valid output. */
const PROOF_COIN = 2_000n;
const SETTLE_MS = 5_000;
const _MOMENTUM =
  "Follow the move. If the last few signed prices climb, call Up; if they fall, call Down. Sit out when the line is flat or the pot is already crowded on that side.";

const { KEEPER_WIF, WEB_URL = "", CONFIRM_MAINNET } = process.env;
if (!KEEPER_WIF) throw new Error("needs KEEPER_WIF (services/engine/.env.mainnet)");
if (!WEB_URL.startsWith("https://")) throw new Error("set WEB_URL to the live https web app");
const api = (path: string) => `${WEB_URL}${path}${path.includes("?") ? "&" : "?"}network=mainnet`;
const fulcrum = connectFulcrum(FULCRUM.mainnet);
await fulcrum.connect();
const provider = chainProvider(fulcrum, "mainnet");
const deployment = deploymentFor("mainnet");
const round = roundContracts({
  category: deployment.category,
  provider,
  protocolLockingBytecode: deployment.protocolLockingBytecode,
});

const keeperKey = decodePrivateKeyWif(KEEPER_WIF);
if (typeof keeperKey === "string") throw new Error(keeperKey);
const ownerWif = encodePrivateKeyWif(
  sha256.hash(flattenBinArray([keeperKey.privateKey, utf8ToBin("joge-mainnet-partner-owner")])),
  "mainnet",
);
const ownerDecoded = decodePrivateKeyWif(ownerWif);
if (typeof ownerDecoded === "string") throw new Error(ownerDecoded);
const ownerPrivateKey = ownerDecoded.privateKey;
const owner = new KeeperWallet(ownerWif, "mainnet", fulcrum);
const ownerPkh = binToHex(owner.pkh);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Signs the given inputs of a WalletConnect transaction object the way a wallet does (Schnorr, SIGHASH_ALL). */
function signLikeAWallet(wire: string, inputs: number[]): string {
  const { transaction, sourceOutputs } = fromWire<{
    transaction: TransactionCommon<Input, Output>;
    sourceOutputs: Array<Output & { lockingBytecode: Uint8Array }>;
  }>(wire);
  for (const inputIndex of inputs) {
    const serialization = generateSigningSerializationBCH(
      { inputIndex, sourceOutputs, transaction },
      {
        coveredBytecode: sourceOutputs[inputIndex]?.lockingBytecode ?? new Uint8Array(),
        signingSerializationType: Uint8Array.of(SIGHASH_ALL_FORKID),
      },
    );
    const signature = secp256k1.signMessageHashSchnorr(ownerPrivateKey, hash256(serialization));
    if (typeof signature === "string") throw new Error(signature);
    const publicKey = secp256k1.derivePublicKeyCompressed(ownerPrivateKey);
    if (typeof publicKey === "string") throw new Error(publicKey);
    const input = transaction.inputs[inputIndex];
    if (!input) throw new Error(`no input ${inputIndex}`);
    input.unlockingBytecode = flattenBinArray([
      encodeDataPush(flattenBinArray([signature, Uint8Array.of(SIGHASH_ALL_FORKID)])),
      encodeDataPush(publicKey),
    ]);
  }
  return binToHex(encodeTransaction(transaction));
}

async function json<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(`${response.url}: ${body.error ?? response.status}`);
  return body;
}

// 0. The owner holds enough: both vaults, the sign-in proof and fees. Stop here unless the owner said go.
const needed = VAULT_FUND * BigInt(PARTNERS.length) + PROOF_COIN * 2n;
const held = await owner.balance();
console.log(`team owner ${owner.address} holds ${held} sats; the partners need ${needed}`);
if (held < needed) throw new Error(`fund it first: TO=${owner.address} AMOUNT=${needed} scripts/mainnet-send.ts`);
if (CONFIRM_MAINNET !== "yes") {
  console.log("dry run: nothing created (set CONFIRM_MAINNET=yes)");
  process.exit(0);
}

// 1. Sign in: the same proof the page builds (placeholder unlocker → WalletConnect object → the wallet signs input 0).
const { challenge } = await json<{ challenge: string }>(await fetch(`${WEB_URL}/api/auth/challenge`));
const proofCoin = await owner.coin(PROOF_COIN);
if (!proofCoin) throw new Error("the owner has no coin to sign in with");
owner.release(proofCoin);
const proofObject = new round.TransactionBuilder({ provider: round.open.provider })
  .setLocktime(SIGN_IN_LOCKTIME)
  .addInput(proofCoin.utxo, placeholderP2PKHUnlocker(owner.address), { sequence: SIGN_IN_SEQUENCE })
  .addOpReturnOutput([SIGN_IN_TAG, challenge])
  .addOutput({ to: owner.address, amount: proofCoin.utxo.satoshis - SIGN_IN_FEE })
  .generateWcTransactionObject({ broadcast: false, userPrompt: "Sign in to Jōge" });
const signedProof = signLikeAWallet(stringify(proofObject), [0]);
const verify = await fetch(`${WEB_URL}/api/auth/verify`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    signedTransaction: signedProof,
    lockingBytecode: owner.lockingBytecode,
    satoshis: proofCoin.utxo.satoshis.toString(),
  }),
});
const proven = await json<{ pkh: string }>(verify);
const cookie = verify.headers
  .getSetCookie()
  .map((line) => line.split(";")[0])
  .join("; ");
console.log(`signed in as ${proven.pkh} (${proven.pkh === ownerPkh ? "the owner" : "SOMEONE ELSE"})`);
const authed = (path: string, method: "POST" | "PATCH", body: unknown) =>
  fetch(api(path), { method, headers: { "content-type": "application/json", cookie }, body: JSON.stringify(body) });

// 2. Create each partner and fund its vault with a plain payment from the owner.
for (const partner of PARTNERS) {
  const created = (
    await json<{ agent: { id: number; vaultLockingBytecode: string } }>(
      await authed("/api/agents", "POST", {
        name: partner.name,
        persona: "Partner: takes the empty side of a lone call so the round plays.",
        posture: "partner",
        lanes: MARKETS,
        perBetCap: PER_BET,
        dailyCap: DAILY,
        mode: "auto",
        face: partner.face,
      }),
    )
  ).agent;
  const fund = await owner.coins(VAULT_FUND);
  if (!fund) throw new Error("the owner cannot fund the vault");
  const funding = new TransactionBuilder({ provider });
  for (const coin of fund) funding.addInput(coin.utxo, coin.unlocker);
  const hex = funding
    .addOutput({ to: hexToBin(created.vaultLockingBytecode), amount: VAULT_FUND })
    .addBchChangeOutputIfNeeded({ to: owner.address, feeRate: 1 })
    .build();
  console.log(
    `${partner.name}: agent ${created.id}, vault funded ${VAULT_FUND} sats: ${await broadcast(fulcrum, hex)}`,
  );
  owner.track(hex);
  await sleep(SETTLE_MS);
}
process.exit(0);
