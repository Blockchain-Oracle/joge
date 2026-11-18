// Mainnet: sends AMOUNT sats from the keeper to TO (the owner funded the keeper and approved splitting it: the genesis
// coin, the team agents' vaults). Prints what it would send and stops; broadcasts only with CONFIRM_MAINNET=yes.
// Usage: TO=bitcoincash:… AMOUNT=100000 node --env-file=.env.mainnet scripts/mainnet-send.ts
import { cashAddressToLockingBytecode, encodeCashAddress, hash160 } from "@bitauth/libauth";
import { ElectrumNetworkProvider, SignatureTemplate, TransactionBuilder } from "cashscript";

const FEE_PER_BYTE = 1n;
const BASE_BYTES = 150n;
const INPUT_BYTES = 150n;
const DUST = 546n;

const { KEEPER_WIF, TO = "", AMOUNT = "", CONFIRM_MAINNET } = process.env;
if (!KEEPER_WIF) throw new Error("needs KEEPER_WIF (services/engine/.env.mainnet)");
if (!TO.startsWith("bitcoincash:") || typeof cashAddressToLockingBytecode(TO) === "string") {
  throw new Error("TO must be a bitcoincash: address");
}
const amount = BigInt(AMOUNT);
if (amount < DUST) throw new Error("AMOUNT (sats) must be at least dust");

const signer = new SignatureTemplate(KEEPER_WIF);
const from = encodeCashAddress({ prefix: "bitcoincash", type: "p2pkh", payload: hash160(signer.publicKey) }).address;
const provider = new ElectrumNetworkProvider("mainnet");
const coins = (await provider.getUtxos(from)).filter((coin) => !coin.token);
const held = coins.reduce((sum, coin) => sum + coin.satoshis, 0n);
const fee = (BASE_BYTES + INPUT_BYTES * BigInt(coins.length)) * FEE_PER_BYTE;
const change = held - amount - fee;
if (change < 0n) throw new Error(`the keeper holds ${held} sats; ${amount} + fee ${fee} is more`);

const builder = new TransactionBuilder({ provider });
builder.addInputs(coins, signer.unlockP2PKH());
builder.addOutput({ to: TO, amount });
if (change >= DUST) builder.addOutput({ to: from, amount: change });
console.log(
  `from ${from} (${held} sats in ${coins.length} coins) → ${TO}: ${amount} sats, fee ${fee}, change ${change}`,
);
if (CONFIRM_MAINNET !== "yes") {
  console.log("dry run: nothing sent (set CONFIRM_MAINNET=yes to send)");
  process.exit(0);
}
const sent = await builder.send();
console.log(`sent ${sent.txid}  https://explorer.bch.ninja/tx/${sent.txid}`);
process.exit(0);
