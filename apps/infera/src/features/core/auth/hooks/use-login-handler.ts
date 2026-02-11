import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import {
  type LoginResponse,
  LoginResponseType,
  useAuthStore,
  usePermissionIdents,
  useUserProfile,
} from "@/packages/auth-core"
import { resolveDefaultTenantId } from "../utils/resolve-default-tenant-id"

/**
 * Hook to handle successful login flow
 * Stores token, fetches user info and permissions, then redirects
 */
export function useLoginHandler() {
  const navigate = useNavigate()
  const { refetch: refetchUser } = useUserProfile({ enabled: false })
  const { refetch: refetchPermissionIdents } = usePermissionIdents({ enabled: false })

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

        const permissionsResult = await refetchPermissionIdents()
        if (permissionsResult.data) {
          authStore.setPermissions(permissionsResult.data)

          const defaultTenantId = resolveDefaultTenantId(authStore)

          toast.success("登录成功!")
          void navigate({
            to: "/t/$tenantId/overview",
            params: {
              tenantId: defaultTenantId,
            },
          })
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
