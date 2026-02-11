import { createFileRoute } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { enforceRoutePermission } from "@/features/core/auth/route-permission"
import { UsersPage } from "@/features/tenant/users"

function TenantUsersRoute() {
	const { tenantId } = Route.useParams()
	return <UsersPage tenantId={tenantId} />
}

export const Route = createFileRoute("/_authenticated/t/$tenantId/users")({
	beforeLoad: () => {
		enforceRoutePermission({
			permission: PERMISSIONS.USERS_READ,
		})
	},
	component: TenantUsersRoute,
	staticData: {
		title: "用户与邀请",
	},
})
