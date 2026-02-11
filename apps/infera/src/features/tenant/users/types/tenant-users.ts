import type { PageInfo } from "@/packages/shared-types"

export const TENANT_USER_ROLES = ["Admin", "Member", "Finance"] as const
export type TenantUserRole = (typeof TENANT_USER_ROLES)[number]

export const TENANT_USER_STATUSES = ["Active", "Invited", "Disabled"] as const
export type TenantUserStatus = (typeof TENANT_USER_STATUSES)[number]

export interface TenantUserItem {
  id: string
  displayName: string
  email: string
  role: TenantUserRole
  status: TenantUserStatus
  lastLoginAt: string | null
  createdAt: string
}

export const TENANT_INVITATION_STATUSES = ["Pending", "Expired"] as const
export type TenantInvitationStatus = (typeof TENANT_INVITATION_STATUSES)[number]

export interface TenantInvitationItem {
  id: string
  email: string
  role: TenantUserRole
  status: TenantInvitationStatus
  createdAt: string
}

export interface TenantUsersListResponse extends PageInfo<TenantUserItem> {}

export interface TenantInvitationsListResponse extends PageInfo<TenantInvitationItem> {}

export interface TenantUsersTableFilters {
  q: string
  role: TenantUserRole | null
  status: TenantUserStatus | null
}

export interface TenantInvitationsTableFilters {
  q: string
}

export interface CreateTenantInviteInput {
  tenantId: string
  emails: string[]
  role: TenantUserRole
  projectAssignments?: Array<{
    projectId: string
    role: string
  }>
}

export interface UpdateTenantUserRoleInput {
  tenantId: string
  userId: string
  role: TenantUserRole
}

export interface ToggleTenantUserStatusInput {
  tenantId: string
  userId: string
  status: TenantUserStatus
}

export interface ResendTenantInvitationInput {
  tenantId: string
  invitationId: string
}

export interface DeleteTenantInvitationInput {
  tenantId: string
  invitationId: string
}
