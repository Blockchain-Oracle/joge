import { binToHex, hexToBin } from "@bitauth/libauth";

const BITS_PER_BYTE = 8n;
const BYTE_MASK = 0xffn;

/**
 * A non-negative integer as `width` little-endian bytes — what CashScript's `toPaddedBytes(value, width)` writes for a
 * positive value. The top bit is the script-number sign, so the value must stay below 2^(8·width − 1).
 */
export function fixedLe(value: bigint | number, width: number): Uint8Array {
  let rest = BigInt(value);
  const limit = 1n << (BigInt(width) * BITS_PER_BYTE - 1n);
  if (rest < 0n || rest >= limit) throw new RangeError(`${value} does not fit ${width} bytes`);
  const out = new Uint8Array(width);
  for (let index = 0; index < width; index += 1) {
    out[index] = Number(rest & BYTE_MASK);
    rest >>= BITS_PER_BYTE;
  }
  return out;
}

/** Reads `width` little-endian bytes at `offset` as a non-negative integer (OP_BIN2NUM of a positive field). */
export function readLe(bytes: Uint8Array, offset: number, width: number): bigint {
  if (offset + width > bytes.length) throw new RangeError("field runs past the end of the commitment");
  let value = 0n;
  for (let index = width - 1; index >= 0; index -= 1) {
    value = (value << BITS_PER_BYTE) | BigInt(bytes[offset + index] ?? 0);
  }
  return value;
}

export function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((length, part) => length + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export const byte = (value: number): Uint8Array => Uint8Array.of(value);
export { binToHex, hexToBin };
