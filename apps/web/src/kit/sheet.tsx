"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx.ts";
import { useOverlay } from "./overlay.ts";

/** A flow's own space: a bottom sheet on phones, a centred card from 768 px. Flows stay inside it. */
export function Sheet({
  open,
  onClose,
  title,
  footer,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  const { mounted, shown, close } = useOverlay(open, onClose);
  if (!mounted) return null;
  // Rendered into <body>: a transformed or clipped parent (the stack on the chart, a card) would otherwise trap a
  // fixed overlay inside its own box.
  return createPortal(
    <div className="fixed inset-0 z-[var(--z-modal)]">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className={cx(
          "absolute inset-0 bg-[var(--scrim)] transition-opacity duration-[var(--dur-drawer-in)] ease-[var(--ease-drawer)]",
          shown ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          "absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-[28px] bg-[var(--surface-1)] pb-[env(safe-area-inset-bottom)] shadow-[inset_0_0_0_1px_var(--hairline),var(--shadow-float)] transition-[transform,opacity] duration-[var(--dur-drawer-in)] ease-[var(--ease-drawer)]",
          "md:inset-auto md:top-1/2 md:left-1/2 md:w-[440px] md:-translate-x-1/2 md:rounded-[24px] md:pb-0",
          wide && "md:w-[520px]",
          shown
            ? "translate-y-0 md:-translate-y-1/2 md:opacity-100"
            : "translate-y-full md:-translate-y-[46%] md:opacity-0",
        )}
      >
        <span className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-strong md:hidden" aria-hidden />
        {title ? (
          <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
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
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer ? <footer className="border-t border-hairline px-5 py-4">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
