import { Inter, JetBrains_Mono, Noto_Serif_JP, Sora } from "next/font/google";

/*
 * Jōge's type (D21), the faces Abu's own products share from Masayume to Kakure: Sora 600–800 for the display, Inter
 * for words, JetBrains Mono for every figure (Mitoshi's "numbers law"), Noto Serif JP for the seal, the chart's 上下
 * watermark and the verdict stamps (loaded on demand: only the glyphs on screen are fetched).
 */
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap", weight: ["600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
const serifJp = Noto_Serif_JP({ subsets: ["latin"], variable: "--font-serif-jp", weight: ["700"], preload: false });

export const fontVariables = [sora.variable, inter.variable, jetbrains.variable, serifJp.variable].join(" ");
