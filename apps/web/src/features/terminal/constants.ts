/** Entries close this long before a round locks (the ticket's rule, so a signature never lands too late). */
export const CLOSE_LEAD_SECONDS = 15;
/** The stake ladder in dollars (Kakure's 1-2-5 snapping); each lane class caps it in the contract. */
export const STAKE_LADDER_USD = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10];
/** Until the player picks a stake, a tap stakes about this share of the balance (Kakure, Owarine, Mitoshi: 5 %). */
export const STAKE_SHARE = 0.05;
/** The lane the screen opens on: BTC 5 min (lane thread 0x11). */
export const DEFAULT_THREAD = 17;
/** The last seconds that tick (Senryo's countBeep, Kakure's Practice clock). */
export const TICK_SECONDS = 5;
