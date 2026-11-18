"use client";

import { LostPage } from "@/features/shell/lost-page";

/** A page that broke while rendering: say so plainly and offer the retry. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <LostPage
      code="Error"
      title="This page tripped."
      line="Something went wrong drawing it. Your coins and rounds are on the chain, untouched."
      action={
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-14 items-center rounded-full bg-[var(--surface-2)] px-7 font-semibold text-[16px]"
        >
          Try again
        </button>
      }
    />
  );
}
