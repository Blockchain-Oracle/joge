// Compiles every contract (files whose name starts with a capital) into typed `as const` artifacts so the SDKs'
// `contract.unlock.<function>` calls are checked against each ABI:
//   cashscript/<Name>.cash           → artifacts/<Name>.ts                   (cashc: the contracts players' money touches)
//   solidcash/<Name>.scash           → artifacts/solidcash/<Name>.ts         (solidc native: factory, lanes, agent vault)
//   solidcash/bakeoff/<Name>.scash   → artifacts/solidcash-bakeoff/<Name>.ts (the S00 ports of the player contracts)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileString as compileSolidCash } from "@solidcash/solidc";
import { compileFile as compileCashScript } from "cashc";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const HEX_CHARS_PER_BYTE = 2;

const contractsIn = (folder: string, extension: string) =>
  existsSync(join(root, folder))
    ? readdirSync(join(root, folder)).filter((file) => file.endsWith(extension) && /^[A-Z]/.test(file))
    : [];

const toJson = (value: unknown) =>
  JSON.stringify(value, (_key, field) => (typeof field === "bigint" ? field.toString() : field), 2);

function write(folder: string, name: string, artifact: unknown) {
  const out = join(root, "artifacts", folder);
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, `${name}.ts`), `export default ${toJson(artifact)} as const;\n`);
}

// cashc injects `require(tx.time >= tx.locktime)` into any function that reads tx.locktime, which forces a non-final
// sequence. Our lifecycle functions pin locktime 0 AND sequence 0xffffffff on purpose: with every input final the
// locktime is not enforced, so pinning it is the only way to rule out a second valid variant of the same transaction.
// The timeout paths carry their own `tx.time` check and a non-final sequence. SolidCash has the same guard and option.
const NO_LOCKTIME_GUARD = { enforceLocktimeGuard: false };

for (const file of contractsIn("cashscript", ".cash")) {
  const artifact = compileCashScript(join(root, "cashscript", file), NO_LOCKTIME_GUARD);
  write("", artifact.contractName, artifact);
  console.log(
    `cashscript ${artifact.contractName}: ${(artifact.debug?.bytecode.length ?? 0) / HEX_CHARS_PER_BYTE} bytes`,
  );
}

/**
 * SolidCash 0.51.0's SDK rebuilds the script for local evaluation from `artifact.source` + the source map, and drops
 * every opcode whose source line lies outside the main file (`@solidcash/utils` formatBitAuthScript). Opcodes compiled
 * from an imported file vanish, so `debug()` and `send()` evaluate a different script than the real bytecode.
 * Flattening our own relative imports gives byte-identical bytecode with a source the SDK can map.
 */
function flatten(path: string, seen = new Set<string>()): string {
  if (seen.has(path)) return "";
  seen.add(path);
  return readFileSync(path, "utf8").replace(/^import "(\.{1,2}\/[^"]+)";$/gm, (_line, imported: string) =>
    flatten(join(dirname(path), imported), seen).replace(/^pragma solidcash[^\n]*\n/m, ""),
  );
}

for (const [source, folder] of [
  ["solidcash", "solidcash"],
  ["solidcash/bakeoff", "solidcash-bakeoff"],
] as const) {
  for (const file of contractsIn(source, ".scash")) {
    const artifact = compileSolidCash(flatten(join(root, source, file)), NO_LOCKTIME_GUARD);
    write(folder, artifact.contractName, artifact);
    console.log(
      `${folder} ${artifact.contractName}: ${(artifact.debug?.bytecode?.length ?? 0) / HEX_CHARS_PER_BYTE} bytes`,
    );
  }
}
