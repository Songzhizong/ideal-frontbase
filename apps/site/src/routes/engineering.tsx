import { createFileRoute } from "@tanstack/react-router"
import { EngineeringPage } from "@/features/engineering/pages/engineering-page"

export const Route = createFileRoute("/engineering")({
  component: EngineeringPage,
  staticData: {
    title: "研发",
  },
})
