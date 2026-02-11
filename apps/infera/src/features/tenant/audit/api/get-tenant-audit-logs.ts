import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantAuditLogsResponse, TenantAuditTableFilters } from "../types/tenant-audit"

const GetTenantAuditLogsInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  page: z.number().int().positive().default(1),
  size: z.number().int().positive().max(100).default(20),
  filters: z.object({
    actorType: z.enum(["user", "service_account"]).nullable(),
    actorQuery: z.string(),
    action: z.string().nullable(),
    resourceType: z.string().nullable(),
    projectId: z.string().nullable(),
    startTimeMs: z.number().nullable(),
    endTimeMs: z.number().nullable(),
  }),
})

export interface GetTenantAuditLogsInput {
  tenantId: string
  page: number
  size: number
  filters: TenantAuditTableFilters
}

function normalizeInput(input: GetTenantAuditLogsInput) {
  const payload = GetTenantAuditLogsInputSchema.parse(input)

  return {
    tenantId: payload.tenantId,
    page: payload.page,
    size: payload.size,
    filters: payload.filters,
  }
}

export async function getTenantAuditLogs(
  input: GetTenantAuditLogsInput,
): Promise<TenantAuditLogsResponse> {
  const payload = normalizeInput(input)

  const searchParams: Record<string, string | number> = {
    pageNumber: payload.page,
    pageSize: payload.size,
  }

  if (payload.filters.actorType) {
    searchParams.actorType = payload.filters.actorType
  }
  if (payload.filters.actorQuery.trim()) {
    searchParams.actorQuery = payload.filters.actorQuery.trim()
  }
  if (payload.filters.action) {
    searchParams.action = payload.filters.action
  }
  if (payload.filters.resourceType) {
    searchParams.resourceType = payload.filters.resourceType
  }
  if (payload.filters.projectId) {
    searchParams.projectId = payload.filters.projectId
  }
  if (payload.filters.startTimeMs) {
    searchParams.startTimeMs = payload.filters.startTimeMs
  }
  if (payload.filters.endTimeMs) {
    searchParams.endTimeMs = payload.filters.endTimeMs
  }

  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/audit/logs`, {
      searchParams,
    })
    .json()

  return json as TenantAuditLogsResponse
}
