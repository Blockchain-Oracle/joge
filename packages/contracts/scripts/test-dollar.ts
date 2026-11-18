// Chipnet only: mints a test dollar token shaped like ParyonUSD (a fungible CashToken; its units are cents), so dollar
// events can be played on chipnet, where ParyonUSD does not exist. One token-genesis transaction from the chipnet test
// key (CHIPNET_WIF in packages/contracts/.env) pays the whole supply to DOLLAR_TO (a chipnet address; default that key).
// Mainnet uses real ParyonUSD.
// Usage: DOLLAR_TO=<address> node --env-file=.env scripts/test-dollar.ts
//        then: DOLLAR_CATEGORY=<printed category> node --env-file=.env scripts/genesis.ts
import { decodeCashAddress, encodeCashAddress, hash160 } from "@bitauth/libauth";
import { ElectrumNetworkProvider, SignatureTemplate, TransactionBuilder } from "cashscript";
import { chipnetKey } from "./dev-key.ts";

const EXPLORER = "https://chipnet.imaginary.cash/tx/";
/** 1,000,000.00 test dollars, in cents. */
const SUPPLY = 100_000_000n;
const TOKEN_DUST = 1_000n;
const GENESIS_COIN = 5_000n;

const provider = new ElectrumNetworkProvider("chipnet");
const signer = new SignatureTemplate(chipnetKey());
const pkh = hash160(signer.publicKey);
const address = encodeCashAddress({ prefix: "bchtest", type: "p2pkh", payload: pkh }).address;
/** Where the supply goes, as a token-aware address (tokens may only be sent to one). */
function tokenAddressOf(target: string): string {
  const decoded = decodeCashAddress(target);
  if (typeof decoded === "string") throw new Error(`DOLLAR_TO: ${decoded}`);
  return encodeCashAddress({ prefix: "bchtest", type: "p2pkhWithTokens", payload: decoded.payload }).address;
}
const tokenAddress = tokenAddressOf(process.env.DOLLAR_TO ?? address);

// A token's category is the txid of the coin its genesis spends, and that coin must be output 0 of its transaction.
const coins = (await provider.getUtxos(address)).filter((utxo) => !utxo.token);
let genesisCoin = coins.find((utxo) => utxo.vout === 0 && utxo.satoshis >= GENESIS_COIN);
if (!genesisCoin) {
  const pay = new TransactionBuilder({ provider });
  for (const coin of coins) pay.addInput(coin, signer.unlockP2PKH());
  const { txid } = await pay.addBchChangeOutputIfNeeded({ to: address, feeRate: 1 }).send();
  genesisCoin = (await provider.getUtxos(address)).find((utxo) => utxo.txid === txid && utxo.vout === 0);
  if (!genesisCoin) throw new Error("self-payment not visible yet");
}
const category = genesisCoin.txid;
const { txid } = await new TransactionBuilder({ provider })
  .addInput(genesisCoin, signer.unlockP2PKH())
  .addOutput({ to: tokenAddress, amount: TOKEN_DUST, token: { category, amount: SUPPLY } })
  .addBchChangeOutputIfNeeded({ to: address, feeRate: 1 })
  .send();
console.log(`test dollar genesis ${EXPLORER}${txid}`);
console.log(`category ${category}: ${SUPPLY} cents to ${tokenAddress}`);
process.exit(0);
