"use client";

import { useQuery } from "@tanstack/react-query";
import { Bot, CornerDownLeft, Hash, type LucideIcon, Search } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cx } from "@/kit";
import { useOverlay } from "@/kit/overlay";
import { agentsQuery } from "../agents/api.ts";
import { PAGES, PLACES } from "./places.ts";
import { useWorld } from "./world.tsx";

interface Item {
  label: string;
  /** The number key that also jumps there. */
  hint?: string;
  href: Route;
  icon: LucideIcon;
}

const ALL: Item[] = [
  ...PLACES.map((place) => ({ label: place.label, hint: place.key, href: place.href, icon: place.icon })),
  ...PAGES.map((page) => ({ label: page.label, href: page.href, icon: page.icon })),
];
/** A typed round number ("1234" or "#1234") opens that round. */
const ROUND_ID = /^#?(\d{1,9})$/;

/** ⌘K: jump anywhere, or to a round by its number. */
export function Palette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mounted, shown, close } = useOverlay(open, onClose);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const network = useWorld();
  const agents = useQuery({ ...agentsQuery(network), enabled: open });
  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const round = ROUND_ID.exec(needle)?.[1];
    if (round) return [{ label: `Round #${round}`, href: `/r/${round}` as Route, icon: Hash }];
    // Agents are found by name too.
    const agentItems: Item[] = (agents.data ?? []).map((agent) => ({
      label: agent.name,
      href: `/agents/${agent.id}` as Route,
      icon: Bot,
    }));
    const every = [...ALL, ...agentItems];
    return needle ? every.filter((item) => item.label.toLowerCase().includes(needle)) : ALL;
  }, [query, agents.data]);
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
  }, [open]);
  if (!mounted) return null;
  const go = (item: Item | undefined) => {
    if (!item) return;
    close();
    router.push(item.href);
  };
  return (
    <div className="fixed inset-0 z-[var(--z-command)] flex items-start justify-center px-3 pt-[12vh]">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className={cx("absolute inset-0 bg-[var(--scrim)] transition-opacity", shown ? "opacity-100" : "opacity-0")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className={cx(
          "relative w-full max-w-lg overflow-hidden rounded-[28px] bg-[var(--surface-1)] shadow-[inset_0_0_0_1px_var(--hairline),var(--shadow-float)] transition-[transform,opacity] duration-[var(--dur-state)] ease-[var(--ease-out)]",
          shown ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
        )}
      >
        <label className="flex items-center gap-3 border-[var(--hairline)] border-b px-5">
          <Search size={18} className="text-[var(--muted)]" aria-hidden />
          <input
            ref={input}
            // biome-ignore lint/a11y/noAutofocus: the palette exists to be typed into the moment it opens
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") setActive((at) => Math.min(items.length - 1, at + 1));
              else if (event.key === "ArrowUp") setActive((at) => Math.max(0, at - 1));
              else if (event.key === "Enter") go(items[active]);
              else return;
              event.preventDefault();
            }}
            placeholder="Go to, or a round number"
            className="h-16 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[var(--muted)]"
          />
        </label>
        <ul className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 ? (
            <li className="px-3 py-6 text-center text-[14px] text-[var(--muted)]">No match</li>
          ) : null}
          {items.map((item, index) => (
            <li key={`${item.href}-${item.label}`}>
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => go(item)}
                className={cx(
                  "flex w-full items-center gap-3 rounded-[18px] px-3 py-2.5 text-left",
                  index === active && "bg-[var(--surface-2)]",
                )}
              >
                <item.icon size={18} className="text-[var(--muted)]" aria-hidden />
                <span className="flex-1 font-semibold text-[15px]">{item.label}</span>
                {index === active ? (
                  <CornerDownLeft size={15} className="text-[var(--muted)]" aria-hidden />
                ) : item.hint ? (
                  <kbd className="nx-num grid size-6 place-items-center rounded-md bg-[var(--surface-2)] text-[12px] text-[var(--muted)]">
                    {item.hint}
                  </kbd>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
