import { flattenBinArray, hexToBin, sha256, utf8ToBin } from "@bitauth/libauth";

/**
 * The judge desk's key, derived from the secret in the judge link: sha256("joge judge desk v1" ‖ secret). Plain code (no
 * React), so the page and the funding script derive the same address.
 */
const DESK_SALT = "joge judge desk v1";
const SECRET_BYTES = 32;

export function deskPrivateKey(secret: string): Uint8Array {
  const bytes = hexToBin(secret);
  if (bytes.length !== SECRET_BYTES) throw new Error("A judge secret is 32 bytes.");
  return sha256.hash(flattenBinArray([utf8ToBin(DESK_SALT), bytes]));
}
