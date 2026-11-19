/**
 * What /demo plays: the demo video on YouTube (played on the page, nothing hosted here), its chapters, and the three
 * mainnet rounds it shows, each with every transaction it made. Times are seconds into the video.
 */
export const FILM = {
  videoId: "mnaZhjLxoqE",
  /** 3:06. */
  seconds: 186,
  title: "Jōge in three minutes",
} as const;

export interface Chapter {
  at: number;
  label: string;
}

export const CHAPTERS: readonly Chapter[] = [
  { at: 0, label: "Hello from Abu" },
  { at: 18, label: "Is it cool? A round with no operator" },
  { at: 47, label: "Is it slick? Pair a wallet, tap Up" },
  { at: 64, label: "Does it work? Real BCH on mainnet" },
  { at: 74, label: "Round 785, step by step on chain" },
  { at: 94, label: "Up wins, paid to the wallet" },
  { at: 104, label: "The proof: every signature re-checked" },
  { at: 111, label: "An agent's vault only pays you" },
  { at: 123, label: "Will it make money?" },
  { at: 151, label: "Under the hood, docs, source" },
  { at: 173, label: "Play" },
];

export type Step = "open" | "enter ▲" | "enter ▼" | "lock" | "settle" | "pay";

export interface FilmRound {
  roundId: number;
  asset: "BTC" | "ETH";
  /** When it ran, in UTC. */
  when: string;
  /** What the film shows of it, and when. */
  shown: string;
  at: number;
  result: string;
  txs: readonly { step: Step; txid: string }[];
}

/** The mainnet rounds on screen, in the order the film shows them. */
export const ROUNDS: readonly FilmRound[] = [
  {
    roundId: 785,
    asset: "BTC",
    when: "18 Nov 2026 · 17:30–17:35 UTC",
    shown: "Drawn step by step",
    at: 74,
    result: "Up won 26,450 sats",
    txs: [
      { step: "open", txid: "332051cda19f58d5a0dbad1b9d2379c5aa531091d27b44fac92f14ce8b5db850" },
      { step: "enter ▲", txid: "1761f0bb236ff2d89a147d2edfacb95d4de679efa786c945a73a0d98ff9bd3a9" },
      { step: "enter ▼", txid: "9563d49d83394cfb9ff29eeb7b3bbb3c30b31abd0d6e7d3aba467d46152ba45a" },
      { step: "lock", txid: "267afed9a754ea8c8e530bb730080cc10d934c478b969990001647a823b9b492" },
      { step: "settle", txid: "1c2ccd6449ede751a93ecaff9d0a621b10530eadbc3cfe906bb7cee858c3c58f" },
      { step: "pay", txid: "1474ff082d7a3e70f56b580bbf3cb107374b3c5e30215462aae1a803ae666acf" },
    ],
  },
  {
    roundId: 1812,
    asset: "ETH",
    when: "19 Nov 2026 · 09:30–09:35 UTC",
    shown: "Played on camera",
    at: 94,
    result: "Abu's 5 cents on Up won 49,062 sats",
    txs: [
      { step: "open", txid: "678b261ce4b9ea685deee2b2ebc40986b0ac3dd5e4d6f3508f57236d7ef63771" },
      { step: "enter ▲", txid: "5e7832cb216a10ebfc174929bf6fe85ee8e127e29b5e758ae7c4b7cc796bdac8" },
      { step: "enter ▼", txid: "0875de982969a131db4d2772ce89d30b56a727ca252a9a474d21699a91133d65" },
      { step: "lock", txid: "1c31510a0a8b074e90ab36f6328c1f9f498eddfef953eaf5ab976d2f4af71258" },
      { step: "settle", txid: "e3fa63f831fde4279d2b3850a70235b333bd5d7048c06ae4fef2c438c19b5a64" },
      { step: "pay", txid: "4f3099c008954d3b6f448240a1dc7f890dbade1df0f681c8e7daa52fd9ff3d97" },
    ],
  },
  {
    roundId: 20,
    asset: "ETH",
    when: "18 Nov 2026 · 17:30–17:35 UTC",
    shown: "Its proof page",
    at: 104,
    result: "5 signatures re-checked in the browser",
    txs: [
      { step: "open", txid: "26da1c92ce53e7ff8ee1f7dc660f2dc410e75d89a5a80d482a8560048e633573" },
      { step: "enter ▲", txid: "8253c0cb624a3a60f36ca47d7968b7ef9804a49fdf23e02908b8e59a3b7517be" },
      { step: "enter ▼", txid: "2a4d68d3ff0ce39766e601038e699866187088afab66e8a97edfed0c06424e8b" },
      { step: "lock", txid: "22358cddf712c4f12404fcd99257c056a7135303547e3784985743d237e3a664" },
      { step: "settle", txid: "e52e3785201785d4291968b85955a4280f0c71455e6161c1d7b5463f9a8b6ba2" },
      { step: "pay", txid: "0bd5fd1bf7f309dfa2d7301fcc23e2a4bf66cb37971adfc7c6d1f8b73510dc7f" },
    ],
  },
];

export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
