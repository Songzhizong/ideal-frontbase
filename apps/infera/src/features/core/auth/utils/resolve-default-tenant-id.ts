import type { UserProfile } from "@/packages/auth-core"

interface TenantResolverState {
  tenantId: string | null
  user: Pick<UserProfile, "tenantId"> | null
}

/**
 * 统一解析当前应使用的默认租户 ID。
 * 优先使用 authStore.tenantId，回退 user.tenantId，最后回退到给定默认值。
 */
export function resolveDefaultTenantId(state: TenantResolverState, fallbackTenantId = "1") {
  const resolvedTenantId = state.tenantId ?? state.user?.tenantId
  if (resolvedTenantId && resolvedTenantId.length > 0) {
    return resolvedTenantId
  }

  return fallbackTenantId
}
