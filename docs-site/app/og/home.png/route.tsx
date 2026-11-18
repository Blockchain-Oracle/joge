import { ogImage } from "@/lib/og"
import { SITE } from "@/lib/site"

export const revalidate = false

/** The front page's link preview, drawn at build time. */
export async function GET() {
  return ogImage({
    kicker: "Live on Bitcoin Cash mainnet",
    title: SITE.tagline,
    description: "No house. Contracts check the signed price and pay the winners. Anyone can finish a round.",
  })
}
