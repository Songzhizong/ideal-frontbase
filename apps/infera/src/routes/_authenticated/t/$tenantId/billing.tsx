import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { TenantBillingPage } from "@/features/tenant/billing"

function TenantBillingRoute() {
	const { tenantId } = Route.useParams()
	return <TenantBillingPage tenantId={tenantId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/billing")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})
	},
	component: TenantBillingRoute,
	staticData: {
		title: "账单与发票",
	},
})
