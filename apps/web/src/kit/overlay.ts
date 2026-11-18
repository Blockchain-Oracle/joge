"use client";

import { useEffect, useState } from "react";
import { cue } from "./feedback.ts";

const CLOSE_MS = 240;

/**
 * Shared by Sheet and Drawer: mounts on open, plays the enter transition on the next frame, keeps the content mounted
 * through the exit transition, closes on Esc, and plays the open and close cues.
 */
export function useOverlay(open: boolean, onClose: () => void) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      cue("open");
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), CLOSE_MS);
    return () => clearTimeout(timer);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      cue("close");
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  const close = () => {
    cue("close");
    onClose();
  };
  return { mounted, shown, close };
}
