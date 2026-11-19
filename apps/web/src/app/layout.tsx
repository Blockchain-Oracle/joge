import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DEFAULT_NETWORK, THEME_INIT } from "@/features/theme/theme";
import { fontVariables } from "@/lib/fonts";
import { Providers } from "./providers.tsx";
import "./globals.css";

/** The public address share cards and link previews point at (set at build time; local dev falls back to :3300). */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3300";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Jōge 上下", template: "%s · Jōge" },
  description:
    "Up or down, in minutes. Call BTC, ETH, BCH or gold for a few cents; a contract on Bitcoin Cash pays the winners. No house.",
  applicationName: "Jōge",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
    { media: "(prefers-color-scheme: light)", color: "#F4EEE3" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-network={DEFAULT_NETWORK} className={fontVariables} suppressHydrationWarning>
      <head>
        <script id="joge-theme" dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
