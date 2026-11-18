// Creates (once) the chipnet test key the proof scripts use, stored in packages/contracts/.env (git-ignored), and
// prints its address so it can be funded with chipnet coins. Test coins only: never mainnet.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  binToHex,
  encodeCashAddress,
  encodePrivateKeyWif,
  generatePrivateKey,
  hash160,
  secp256k1,
} from "@bitauth/libauth";

const envFile = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
const KEY_NAME = "CHIPNET_WIF";

function readKey(): string | undefined {
  if (!existsSync(envFile)) return undefined;
  return readFileSync(envFile, "utf8")
    .split("\n")
    .find((line) => line.startsWith(`${KEY_NAME}=`))
    ?.slice(KEY_NAME.length + 1)
    .trim();
}

if (!readKey()) {
  const wif = encodePrivateKeyWif(generatePrivateKey(), "testnet");
  writeFileSync(envFile, `# Chipnet test key for the S00 proof scripts. Test coins only.\n${KEY_NAME}=${wif}\n`, {
    flag: "a",
  });
  console.log("Created a new chipnet test key in packages/contracts/.env");
}

export function chipnetKey() {
  const wif = readKey();
  if (!wif) throw new Error("run `node scripts/dev-key.ts` first");
  return wif;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { decodePrivateKeyWif } = await import("@bitauth/libauth");
  const decoded = decodePrivateKeyWif(chipnetKey());
  if (typeof decoded === "string") throw new Error(decoded);
  const pkh = hash160(secp256k1.derivePublicKeyCompressed(decoded.privateKey) as Uint8Array);
  const { address } = encodeCashAddress({ prefix: "bchtest", type: "p2pkh", payload: pkh });
  console.log(`chipnet address: ${address}`);
  console.log(`pubkey hash: ${binToHex(pkh)}`);
}
