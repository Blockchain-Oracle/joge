/**
 * The agents' postures and brief limits: plain data the studio shows in the browser and the runner's gate enforces on
 * the server (no model code here, so pages can import it).
 */
export const POSTURES = {
  guarded: { minConfidence: 0.75, maxSideShare: 0.7, breakerLosses: 3, pauseHours: 6, dailyLossShare: 0.25 },
  balanced: { minConfidence: 0.65, maxSideShare: 0.85, breakerLosses: 4, pauseHours: 4, dailyLossShare: 0.4 },
  active: { minConfidence: 0.55, maxSideShare: 0.95, breakerLosses: 5, pauseHours: 2, dailyLossShare: 0.6 },
  /**
   * The partner reads no model: in a round with money on one side only it takes the empty side, matching the stake
   * within its caps, so a lone call still plays (a shared pot with one side is refunded). Its limits are the daily ones.
   */
  partner: { minConfidence: 0, maxSideShare: 1, breakerLosses: 8, pauseHours: 1, dailyLossShare: 0.6 },
} as const;
export type Posture = keyof typeof POSTURES;
/** The longest brief an agent takes (characters). */
export const PERSONA_MAX = 600;
/** The longest reason a read keeps. */
export const WHY_MAX = 240;
