import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono, Noto_Serif_JP, Sora } from "next/font/google"
import { BlazeBanner } from "@/components/blaze"
import { Provider } from "@/components/provider"
import { OG, SITE } from "@/lib/site"
import "./global.css"

// The app's faces: Sora for titles, Inter for reading, JetBrains Mono for every figure and label, Noto Serif JP for 上下.
const sora = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-sora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jetbrains" })
const jp = Noto_Serif_JP({ subsets: ["latin"], weight: ["700"], variable: "--font-serif-jp", preload: false })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.title} · ${SITE.tagline}`, template: `%s · ${SITE.title}` },
  description: SITE.description,
  applicationName: SITE.title,
  openGraph: {
    siteName: SITE.title,
    type: "website",
    images: [{ url: "/og/home.png", width: OG.width, height: OG.height }],
  },
  twitter: { card: "summary_large_image" },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4eee3" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${mono.variable} ${jp.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Provider>
          <BlazeBanner />
          {children}
        </Provider>
      </body>
    </html>
  )
}
