import { LOG_COMPONENT_WIDTH, LOG_TIME_END } from "./constants.ts";

/** One line per event: time, component, message, then key=value details. Goes to stdout for Coolify's log view. */

const field = (value: unknown): string =>
  typeof value === "string" ? value : typeof value === "bigint" ? value.toString() : JSON.stringify(value);

function write(stream: NodeJS.WriteStream, component: string, message: string, details: Record<string, unknown>) {
  const time = new Date().toISOString().slice(0, LOG_TIME_END).replace("T", " ");
  const extras = Object.entries(details)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${field(value)}`)
    .join(" ");
  stream.write(`${time} ${component.padEnd(LOG_COMPONENT_WIDTH)} ${message}${extras ? ` ${extras}` : ""}\n`);
}

export interface Logger {
  info(message: string, details?: Record<string, unknown>): void;
  warn(message: string, details?: Record<string, unknown>): void;
}

export const logger = (component: string): Logger => ({
  info: (message, details = {}) => write(process.stdout, component, message, details),
  warn: (message, details = {}) => write(process.stderr, component, `⚠ ${message}`, details),
});

/** The first line of any error, including the plain `{ code, message }` objects JSON-RPC servers reply with. */
export function errorText(error: unknown): string {
  let text: string;
  if (error instanceof Error) text = error.message;
  else if (error && typeof error === "object" && "message" in error) text = String(error.message);
  else text = typeof error === "object" ? JSON.stringify(error) : String(error);
  return text.split("\n")[0] ?? "unknown error";
}
