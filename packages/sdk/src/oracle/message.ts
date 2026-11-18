import { hexToBin, secp256k1, sha256 } from "@bitauth/libauth";
import { FIELD_BYTES, MESSAGE_BYTES, SIGNATURE_BYTES } from "./constants.ts";

export interface SignedMessage {
  /** 16-byte message, hex. */
  message: string;
  /** 64-byte Schnorr data signature, hex. */
  signature: string;
}

export interface PriceMessage extends SignedMessage {
  timestamp: number;
  messageSequence: number;
  dataSequence: number;
  price: number;
}

const readUint32 = (bytes: Uint8Array, field: number): number =>
  new DataView(bytes.buffer, bytes.byteOffset + field * FIELD_BYTES, FIELD_BYTES).getUint32(0, true);

const TIMESTAMP = 0;
const MESSAGE_SEQUENCE = 1;
const DATA_SEQUENCE = 2;
const PRICE = 3;

/**
 * Decodes a General Protocols price message. Throws on anything a contract would reject before reading it:
 * wrong length, wrong signature length. Metadata messages (non-positive data sequence) decode but are not prices.
 */
export function decodeMessage(signed: SignedMessage): PriceMessage {
  const bytes = hexToBin(signed.message);
  if (bytes.length !== MESSAGE_BYTES) throw new Error(`Oracle message must be ${MESSAGE_BYTES} bytes`);
  if (hexToBin(signed.signature).length !== SIGNATURE_BYTES) {
    throw new Error(`Oracle signature must be ${SIGNATURE_BYTES} bytes`);
  }
  return {
    ...signed,
    timestamp: readUint32(bytes, TIMESTAMP),
    messageSequence: readUint32(bytes, MESSAGE_SEQUENCE),
    dataSequence: new DataView(bytes.buffer, bytes.byteOffset + DATA_SEQUENCE * FIELD_BYTES, FIELD_BYTES).getInt32(
      0,
      true,
    ),
    price: new DataView(bytes.buffer, bytes.byteOffset + PRICE * FIELD_BYTES, FIELD_BYTES).getInt32(0, true),
  };
}

export const isPriceMessage = (message: PriceMessage): boolean => message.dataSequence > 0 && message.price > 0;

/**
 * Whether a signed message really comes from the oracle with this public key: a Schnorr signature over the SHA-256 of
 * the 16-byte message (the check every Jōge contract runs on chain). The engine runs it on every message it stores,
 * and a round's proof page runs it again in the reader's browser.
 */
export const verifyMessageSignature = (signed: SignedMessage, publicKeyHex: string): boolean =>
  secp256k1.verifySignatureSchnorr(
    hexToBin(signed.signature),
    hexToBin(publicKeyHex),
    sha256.hash(hexToBin(signed.message)),
  );
