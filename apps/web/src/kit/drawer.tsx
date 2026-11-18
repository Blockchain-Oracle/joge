"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx.ts";
import { useOverlay } from "./overlay.ts";

/** A side panel from 768 px (notices, settings, More); a bottom sheet on phones. */
export function Drawer({
  open,
  onClose,
  title,
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  const { mounted, shown, close } = useOverlay(open, onClose);
  if (!mounted) return null;
  // Rendered into <body>: a transformed or clipped parent (the stack on the chart, a card) would otherwise trap a
  // fixed overlay inside its own box.
  return createPortal(
    <div className="fixed inset-0 z-[var(--z-drawer)]">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className={cx(
          "absolute inset-0 bg-[var(--scrim)] transition-opacity duration-[var(--dur-drawer-in)] ease-[var(--ease-drawer)]",
          shown ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={cx(
          "absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[28px] bg-[var(--surface-1)] pb-[env(safe-area-inset-bottom)] shadow-[inset_0_0_0_1px_var(--hairline),var(--shadow-float)] transition-transform duration-[var(--dur-drawer-in)] ease-[var(--ease-drawer)]",
          "md:inset-y-4 md:right-4 md:left-auto md:max-h-none md:w-96 md:rounded-[24px] md:pb-0",
          wide && "md:w-[560px]",
          shown
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-x-[calc(100%+16px)] md:translate-y-0",
        )}
      >
        <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
          <h2 className="nx-display text-[22px]">{title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
          >
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
