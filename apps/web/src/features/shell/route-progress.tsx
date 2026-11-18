"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const START_DELAY_MS = 80;
const CRAWL_TO = 70;
const CRAWL_MS = 8_000;
const FILL_MS = 200;
const SETTLE_MS = 220;
const FULL = 100;

/** A thin accent bar while a page is on its way: starts on a same-origin link click, fills when the path changes. */
export function RouteProgress() {
  const path = usePathname();
  const [width, setWidth] = useState(0);
  const [duration, setDuration] = useState(0);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest("a");
      if (!link || link.target === "_blank") return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      pending.current = setTimeout(() => {
        started.current = true;
        setDuration(CRAWL_MS);
        setWidth(CRAWL_TO);
      }, START_DELAY_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (pending.current) clearTimeout(pending.current);
    pending.current = null;
    if (!started.current) return;
    started.current = false;
    setDuration(FILL_MS);
    setWidth(FULL);
    const timer = setTimeout(() => {
      setDuration(0);
      setWidth(0);
    }, FILL_MS + SETTLE_MS);
    return () => clearTimeout(timer);
  }, [path]);

  if (width === 0) return null;
  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 z-[var(--z-fx)] h-[3px] bg-accent shadow-[0_0_8px_var(--accent)]"
      style={{ width: `${width}%`, transition: `width ${duration}ms cubic-bezier(0.1, 0.7, 0.2, 1)` }}
    />
  );
}
