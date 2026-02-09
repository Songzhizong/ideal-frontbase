import { z } from "zod"

/**
 * Permission Schema - 权限定义
 */
export type Permission = string
export const PermissionSchema = z.string()

/**
 * Tenant Info Interface
 * 租户信息
 */
export interface TenantInfo {
  id: string
  name: string
  abbreviation: string
  blocked: boolean
}

/**
 * User Profile Interface
 * 用户个人信息
 */
export interface UserProfile {
  userId: string
  containerId: string | null
  name: string
  account: string | null
  phone: string | null
  email: string | null
  mfaEnabled: boolean
  tenantId: string | null
  tenantName: string | null
  tenantAbbreviation: string | null
  accessibleTenants: TenantInfo[]
}
