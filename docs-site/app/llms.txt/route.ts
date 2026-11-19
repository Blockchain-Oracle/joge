import { docsLlms } from "@/lib/source"
import { BLAZE, SITE } from "@/lib/site"

export const revalidate = false

/** Who this is and where everything lives, read first by language models and screeners. */
const HEADER = [
  `# ${SITE.name} ${SITE.kanji} · ${BLAZE.event}, ${BLAZE.track}`,
  "",
  `> ${SITE.tagline} ${SITE.description}`,
  "",
  `- Live app (Bitcoin Cash mainnet): ${SITE.app}`,
  `- Source (MIT): ${SITE.repo}`,
  `- Widget Factory deck: ${BLAZE.deck}`,
  `- CashTokens address: ${BLAZE.cashtokens}`,
  `- Full text of every page: ${SITE.url}/llms-full.txt`,
  "",
].join("\n")

/** An index of every page for language models; the full text is at /llms-full.txt. */
export async function GET() {
  return new Response(`${HEADER}\n${await docsLlms.index()}`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
