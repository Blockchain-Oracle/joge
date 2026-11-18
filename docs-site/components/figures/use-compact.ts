"use client"

import { type RefObject, useEffect, useState } from "react"

/** Below this container width a figure switches to its tall (phone) layout. */
export const COMPACT_BELOW = 600

/** Whether the element is narrow enough for a figure's tall layout (follows resizes). */
export function useCompact(ref: RefObject<HTMLElement | null>) {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const watch = new ResizeObserver(([entry]) => {
      if (entry) setCompact(entry.contentRect.width < COMPACT_BELOW)
    })
    watch.observe(node)
    return () => watch.disconnect()
  }, [ref])
  return compact
}
