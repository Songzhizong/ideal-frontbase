import { useMemo } from "react"
import type { Permission } from "./types"
import { useAuthStore } from "./auth-store"

/**
 * 性能优化的权限检查 Hook
 *
 * 使用场景：
 * - 大表格渲染（每行都需要权限检查）
 * - 高频渲染的组件
 * - 需要精确控制重新渲染的场景
 *
 * 优化策略：
 * 1. 使用 Zustand Selector 仅订阅 hasPermission 函数
 * 2. 避免不相关状态变化导致的重新渲染
 *
 * @example
 * // ✅ 推荐：在组件中使用
 * const canEdit = useHasPermission("user:edit")
 * const canDelete = useHasPermission(["user:delete", "admin:all"], "OR")
 *
 * @example
 * // ❌ 不推荐：会导致不必要的重新渲染
 * const { hasPermission } = useAuthStore()
 * const canEdit = hasPermission("user:edit")
 */
export function useHasPermission(
  permission: Permission | Permission[],
  mode: "AND" | "OR" = "OR",
): boolean {
  // 使用 Selector 仅订阅 hasPermission 函数
  // 当 token、user、tenantId 等其他状态变化时，不会触发此组件重新渲染
  const hasPermission = useAuthStore((state) => state.hasPermission)

  // 直接调用，无需 useMemo (因为 hasPermission 内部已经使用了 Set 优化)
  return hasPermission(permission, mode)
}

/**
 * 批量权限检查 Hook
 *
 * 用于一次性检查多个独立权限，避免多次调用 useHasPermission
 *
 * @example
 * const { canEdit, canDelete, canExport } = usePermissions({
 *   canEdit: "user:edit",
 *   canDelete: "user:delete",
 *   canExport: ["user:export", "admin:all"], // OR 逻辑
 * })
 */
export function usePermissions<T extends Record<string, Permission | Permission[]>>(
  permissionMap: T,
): Record<keyof T, boolean> {
  const hasPermission = useAuthStore((state) => state.hasPermission)

  // 使用 useMemo 缓存结果,避免每次渲染都重新计算
  return useMemo(() => {
    const result = {} as Record<keyof T, boolean>

    for (const [key, permission] of Object.entries(permissionMap)) {
      result[key as keyof T] = hasPermission(permission, "OR")
    }

    return result
  }, [permissionMap, hasPermission])
}
