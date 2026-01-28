import { authStore } from "../stores/auth-store"

/**
 * 获取当前租户 ID
 * 用于在非 React 环境中获取租户 ID（如 api-client 配置）
 *
 * @returns 当前租户 ID，如果未设置则返回 null
 *
 * @example
 * // 在 api-client 配置中使用
 * configureApiClient({
 *   getToken: () => authStore.getState().token,
 *   getTenantId: getTenantId,
 *   onUnauthorized: () => { ... }
 * })
 */
export const getTenantId = (): string | null => {
	const state = authStore.getState()
	return state.tenantId ?? state.user?.tenantId ?? null
}
