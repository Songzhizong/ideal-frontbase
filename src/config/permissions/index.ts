import { DASHBOARD_PERMISSIONS } from "./dashboard"
import { FILE_MANAGEMENT_PERMISSIONS } from "./file-management"
import { USER_PERMISSIONS } from "./users"

/**
 * 综合权限对象, 包含所有模块的权限定义
 */
export const PERMISSIONS = {
  ...USER_PERMISSIONS,
  ...DASHBOARD_PERMISSIONS,
  ...FILE_MANAGEMENT_PERMISSIONS,
} as const
