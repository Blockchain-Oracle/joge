/** Per-bet caps the studio offers, in US dollars (bought at the live BCH price; each lane's own cap still applies). */
export const PER_BET_CHIPS_USD = [0.05, 0.1, 0.25, 0.5, 1] as const;
/** The daily cap, as a number of bets at the per-bet cap. */
export const DAILY_BETS = [5, 10, 20] as const;
/** What the owner can send to a vault in one tap, in US dollars. */
export const FUND_CHIPS_USD = [0.5, 1, 2, 5] as const;
export const NAME_MAX = 40;
/** A plain transfer's fee: about one sat per byte (P2PKH inputs ≈ 150 bytes, outputs and overhead ≈ 100). */
export const FUND_FEE_BASE = 100n;
export const FUND_FEE_PER_INPUT = 150n;
/** The smallest output nodes accept. */
export const DUST = 546n;
export const SATS_PER_BCH = 100_000_000;
export const PERCENT = 100;
/** Characters of a prompt hash shown in an agent's memory. */
export const HASH_SHOWN = 8;
