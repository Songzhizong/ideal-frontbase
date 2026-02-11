import { createFileRoute, redirect } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { resolveDefaultTenantId } from "@/features/core/auth/utils/resolve-default-tenant-id"
import { authStore } from "@/packages/auth-core"

function resolveDefaultTenantRouteId() {
	return resolveDefaultTenantId(authStore.getState())
}

export const Route = createFileRoute("/_authenticated/_dashboard/")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.DASHBOARD_VIEW,
		})

		throw redirect({
			to: "/t/$tenantId/overview",
			params: {
				tenantId: resolveDefaultTenantRouteId(),
			},
			replace: true,
		})
	},
	component: DashboardIndexRedirect,
	staticData: {
		title: "控制台",
	},
})

function DashboardIndexRedirect() {
	return null
}
