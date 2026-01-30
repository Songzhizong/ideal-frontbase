import { DASHBOARD_PERMISSIONS } from "./dashboard"
import { USER_PERMISSIONS } from "./users"

/**
 * 综合权限对象, 包含所有模块的权限定义
 */
export const PERMISSIONS = {
    ...USER_PERMISSIONS,
    ...DASHBOARD_PERMISSIONS,
} as const
