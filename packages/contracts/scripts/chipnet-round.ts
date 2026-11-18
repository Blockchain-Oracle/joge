// Proof P6 on chipnet: one real round, start to finish, with live General Protocols prices.
//   genesis (category K: master + 2 gates) → two entries → wait for the oracle past T_lock → lock → wait for the
//   strike and the close → settle → sweep. Every txid and size goes to runs/chipnet-<time>.json.
// Usage: node scripts/chipnet-round.ts [cashscript|solidcash]   (needs chipnet coins on the key from dev-key.ts)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { binToHex, encodeCashAddress, hash160, hexToBin } from "@bitauth/libauth";
import {
  decodeGate,
  encodeGate,
  encodeOpen,
  FEEDS,
  fetchMessages,
  findBoundaryPair,
  findBySequence,
  type OpenRound,
  sortPrices,
} from "@joge/sdk";
import { ElectrumNetworkProvider as SolidElectrumNetworkProvider } from "@solidcash/solidcash/network/electrum";
import { ElectrumNetworkProvider, SignatureTemplate } from "cashscript";
import { buildEnter, buildLock, buildSettle, buildSweep, type TokenUtxo } from "../src/builders.ts";
import { cashscriptKit, roundContracts } from "../src/contracts.ts";
import { SOLIDCASH } from "../test/kits.ts";
import { chipnetKey } from "./dev-key.ts";

/**
 * Which contract language the round's covenants are compiled from (the S00 bake-off runs both). Each language runs on
 * its own SDK end to end — provider, builder and signer — because the two SDKs' objects do not mix.
 */
const useSolidCash = process.argv[2] === "solidcash";
const kit = useSolidCash ? SOLIDCASH.kit : cashscriptKit;
const Builder = kit.TransactionBuilder;
const Signer = useSolidCash ? SOLIDCASH.SignatureTemplate : SignatureTemplate;

const EXPLORER = "https://chipnet.imaginary.cash/tx/";
const ENTRY_WINDOW_SECONDS = 240;
const ROUND_SECONDS = 180;
const MASTER_BUDGET = 20_000n;
const GATE_DUST = 1_000n;
const STAKE = 10_000n;
/** A genesis coin must fund the master, the gates, two entries' change and fees. */
const GENESIS_COIN = 100_000n;
const POLL_MS = 10_000;
const ORACLE_LOOKBACK_SECONDS = 600;
const MS = 1_000;
const SIZE_COLUMN = 6;
const STEP_COLUMN = 10;

const provider = useSolidCash
  ? (new SolidElectrumNetworkProvider("chipnet") as unknown as ElectrumNetworkProvider)
  : new ElectrumNetworkProvider("chipnet");
const signer = new Signer(chipnetKey());
const pkh = hash160(signer.publicKey);
const address = encodeCashAddress({ prefix: "bchtest", type: "p2pkh", payload: pkh }).address;
const ownLockingBytecode = `76a914${binToHex(pkh)}88ac`;
const log: Array<{ step: string; txid: string; bytes: number }> = [];

