import type { ReactNode } from "react"

export interface ComponentApiItem {
  name: string
  type: string
  defaultValue: string
  description: string
}

export type ComponentDocRenderMode = "hybrid" | "markdown-only"

export interface ComponentDoc {
  slug: string
  name: string
  category: string
  status: "stable" | "beta"
  since: string
  summary: string
  usage: string
  docsPath: string
  markdownEntry?: string | undefined
  renderMode?: ComponentDocRenderMode | undefined
  scenarios: readonly string[]
  notes: readonly string[]
  api: readonly ComponentApiItem[]
  renderDetail?: ((doc: ComponentDoc) => ReactNode) | undefined
}
