/** Every rendered diagram and its pixel size at 2x (light and dark share one size), read from the PNGs. */
export const DIAGRAMS = {
  "system": { width: 2186, height: 2372 },
  "lifecycle": { width: 864, height: 1688 },
  "payout": { width: 1174, height: 1530 },
  "vault": { width: 936, height: 1024 },
  "on-demand": { width: 972, height: 1480 },
} as const

export type DiagramName = keyof typeof DIAGRAMS

/** The PNGs are rendered at twice their drawn size. */
export const DIAGRAM_SCALE = 2
