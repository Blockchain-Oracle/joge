import { binToUtf8, decodeAuthenticationInstructions, hexToBin, utf8ToBin } from "@bitauth/libauth";

/**
 * A custom round's title, written on chain in its create transaction as an OP_RETURN output: the push "JOGE" then
 * the title in UTF-8. The factory allows token-free outputs after its fee, so the title costs nothing but bytes and
 * nobody can change it later. Indexers read it back with `titleFromOutput`.
 */
export const TITLE_PREFIX = "JOGE";
/** Long enough for a question ("Will BTC hold 65k into the Friday close?"), short enough for a card. */
export const TITLE_MAX_BYTES = 80;
const OP_RETURN = 0x6a;

/** Trims a title to whole characters within the byte limit (UTF-8), or "" when there is nothing to write. */
export function cleanTitle(title: string): string {
  let clean = title.replace(/\s+/g, " ").trim();
  while (utf8ToBin(clean).length > TITLE_MAX_BYTES) clean = [...clean].slice(0, -1).join("");
  return clean;
}

/** The chunks for CashScript's `addOpReturnOutput` (each becomes one push). */
export const titleChunks = (title: string): string[] => [TITLE_PREFIX, cleanTitle(title)];

/** A title from an output's locking bytecode (hex), if it is Jōge's OP_RETURN. */
export function titleFromOutput(lockingBytecodeHex: string): string | null {
  const bytes = hexToBin(lockingBytecodeHex);
  if (bytes[0] !== OP_RETURN) return null;
  const pushes = decodeAuthenticationInstructions(bytes.slice(1)).map((instruction) =>
    "data" in instruction ? instruction.data : undefined,
  );
  const [prefix, title] = pushes;
  if (!prefix || !title || binToUtf8(prefix) !== TITLE_PREFIX) return null;
  const text = cleanTitle(binToUtf8(title));
  return text.length > 0 ? text : null;
}
