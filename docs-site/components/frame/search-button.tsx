"use client"

import { useSearchContext } from "fumadocs-ui/contexts/search"
import { Search } from "lucide-react"

/** The front page's big search box: opens the same ⌘K search as the bar. */
export function SearchButton() {
  const { setOpenSearch } = useSearchContext()
  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      className="mt-2 flex h-14 w-full max-w-[560px] items-center gap-3 rounded-2xl border border-fd-border bg-surface px-5 text-[16px] text-muted-ink hover:text-ink-2"
    >
      <Search className="size-5" />
      Search the docs
      <kbd className="ms-auto rounded-md border border-fd-border px-2 py-0.5 font-mono text-[12px]">⌘K</kbd>
    </button>
  )
}