async function broadcast(
  step: string,
  builder: { build(): string | Promise<string>; send(): Promise<{ txid: string }> },
) {
  const bytes = (await builder.build()).length / 2;
  const { txid } = await builder.send();
  log.push({ step, txid, bytes });
  console.log(`${step.padEnd(STEP_COLUMN)} ${String(bytes).padStart(SIZE_COLUMN)} B  ${EXPLORER}${txid}`);
  return txid;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => Math.floor(Date.now() / MS);

/** Polls the oracle until `ready` finds what it needs in the latest messages. */
async function waitForOracle<T>(
  what: string,
  from: number,
  ready: (prices: ReturnType<typeof sortPrices>) => T | undefined,
) {
  for (;;) {
    const messages = await fetchMessages({
      publicKey: FEEDS["USD/BTC"].publicKey,
      minMessageTimestamp: from,
      count: 50,
    });
    const found = ready(sortPrices(messages));
    if (found) return found;
    console.log(`waiting for the oracle: ${what}`);
    await sleep(POLL_MS);
  }
}

/** A token genesis must spend output 0 of its parent; if no plain coin sits at output 0, pay ourselves first. */
async function genesisInput() {
  const coins = (await provider.getUtxos(address)).filter((utxo) => !utxo.token);
  const atZero = coins.find((utxo) => utxo.vout === 0 && utxo.satoshis >= GENESIS_COIN);
  if (atZero) return atZero;
  if (coins.length === 0) throw new Error(`fund ${address} with chipnet coins first`);
  const consolidate = new Builder({ provider });
  for (const coin of coins) consolidate.addInput(coin, signer.unlockP2PKH());
  consolidate.addBchChangeOutputIfNeeded({ to: address, feeRate: 1 });
  const txid = await broadcast("self-pay", consolidate);
  const fresh = (await provider.getUtxos(address)).find((utxo) => utxo.txid === txid && utxo.vout === 0);
  if (!fresh) throw new Error("self-payment not visible yet");
  return fresh;
}

async function main() {
  const genesisCoin = await genesisInput();

  const category = genesisCoin.txid;
  const contracts = roundContracts({ category, provider, protocolLockingBytecode: ownLockingBytecode, kit });
  const lockTime = now() + ENTRY_WINDOW_SECONDS;
  const round: OpenRound = {
    roundId: 1,
    asset: "BTC",
    mode: "updown",
    outcomes: 2,
    gates: 2,
    lockTime,
    closeTime: lockTime + ROUND_SECONDS,
    creatorFeeBps: 100,
    creatorPkh: pkh,
    minPot: 0n,
    minEntrants: 0,
    boundaries: [],
  };
  const nft = (capability: "mutable" | "minting", commitment: Uint8Array) => ({
    category,
    amount: 0n,
    nft: { capability, commitment: binToHex(commitment) },
  });
  const genesis = new Builder({ provider }).addInput(genesisCoin, signer.unlockP2PKH()).addOutput({
    to: hexToBin(contracts.open.lockingBytecode),
    amount: MASTER_BUDGET,
    token: nft("mutable", encodeOpen(round)),
  });
  for (const gateIndex of [0, 1]) {
    const gate = { roundId: 1, gateIndex, stakeClass: "short" as const, outcomes: 2, entrants: 0, totals: [0n, 0n] };
    genesis.addOutput({
      to: hexToBin(contracts.gate.lockingBytecode),
      amount: GATE_DUST,
      token: nft("minting", encodeGate(gate)),
    });
  }
  genesis.addBchChangeOutputIfNeeded({ to: address, feeRate: 1 });
  await broadcast("genesis", genesis);
  console.log(`category ${category} · lock ${new Date(lockTime * MS).toISOString()} · close +${ROUND_SECONDS}s`);

  for (const [gateIndex, outcome] of [
    [0, 0],
    [1, 1],
  ] as const) {
    const gates = (await provider.getUtxosForLockingBytecode(contracts.gate.lockingBytecode)) as TokenUtxo[];
    const gate = gates.find((utxo) => decodeGate(utxo.token.nft.commitment).gateIndex === gateIndex);
    const funding = (await provider.getUtxos(address)).filter((utxo) => !utxo.token && utxo.satoshis > STAKE * 2n);
    if (!gate || !funding[0]) throw new Error("gate or funding coin not found");
    await broadcast(
      `enter ${outcome === 0 ? "up" : "down"}`,
      buildEnter({
        contracts,
        gate,
        funding: [{ utxo: funding[0], unlocker: signer.unlockP2PKH() }],
        outcome,
        stake: STAKE,
        payoutPkh: pkh,
        change: address,
      }),
    );
  }

  const lock = await waitForOracle("first price at or after T_lock", lockTime - ORACLE_LOOKBACK_SECONDS, (prices) =>
    findBoundaryPair(prices, lockTime),
  );
  const master = ((await provider.getUtxosForLockingBytecode(contracts.open.lockingBytecode)) as TokenUtxo[])[0];
  const gates = (await provider.getUtxosForLockingBytecode(contracts.gate.lockingBytecode)) as TokenUtxo[];
  if (!master) throw new Error("master not found");
  await broadcast("lock", buildLock({ contracts, master, gates, proof: lock }));

  const { strike, close } = await waitForOracle("strike and close", lockTime - ORACLE_LOOKBACK_SECONDS, (prices) => {
    const strikeMessage = findBySequence(prices, lock.first.dataSequence + 1);
    const closePair = findBoundaryPair(prices, round.closeTime);
    return strikeMessage && closePair ? { strike: strikeMessage, close: closePair } : undefined;
  });
  const locked = ((await provider.getUtxosForLockingBytecode(contracts.locked.lockingBytecode)) as TokenUtxo[])[0];
  if (!locked) throw new Error("locked master not found");
  const settled = buildSettle({
    contracts,
    master: locked,
    strike,
    close,
    protocolLockingBytecode: ownLockingBytecode,
  });
  await broadcast("settle", settled.builder);
  console.log(
    `strike ${strike.price / FEEDS["USD/BTC"].scaling} → close ${close.first.price / FEEDS["USD/BTC"].scaling}: winner ${settled.outcome.winner ?? "none (void)"}`,
  );

  const sweepMaster = ((await provider.getUtxosForLockingBytecode(contracts.sweep.lockingBytecode)) as TokenUtxo[])[0];
  const tickets = (await provider.getUtxosForLockingBytecode(contracts.ticket.lockingBytecode)) as TokenUtxo[];
  if (!sweepMaster) throw new Error("settled master not found");
  await broadcast("sweep", buildSweep({ contracts, master: sweepMaster, tickets }).builder);

  const runs = join(dirname(fileURLToPath(import.meta.url)), "..", "runs");
  mkdirSync(runs, { recursive: true });
  writeFileSync(
    join(runs, `chipnet-${lockTime}.json`),
    `${JSON.stringify({ kit: kit.name, category, round: { ...round, creatorPkh: binToHex(pkh), minPot: "0" }, log }, null, 2)}\n`,
  );
  console.log("done");
}

await main();
