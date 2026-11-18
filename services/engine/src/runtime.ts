import { type Database, heartbeats } from "@joge/db";

const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 60_000;
const JITTER = 0.25;

/** Exponential backoff with jitter: 1 s, 2 s, 4 s … capped at a minute. */
export const backoff = (attempt: number): number => {
  const base = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** attempt);
  return base * (1 + JITTER * Math.random());
};

export const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });

export const MS = 1_000;
export const nowSeconds = () => Math.floor(Date.now() / MS);

/** Records a component's latest state for /status. */
export const beat = (database: Database, component: string, detail: Record<string, unknown>) =>
  database.db
    .insert(heartbeats)
    .values({ component, detail, at: new Date() })
    .onConflictDoUpdate({ target: heartbeats.component, set: { detail, at: new Date() } });

/** Runs `task` until the signal aborts, sleeping `everyMs` between runs; failures are logged and retried. */
export async function every(
  everyMs: number,
  signal: AbortSignal,
  task: () => Promise<void>,
  onError: (error: unknown) => void,
) {
  while (!signal.aborted) {
    try {
      await task();
    } catch (error) {
      onError(error);
    }
    await sleep(everyMs, signal);
  }
}
