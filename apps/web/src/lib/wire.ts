import { hexToBin, stringify } from "@bitauth/libauth";

/**
 * Sending a transaction object between the server and the page: it holds bigints and byte arrays, which plain JSON
 * cannot carry. libauth's `stringify` writes `<bigint: 1n>` and `<Uint8Array: 0x…>`; `fromWire` reads them back.
 */
export const toWire = (value: unknown): string => stringify(value, 0);

const BIGINT = /^<bigint: (-?\d+)n>$/;
const BYTES = /^<Uint8Array: 0x([0-9a-f]*)>$/i;

export const fromWire = <T>(text: string): T =>
  JSON.parse(text, (_key, value: unknown) => {
    if (typeof value !== "string") return value;
    const big = BIGINT.exec(value);
    if (big?.[1] !== undefined) return BigInt(big[1]);
    const bytes = BYTES.exec(value);
    if (bytes?.[1] !== undefined) return hexToBin(bytes[1]);
    return value;
  }) as T;
