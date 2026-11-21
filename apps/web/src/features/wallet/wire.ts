import { binToHex, encodeTransaction, type Transaction } from "@bitauth/libauth";

/** A value in WizardConnect's wire form: byte arrays as plain hex, bigints as `<bigint: Xn>`. */
function wireValue(value: unknown): unknown {
  if (value instanceof Uint8Array) return binToHex(value);
  if (typeof value === "bigint") return `<bigint: ${value}n>`;
  if (Array.isArray(value)) return value.map(wireValue);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, each]) => each !== undefined)
        .map(([key, each]) => [key, wireValue(each)]),
    );
  return value;
}

/**
 * A CashScript sign request in WizardConnect's wire format, the one its reference serializer writes
 * (`transactionToHex` and `sourceOutputToRelay` in @wizardconnect/core, docs/serialization.md): the unsigned
 * transaction as hex, every byte array as plain hex, bigints as `<bigint: Xn>`. Paytaca hex-decodes the transaction
 * field, so the libauth object sent before reached it as zero bytes ("Failed to decode transaction … Error reading
 * Uint32LE: requires 4 bytes"); Cashonize reads both forms.
 */
export function signRequestToWire(request: { transaction: Transaction | string }): Record<string, unknown> {
  const { transaction, ...rest } = request;
  return {
    ...(wireValue(rest) as Record<string, unknown>),
    transaction: typeof transaction === "string" ? transaction : binToHex(encodeTransaction(transaction)),
  };
}
