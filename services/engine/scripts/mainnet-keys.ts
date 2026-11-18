// Mainnet prep (S09): creates, once, the keys Jōge's mainnet world needs, written only to git-ignored files, and prints
// the public addresses with what each needs. It sends nothing and funds nothing: funding is the owner's step.
//   services/engine/.env.mainnet  GENESIS_WIF (pays the one genesis), KEEPER_WIF (opens lanes, pays their fees),
//                                 AGENT_XPRV (signs agents' vault bets), JUDGE_SECRET_MAINNET (the judge link's secret)
//   apps/web/.env.local           AGENT_XPUB_MAINNET (the web derives mainnet agents' vault keys)
// Usage: node scripts/mainnet-keys.ts
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  decodePrivateKeyWif,
  deriveHdPrivateNodeFromSeed,
  deriveHdPublicNode,
  encodeCashAddress,
  encodeHdPrivateKey,
  encodeHdPublicKey,
  encodePrivateKeyWif,
  generatePrivateKey,
  hash160,
  secp256k1,
} from "@bitauth/libauth";
import { deskPrivateKey } from "../../../apps/web/src/lib/desk-key.ts";

const SEED_BYTES = 32;
const SECRET_BYTES = 32;
const root = join(import.meta.dirname, "..", "..", "..");
const engineFile = join(root, "services", "engine", ".env.mainnet");
const webFile = join(root, "apps", "web", ".env.local");
const read = (file: string) => (existsSync(file) ? readFileSync(file, "utf8") : "");
const settingOf = (file: string, name: string) =>
  read(file)
    .split("\n")
    .find((line) => line.startsWith(`${name}=`))
    ?.slice(name.length + 1)
    .trim();

const toHex = (bytes: Uint8Array) => Buffer.from(bytes).toString("hex");
const lines: string[] = [];
const ensure = (name: string, make: () => string) => {
  if (settingOf(engineFile, name)) return;
  lines.push(`${name}=${make()}`);
};
ensure("GENESIS_WIF", () => encodePrivateKeyWif(generatePrivateKey(), "mainnet"));
ensure("KEEPER_WIF", () => encodePrivateKeyWif(generatePrivateKey(), "mainnet"));
ensure("JUDGE_SECRET_MAINNET", () => toHex(crypto.getRandomValues(new Uint8Array(SECRET_BYTES))));
let xpub: string | null = null;
if (!settingOf(engineFile, "AGENT_XPRV")) {
  const node = deriveHdPrivateNodeFromSeed(crypto.getRandomValues(new Uint8Array(SEED_BYTES)));
  lines.push(`AGENT_XPRV=${encodeHdPrivateKey({ network: "mainnet", node }).hdPrivateKey}`);
  xpub = encodeHdPublicKey({ network: "mainnet", node: deriveHdPublicNode(node) }).hdPublicKey;
}
if (lines.length > 0) {
  appendFileSync(
    engineFile,
    `${read(engineFile) ? "\n" : "# Jōge mainnet keys (S09). Real money once funded: never commit, never print.\n"}${lines.join("\n")}\n`,
  );
}
if (xpub && !settingOf(webFile, "AGENT_XPUB_MAINNET")) appendFileSync(webFile, `\nAGENT_XPUB_MAINNET=${xpub}\n`);

const addressOf = (privateKey: Uint8Array) => {
  const publicKey = secp256k1.derivePublicKeyCompressed(privateKey);
  if (typeof publicKey === "string") throw new Error(publicKey);
  return encodeCashAddress({ prefix: "bitcoincash", type: "p2pkh", payload: hash160(publicKey) }).address;
};
const keyOf = (name: string) => {
  const decoded = decodePrivateKeyWif(settingOf(engineFile, name) ?? "");
  if (typeof decoded === "string") throw new Error(`${name}: ${decoded}`);
  return decoded.privateKey;
};
console.log(lines.length > 0 ? `wrote ${lines.length} new key(s) (git-ignored files only)` : "keys already exist");
console.log(`genesis  ${addressOf(keyOf("GENESIS_WIF"))}  needs one coin of ≥ 60,000 sats`);
console.log(`keeper   ${addressOf(keyOf("KEEPER_WIF"))}  lane budget (see the lane cost table)`);
console.log(
  `judge    ${addressOf(deskPrivateKey(settingOf(engineFile, "JUDGE_SECRET_MAINNET") ?? ""))}  the judges' shared wallet`,
);
