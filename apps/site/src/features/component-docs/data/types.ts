import type { ReactNode } from "react"

export interface ComponentApiItem {
  name: string
  type: string
  defaultValue: string
  description: string
}

export type ComponentDocRenderMode = "hybrid" | "markdown-only"

interface ComponentDocBase {
  slug: string
  name: string
  category: string
  status: "stable" | "beta"
  since: string
  summary: string
  docsPath: string
}

export interface HybridComponentDoc extends ComponentDocBase {
  renderMode?: "hybrid" | undefined
  markdownEntry?: string | undefined
  usage: string
  scenarios: readonly string[]
  notes: readonly string[]
  api: readonly ComponentApiItem[]
  renderDetail?: ((doc: HybridComponentDoc) => ReactNode) | undefined
}

export interface MarkdownOnlyComponentDoc extends ComponentDocBase {
  renderMode: "markdown-only"
  markdownEntry: string
  usage?: string | undefined
  scenarios?: readonly string[] | undefined
  notes?: readonly string[] | undefined
  api?: readonly ComponentApiItem[] | undefined
  renderDetail?: undefined
}

export type ComponentDoc = HybridComponentDoc | MarkdownOnlyComponentDoc

export function isMarkdownOnlyComponentDoc(doc: ComponentDoc): doc is MarkdownOnlyComponentDoc {
  return doc.renderMode === "markdown-only"
}
