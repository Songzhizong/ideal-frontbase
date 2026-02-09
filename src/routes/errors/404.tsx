import { createFileRoute } from "@tanstack/react-router"
import { NotFound } from "@/packages/error-core"

export const Route = createFileRoute("/errors/404")({
  component: NotFound,
})
