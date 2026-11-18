"use client";

import { Bell, Globe, Search } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/brand/mark";
import { Drawer } from "@/kit";
import { LimitsPanel } from "../limits/limits-panel.tsx";
import { WalletPlate } from "../wallet/wallet-plate.tsx";
import { PAGES, PLACES } from "./places.ts";
import { Preferences, SettingRow } from "./prefs.tsx";
import { WorldSwitch } from "./world-switch.tsx";

/**
 * More: the wallet, search and notices, then every setting as an icon, a word and its control. Places live in
 * the header and the dock, Sensei in its orb, so neither is repeated here.
 */
export function More({
  open,
  onClose,
  onSearch,
  onNotices,
  unseen,
}: {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
  onNotices: () => void;
  unseen: number;
}) {
  return (
    <Drawer open={open} onClose={onClose} title={<Logo size={36} />}>
      <div className="flex flex-col gap-5">
        <div className="rounded-[24px] bg-[var(--surface-2)] px-4">
          <SettingRow icon={<Globe size={18} aria-hidden />} label="Network">
            <WorldSwitch />
          </SettingRow>
        </div>
        <WalletPlate />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSearch();
            }}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--surface-2)] font-semibold text-[14px]"
          >
            <Search size={17} aria-hidden /> Search
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNotices();
            }}
            className="relative flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--surface-2)] font-semibold text-[14px]"
          >
            <Bell size={17} aria-hidden /> Notices
            {unseen > 0 ? <span className="absolute top-3 right-4 size-2 rounded-full bg-[var(--vermilion)]" /> : null}
          </button>
        </div>
        <div className="flex flex-col divide-y divide-[var(--hairline)] rounded-[24px] bg-[var(--surface-2)] px-4">
          <Preferences />
          <LimitsPanel />
        </div>
        <div className="flex flex-col gap-1">
          {PLACES.filter((place) => place.dock === false).map((place) => (
            <Link
              key={place.href}
              href={place.href}
              onClick={onClose}
              className="flex h-12 items-center gap-3 rounded-[18px] bg-[var(--surface-2)] px-4 font-semibold text-[15px] md:hidden"
            >
              <place.icon aria-hidden className="size-[18px] text-[var(--muted)]" />
              {place.label}
            </Link>
          ))}
        </div>
        {PAGES.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            onClick={onClose}
            className="nx-eyebrow self-center hover:text-[var(--ink)]"
          >
            {page.label}
          </Link>
        ))}
      </div>
    </Drawer>
  );
}
