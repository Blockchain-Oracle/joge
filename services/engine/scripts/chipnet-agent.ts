// Chipnet only: an agent run end to end through the web app's own routes, signed the way a paired wallet signs.
//   1. an owner test wallet (derived from the player key) signs in: a never-mineable proof built like the page builds it;
//   2. it creates an agent ("On its own", BTC 5 min) and funds its vault with a plain payment;
//   3. the engine's runner reads rounds and bets from the vault (signed by the agent's key, inside the covenant);
//   4. the owner switches it to "Ask me first", waits for a proposal and takes it with an entry of its own;
//   5. the owner pauses it and takes everything in the vault back (the vault's withdraw, the owner's coin as input 1).
// Needs the web app on WEB_URL (default http://localhost:3300) and the engine running with the agents component.
// Usage: node --env-file=.env scripts/chipnet-agent.ts   (AGENT_ID=<id> picks up an earlier agent; BRIEF="…" rewrites it)
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
import { buildEnter, deploymentFor, roundContracts, type TokenUtxo } from "@joge/contracts";
import { decodeGate } from "@joge/sdk";
import { placeholderP2PKHUnlocker, TransactionBuilder } from "cashscript";
import { SIGN_IN_FEE, SIGN_IN_LOCKTIME, SIGN_IN_SEQUENCE, SIGN_IN_TAG } from "../../../apps/web/src/lib/sign-in.ts";
import { fromWire } from "../../../apps/web/src/lib/wire.ts";
import { broadcast, chainProvider, connectFulcrum, FULCRUM, utxosAt } from "../src/chain/electrum.ts";
import { KeeperWallet } from "../src/keeper/wallet.ts";

const LANE_BTC_5 = 17;
const PER_BET = 6_000;
const DAILY = 60_000;
const VAULT_FUND = 40_000n;
const OWNER_FLOOR = 70_000n;
const ENTRY_COIN = 12_000n;
const SIGHASH_ALL_FORKID = 0x41;
const POLL_MS = 15_000;
const MINUTE_MS = 60_000;
/** About three 5-minute rounds: time for the runner to read one inside its window. */
const WAIT_ROUNDS_MINUTES = 14;
const WAIT_ROUNDS_MS = WAIT_ROUNDS_MINUTES * MINUTE_MS;
const PERCENT = 100;
/** A sign-in proof's coin must cover its fee and leave a valid output. */
const PROOF_COIN = 2_000n;
const SETTLE_MS = 5_000;
const MOMENTUM =
  "Follow the move. If the last few signed prices climb, call Up; if they fall, call Down. Sit out when the line is flat or the pot is already crowded on that side.";

const { CHIPNET_PLAYER_WIF, WEB_URL = "http://localhost:3300", AGENT_ID, BRIEF } = process.env;
if (!CHIPNET_PLAYER_WIF) throw new Error("needs CHIPNET_PLAYER_WIF");
const api = (path: string) => `${WEB_URL}${path}${path.includes("?") ? "&" : "?"}network=chipnet`;
const fulcrum = connectFulcrum(FULCRUM.chipnet);
await fulcrum.connect();
const provider = chainProvider(fulcrum, "chipnet");
const deployment = deploymentFor("chipnet");
const round = roundContracts({
  category: deployment.category,
  provider,
  protocolLockingBytecode: deployment.protocolLockingBytecode,
});

const playerKey = decodePrivateKeyWif(CHIPNET_PLAYER_WIF);
if (typeof playerKey === "string") throw new Error(playerKey);
const ownerWif = encodePrivateKeyWif(
  sha256.hash(flattenBinArray([playerKey.privateKey, utf8ToBin("joge-chipnet-agent-owner")])),
  "testnet",
);
const ownerDecoded = decodePrivateKeyWif(ownerWif);
if (typeof ownerDecoded === "string") throw new Error(ownerDecoded);
const ownerPrivateKey = ownerDecoded.privateKey;
const owner = new KeeperWallet(ownerWif, "chipnet", fulcrum);
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

