import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { TenantAuditPage } from "@/features/tenant/audit"

function TenantAuditRoute() {
	const { tenantId } = Route.useParams()

	return <TenantAuditPage tenantId={tenantId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/audit")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: TenantAuditRoute,
	staticData: {
		title: "租户审计",
	},
})
