import { createRelativeLink } from "fumadocs-ui/mdx"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CopyPage } from "@/components/frame/copy-page"
import { DocsFrame } from "@/components/frame/docs-frame"
import { Outline, PageHeader, PrevNext } from "@/components/frame/page-parts"
import { getMDXComponents } from "@/components/mdx"
import { docsNav, placeOf } from "@/lib/nav"
import { getPageImage, getPageMarkdownUrl, source } from "@/lib/source"

type Props = { params: Promise<{ slug?: string[] }> }

const OUTLINE_DEPTH = 2

/** A docs page in the frame: where it sits, its title and line, the page, its outline and its neighbours. */
export default async function Page({ params }: Props) {
  const page = source.getPage((await params).slug)
  if (!page) notFound()
  const MDX = page.data.body
  const nav = docsNav()
  const place = placeOf(nav, page.url)
  const outline = page.data.toc
    .filter((item) => item.depth === OUTLINE_DEPTH)
    .map((item) => ({ id: item.url.slice(1), label: item.title }))

  return (
    <DocsFrame nav={nav} outline={outline.length > 1 ? <Outline items={outline} /> : undefined}>
      <article className="mx-auto max-w-[820px]">
        <PageHeader
          section={place.section ? `${place.page?.n ?? place.section.n} · ${place.section.name.toUpperCase()}` : "DOCS"}
          title={page.data.title}
          lead={page.data.description}
          action={<CopyPage markdownUrl={getPageMarkdownUrl(page).url} />}
        />
        <div className="docs-body">
          <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
        </div>
        <PrevNext prev={place.prev} next={place.next} />
      </article>
    </DocsFrame>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = source.getPage((await params).slug)
  if (!page) notFound()
  const image = getPageImage(page).url
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
    openGraph: { title: page.data.title, description: page.data.description, images: image },
    twitter: { card: "summary_large_image", images: image },
  }
}
