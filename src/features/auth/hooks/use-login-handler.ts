import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { PRIMARY_NAV } from "@/components/layout/nav-config"
import { useUserProfile } from "@/features/auth/api/get-current-user.ts"
import { usePermissions } from "@/features/auth/api/get-permissions"
import { type LoginResponse, LoginResponseType } from "@/features/auth/api/login"
import { useAuthStore } from "@/lib/auth-store"

/**
 * Hook to handle successful login flow
 * Stores token, fetches user info and permissions, then redirects
 */
export function useLoginHandler() {
	const navigate = useNavigate()
	const authStore = useAuthStore()
	const { refetch: refetchUser } = useUserProfile({ enabled: false })
	const { refetch: refetchPermissions } = usePermissions({ enabled: false })

	const handleLoginSuccess = async (response: LoginResponse) => {
		const token = response.token
		if (response.type === LoginResponseType.TOKEN && token) {
			try {
				// Store token first
				authStore.setToken(`${token.token_type} ${token.access_token}`)

				const userResult = await refetchUser()

				const user = userResult.data
				if (user) {
					authStore.setUser(user)
					const tenantId = user.tenantId
					authStore.setTenantId(tenantId)
				} else {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error("Failed to fetch user data")
				}

				const permissionsResult = await refetchPermissions()
				if (permissionsResult.data) {
					authStore.setPermissions(permissionsResult.data)

					toast.success("登录成功!")

					// Find first accessible page based on user permissions
					const firstAccessiblePage = PRIMARY_NAV.find((item) => {
						return !item.permission || authStore.hasPermission(item.permission)
					})

					// Redirect to first accessible page or 403 if no access
					if (firstAccessiblePage) {
						void navigate({ to: firstAccessiblePage.to })
					} else {
						void navigate({ to: "/" })
					}
				} else {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error("Failed to fetch user data")
				}
			} catch (error) {
				console.error("Login handler error:", error)
				toast.error("Failed to complete login. Please try again.")
				authStore.logout()
			}
		}
	}

	return { handleLoginSuccess }
}
