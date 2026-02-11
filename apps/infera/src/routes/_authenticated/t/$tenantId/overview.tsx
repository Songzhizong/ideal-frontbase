import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { TenantOverviewPage } from "@/features/tenant/overview"

function TenantOverviewRoute() {
	const { tenantId } = Route.useParams()
	return <TenantOverviewPage tenantId={tenantId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/overview")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: TenantOverviewRoute,
	staticData: {
		title: "租户概览",
	},
})
