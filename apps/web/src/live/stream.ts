/**
 * One live stream per tab: an `EventSource` on `/api/stream`, opened by the first subscriber and closed a few seconds
 * after the last leaves (so a route change never reconnects). A tab hidden for a minute closes it; on return it reopens
 * and every consumer refetches its snapshot. Display only: no transaction is ever built from these events.
 */
import type { AgentNotice, Network, OracleNotice, PriceNotice, RoundNotice } from "@joge/db";

export interface LiveEvents {
  oracle: OracleNotice;
  price: PriceNotice;
  round: RoundNotice;
  agent: AgentNotice;
}
export type Topic = keyof LiveEvents;

const TOPICS: Topic[] = ["oracle", "price", "round", "agent"];
const HIDDEN_CLOSE_MS = 60_000;
const LINGER_MS = 5_000;
const RETRY_MIN_MS = 5_000;
const RETRY_MAX_MS = 60_000;

type Listener<T extends Topic> = (event: LiveEvents[T]) => void;

const listeners: { [T in Topic]: Set<Listener<T>> } = {
  oracle: new Set(),
  price: new Set(),
  round: new Set(),
  agent: new Set(),
};
const statusListeners = new Set<() => void>();
let network: Network = "chipnet";
let source: EventSource | null = null;
let live = false;
let retryMs = RETRY_MIN_MS;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let hiddenTimer: ReturnType<typeof setTimeout> | null = null;
let lingerTimer: ReturnType<typeof setTimeout> | null = null;
let visibilityBound = false;

const subscriberCount = () => TOPICS.reduce((sum, topic) => sum + listeners[topic].size, 0);

function setLive(next: boolean) {
  if (live === next) return;
  live = next;
  for (const listener of statusListeners) listener();
}

function close() {
  source?.close();
  source = null;
  setLive(false);
}

function open() {
  if (source || subscriberCount() === 0 || typeof EventSource === "undefined") return;
  if (document.visibilityState === "hidden") return;
  const stream = new EventSource(`/api/stream?network=${network}`);
  source = stream;
  stream.onopen = () => {
    retryMs = RETRY_MIN_MS;
    setLive(true);
  };
  for (const topic of TOPICS) {
    stream.addEventListener(topic, (message) => {
      try {
        const event = JSON.parse((message as MessageEvent<string>).data) as LiveEvents[typeof topic];
        for (const listener of listeners[topic]) (listener as Listener<typeof topic>)(event);
      } catch {
        // A malformed event is dropped; the next one carries fresh state.
      }
    });
  }
  stream.onerror = () => {
    if (stream !== source) return;
    setLive(false);
    // Still connecting: the browser retries on its own. Closed: it gave up, so reopen with a backoff.
    if (stream.readyState !== EventSource.CLOSED) return;
    source = null;
    retryTimer ??= setTimeout(() => {
      retryTimer = null;
      open();
    }, retryMs);
    retryMs = Math.min(retryMs * 2, RETRY_MAX_MS);
  };
}

function bindVisibility() {
  if (visibilityBound || typeof document === "undefined") return;
  visibilityBound = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      hiddenTimer ??= setTimeout(() => {
        hiddenTimer = null;
        close();
      }, HIDDEN_CLOSE_MS);
      return;
    }
    if (hiddenTimer) clearTimeout(hiddenTimer);
    hiddenTimer = null;
    open();
  });
}

/** Switches worlds (mainnet ↔ chipnet): round events are filtered server-side by network. */
export function setStreamNetwork(next: Network) {
  if (next === network) return;
  network = next;
  close();
  open();
}

export function subscribe<T extends Topic>(topic: T, listener: Listener<T>): () => void {
  (listeners[topic] as Set<Listener<T>>).add(listener);
  if (lingerTimer) clearTimeout(lingerTimer);
  lingerTimer = null;
  bindVisibility();
  open();
  return () => {
    (listeners[topic] as Set<Listener<T>>).delete(listener);
    if (subscriberCount() > 0) return;
    lingerTimer ??= setTimeout(() => {
      lingerTimer = null;
      if (subscriberCount() > 0) return;
      if (retryTimer) clearTimeout(retryTimer);
      retryTimer = null;
      close();
    }, LINGER_MS);
  };
}

/** Whether the stream is open now (the UI shows "live" vs a reconnecting state). */
export const isLive = () => live;

export function subscribeStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}
