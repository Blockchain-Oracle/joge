"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSensei } from "./store.ts";

/** The chat and the AI SDK load on the first open only, then stay mounted so the conversation survives closing. */
const SenseiPanel = dynamic(() => import("./sensei-panel.tsx").then((module) => module.SenseiPanel), { ssr: false });

export function SenseiMount() {
  const { open } = useSensei();
  const [wanted, setWanted] = useState(false);
  useEffect(() => {
    if (open) setWanted(true);
  }, [open]);
  return wanted ? <SenseiPanel /> : null;
}
