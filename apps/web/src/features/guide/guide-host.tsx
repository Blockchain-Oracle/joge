"use client";

import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { guideSeen, openGuide, useGuide } from "./store.ts";

const Guide = dynamic(() => import("./guide.tsx").then((module) => module.Guide), { ssr: false });

/** Pages a visitor comes to watch, not to play: the guide waits there, and opens on the next page they visit. */
const WATCH_ONLY = new Set(["/demo"]);

/**
 * Hosts the first-run guide: it opens by itself the first time this device visits the app (except over the demo
 * video), whenever a link
 * carries `?guide=1` (More and ⌘K use it), and when a blocker asks for it. Its code loads only once it opens.
 */
export function GuideHost() {
  // The query is read inside its own Suspense boundary, so no page gives up static rendering for it.
  return (
    <Suspense fallback={null}>
      <Host />
    </Suspense>
  );
}

function Host() {
  const { open } = useGuide();
  const path = usePathname();
  const asked = useSearchParams().get("guide") === "1";
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (asked) {
      const url = new URL(window.location.href);
      url.searchParams.delete("guide");
      window.history.replaceState(window.history.state, "", url);
      openGuide("intro");
    } else if (!(guideSeen() || WATCH_ONLY.has(path))) openGuide("intro");
  }, [path, asked]);

  useEffect(() => {
    if (open) setLoaded(true);
  }, [open]);

  return loaded ? <Guide /> : null;
}
