import "server-only";
import { CHANNEL, type Channel, listen, type NoticeOf } from "@joge/db";
import { database } from "./db.ts";

type Listener = <C extends Channel>(channel: C, notice: NoticeOf[C]) => void;

interface Hub {
  listeners: Set<Listener>;
  ready: Promise<void>;
}

const store = globalThis as typeof globalThis & { jogeHub?: Hub };

/**
 * One LISTEN per server process for every engine channel, fanned out to every open browser stream. Postgres keeps a
 * single connection for all of them (postgres.js), however many tabs are watching.
 */
function startHub(): Hub {
  const listeners = new Set<Listener>();
  const fanOut =
    <C extends Channel>(channel: C) =>
    (notice: NoticeOf[C]) => {
      for (const listener of listeners) listener(channel, notice);
    };
  const ready = Promise.all(
    (Object.values(CHANNEL) as Channel[]).map((channel) => listen(database.sql, channel, fanOut(channel))),
  ).then(() => undefined);
  return { listeners, ready };
}

export function hub(): Hub {
  store.jogeHub ??= startHub();
  return store.jogeHub;
}
