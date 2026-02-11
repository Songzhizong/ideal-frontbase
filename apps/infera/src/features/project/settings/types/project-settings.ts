export type ProjectEnvironment = "Dev" | "Test" | "Prod"

export type ProjectRole = "Owner" | "Developer" | "Viewer"

export type ServiceAccountStatus = "Active" | "Disabled"

export interface ProjectOverview {
  projectId: string
  projectName: string
  environment: ProjectEnvironment
  description: string
  createdAt: string
  createdBy: string
}

export interface ProjectMember {
  memberId: string
  name: string
  email: string
  role: ProjectRole
  joinedAt: string
}

export interface ServiceAccountItem {
  serviceAccountId: string
  name: string
  role: Exclude<ProjectRole, "Viewer"> | "Viewer"
  status: ServiceAccountStatus
  lastUsedAt: string | null
  createdAt: string
  note: string
}

export interface ProjectQuotaBudgetPolicy {
  inheritTenantPolicy: boolean
  dailyTokenLimit: number
  monthlyTokenLimit: number
  monthlyBudgetCny: number
  alertThresholds: number[]
  overLimitAction: "Block" | "Throttle"
  notificationChannels: string[]
}

export interface ProjectEnvironmentPolicies {
  disableScaleToZeroInProd: boolean
  requireAlertsInProd: boolean
  disablePlaygroundLoggingInProd: boolean
  forbidViewerLogs: boolean
}

export interface ProjectSettingsSnapshot {
  overview: ProjectOverview
  members: ProjectMember[]
  serviceAccounts: ServiceAccountItem[]
  quotaBudgetPolicy: ProjectQuotaBudgetPolicy
  environmentPolicies: ProjectEnvironmentPolicies
}

export interface AddProjectMemberInput {
  tenantId: string
  projectId: string
  name: string
  email: string
  role: ProjectRole
}

export interface UpdateProjectMemberRoleInput {
  tenantId: string
  projectId: string
  memberId: string
  role: ProjectRole
}

export interface RemoveProjectMemberInput {
  tenantId: string
  projectId: string
  memberId: string
}

export interface CreateServiceAccountInput {
  tenantId: string
  projectId: string
  name: string
  role: ProjectRole
  note: string
}

export interface RotateServiceAccountTokenInput {
  tenantId: string
  projectId: string
  serviceAccountId: string
  disableOldToken: boolean
}

export interface ToggleServiceAccountInput {
  tenantId: string
  projectId: string
  serviceAccountId: string
  nextStatus: ServiceAccountStatus
}

export interface DeleteServiceAccountInput {
  tenantId: string
  projectId: string
  serviceAccountId: string
}

export interface UpdateProjectOverviewInput {
  tenantId: string
  projectId: string
  projectName: string
  environment: ProjectEnvironment
  description: string
}

export interface SaveProjectQuotaPolicyInput {
  tenantId: string
  projectId: string
  policy: ProjectQuotaBudgetPolicy
}

export interface SaveProjectEnvironmentPoliciesInput {
  tenantId: string
  projectId: string
  policies: ProjectEnvironmentPolicies
}

export interface DeleteProjectInput {
  tenantId: string
  projectId: string
}
