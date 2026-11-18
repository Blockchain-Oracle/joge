// Chipnet only: moves test coins between the project's own test keys (keeper, players, and the test wallets derived
// from the players' key) and the faucet, so lanes keep opening, rounds keep both sides and first-time players get
// test coins. AMOUNT (sats) is optional: all by default.
// Usage: FROM=owner TO=keeper node --env-file=.env scripts/chipnet-top-up.ts
//        FROM=keeper TO=player AMOUNT=250000 node --env-file=.env scripts/chipnet-top-up.ts
//        FROM=keeper TO=faucet AMOUNT=20000000 node --env-file=.env scripts/chipnet-top-up.ts
import { decodePrivateKeyWif, encodePrivateKeyWif, flattenBinArray, sha256, utf8ToBin } from "@bitauth/libauth";
import { TransactionBuilder } from "cashscript";
import { broadcast, chainProvider, connectFulcrum, FULCRUM } from "../src/chain/electrum.ts";
import { KeeperWallet } from "../src/keeper/wallet.ts";

const DERIVED = {
  owner: "joge-chipnet-agent-owner",
  wallet2: "joge-chipnet-wallet-2",
  wallet3: "joge-chipnet-wallet-3",
} as const;
const { KEEPER_WIF, CHIPNET_PLAYER_WIF, FAUCET_WIF, FROM = "", TO = "keeper", AMOUNT } = process.env;
if (!KEEPER_WIF || !CHIPNET_PLAYER_WIF) throw new Error("needs KEEPER_WIF and CHIPNET_PLAYER_WIF");
const player = decodePrivateKeyWif(CHIPNET_PLAYER_WIF);
if (typeof player === "string") throw new Error(player);
const wifOf = (name: string): string => {
  if (name === "keeper") return KEEPER_WIF;
  if (name === "player") return CHIPNET_PLAYER_WIF;
  if (name === "faucet") {
    if (!FAUCET_WIF) throw new Error("needs FAUCET_WIF");
    return FAUCET_WIF;
  }
  const label = DERIVED[name as keyof typeof DERIVED];
  if (!label) throw new Error(`"${name}" is not one of keeper, player, faucet, ${Object.keys(DERIVED).join(", ")}`);
  return encodePrivateKeyWif(sha256.hash(flattenBinArray([player.privateKey, utf8ToBin(label)])), "testnet");
};
if (FROM === TO) throw new Error("FROM and TO are the same key");
const fulcrum = connectFulcrum(FULCRUM.chipnet);
await fulcrum.connect();
const from = new KeeperWallet(wifOf(FROM), "chipnet", fulcrum);
const to = new KeeperWallet(wifOf(TO), "chipnet", fulcrum);
const balance = await from.balance();
const amount = AMOUNT ? BigInt(AMOUNT) : null;
const coins = await from.coins(amount ?? balance);
if (!coins || balance === 0n) throw new Error(`${FROM} (${from.address}) holds too little to move`);
const builder = new TransactionBuilder({ provider: chainProvider(fulcrum, "chipnet") });
for (const coin of coins) builder.addInput(coin.utxo, coin.unlocker);
if (amount) builder.addOutput({ to: to.address, amount });
const hex = builder.addBchChangeOutputIfNeeded({ to: amount ? from.address : to.address, feeRate: 1 }).build();
console.log(`moved ${amount ?? balance} test sats from ${FROM} to ${TO}: ${await broadcast(fulcrum, hex)}`);
process.exit(0);
