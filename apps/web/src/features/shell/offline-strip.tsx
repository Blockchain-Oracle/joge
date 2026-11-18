"use client";

import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

/** A strip across the top while the device is offline. */
export function OfflineStrip() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  if (online) return null;
  return (
    <div className="nx-num fixed inset-x-0 top-0 z-[var(--z-toast)] flex items-center justify-center gap-2 bg-[var(--gold)] px-4 py-1.5 font-semibold text-[#1a1406] text-[12px]">
      <WifiOff size={14} aria-hidden />
      Offline · paused until you reconnect
    </div>
  );
}
