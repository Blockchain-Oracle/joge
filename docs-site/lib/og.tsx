import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { markSvg } from "./mark"
import { OG, SITE } from "./site"

/*
 * Link previews in Jōge's night look: the near-black stage, a Sora title, a mono "/ SECTION" kicker, the mark, a faint
 * 上下 behind, and the vermilion line along the foot. Drawn once at build; fonts read from disk (assets/fonts, OFL) so
 * the Docker build needs no network for them.
 */

const STAGE = "#050505"
const INK = "#FFFFFF"
const MUTED = "#8A8A8A"
const VERMILION = "#E04D26"
const TITLE_MAX = 64
const DESCRIPTION_MAX = 140

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file))
const fontsOnce = Promise.all([
  font("sora-800.ttf"),
  font("jetbrains-mono-600.ttf"),
  font("noto-serif-jp-700-subset.woff"),
])

async function fonts() {
  const [sora, mono, jp] = await fontsOnce
  return [
    { name: "Sora", data: sora, weight: 800 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: mono, weight: 600 as const, style: "normal" as const },
    { name: "Noto Serif JP", data: jp, weight: 700 as const, style: "normal" as const },
  ]
}

const MARK_URI = `data:image/svg+xml;base64,${Buffer.from(markSvg()).toString("base64")}`

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

/** A preview card: a kicker (the section), the title, a line of description. */
export async function ogImage({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 72px 0",
        background: STAGE,
        color: INK,
        fontFamily: "Sora",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -10,
          bottom: 20,
          display: "flex",
          fontFamily: "Noto Serif JP",
          fontSize: 300,
          lineHeight: 1,
          color: "rgba(255,255,255,0.05)",
        }}
      >
        {SITE.kanji}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* biome-ignore lint/performance/noImgElement: satori draws plain img */}
        <img src={MARK_URI} width={60} height={60} alt="" />
        <div style={{ display: "flex", fontSize: 38, letterSpacing: -1.5 }}>{SITE.name}</div>
        <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 20, color: MUTED, letterSpacing: 2 }}>
          / DOCS
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 56 }}>
        <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 22, color: VERMILION, letterSpacing: 2.5 }}>
          {`/ ${kicker.toUpperCase()}`}
        </div>
        <div style={{ display: "flex", fontSize: 74, letterSpacing: -3.5, lineHeight: 1.02, maxWidth: 1000 }}>
          {clip(title, TITLE_MAX)}
        </div>
        {description ? (
          <div
            style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 24, color: MUTED, lineHeight: 1.4, maxWidth: 980 }}
          >
            {clip(description, DESCRIPTION_MAX)}
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", height: 10, marginLeft: -72, marginRight: -72, background: VERMILION }} />
    </div>,
    { ...OG, fonts: await fonts() },
  )
}
