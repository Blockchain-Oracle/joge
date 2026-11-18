"use client";

import { useNow } from "../rounds/use-now.ts";
import { useLane } from "../terminal/use-lane.ts";
import { SenseiOrb } from "./orb.tsx";
import { useSensei } from "./store.ts";

const SECOND_MS = 1_000;
const MINUTE_SECONDS = 60;

/** The orb on every page (desktop), its ring tied to the next round of the lane on screen; it steps aside while the panel is open. */
export function SenseiOrbMount() {
  const { open } = useSensei();
  const { lane, next } = useLane();
  const now = useNow();
  const left = next && now > 0 ? (next.lockTime - now) * SECOND_MS : null;
  if (open) return null;
  return <SenseiOrb leftMs={left} spanMs={(lane?.seconds ?? MINUTE_SECONDS) * SECOND_MS} />;
}
