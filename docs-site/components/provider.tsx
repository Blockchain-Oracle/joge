"use client"

import { RootProvider } from "fumadocs-ui/provider/next"
import type { ReactNode } from "react"
import SearchDialog from "./search"

/** Night first, like the app (the toggle switches to the cream day page); search runs over a prebuilt index. */
export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider search={{ SearchDialog }} theme={{ defaultTheme: "dark", enableSystem: false }}>
      {children}
    </RootProvider>
  )
}
