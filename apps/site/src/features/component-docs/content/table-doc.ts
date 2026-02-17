import type { ComponentDoc } from "@/features/component-docs/data/types"

export const tableDoc: ComponentDoc = {
  slug: "table",
  name: "Table",
  category: "数据展示",
  status: "beta",
  since: "0.1.0",
  summary: "用于结构化数据展示，适合列表页和运营后台场景。",
  docsPath: "packages/ui/table.tsx",
  renderMode: "markdown-only",
  markdownEntry: "table",
}
