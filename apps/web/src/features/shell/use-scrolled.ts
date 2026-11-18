"use client";

import { useEffect, useState } from "react";

/** How far the page moves before a pinned bar takes its own ground. */
const SCROLLED_PX = 8;

/** True once the page has scrolled: the app header and the landing's bar switch to their frosted ground. */
export function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}
