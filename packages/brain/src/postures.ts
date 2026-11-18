/**
 * The agents' postures and brief limits: plain data the studio shows in the browser and the runner's gate enforces on
 * the server (no model code here, so pages can import it).
 */
export const POSTURES = {
  guarded: { minConfidence: 0.75, maxSideShare: 0.7, breakerLosses: 3, pauseHours: 6, dailyLossShare: 0.25 },
  balanced: { minConfidence: 0.65, maxSideShare: 0.85, breakerLosses: 4, pauseHours: 4, dailyLossShare: 0.4 },
  active: { minConfidence: 0.55, maxSideShare: 0.95, breakerLosses: 5, pauseHours: 2, dailyLossShare: 0.6 },
} as const;
export type Posture = keyof typeof POSTURES;
/** The longest brief an agent takes (characters). */
export const PERSONA_MAX = 600;
/** The longest reason a read keeps. */
export const WHY_MAX = 240;
