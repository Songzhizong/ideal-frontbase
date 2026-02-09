import { createFileRoute } from "@tanstack/react-router"
import { GeneralError } from "@/packages/error-core"

export const Route = createFileRoute("/errors/500")({
  component: GeneralError,
})