// 0. The owner wallet holds enough test coins: the two event test wallets are swept into it when it runs low.
const donors = ["joge-chipnet-wallet-3", "joge-chipnet-wallet-2"].map(
  (label) =>
    new KeeperWallet(
      encodePrivateKeyWif(sha256.hash(flattenBinArray([playerKey.privateKey, utf8ToBin(label)])), "testnet"),
      "chipnet",
      fulcrum,
    ),
);
for (const donor of donors) {
  if ((await owner.balance()) >= OWNER_FLOOR) break;
  const balance = await donor.balance();
  const coins = balance > 0n ? await donor.coins(balance) : undefined;
  if (!coins) continue;
  const builder = new TransactionBuilder({ provider });
  for (const coin of coins) builder.addInput(coin.utxo, coin.unlocker);
  const hex = builder.addBchChangeOutputIfNeeded({ to: owner.address, feeRate: 1 }).build();
  console.log(`moved ${balance} test sats from ${donor.address} to the owner: ${await broadcast(fulcrum, hex)}`);
  owner.track(hex);
}
if ((await owner.balance()) < OWNER_FLOOR) throw new Error(`the owner ${owner.address} has too few test coins`);

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

// 2. Create the agent and fund its vault (or, with AGENT_ID, pick up an agent this script made before; with BRIEF, the
//    owner rewrites its brief through the same signed-in route the agent page uses).
type AgentTerms = { id: number; vaultLockingBytecode: string; perBetCap: number; mode: string };
let agent: AgentTerms;
if (AGENT_ID) {
  agent = (await json<{ agent: AgentTerms }>(await fetch(api(`/api/agents/${AGENT_ID}`)))).agent;
  if (agent.mode !== "auto") await json(await authed(`/api/agents/${agent.id}`, "PATCH", { mode: "auto" }));
  await json(await authed(`/api/agents/${agent.id}`, "PATCH", { status: "active" }));
  console.log(`picked up agent ${agent.id}: ${WEB_URL}/agents/${agent.id}`);
} else {
  agent = (
    await json<{ agent: AgentTerms }>(
      await authed("/api/agents", "POST", {
        name: "Night owl",
        persona: MOMENTUM,
        posture: "active",
        lanes: [LANE_BTC_5],
        perBetCap: PER_BET,
        dailyCap: DAILY,
        mode: "auto",
      }),
    )
  ).agent;
  console.log(`created agent ${agent.id}: ${WEB_URL}/agents/${agent.id}`);
  const fund = await owner.coins(VAULT_FUND + ENTRY_COIN);
  if (!fund) throw new Error("the owner cannot fund the vault");
  const funding = new TransactionBuilder({ provider });
  for (const coin of fund) funding.addInput(coin.utxo, coin.unlocker);
  const fundHex = funding
    .addOutput({ to: hexToBin(agent.vaultLockingBytecode), amount: VAULT_FUND })
    .addBchChangeOutputIfNeeded({ to: owner.address, feeRate: 1 })
    .build();
  console.log(`funded the vault with ${VAULT_FUND} sats: ${await broadcast(fulcrum, fundHex)}`);
  owner.track(fundHex);
}
if (BRIEF) {
  await json(await authed(`/api/agents/${agent.id}`, "PATCH", { persona: BRIEF }));
  console.log("the owner rewrote the brief");
}

