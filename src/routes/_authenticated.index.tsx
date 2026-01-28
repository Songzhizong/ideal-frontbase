import { createFileRoute } from "@tanstack/react-router"
import { InfrastructureDashboard } from "@/features/dashboard/routes/infrastructure-dashboard"

export const Route = createFileRoute("/_authenticated/")({
	component: InfrastructureDashboard,
})
