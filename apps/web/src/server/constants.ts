/** API windows and timings. */

export const SECOND_MS = 1_000;
/** A chart's default first-paint window. */
export const CHART_WINDOW_SECONDS = 15 * 60;
/** The longest window one chart request may ask for. */
export const CHART_WINDOW_MAX_SECONDS = 6 * 60 * 60;
/** SSE comment line so proxies keep an idle stream open. */
export const STREAM_KEEP_ALIVE_MS = 15_000;
export const DB_POOL = 10;

const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;

/** Sensei's rate gate: per IP one ask every 3 s and 30 per 10 minutes; 600 an hour for the whole house. */
export const SENSEI_PER_IP = [
  { count: 1, windowMs: 3 * SECOND_MS },
  { count: 30, windowMs: 10 * MINUTE_MS },
];
export const SENSEI_HOUSE = [{ count: 600, windowMs: HOUR_MS }];
/** The studio's dry read: one per IP every 10 s, 60 an hour house-wide. */
export const DRY_READ_PER_IP = [{ count: 1, windowMs: 10 * SECOND_MS }];
export const DRY_READ_HOUSE = [{ count: 60, windowMs: HOUR_MS }];

/** Sign-in (D11): a challenge lives 5 minutes, a session a day. */
export const CHALLENGE_TTL_MS = 5 * MINUTE_MS;
export const SESSION_TTL_MS = 24 * HOUR_MS;
/** A challenge's form: 13-digit expiry, 32 hex nonce, 64 hex MAC. */
export const CHALLENGE_PATTERN = /\d{13}\.[0-9a-f]{32}\.[0-9a-f]{64}/;
/** The first byte of an OP_RETURN output. */
export const OP_RETURN = 0x6a;
/** AUTH_SECRET is at least this long (hex of 16 random bytes). */
export const AUTH_SECRET_MIN = 32;

/** What the agents and the dry read see of the price line. */
export const PRICE_WINDOW_MS = 15 * MINUTE_MS;
export const PRICE_POINTS = 12;
export const ROUND_ID_MAX = 2 ** 32;

/** Sensei never hands out a ticket card for a round whose entries close sooner than this (no time left to sign). */
export const SENSEI_CARD_LEAD_SECONDS = 30;

/** Push sign-ups: a few changes a minute per IP (a browser re-sends when its wallet changes). */
export const PUSH_PER_IP = [{ count: 10, windowMs: MINUTE_MS }];
/** A wallet shares its receive addresses (ten) and change addresses (ten). */
export const PUSH_MAX_ADDRESSES = 20;
/** Push service endpoints are URLs well under this. */
export const PUSH_ENDPOINT_MAX = 1_000;

/** A woken lane keeps opening rounds this long after the last viewer asked (S09 on-demand lanes). */
export const LANE_WAKE_MS = 30 * MINUTE_MS;
/** Wake requests per IP: one per lane switch, plus a repeat every few minutes. */
export const WAKE_PER_IP = [{ count: 30, windowMs: MINUTE_MS }];

/** Faucet asks per IP in a burst (the daily caps live in @joge/db's faucet policy). */
export const FAUCET_PER_IP = [{ count: 5, windowMs: MINUTE_MS }];
