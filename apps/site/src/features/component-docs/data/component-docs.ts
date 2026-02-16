import { DEFAULT_COMPONENT_DOCS } from "@/features/component-docs/content/component-docs-catalog"
import type { ComponentDoc } from "@/features/component-docs/data/types"
import { isMarkdownOnlyComponentDoc } from "@/features/component-docs/data/types"
import { listMarkdownDocEntries } from "@/features/component-docs/markdown/markdown-doc-registry"

type ComponentDocModule = Record<string, unknown>

const componentDocModules = import.meta.glob<ComponentDocModule>("../content/*-doc.{ts,tsx}", {
  eager: true,
})

const DEFAULT_COMPONENT_DOC_SLUG_SET = new Set(DEFAULT_COMPONENT_DOCS.map((doc) => doc.slug))
const MARKDOWN_DOC_ENTRY_SET = new Set(listMarkdownDocEntries())

function isComponentDocValue(value: unknown): value is ComponentDoc {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.slug === "string" &&
    typeof record.name === "string" &&
    typeof record.category === "string" &&
    (record.status === "stable" || record.status === "beta") &&
    typeof record.since === "string" &&
    typeof record.summary === "string" &&
    typeof record.docsPath === "string" &&
    (record.renderMode === undefined ||
      record.renderMode === "hybrid" ||
      (record.renderMode === "markdown-only" && typeof record.markdownEntry === "string"))
  )
}

function getComponentDocFromModule(modulePath: string, moduleExports: ComponentDocModule) {
  const docs = Object.values(moduleExports).filter(isComponentDocValue)

  if (docs.length === 0) {
    return null
  }

  if (docs.length > 1) {
    console.warn(`[component-docs] 文档模块包含多个文档对象，仅使用第一个：${modulePath}`)
  }

  return docs[0] ?? null
}

function getDiscoveredComponentDocs() {
  const docs: ComponentDoc[] = []

  Object.entries(componentDocModules).forEach(([modulePath, moduleExports]) => {
    const componentDoc = getComponentDocFromModule(modulePath, moduleExports)

    if (componentDoc) {
      docs.push(componentDoc)
      return
    }

    console.warn(`[component-docs] 文档模块未导出有效的 ComponentDoc：${modulePath}`)
  })

  return docs
}

function buildCustomDocMap(customDocs: readonly ComponentDoc[]) {
  const map = new Map<string, ComponentDoc>()

  customDocs.forEach((doc) => {
    if (map.has(doc.slug)) {
      console.warn(`[component-docs] 检测到重复 slug，后者将覆盖前者：${doc.slug}`)
    }

    map.set(doc.slug, doc)
  })

  return map
}

function hasMarkdownContent(entry: string) {
  return MARKDOWN_DOC_ENTRY_SET.has(entry)
}

function shouldFallbackToBaseDoc(baseDoc: ComponentDoc, customDoc: ComponentDoc) {
  if (!DEFAULT_COMPONENT_DOC_SLUG_SET.has(baseDoc.slug)) {
    return false
  }

  if (!isMarkdownOnlyComponentDoc(customDoc)) {
    return false
  }

  if (hasMarkdownContent(customDoc.markdownEntry)) {
    return false
  }

  console.warn(`[component-docs] 组件 ${customDoc.slug} 缺少 Markdown 文档，已回退默认提示页。`)
  return true
}

function toMarkdownOnlyDoc(baseDoc: ComponentDoc): ComponentDoc {
  return {
    ...baseDoc,
    renderDetail: undefined,
    renderMode: "markdown-only",
    markdownEntry: baseDoc.slug,
  }
}

function buildExtraCustomDocs(customDocs: readonly ComponentDoc[]) {
  return customDocs.filter((doc) => {
    if (DEFAULT_COMPONENT_DOC_SLUG_SET.has(doc.slug)) {
      return false
    }

    if (!isMarkdownOnlyComponentDoc(doc)) {
      return true
    }

    if (hasMarkdownContent(doc.markdownEntry)) {
      return true
    }

    console.warn(`[component-docs] 额外组件 ${doc.slug} 缺少 Markdown 文档，已跳过注册。`)
    return false
  })
}

function buildComponentDocs() {
  const customDocs = getDiscoveredComponentDocs()
  const customDocMap = buildCustomDocMap(customDocs)

  const resolvedDocs = DEFAULT_COMPONENT_DOCS.map((baseDoc) => {
    const customDoc = customDocMap.get(baseDoc.slug)

    if (customDoc && !shouldFallbackToBaseDoc(baseDoc, customDoc)) {
      return customDoc
    }

    if (!customDoc && hasMarkdownContent(baseDoc.slug)) {
      return toMarkdownOnlyDoc(baseDoc)
    }

    return baseDoc
  })

  return [...resolvedDocs, ...buildExtraCustomDocs(customDocs)]
}

export const COMPONENT_DOCS: readonly ComponentDoc[] = buildComponentDocs()

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
