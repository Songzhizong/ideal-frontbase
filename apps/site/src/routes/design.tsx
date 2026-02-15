import { createFileRoute } from "@tanstack/react-router"
import { DesignPage } from "@/features/design/pages/design-page"

export const Route = createFileRoute("/design")({
  component: DesignPage,
  staticData: {
    title: "设计",
  },
})
