import { createFromSource } from "fumadocs-core/search/server"
import { source } from "@/lib/source"

// Built once at export: the search box downloads this index and searches it in the browser.
export const revalidate = false
export const { staticGET: GET } = createFromSource(source)
