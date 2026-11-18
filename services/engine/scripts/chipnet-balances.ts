// Chipnet only: what each of the project's test keys holds (keeper, players, the derived test wallets, the deployer).
// Usage: node --env-file=.env scripts/chipnet-balances.ts   (CHIPNET_WIF, the deployer, is read when set)
import { decodePrivateKeyWif, encodePrivateKeyWif, flattenBinArray, sha256, utf8ToBin } from "@bitauth/libauth";
import { connectFulcrum, FULCRUM } from "../src/chain/electrum.ts";
import { KeeperWallet } from "../src/keeper/wallet.ts";

const PAD_NAME = 9;
const PAD_SATS = 11;
const { KEEPER_WIF, CHIPNET_PLAYER_WIF, CHIPNET_WIF } = process.env;
if (!KEEPER_WIF || !CHIPNET_PLAYER_WIF) throw new Error("needs KEEPER_WIF and CHIPNET_PLAYER_WIF");
const player = decodePrivateKeyWif(CHIPNET_PLAYER_WIF);
if (typeof player === "string") throw new Error(player);
const derived = (label: string) =>
  encodePrivateKeyWif(sha256.hash(flattenBinArray([player.privateKey, utf8ToBin(label)])), "testnet");
const keys: Record<string, string> = {
  keeper: KEEPER_WIF,
  player: CHIPNET_PLAYER_WIF,
  wallet2: derived("joge-chipnet-wallet-2"),
  wallet3: derived("joge-chipnet-wallet-3"),
  owner: derived("joge-chipnet-agent-owner"),
  ...(CHIPNET_WIF ? { deployer: CHIPNET_WIF } : {}),
};
const fulcrum = connectFulcrum(FULCRUM.chipnet);
await fulcrum.connect();
for (const [name, wif] of Object.entries(keys)) {
  const wallet = new KeeperWallet(wif, "chipnet", fulcrum);
  console.log(name.padEnd(PAD_NAME), String(await wallet.balance()).padStart(PAD_SATS), wallet.address);
}
process.exit(0);
