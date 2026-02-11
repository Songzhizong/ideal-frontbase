import type { PageInfo } from "@/packages/shared-types"

export const TENANT_PROJECT_ENVIRONMENTS = ["Dev", "Test", "Prod"] as const
export type TenantProjectEnvironment = (typeof TENANT_PROJECT_ENVIRONMENTS)[number]

export const TENANT_PROJECT_ROLES = ["Owner", "Maintainer", "Member"] as const
export type TenantProjectRole = (typeof TENANT_PROJECT_ROLES)[number]

export const TENANT_PROJECT_COST_RANGES = [
  "lt_1000",
  "between_1000_5000",
  "between_5000_20000",
  "gte_20000",
] as const

export type TenantProjectCostRange = (typeof TENANT_PROJECT_COST_RANGES)[number]

export interface TenantProjectServiceSummary {
  ready: number
  total: number
}

export interface TenantProjectDeletionDependency {
  id: string
  resourceType: string
  resourceName: string
  to: string | null
}

export type TenantProjectDeletionPolicy = "allow" | "cascade" | "blocked"

export interface TenantProjectDeletionPreview {
  policy: TenantProjectDeletionPolicy
  dependencies: TenantProjectDeletionDependency[]
}

export interface TenantProjectItem {
  projectId: string
  projectName: string
  environment: TenantProjectEnvironment
  ownerId: string
  ownerName: string
  serviceSummary: TenantProjectServiceSummary
  monthlyEstimatedCostCny: number
  tokensToday: number
  updatedAt: string
  deletionPreview: TenantProjectDeletionPreview
}

export interface TenantProjectOwnerOption {
  userId: string
  displayName: string
  email: string
}

export interface TenantProjectMemberCandidate {
  userId: string
  displayName: string
  email: string
  defaultRole: TenantProjectRole
}

export interface TenantProjectsListResponse extends PageInfo<TenantProjectItem> {
  canCreateProject: boolean
  ownerOptions: TenantProjectOwnerOption[]
  memberCandidates: TenantProjectMemberCandidate[]
  existingProjectNames: string[]
}

export interface TenantProjectsTableFilters {
  q: string
  environment: string | null
  ownerId: string | null
  costRange: string | null
}

export type TenantProjectQuotaPolicyMode = "tenant_default" | "custom"

export interface TenantProjectInitialMemberInput {
  userId: string
  role: TenantProjectRole
}

export interface CreateTenantProjectInput {
  tenantId: string
  name: string
  environment: TenantProjectEnvironment
  description: string
  quotaPolicyMode: TenantProjectQuotaPolicyMode
  quotaPolicyJson: string | null
  initialMembers: TenantProjectInitialMemberInput[]
}

export interface CreateTenantProjectResponse {
  project: TenantProjectItem
}

export interface DeleteTenantProjectInput {
  tenantId: string
  projectId: string
}