interface MemoryRow {
  id: number;
  roundId: number;
  side: string | null;
  confidence: number | null;
  verdict: string;
  reason: string | null;
  stake: number | null;
  txid: string | null;
  proposal: string | null;
  outcome: string;
}
const memoryOf = async () => (await json<{ memory: MemoryRow[] }>(await fetch(api(`/api/agents/${agent.id}`)))).memory;
const seen = new Set<number>();
async function watch(until: (memory: MemoryRow[]) => MemoryRow | undefined, label: string): Promise<MemoryRow> {
  const deadline = Date.now() + WAIT_ROUNDS_MS;
  while (Date.now() < deadline) {
    const memory = await memoryOf();
    for (const entry of memory) {
      if (seen.has(entry.id) || entry.verdict === "reading") continue;
      seen.add(entry.id);
      console.log(
        `  read round ${entry.roundId}: ${entry.side} ${Math.round((entry.confidence ?? 0) * PERCENT)} % → ${entry.verdict}` +
          `${entry.stake ? ` ${entry.stake} sats` : ""}${entry.txid ? ` tx ${entry.txid}` : ""}` +
          `${entry.proposal ? ` proposal ${entry.proposal}` : ""}${entry.reason ? ` (${entry.reason})` : ""}`,
      );
    }
    const found = until(memory);
    if (found) return found;
    await sleep(POLL_MS);
  }
  throw new Error(`timed out waiting for ${label}`);
}

// 3. The runner bets from the vault.
const bet = await watch((memory) => memory.find((entry) => entry.txid), "a vault bet");
if ((bet.stake ?? 0) > agent.perBetCap) throw new Error("the bet broke the per-bet cap");
console.log(`vault bet ${bet.txid} for ${bet.stake} sats (cap ${agent.perBetCap})`);

// 4. Ask me first: the next read becomes a proposal; the owner takes it with an entry of its own.
await json(await authed(`/api/agents/${agent.id}`, "PATCH", { mode: "ask" }));
console.log("switched to Ask me first");
const proposal = await watch(
  (memory) => memory.find((entry) => entry.proposal === "open" && entry.id !== bet.id),
  "a proposal",
);
const gate = (await utxosAt(fulcrum, round.gate.lockingBytecode)).find(
  (utxo) =>
    utxo.token?.category === deployment.category &&
    utxo.token.nft &&
    decodeGate(utxo.token.nft.commitment).roundId === proposal.roundId,
) as unknown as TokenUtxo | undefined;
const coin = await owner.coin(ENTRY_COIN);
if (gate && coin) {
  const entryHex = buildEnter({
    contracts: round,
    gate,
    funding: [coin],
    outcome: proposal.side === "down" ? 1 : 0,
    stake: BigInt(proposal.stake ?? PER_BET),
    payoutPkh: owner.pkh,
    change: owner.address,
  }).build();
  console.log(`took proposal ${proposal.id}: entry ${await broadcast(fulcrum, entryHex)}`);
  owner.track(entryHex);
  await json(await authed(`/api/agents/reads/${proposal.id}`, "PATCH", { proposal: "taken" }));
} else console.log("the proposal's round closed before the owner could take it");

// 5. Pause, then take everything back.
await json(await authed(`/api/agents/${agent.id}`, "PATCH", { status: "paused" }));
const authority = await owner.coin(SIGN_IN_FEE);
if (!authority) throw new Error("the owner has no coin to sign the withdrawal with");
const withdraw = await json<{ transaction: string; amount: string }>(
  await fetch(api(`/api/agents/${agent.id}/withdraw`), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      coin: {
        txid: authority.utxo.txid,
        vout: authority.utxo.vout,
        satoshis: authority.utxo.satoshis.toString(),
        address: owner.address,
      },
    }),
  }),
);
const withdrawHex = signLikeAWallet(withdraw.transaction, [1]);
console.log(`withdrew ${withdraw.amount} sats (vault + the owner's coin): ${await broadcast(fulcrum, withdrawHex)}`);
await sleep(SETTLE_MS);
const left = (await utxosAt(fulcrum, agent.vaultLockingBytecode)).length;
console.log(left === 0 ? "the vault is empty" : `the vault still holds ${left} coin(s)`);
console.log(`agent ${agent.id}: ${WEB_URL}/agents/${agent.id}`);
process.exit(0);
