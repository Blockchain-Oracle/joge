/**
 * General Protocols price oracle: the only price source a BCH contract can verify itself.
 * Keys and end dates are the oracle's own metadata (`/api/v1/oracleMetadata`, read 2026-11-16).
 */

export const ORACLE_API_BASE = "https://oracles.generalprotocols.com";
export const ORACLE_MESSAGES_PATH = "/api/v1/oracleMessages";
export const ORACLE_SSE_PATH = "/sse/v1/messages";

/** A price message is four 4-byte little-endian fields: timestamp, message sequence, data sequence, price. */
export const MESSAGE_BYTES = 16;
export const FIELD_BYTES = 4;
export const SIGNATURE_BYTES = 64;
export const ATTESTATION_SECONDS = 60;

export type FeedId = "USD/BTC" | "USD/ETH" | "USD/BCH" | "XAU/BCH";

export interface Feed {
  id: FeedId;
  publicKey: string;
  /** Divide the signed integer by this to get the human price. */
  scaling: number;
  /** Unix seconds until which General Protocols has committed to run this feed. */
  committedUntil: number;
}

export const FEEDS: Record<FeedId, Feed> = {
  "USD/BTC": {
    id: "USD/BTC",
    publicKey: "02664276fb7513f838f505c221680a9d963479ffb45452b0c744ddb6bd19ecacb3",
    scaling: 100,
    committedUntil: 1800014400,
  },
  "USD/ETH": {
    id: "USD/ETH",
    publicKey: "0307c919029daf616d6c01152b8eaadc22888c7a93384e06f4a22866fa9ea486a1",
    scaling: 100,
    committedUntil: 1800014400,
  },
  "USD/BCH": {
    id: "USD/BCH",
    publicKey: "02d09db08af1ff4e8453919cc866a4be427d7bfe18f2c05e5444c196fcf6fd2818",
    scaling: 100,
    committedUntil: 1839412800,
  },
  "XAU/BCH": {
    id: "XAU/BCH",
    publicKey: "021f8338ccd45a7790025de198a266f252ac43c95bf81d2469feff110beeac89dd",
    scaling: 100000,
    committedUntil: 1800014400,
  },
};

/**
 * Gold per ounce = USD/BCH × GOLD_FACTOR ÷ XAU/BCH (both signed integers; 05 §6). USD/BCH is in cents and XAU/BCH in
 * ounces × 100000, so the result is in ten-thousandths of a dollar. Mirrors `GOLD_FACTOR` in contracts' rules.
 */
export const GOLD_FACTOR = 10_000_000;
export const GOLD_PRICE_SCALING = 10_000;
