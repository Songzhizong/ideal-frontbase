import type { PageInfo } from "@/packages/shared-types"

export const TENANT_AUDIT_ACTOR_TYPES = ["user", "service_account"] as const

export type TenantAuditActorType = (typeof TENANT_AUDIT_ACTOR_TYPES)[number]

export interface TenantAuditProjectOption {
  projectId: string
  projectName: string
}

export interface TenantAuditLogItem {
  logId: string
  happenedAtMs: number
  actorType: TenantAuditActorType
  actorName: string | null
  actorEmail: string
  action: string
  resourceType: string
  resourceId: string
  resourceName: string | null
  projectId: string | null
  projectName: string | null
  ip: string | null
  userAgent: string | null
}

export interface TenantAuditLogDetail extends TenantAuditLogItem {
  beforePayload: unknown | null
  afterPayload: unknown | null
}

export interface TenantAuditTableFilters {
  actorType: TenantAuditActorType | null
  actorQuery: string
  action: string | null
  resourceType: string | null
  projectId: string | null
  startTimeMs: number | null
  endTimeMs: number | null
}

export interface TenantAuditLogsResponse extends PageInfo<TenantAuditLogItem> {
  projectOptions: TenantAuditProjectOption[]
  actionOptions: string[]
  resourceTypeOptions: string[]
}
