"use client";

import { Bell, ChevronLeft, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/brand/mark";
import { cx } from "@/kit";
import { backFor, PLACES, placeFor } from "./places.ts";
import { useScrolled } from "./use-scrolled.ts";
import { WalletButton } from "./wallet-button.tsx";
import { WorldSwitch } from "./world-switch.tsx";

/**
 * The header (D21): the seal and the name, the places as pills (desktop), notices, the wallet and the menu. On a phone
 * the places live in the dock at the bottom instead; between phone and desktop, search and notices move into the menu
 * so the header never runs wider than the window (his screenshot at ~800 px).
 */
export function Header({
  onNotices,
  onMore,
  onSearch,
  unseen,
}: {
  onNotices: () => void;
  onMore: () => void;
  onSearch: () => void;
  unseen: number;
}) {
  const path = usePathname();
  const place = placeFor(path);
  const back = backFor(path);
  // Pinned while the page scrolls; once it has moved, a lighter frosted ground sets it apart from the stage.
  const scrolled = useScrolled();
  return (
    <header
      data-scrolled={scrolled ? "" : undefined}
      className="jg-header flex flex-col gap-1 pt-[max(env(safe-area-inset-top),10px)] pb-3 md:pt-4"
    >
      <div className="flex h-12 items-center gap-3">
        <Link href="/" aria-label="Jōge home" className="flex shrink-0 items-center">
          <Logo size={40} />
        </Link>
        <nav aria-label="Places" className="ml-1 hidden items-center gap-0.5 md:flex lg:ml-4 lg:gap-1">
          {PLACES.map((each) => {
            const here = each === place;
            return (
              <Link
                key={each.href}
                href={each.href}
                aria-current={here ? "page" : undefined}
                className={cx(
                  "rounded-full px-3 py-2 font-semibold text-[14px] transition-colors lg:px-4",
                  here ? "bg-[var(--ink)] text-[var(--ink-inverse)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]",
                )}
              >
                {each.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <WorldSwitch words />
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search (⌘K)"
            className="nx-glass hidden size-11 place-items-center rounded-full lg:grid"
          >
            <Search size={18} aria-hidden />
          </button>
          <button
            type="button"
            onClick={onNotices}
            aria-label={unseen > 0 ? `Notices, ${unseen} new` : "Notices"}
            className="nx-glass relative hidden size-11 place-items-center rounded-full lg:grid"
          >
            <Bell size={18} aria-hidden />
            {unseen > 0 ? (
              <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-[var(--vermilion)]" />
            ) : null}
          </button>
          <WalletButton compact />
          <button
            type="button"
            onClick={onMore}
            aria-label="Menu"
            className="nx-glass hidden size-11 place-items-center rounded-full md:grid"
          >
            <Menu size={18} aria-hidden />
          </button>
        </div>
      </div>
      {back ? (
        <Link href={back.href} className="nx-eyebrow inline-flex items-center gap-1 self-start hover:text-[var(--ink)]">
          <ChevronLeft size={14} aria-hidden />
          {back.label}
        </Link>
      ) : null}
    </header>
  );
}
