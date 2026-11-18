"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

/** Copies the page as Markdown (for an AI or a note); the same text is served at its .md address. */
export function CopyPage({ markdownUrl }: { markdownUrl: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        const text = await (await fetch(markdownUrl)).text()
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-fd-border px-3 font-mono text-[11.5px] text-ink-2 hover:text-ink"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy page"}
    </button>
  )
}
