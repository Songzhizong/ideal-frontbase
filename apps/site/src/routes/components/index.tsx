import { createFileRoute } from "@tanstack/react-router"
import { ComponentsOverviewPage } from "@/features/component-docs/pages/components-overview-page"

export const Route = createFileRoute("/components/")({
  component: ComponentsOverviewPage,
  staticData: {
    title: "组件总览",
  },
})
