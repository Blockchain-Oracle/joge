"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useLiveEvent } from "@/live/hooks";
import type { LiveEvents } from "@/live/stream";

/** Round changes arrive over the stream; every list that shows rounds refetches at once (nothing polls). */
export function LiveSync() {
  const client = useQueryClient();
  useLiveEvent(
    "round",
    useCallback(
      (event: LiveEvents["round"]) => {
        void client.invalidateQueries({ queryKey: ["lobby", event.network] });
        // Your tickets (portfolio, the judge's path) change when your rounds move.
        void client.invalidateQueries({ queryKey: ["tickets", event.network] });
        if (event.kind === "sweep") void client.invalidateQueries({ queryKey: ["players", event.network] });
        void client.invalidateQueries({ queryKey: ["round", event.network, event.roundId] });
      },
      [client],
    ),
  );
  useLiveEvent(
    "agent",
    useCallback(
      (event: LiveEvents["agent"]) => {
        void client.invalidateQueries({ queryKey: ["agents", event.network] });
        void client.invalidateQueries({ queryKey: ["agent", event.network, event.agentId] });
      },
      [client],
    ),
  );
  return null;
}
