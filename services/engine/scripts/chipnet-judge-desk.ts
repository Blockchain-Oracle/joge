// Chipnet only: makes (once) and funds the judges' shared desk wallet (F14). The judge link's secret is written only to
// this git-ignored .env as JUDGE_SECRET_CHIPNET; the link is <app>/judge#k=<that secret>. The desk is topped up from
// the keeper's test coins (one of the project's own test keys) to TARGET sats.
// Usage: node --env-file=.env scripts/chipnet-judge-desk.ts
import { randomBytes } from "node:crypto";
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { encodePrivateKeyWif } from "@bitauth/libauth";
import { TransactionBuilder } from "cashscript";
import { deskPrivateKey } from "../../../apps/web/src/lib/desk-key.ts";
import { broadcast, chainProvider, connectFulcrum, FULCRUM } from "../src/chain/electrum.ts";
import { KeeperWallet } from "../src/keeper/wallet.ts";

/** About $10 of test coins at today's chipnet-mirrored price: dozens of minimum entries. */
const TARGET = 5_000_000n;
const SECRET_BYTES = 32;
const { KEEPER_WIF } = process.env;
if (!KEEPER_WIF) throw new Error("needs KEEPER_WIF");
let secret = process.env.JUDGE_SECRET_CHIPNET;
if (!secret) {
  secret = randomBytes(SECRET_BYTES).toString("hex");
  appendFileSync(
    join(import.meta.dirname, "../.env"),
    `\n# Judge desk (S08): the secret in the chipnet judge link <app>/judge#k=<this>\nJUDGE_SECRET_CHIPNET=${secret}\n`,
  );
  console.log("made a new judge secret (in services/engine/.env as JUDGE_SECRET_CHIPNET)");
}
const fulcrum = connectFulcrum(FULCRUM.chipnet);
await fulcrum.connect();
const desk = new KeeperWallet(encodePrivateKeyWif(deskPrivateKey(secret), "testnet"), "chipnet", fulcrum);
const keeper = new KeeperWallet(KEEPER_WIF, "chipnet", fulcrum);
const held = await desk.balance();
console.log(`desk ${desk.address} holds ${held} test sats`);
if (held < TARGET) {
  const amount = TARGET - held;
  const coins = await keeper.coins(amount);
  if (!coins) throw new Error("the keeper holds too little test coin");
  const builder = new TransactionBuilder({ provider: chainProvider(fulcrum, "chipnet") });
  for (const coin of coins) builder.addInput(coin.utxo, coin.unlocker);
  builder.addOutput({ to: desk.address, amount });
  const hex = builder.addBchChangeOutputIfNeeded({ to: keeper.address, feeRate: 1 }).build();
  console.log(`topped up ${amount} test sats: ${await broadcast(fulcrum, hex)}`);
}
process.exit(0);
