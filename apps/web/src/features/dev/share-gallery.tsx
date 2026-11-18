"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { TicketRow } from "../portfolio/ticket-row.tsx";
import { roundQuery } from "../round/api.ts";
import { RunShareSheet } from "../share/run-share.tsx";
import { ShareSheet } from "../share/share-sheet.tsx";
import { useWorld } from "../shell/world.tsx";

/** The share sheet on the latest played round, seen as its first player (no wallet needed to check the look). */
export function ShareGallery() {
  const network = useWorld();
  const [open, setOpen] = useState(false);
  const latest = useQuery({
    queryKey: ["dev-played", network],
    queryFn: async (): Promise<Array<{ roundId: number }>> =>
      (await fetch(`/api/rounds/previous?network=${network}&asset=BTC&limit=1`)).json(),
  });
  const roundId = latest.data?.[0]?.roundId ?? null;
  const view = useQuery({ ...roundQuery(network, roundId ?? 0), enabled: roundId !== null });
  const focus = view.data?.entries[0]?.payoutPkh;
  const [runOpen, setRunOpen] = useState(false);
  const tickets = useQuery({
    queryKey: ["dev-run", network, focus],
    enabled: Boolean(focus),
    queryFn: async (): Promise<TicketRow[]> =>
      ((await (await fetch(`/api/tickets?network=${network}&pkh=${focus}`)).json()) as { tickets: TicketRow[] })
        .tickets,
  });
  return (
    <section className="flex flex-col gap-3 rounded-[24px] bg-[var(--surface-1)] p-5">
      <p className="nx-eyebrow">Receipt and replay video</p>
      <button
        type="button"
        disabled={!roundId || !focus}
        onClick={() => setOpen(true)}
        className="self-start rounded-full bg-[var(--vermilion)] px-5 py-3 font-semibold text-white disabled:opacity-40"
      >
        {roundId ? `Share round ${roundId} as its first player` : "No played round yet"}
      </button>
      <button
        type="button"
        disabled={!tickets.data?.length}
        onClick={() => setRunOpen(true)}
        className="self-start rounded-full bg-[var(--surface-2)] px-5 py-3 font-semibold disabled:opacity-40"
      >
        Share that player's run
      </button>
      {runOpen && focus && tickets.data ? (
        <RunShareSheet rows={tickets.data} pkh={focus} open onClose={() => setRunOpen(false)} />
      ) : null}
      {open && roundId && focus ? (
        <ShareSheet roundId={roundId} focus={focus} open onClose={() => setOpen(false)} />
      ) : null}
    </section>
  );
}
