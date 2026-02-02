import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { PRIMARY_NAV } from "@/components/layout/nav-config"
import { useUserProfile } from "@/features/core/auth/api/get-current-user.ts"
import { usePermissions } from "@/features/core/auth/api/get-permissions"
import { type LoginResponse, LoginResponseType } from "@/features/core/auth/api/login"
import { useAuthStore } from "@/lib/auth-store"

/**
 * Hook to handle successful login flow
 * Stores token, fetches user info and permissions, then redirects
 */
export function useLoginHandler() {
	const navigate = useNavigate()
	// 性能优化: 使用 Selector 仅订阅 hasPermission 函数
	// 避免 token、user、permissions 等状态变化导致组件重新渲染
	const hasPermission = useAuthStore((state) => state.hasPermission)
	const { refetch: refetchUser } = useUserProfile({ enabled: false })
	const { refetch: refetchPermissions } = usePermissions({ enabled: false })

	const handleLoginSuccess = async (response: LoginResponse) => {
		const token = response.token
		if (response.type === LoginResponseType.TOKEN && token) {
			try {
				// 使用 getState() 调用 action 方法,不会触发订阅
				const authStore = useAuthStore.getState()

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
						return !item.permission || hasPermission(item.permission)
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
				// 错误处理时也使用 getState()
				useAuthStore.getState().logout()
			}
		}
	}

	return { handleLoginSuccess }
}
