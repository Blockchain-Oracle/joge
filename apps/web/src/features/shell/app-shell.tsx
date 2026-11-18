"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { onToast, onToastOpen, primeFeedback, Toaster } from "@/kit";
import { setStreamNetwork } from "@/live/stream";
import { registerWorker } from "../push/push.ts";
import { ResultWatch } from "../round/result-watch.tsx";
import { SenseiOrbMount } from "../sensei/orb-mount.tsx";
import { SenseiMount } from "../sensei/sensei-mount.tsx";
import { currentNetwork } from "../theme/theme.ts";
import { ConnectSheet } from "../wallet/connect-sheet.tsx";
import { WalletProvider } from "../wallet/wallet-context.tsx";
import { BlazeBanner } from "./banner.tsx";
import { Dock } from "./dock.tsx";
import { Header } from "./header.tsx";
import { LiveSync } from "./live-sync.tsx";
import { More } from "./more.tsx";
import { recordNotice, useNotices } from "./notices.ts";
import { NoticesDrawer } from "./notices-drawer.tsx";
import { OfflineStrip } from "./offline-strip.tsx";
import { Palette } from "./palette.tsx";
import { OPEN_MORE_EVENT, PLACES } from "./places.ts";
import { RouteProgress } from "./route-progress.tsx";

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * The app frame: the header (wordmark, places as pills, wallet pill), one stage, and the overlays every page shares
 * (More, ⌘K, notices, toasts). Keys: ⌘K or / opens search, 1–6 jump to places.
 */
export function AppShell({ children, bleed = false }: { children: ReactNode; bleed?: boolean }) {
  const router = useRouter();
  const [more, setMore] = useState(false);
  const [search, setSearch] = useState(false);
  const [notices, setNotices] = useState(false);
  const unseen = useNotices().filter((notice) => !notice.seen).length;

  useEffect(() => {
    primeFeedback();
    registerWorker();
    setStreamNetwork(currentNetwork());
    const stopSink = onToast(recordNotice);
    const openMore = () => setMore(true);
    window.addEventListener(OPEN_MORE_EVENT, openMore);
    onToastOpen((toast) => {
      if (toast.href) router.push(toast.href as never);
    });
    return () => {
      stopSink();
      window.removeEventListener(OPEN_MORE_EVENT, openMore);
    };
  }, [router]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearch((open) => !open);
        return;
      }
      if (typing(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "/") {
        event.preventDefault();
        setSearch(true);
        return;
      }
      const place = PLACES.find((candidate) => candidate.key === event.key);
      if (place) router.push(place.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <WalletProvider>
      <div className="jg-shell">
        <a
          href="#stage"
          className="sr-only z-[var(--z-skip)] rounded-md bg-accent px-3 py-2 text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <BlazeBanner />
        <div className="jg-column">
          <Header
            onNotices={() => setNotices(true)}
            onMore={() => setMore(true)}
            onSearch={() => setSearch(true)}
            unseen={unseen}
          />
          <main id="stage" className="jg-stage" data-bleed={bleed ? "" : undefined}>
            {children}
          </main>
        </div>
        <More
          open={more}
          onClose={() => setMore(false)}
          onSearch={() => setSearch(true)}
          onNotices={() => setNotices(true)}
          unseen={unseen}
        />
        <Palette open={search} onClose={() => setSearch(false)} />
        <NoticesDrawer open={notices} onClose={() => setNotices(false)} />
        <SenseiMount />
        <SenseiOrbMount />
        <Dock onMore={() => setMore(true)} />
        <LiveSync />
        <ResultWatch />
        <Toaster />
        <RouteProgress />
        <OfflineStrip />
        <ConnectSheet />
      </div>
    </WalletProvider>
  );
}
