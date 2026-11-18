import type { Folder, Item, Node } from "fumadocs-core/page-tree"
import { source } from "./source"

/** A page as the frame lists it: its number in the book (1.1, 2.3…), its name and address. */
export type NavPage = { n: string; name: string; href: string }
/** A section: its number (01…), name, one line, and its pages in order. */
export type NavSection = { n: string; name: string; blurb: string; pages: NavPage[] }

const PAD = 2

function pagesOf(nodes: Node[]): Item[] {
  return nodes.flatMap((node) =>
    node.type === "page" ? [node] : node.type === "folder" ? [...(node.index ? [node.index] : []), ...pagesOf(node.children)] : [],
  )
}

/** The docs as a book, read from the content folders (their meta.json order gives the numbers). */
export function docsNav(): NavSection[] {
  const sections = source.getPageTree().children.filter((node): node is Folder => node.type === "folder")
  return sections.map((folder, i) => {
    const pages = [...(folder.index ? [folder.index] : []), ...pagesOf(folder.children)]
    return {
      n: String(i + 1).padStart(PAD, "0"),
      name: String(folder.name),
      blurb: typeof folder.description === "string" ? folder.description : "",
      pages: pages.map((page, j) => ({ n: `${i + 1}.${j + 1}`, name: String(page.name), href: page.url })),
    }
  })
}

/** Where a page sits: its section, its own entry, and its neighbours in reading order. */
export function placeOf(nav: NavSection[], href: string) {
  const all = nav.flatMap((section) => section.pages.map((page) => ({ section, page })))
  const at = all.findIndex((entry) => entry.page.href === href)
  return {
    section: all[at]?.section,
    page: all[at]?.page,
    prev: at > 0 ? all[at - 1]?.page : undefined,
    next: at >= 0 ? all[at + 1]?.page : undefined,
  }
}
