import { createFileRoute } from "@tanstack/react-router"
import { ComponentsDocsLayout } from "@/features/component-docs/layout/components-docs-layout"

export const Route = createFileRoute("/components")({
  component: ComponentsDocsLayout,
  staticData: {
    title: "组件文档",
  },
})
