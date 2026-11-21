"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { openGuide, useGuide } from "./store.ts";

const Guide = dynamic(() => import("./guide.tsx").then((module) => module.Guide), { ssr: false });

/**
 * Hosts the wallet guide (get a wallet, pair it, coins, play). It no longer opens by itself: a first visit gets the
 * round screen's walkthrough instead, whose last step opens this guide at "Get a wallet". It opens for a link that
 * carries `?guide=1` and for any blocker that asks (Pair a wallet, Top up). Its code loads only once it opens.
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
  const asked = useSearchParams().get("guide") === "1";
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (asked) {
      const url = new URL(window.location.href);
      url.searchParams.delete("guide");
      window.history.replaceState(window.history.state, "", url);
      openGuide("intro");
    }
  }, [asked]);

  useEffect(() => {
    if (open) setLoaded(true);
  }, [open]);

  return loaded ? <Guide /> : null;
}
