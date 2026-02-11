import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { ApiKeyDetailPage } from "@/features/project/api-keys"

const ApiKeyDetailSearchSchema = z.object({
	tab: z.enum(["overview", "usage", "audit"]).optional(),
})

function ApiKeyDetailRoute() {
	const { tenantId, projectId, apiKeyId } = Route.useParams()
	const { tab } = Route.useSearch()

	return (
		<ApiKeyDetailPage
			tenantId={tenantId}
			projectId={projectId}
			apiKeyId={apiKeyId}
			initialTab={tab}
		/>
	)
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/p/$projectId/api-keys/$apiKeyId")({
	validateSearch: (search) => ApiKeyDetailSearchSchema.parse(search),
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: ApiKeyDetailRoute,
	staticData: {
		title: "API Key 详情",
	},
})
