import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { TenantProjectsPage } from "@/features/tenant/projects"

function TenantProjectsRoute() {
	const { tenantId } = Route.useParams()
	return <TenantProjectsPage tenantId={tenantId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/projects")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: TenantProjectsRoute,
	staticData: {
		title: "项目管理",
	},
})
