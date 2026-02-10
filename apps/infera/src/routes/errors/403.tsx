import { createFileRoute } from "@tanstack/react-router"
import { Forbidden } from "@/packages/error-core"

export const Route = createFileRoute("/errors/403")({
  component: Forbidden,
})
