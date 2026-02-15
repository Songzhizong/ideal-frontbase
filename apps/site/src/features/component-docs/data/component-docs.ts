import { buttonDoc } from "@/features/component-docs/content/button-doc"
import { buttonMdDoc } from "@/features/component-docs/content/button-md-doc"
import { DEFAULT_COMPONENT_DOCS } from "@/features/component-docs/content/component-docs-catalog"
import { dialogDoc } from "@/features/component-docs/content/dialog-doc"
import { inputDoc } from "@/features/component-docs/content/input-doc"
import { tableDoc } from "@/features/component-docs/content/table-doc"
import type { ComponentDoc } from "@/features/component-docs/data/types"

const customDocs = [buttonDoc, inputDoc, dialogDoc, tableDoc] as const
const customDocMap = new Map(customDocs.map((doc) => [doc.slug, doc] as const))

function getExtendedComponentDocs(baseDocs: readonly ComponentDoc[]) {
  const docs: ComponentDoc[] = []

  baseDocs.forEach((doc) => {
    docs.push(doc)

    if (doc.slug === "button") {
      docs.push(buttonMdDoc)
    }
  })

  return docs
}

export const COMPONENT_DOCS: readonly ComponentDoc[] = getExtendedComponentDocs(
  DEFAULT_COMPONENT_DOCS.map((doc) => customDocMap.get(doc.slug) ?? doc),
)

const componentDocsEntries = COMPONENT_DOCS.map((doc) => [doc.slug, doc] as const)

export const COMPONENT_DOCS_MAP: Readonly<Record<string, ComponentDoc>> =
  Object.fromEntries(componentDocsEntries)

export function findComponentDocBySlug(slug: string) {
  return COMPONENT_DOCS_MAP[slug] ?? null
}

export function groupComponentDocsByCategory(docs: readonly ComponentDoc[]) {
  const grouped = new Map<string, ComponentDoc[]>()

  docs.forEach((doc) => {
    const categoryDocs = grouped.get(doc.category)

    if (categoryDocs) {
      categoryDocs.push(doc)
      return
    }

    grouped.set(doc.category, [doc])
  })

  return Array.from(grouped.entries()).map(([category, items]) => ({
    category,
    items,
  }))
}
