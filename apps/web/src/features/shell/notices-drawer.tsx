"use client";

import { BellOff } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Drawer, EmptyState, ToneDisc } from "@/kit";
import { clearNotices, markNoticesSeen, useNotices } from "./notices.ts";

const MINUTE_MS = 60_000;
const HOUR_MIN = 60;

const ago = (at: number) => {
  const minutes = Math.floor((Date.now() - at) / MINUTE_MS);
  if (minutes < 1) return "now";
  if (minutes < HOUR_MIN) return `${minutes}m`;
  return `${Math.floor(minutes / HOUR_MIN)}h`;
};

/** The bell's drawer: what happened to your rounds, newest first, each as a tone disc, one line and its age. */
export function NoticesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const notices = useNotices();
  useEffect(() => {
    if (open) markNoticesSeen();
  }, [open]);
  return (
    <Drawer open={open} onClose={onClose} title={<span className="nx-display text-[22px]">Notices</span>}>
      {notices.length === 0 ? (
        <EmptyState icon={BellOff} title="Nothing yet" body="Results and payouts land here." />
      ) : (
        <div className="flex flex-col gap-1">
          {notices.map((notice) => {
            const body = (
              <span className="flex items-center gap-3 rounded-[20px] p-2.5 hover:bg-[var(--surface-2)]">
                <ToneDisc tone={notice.tone} seal={notice.seal} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-[14px]">{notice.title}</span>
                  {notice.body ? (
                    <span className="nx-num block truncate text-[12px] text-[var(--muted)]">{notice.body}</span>
                  ) : null}
                </span>
                <span className="nx-num shrink-0 text-[11px] text-[var(--muted)]">{ago(notice.at)}</span>
                {notice.seen ? null : <span className="size-2 shrink-0 rounded-full bg-[var(--vermilion)]" />}
              </span>
            );
            return notice.href ? (
              <Link key={notice.id} href={notice.href as never} onClick={onClose}>
                {body}
              </Link>
            ) : (
              <div key={notice.id}>{body}</div>
            );
          })}
          <button type="button" onClick={clearNotices} className="nx-eyebrow mt-3 self-center hover:text-[var(--ink)]">
            Clear all
          </button>
        </div>
      )}
    </Drawer>
  );
}
