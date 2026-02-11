import type { Permission } from "@/packages/auth-core"
import type { PermissionEnvironmentTag, PermissionSubjectType } from "./permission-context"
import { usePermissionContext } from "./permission-context"

export interface ProdRestrictionOptions {
  enabledInProd?: boolean
  reason?: string
}

export interface UsePermissionOptions {
  mode?: "AND" | "OR"
  prodRestriction?: ProdRestrictionOptions
}

export interface UsePermissionResult {
  hasPermission: boolean
  isRestrictedInProd: boolean
  canAccess: boolean
  reason: string | null
  subjectType: PermissionSubjectType
  environmentTag: PermissionEnvironmentTag
}

const DEFAULT_PROD_RESTRICTION_REASON = "生产环境策略限制当前操作。"

/**
 * 类型安全的权限校验 Hook。
 * - 权限判定始终以 hasPermission 为唯一来源
 * - Prod 环境限制仅用于 UI 提示，不替代权限判断
 */
export function usePermission(
  permission: Permission | readonly Permission[],
  options: UsePermissionOptions = {},
): UsePermissionResult {
  const { hasPermission, isProdEnvironment, subjectType, environmentTag } = usePermissionContext()
  const mode = options.mode ?? "OR"
  const hasAccess = hasPermission(permission, mode)

  const isRestrictedInProd = isProdEnvironment && options.prodRestriction?.enabledInProd === false

  const reason = isRestrictedInProd
    ? (options.prodRestriction?.reason ?? DEFAULT_PROD_RESTRICTION_REASON)
    : null

  return {
    hasPermission: hasAccess,
    isRestrictedInProd,
    canAccess: hasAccess && !isRestrictedInProd,
    reason,
    subjectType,
    environmentTag,
  }
}
