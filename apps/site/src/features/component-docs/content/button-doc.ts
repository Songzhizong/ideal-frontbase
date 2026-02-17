import type { MarkdownOnlyComponentDoc } from "@/features/component-docs/data/types"

export const buttonDoc: MarkdownOnlyComponentDoc = {
  slug: "button",
  name: "Button",
  category: "基础组件",
  status: "stable",
  since: "0.1.0",
  summary: "用于触发即时操作，是页面中的核心交互入口。",
  docsPath: "packages/ui/button.tsx",
  markdownEntry: "button",
  renderMode: "markdown-only",
}
