import type * as React from "react"
import type { Permission } from "./types"
import { useAuthStore } from "./auth-store"

interface PermissionGateProps {
  permission: Permission | Permission[]
  mode?: "AND" | "OR"
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * PermissionGate - 声明式权限控制组件
 *
 * @example
 * <PermissionGate permission="users:add">
 *   <Button>新增用户</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  mode = "OR",
  fallback = null,
  children,
}: PermissionGateProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const isAllowed = hasPermission(permission, mode)

  if (!isAllowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
