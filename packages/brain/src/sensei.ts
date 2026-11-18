import { z } from "zod";
import { MAX_SESSION_STAKE_USD, NOTE_RESULTS, PERCENT, SESSION_RESULTS, SESSION_STAKES } from "./constants.ts";

/**
 * Sensei (F12): the coach. It gives a straight call on a live round (Up, Down or sit it out) with one reason and one
 * risk, names the round through the `ticket` tool so the player gets a ticket card, and is the one voice in the app
 * allowed to say "not this one". It never signs or sends; the player decides in their own wallet.
 *
 * The instructions below never change between turns (so a provider can cache them); each turn's figures arrive as a
 * leading "market notes" message built by `marketNotes`.
 */

/** The last paragraph of Sensei's instructions. A test pins that it stays last. */
export const THE_BRAKE =
  "THE BRAKE. You are the one voice in this app allowed to say: do not take this one. When the notes show losses in a row, stakes rising after a loss, or the tilt flag, slow the player down before anything else: say plainly what you see, suggest sitting this round out or taking a break, and point to Play limits in More, where they can set a daily limit or a break that cannot be undone early. Never help anyone chase a loss.";

export const SENSEI_INSTRUCTIONS = [
  "You are Sensei, the coach inside Jōge. Jōge runs short price rounds on Bitcoin Cash. In a round, players stake on whether Bitcoin, Ether, Bitcoin Cash or gold ends Up or Down against the price to beat: the oracle's price signed just after entries close. Every pot is shared: the winners split it in proportion to their stakes, after a 2 % protocol fee and 0.5 % to whoever opened the round; ties and one-sided rounds refund everyone. Prices are General Protocols' signed oracle prices, the same ones the contract checks.",
  "When the player asks what to do, give a straight call on one round that is taking entries: Up, Down, or sit it out. Give one reason and one risk, in two to four short sentences. When you name a round to take, use the `ticket` tool with that round's id and side, so the player gets a ticket for it; at most two tickets per reply, and none when you say sit it out. Use only the figures in the market notes, and never invent a price, a payout or a result. A pot that already leans heavily to one side pays little for that side: say so when it matters.",
  "You cannot sign or send anything, and you never see the player's wallet; they decide and sign in their own wallet. On mainnet these are real coins; on chipnet they are test coins, and you say so when it matters. Your call is a read of the market, not financial advice. If asked about savings, taxes, loans or how much of their money to put in, say briefly that you only read these rounds and cannot advise on that.",
  "Style: plain words a newcomer understands, short sentences, no emoji, no exclamation marks, no dashes used as punctuation, no lists unless asked.",
  THE_BRAKE,
].join("\n\n");

/** A question that strays into money advice; the notes then remind Sensei of its refusal line. */
export const ADVICE_TRIPWIRE =
  /\b(savings?|retire(ment)?|mortgage|loans?|tax(es)?|pension|allocat\w*|how much (should|do) i (put|invest|bet|stake))\b/i;

/** Tilt: this many asks inside the window shows a slow-down cue and tells Sensei. */
export const TILT_ASKS = 4;
export const TILT_WINDOW_MS = 180_000;

export const SENSEI_LIMITS = {
  turns: 12,
  charsPerTurn: 4_000,
  maxOutputTokens: 1_500,
  timeoutMs: 45_000,
  steps: 3,
} as const;

/** What the page tells Sensei about the player, from this browser's own journal (no address is ever sent). */
export const senseiSessionSchema = z.object({
  network: z.enum(["mainnet", "chipnet"]),
  tilt: z.boolean(),
  /** Settled tickets from this browser, newest first: "won", "lost" or "refunded". */
  results: z.array(z.enum(["won", "lost", "refunded"])).max(SESSION_RESULTS),
  /** Stakes of the last few entries in dollars, newest first (rising after losses is a tilt sign). */
  stakesUsd: z.array(z.number().nonnegative()).max(SESSION_STAKES),
  /** The stake one tap would send now (the stack's standing stake), in dollars; the notes price every side at it. */
  stakeUsd: z.number().nonnegative().max(MAX_SESSION_STAKE_USD),
  /** The player's own limits, if set. */
  dailyLimitUsd: z.number().nullable(),
  onBreak: z.boolean(),
});
export type SenseiSession = z.infer<typeof senseiSessionSchema>;

/** One live round as the notes describe it. */
export interface NoteRound {
  roundId: number;
  asset: string;
  /** "5 min" or "1 h". */
  length: string;
  question: string;
  locksInSeconds: number;
  closesAt: string;
  potUsd: number;
  /** Per outcome: its name, its share of the pot and what the player's stake returns on a win (after fees). */
  sides: Array<{ name: string; share: number; pays: string }>;
}

export interface MarketNotes {
  nowUtc: string;
  prices: Array<{ asset: string; usd: number }>;
  open: NoteRound[];
  /** Recent results per lane, newest first: "BTC 5 min: Up, Down, Up". */
  recent: string[];
}

/** The per-turn notes: the market, then the player's record; plain text the model reads before the conversation. */
export function marketNotes(market: MarketNotes, session: SenseiSession, lastQuestion: string): string {
  const streak = streakOf(session.results);
  const lines = [
    `Market notes (${session.network}${session.network === "chipnet" ? ", test coins" : ", real coins"}), ${market.nowUtc} UTC.`,
    `Prices now: ${market.prices.map((price) => `${price.asset} $${price.usd.toFixed(2)}`).join(", ")}.`,
    `Rounds taking entries (pays = what the player's $${session.stakeUsd.toFixed(2)} stake returns on a win after fees, the figure on their Up and Down buttons):`,
    ...market.open.map(
      (round) =>
        `- #${round.roundId} ${round.asset} ${round.length}: ${round.question} Entries close in ${Math.max(0, Math.round(round.locksInSeconds))} s; decided ${round.closesAt}. Pot $${round.potUsd.toFixed(2)}. ${round.sides.map((side) => `${side.name} ${Math.round(side.share * PERCENT)} % of the pot, pays ${side.pays}`).join("; ")}.`,
    ),
    market.recent.length > 0 ? `Recent results: ${market.recent.join(" | ")}.` : "No recent results.",
    `The player: ${session.results.length === 0 ? "no settled tickets in this browser yet" : `last results ${session.results.slice(0, NOTE_RESULTS).join(", ")}`}; ${streak}.`,
    session.stakesUsd.length > 0
      ? `Recent stakes, newest first: ${session.stakesUsd.map((usd) => `$${usd.toFixed(2)}`).join(", ")}.`
      : "",
    session.dailyLimitUsd === null ? "No daily limit set." : `Daily limit $${session.dailyLimitUsd}.`,
    session.onBreak ? "The player has a break running; they cannot enter until it ends." : "",
    session.tilt ? "Tilt flag: many questions in the last few minutes." : "",
    ADVICE_TRIPWIRE.test(lastQuestion) ? "The question strays into money advice: use your refusal line." : "",
  ];
  return lines.filter(Boolean).join("\n");
}

function streakOf(results: SenseiSession["results"]): string {
  const [first] = results;
  if (!first || first === "refunded") return "no streak";
  let count = 0;
  for (const result of results) {
    if (result !== first) break;
    count += 1;
  }
  return `${count} ${first === "won" ? "win" : "loss"}${count === 1 ? "" : first === "won" ? "s" : "es"} in a row`;
}
