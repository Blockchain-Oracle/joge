// Creates (once) the agents' master key: AGENT_XPRV goes to services/engine/.env (the engine signs vault bets) and
// AGENT_XPUB to apps/web/.env.local (the web server derives each agent's public key for its vault). Both files are
// git-ignored; nothing is printed. Chipnet keys use the testnet encoding; mainnet gets its own key in S09.
// Usage: node scripts/agent-key.ts
import { appendFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPublicNode,
  encodeHdPrivateKey,
  encodeHdPublicKey,
} from "@bitauth/libauth";
import { agentPrivateKey, agentPublicKey, publicKeyOf } from "@joge/sdk";

const SEED_BYTES = 32;
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const engineEnv = join(root, "services", "engine", ".env");
const webEnv = join(root, "apps", "web", ".env.local");
const has = (file: string, name: string) =>
  readFileSync(file, "utf8")
    .split("\n")
    .some((line) => line.startsWith(`${name}=`));
if (has(engineEnv, "AGENT_XPRV") || has(webEnv, "AGENT_XPUB")) {
  console.log("The agents' master key already exists; nothing changed.");
  process.exit(0);
}
const node = deriveHdPrivateNodeFromSeed(crypto.getRandomValues(new Uint8Array(SEED_BYTES)));
const { hdPrivateKey } = encodeHdPrivateKey({ network: "testnet", node });
const { hdPublicKey } = encodeHdPublicKey({ network: "testnet", node: deriveHdPublicNode(node) });
const PROBE = 7;
const same = Buffer.from(publicKeyOf(agentPrivateKey(hdPrivateKey, PROBE))).equals(
  Buffer.from(agentPublicKey(hdPublicKey, PROBE)),
);
if (!same) throw new Error("the two halves do not derive the same child key");
appendFileSync(engineEnv, `\nAGENT_XPRV=${hdPrivateKey}\n`);
appendFileSync(webEnv, `\nAGENT_XPUB=${hdPublicKey}\n`);
console.log("Wrote AGENT_XPRV to services/engine/.env and AGENT_XPUB to apps/web/.env.local (both git-ignored).");
