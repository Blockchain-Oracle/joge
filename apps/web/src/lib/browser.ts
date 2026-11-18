/**
 * Browser helpers that also work on a plain-HTTP address.
 * Outside a secure context browsers remove `navigator.clipboard` and `crypto.randomUUID`, but keep
 * `crypto.getRandomValues` and the old copy command, so each helper falls back to those.
 */

const ID_BYTES = 16;
const HEX = 16;
const BYTE_HEX_WIDTH = 2;

/** A random 128-bit id in hex (stands in for `crypto.randomUUID`, which needs HTTPS). */
export function randomId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(ID_BYTES)), (byte) =>
    byte.toString(HEX).padStart(BYTE_HEX_WIDTH, "0"),
  ).join("");
}

/** Copies text to the clipboard; resolves false when the browser refused both ways. */
export async function copyText(text: string): Promise<boolean> {
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the copy command.
    }
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}
