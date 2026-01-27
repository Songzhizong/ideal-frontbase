import { createFileRoute } from "@tanstack/react-router"
import { NotFound } from "@/features/errors"

export const Route = createFileRoute("/errors/404")({
	component: NotFound,
})
