/**
 * The words of anything thrown. Wallets and chain servers often reject with plain objects (`{ message }`,
 * `{ code, message }`, `{ error: … }`), which `String()` turns into "[object Object]" (his report: "Not entered
 * [object Object]").
 */
export function errorText(error: unknown): string {
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === "string") return error;
  if (error !== null && typeof error === "object") {
    const record = error as Record<string, unknown>;
    for (const field of ["message", "error", "reason", "details"]) {
      const value = record[field];
      if (typeof value === "string" && value) return value;
      if (value !== null && typeof value === "object") return errorText(value);
    }
    try {
      return JSON.stringify(error);
    } catch {
      // Circular: fall through.
    }
  }
  return String(error);
}
