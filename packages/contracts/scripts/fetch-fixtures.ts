// Saves real General Protocols messages for proof P1: the latest two hours of each feed we settle on, plus the
// 2026-06-12 slow window (spacings up to 125 s, context/build-research/05 §2.4.1).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FEEDS, type FeedId, fetchMessages } from "@joge/sdk";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "test", "fixtures");
const LATEST_COUNT = 120;
const SLOW_FROM = 1781233200; // 2026-06-12T03:00:00Z
const SLOW_TO = 1781244000; // 2026-06-12T06:00:00Z
const SLOW_WINDOW = { from: SLOW_FROM, to: SLOW_TO };
const SLOW_COUNT = 200;

const feeds: FeedId[] = ["USD/BTC", "USD/ETH", "USD/BCH", "XAU/BCH"];
for (const id of feeds) {
  const messages = await fetchMessages({ publicKey: FEEDS[id].publicKey, count: LATEST_COUNT });
  const file = `latest-${id.replace("/", "-").toLowerCase()}.json`;
  writeFileSync(join(out, file), `${JSON.stringify({ feed: id, messages }, null, 2)}\n`);
  console.log(`${file}: ${messages.length} messages`);
}

const slow = await fetchMessages({
  publicKey: FEEDS["USD/BCH"].publicKey,
  minMessageTimestamp: SLOW_WINDOW.from,
  maxMessageTimestamp: SLOW_WINDOW.to,
  count: SLOW_COUNT,
});
writeFileSync(
  join(out, "slow-usd-bch-2026-06-12.json"),
  `${JSON.stringify({ feed: "USD/BCH", messages: slow }, null, 2)}\n`,
);
console.log(`slow-usd-bch-2026-06-12.json: ${slow.length} messages`);
