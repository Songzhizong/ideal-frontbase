import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ServiceDetailPage } from "@/features/project/services"

const ServiceDetailSearchSchema = z.object({
	tab: z.enum(["overview", "revisions", "metrics", "logs", "playground", "settings", "audit"]).optional(),
})

function ServiceDetailRoute() {
	const { tenantId, projectId, serviceId } = Route.useParams()
	const { tab } = Route.useSearch()

	return (
		<ServiceDetailPage
			tenantId={tenantId}
			projectId={projectId}
			serviceId={serviceId}
			initialTab={tab}
		/>
	)
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/services/$serviceId")({
	validateSearch: (search) => ServiceDetailSearchSchema.parse(search),
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: ServiceDetailRoute,
	staticData: {
		title: "服务详情",
	},
})
