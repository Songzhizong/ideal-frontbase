import { z } from "zod"
import { api } from "@/features/core/api"
import type {
  TenantProjectsListResponse,
  TenantProjectsTableFilters,
} from "../types/tenant-projects"

const SortItemSchema = z.object({
  field: z.string().min(1, "sort.field is required."),
  order: z.enum(["asc", "desc"]),
})

const TenantProjectsFiltersSchema = z.object({
  q: z.string().default(""),
  environment: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),
  costRange: z.string().nullable().optional(),
})

const GetTenantProjectsInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  page: z.number().int().positive().default(1),
  size: z.number().int().positive().max(100).default(20),
  sort: z.array(SortItemSchema).default([]),
  filters: TenantProjectsFiltersSchema.default({
    q: "",
  }),
})

export interface GetTenantProjectsInput {
  tenantId: string
  page: number
  size: number
  sort: Array<{
    field: string
    order: "asc" | "desc"
  }>
  filters: TenantProjectsTableFilters
}

interface GetTenantProjectsPayload {
  tenantId: string
  page: number
  size: number
  sort: Array<{
    field: string
    order: "asc" | "desc"
  }>
  filters: {
    q: string
    environment: string | null
    ownerId: string | null
    costRange: string | null
  }
}

function toPayload(input: GetTenantProjectsInput): GetTenantProjectsPayload {
  const parsed = GetTenantProjectsInputSchema.parse(input)

  return {
    tenantId: parsed.tenantId,
    page: parsed.page,
    size: parsed.size,
    sort: parsed.sort,
    filters: {
      q: parsed.filters.q,
      environment: parsed.filters.environment ?? null,
      ownerId: parsed.filters.ownerId ?? null,
      costRange: parsed.filters.costRange ?? null,
    },
  }
}

function buildSearchParams(payload: GetTenantProjectsPayload) {
  const searchParams: Record<string, string | number> = {
    pageNumber: payload.page,
    pageSize: payload.size,
  }

  if (payload.filters.q.trim().length > 0) {
    searchParams.q = payload.filters.q.trim()
  }

  if (payload.filters.environment) {
    searchParams.environment = payload.filters.environment
  }

  if (payload.filters.ownerId) {
    searchParams.ownerId = payload.filters.ownerId
  }

  if (payload.filters.costRange) {
    searchParams.costRange = payload.filters.costRange
  }

  if (payload.sort.length > 0) {
    searchParams.sort = payload.sort.map((item) => `${item.field}.${item.order}`).join(",")
  }

  return searchParams
}

export async function getTenantProjects(
  input: GetTenantProjectsInput,
): Promise<TenantProjectsListResponse> {
  const payload = toPayload(input)

  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/projects`, {
      searchParams: buildSearchParams(payload),
    })
    .json()

  return json as TenantProjectsListResponse
}
