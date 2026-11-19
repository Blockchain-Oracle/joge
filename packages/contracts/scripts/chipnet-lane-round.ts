// On chipnet: the hybrid end to end. The BTC 3-minute lane thread (SolidCash) opens its next round with a signed
// oracle clock; two entries go into its gates (CashScript); then lock → settle → sweep with live prices.
// Usage: node scripts/chipnet-lane-round.ts        (after scripts/genesis.ts; records to runs/lane-<lock>.json)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { encodeCashAddress, hash160 } from "@bitauth/libauth";
import {
  decodeGate,
  decodeLane,
  decodeOpen,
  decodeTicket,
  FEEDS,
  fetchMessages,
  findBoundaryPair,
  findBySequence,
  nextSlot,
  type PriceMessage,
  sortPrices,
} from "@joge/sdk";
import { ElectrumNetworkProvider, SignatureTemplate } from "cashscript";
import { buildEnter, buildLaneOpen, buildLock, buildSettle, buildSweep, type TokenUtxo } from "../src/builders.ts";
import { roundContracts } from "../src/contracts.ts";
import { dollarContracts } from "../src/dollar.ts";
import { openingContracts } from "../src/hybrid.ts";
import { chipnetKey } from "./dev-key.ts";

const EXPLORER = "https://chipnet.imaginary.cash/tx/";
const LANE_THREAD = 0x10;
const STAKE = 10_000n;
const POLL_MS = 10_000;
const LOOKBACK_SECONDS = 600;
const MS = 1_000;
const HEX = 2;
const STEP_COLUMN = 12;
const SIZE_COLUMN = 5;
const ORACLE_PAGE = 50;
/** A funding coin must cover a round budget or a stake plus fees. */
const MIN_COIN = 100_000n;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const deployment = JSON.parse(readFileSync(join(root, "deployments", "chipnet.json"), "utf8")) as {
  category: string;
  protocolLockingBytecode: string;
  dollarCategory: string;
};
const provider = new ElectrumNetworkProvider("chipnet");
const signer = new SignatureTemplate(chipnetKey());
const pkh = hash160(signer.publicKey);
const address = encodeCashAddress({ prefix: "bchtest", type: "p2pkh", payload: pkh }).address;
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
const log: Array<{ step: string; txid: string; bytes: number }> = [];
const at = async (lockingBytecode: string) =>
  (await provider.getUtxosForLockingBytecode(lockingBytecode)) as TokenUtxo[];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function broadcast(step: string, builder: { build(): string; send(): Promise<{ txid: string }> }) {
  const bytes = builder.build().length / HEX;
  const { txid } = await builder.send();
  log.push({ step, txid, bytes });
  console.log(`${step.padEnd(STEP_COLUMN)} ${String(bytes).padStart(SIZE_COLUMN)} B  ${EXPLORER}${txid}`);
}

const coin = async () => {
  const utxo = (await provider.getUtxos(address)).find((each) => !each.token && each.satoshis > MIN_COIN);
  if (!utxo) throw new Error("the dev key needs chipnet coins");
  return { utxo, unlocker: signer.unlockP2PKH() };
};

async function oracle<T>(feed: keyof typeof FEEDS, from: number, ready: (prices: PriceMessage[]) => T | undefined) {
  for (;;) {
    const found = ready(
      sortPrices(
        await fetchMessages({ publicKey: FEEDS[feed].publicKey, minMessageTimestamp: from, count: ORACLE_PAGE }),
      ),
    );
    if (found) return found;
    await sleep(POLL_MS);
  }
}

// 1. Open the lane's next round through the SolidCash lane thread.
const lane = (await at(opening.lanes.lockingBytecode)).find(
  (utxo) => decodeLane(utxo.token.nft.commitment).thread === LANE_THREAD,
);
if (!lane) throw new Error("lane thread not found: run scripts/genesis.ts");
const now = Math.floor(Date.now() / MS);
const clock = sortPrices(await fetchMessages({ publicKey: FEEDS["USD/BCH"].publicKey, count: 1 })).at(
  -1,
) as PriceMessage;
const slot = nextSlot(decodeLane(lane.token.nft.commitment), now);
const opened = buildLaneOpen({
  round,
  opening,
  lane,
  slot,
  openerPkh: pkh,
  clock,
  funding: [await coin()],
  change: address,
});
await broadcast("lane open", opened.builder);
const { open } = opened;
console.log(`round ${open.roundId} · BTC 3 min · lock ${new Date(open.lockTime * MS).toISOString()}`);

// 2. Two entries, one per gate.
for (const [gateIndex, outcome] of [
  [0, 0],
  [1, 1],
] as const) {
  const gate = (await at(round.gate.lockingBytecode)).find((utxo) => {
    const state = decodeGate(utxo.token.nft.commitment);
    return state.roundId === open.roundId && state.gateIndex === gateIndex;
  });
  if (!gate) throw new Error("gate not visible yet");
  const entry = buildEnter({
    contracts: round,
    gate,
    funding: [await coin()],
    outcome,
    stake: STAKE,
    payoutPkh: pkh,
    change: address,
  });
  await broadcast(outcome === 0 ? "enter up" : "enter down", entry);
}

// 3. Lock, settle and sweep with live General Protocols prices.
const lockProof = await oracle("USD/BTC", open.lockTime - LOOKBACK_SECONDS, (prices) =>
  findBoundaryPair(prices, open.lockTime),
);
const master = (await at(round.open.lockingBytecode)).find(
  (utxo) => decodeOpen(utxo.token.nft.commitment).roundId === open.roundId,
);
const gates = (await at(round.gate.lockingBytecode)).filter(
  (utxo) => decodeGate(utxo.token.nft.commitment).roundId === open.roundId,
);
if (!master) throw new Error("master not found");
await broadcast("lock", buildLock({ contracts: round, master, gates, proof: lockProof }));

const { strike, close } = await oracle("USD/BTC", open.lockTime - LOOKBACK_SECONDS, (prices) => {
  const strikeMessage = findBySequence(prices, lockProof.first.dataSequence + 1);
  const closePair = findBoundaryPair(prices, open.closeTime);
  return strikeMessage && closePair ? { strike: strikeMessage, close: closePair } : undefined;
});
const [locked] = await at(round.locked.lockingBytecode);
if (!locked) throw new Error("locked master not found");
const settled = buildSettle({
  contracts: round,
  master: locked,
  strike,
  close,
  protocolLockingBytecode: deployment.protocolLockingBytecode,
});
await broadcast("settle", settled.builder);
console.log(
  `strike $${strike.price / FEEDS["USD/BTC"].scaling} → close $${close.first.price / FEEDS["USD/BTC"].scaling}: winner ${settled.outcome.winner ?? "none (void)"}`,
);

const [sweepMaster] = await at(round.sweep.lockingBytecode);
const tickets = (await at(round.ticket.lockingBytecode)).filter(
  (utxo) => decodeTicket(utxo.token.nft.commitment).roundId === open.roundId,
);
if (!sweepMaster) throw new Error("settled master not found");
await broadcast("sweep", buildSweep({ contracts: round, master: sweepMaster, tickets }).builder);

mkdirSync(join(root, "runs"), { recursive: true });
writeFileSync(
  join(root, "runs", `lane-${open.lockTime}.json`),
  `${JSON.stringify({ roundId: open.roundId, slot, log }, null, 2)}\n`,
);
console.log("done");
process.exit(0);
