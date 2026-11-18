import { ORACLE_API_BASE, ORACLE_MESSAGES_PATH } from "./constants.ts";
import type { SignedMessage } from "./message.ts";

export interface MessageQuery {
  publicKey: string;
  minMessageTimestamp?: number;
  maxMessageTimestamp?: number;
  count?: number;
}

interface MessagesResponse {
  oracleMessages: Array<SignedMessage & { publicKey: string }>;
}

/** Reads signed messages from General Protocols' public REST API (newest first, as the API returns them). */
export async function fetchMessages(query: MessageQuery, base: string = ORACLE_API_BASE): Promise<SignedMessage[]> {
  const url = new URL(ORACLE_MESSAGES_PATH, base);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Oracle answered ${response.status} for ${url.pathname}`);
  const body = (await response.json()) as MessagesResponse;
  return body.oracleMessages.map(({ message, signature }) => ({ message, signature }));
}
