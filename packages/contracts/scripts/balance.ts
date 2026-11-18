// Prints the chipnet test key's coins as two Fulcrum servers see them (history includes the mempool).
// Usage: node scripts/balance.ts [address]
import { ElectrumClient } from "@electrum-cash/network";
import { ElectrumNetworkProvider } from "cashscript";

const SERVERS = ["chipnet.bch.ninja", "chipnet.imaginary.cash"];
const DEV_ADDRESS = "bchtest:qzyhdf7aadg9ryjhxwls669za73v0e2c2scz2870wp";
const address = process.argv[2] ?? DEV_ADDRESS;

for (const host of SERVERS) {
  try {
    const electrum = new ElectrumClient("joge-balance", "1.5.0", host);
    await electrum.connect();
    const provider = new ElectrumNetworkProvider("chipnet", { electrum, manualConnectionManagement: true });
    const utxos = await provider.getUtxos(address);
    const history = (await electrum.request("blockchain.address.get_history", address)) as unknown[];
    const total = utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
    console.log(`${host}: ${utxos.length} coins, ${total} sats, ${history.length} transactions in history`);
    await electrum.disconnect();
  } catch (error) {
    console.log(`${host}: ${(error as Error).message}`);
  }
}
process.exit(0);
