import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/packages/mock-core"
import type {
  TenantAuditLogDetail,
  TenantAuditLogItem,
  TenantAuditProjectOption,
} from "../types/tenant-audit"
import { TENANT_AUDIT_SEEDS, type TenantAuditSeed } from "./tenant-audit.mock.seed"

interface TenantAuditStoreState {
  projectOptions: TenantAuditProjectOption[]
  logs: TenantAuditLogDetail[]
}

const tenantAuditStore = new Map<string, TenantAuditStoreState>()

function cloneSeed(seed: TenantAuditSeed): TenantAuditStoreState {
  return {
    projectOptions: seed.projectOptions.map((item) => ({ ...item })),
    logs: seed.logs.map((item) => ({ ...item })),
  }
}

function getDefaultSeed(): TenantAuditSeed {
  const seed = TENANT_AUDIT_SEEDS["1"]
  if (!seed) {
    throw new Error("Missing default tenant audit seed.")
  }
  return seed
}

function getStoreState(tenantId: string): TenantAuditStoreState {
  let state = tenantAuditStore.get(tenantId)
  if (!state) {
    const seed = TENANT_AUDIT_SEEDS[tenantId] ?? getDefaultSeed()
    state = cloneSeed(seed)
    tenantAuditStore.set(tenantId, state)
  }
  return state
}

function toLogItem(log: TenantAuditLogDetail): TenantAuditLogItem {
  return {
    logId: log.logId,
    happenedAtMs: log.happenedAtMs,
    actorType: log.actorType,
    actorName: log.actorName,
    actorEmail: log.actorEmail,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    resourceName: log.resourceName,
    projectId: log.projectId,
    projectName: log.projectName,
    ip: log.ip,
    userAgent: log.userAgent,
  }
}

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

export const tenantAuditHandlers = [
  http.get("*/infera-api/tenants/:tenantId/audit/logs", async ({ params, request }) => {
    await delay(260)
    const tenantId = params.tenantId as string
    const state = getStoreState(tenantId)
    const url = new URL(request.url)

    const pageNumber = Number(url.searchParams.get("pageNumber") ?? "1")
    const pageSize = Number(url.searchParams.get("pageSize") ?? "20")
    const actorType = url.searchParams.get("actorType")
    const actorQuery = url.searchParams.get("actorQuery")?.trim().toLowerCase() ?? ""
    const action = url.searchParams.get("action")
    const resourceType = url.searchParams.get("resourceType")
    const projectId = url.searchParams.get("projectId")
    const startTimeMs = Number(url.searchParams.get("startTimeMs") ?? "0")
    const endTimeMs = Number(url.searchParams.get("endTimeMs") ?? "0")

    const filtered = state.logs
      .filter((log) => {
        if (actorType && log.actorType !== actorType) {
          return false
        }

        if (actorQuery) {
          const actorName = log.actorName?.toLowerCase() ?? ""
          if (
            !actorName.includes(actorQuery) &&
            !log.actorEmail.toLowerCase().includes(actorQuery)
          ) {
            return false
          }
        }

        if (action && log.action !== action) {
          return false
        }

        if (resourceType && log.resourceType !== resourceType) {
          return false
        }

        if (projectId && log.projectId !== projectId) {
          return false
        }

        if (startTimeMs > 0 && log.happenedAtMs < startTimeMs) {
          return false
        }

        if (endTimeMs > 0 && log.happenedAtMs > endTimeMs) {
          return false
        }

        return true
      })
      .sort((a, b) => b.happenedAtMs - a.happenedAtMs)

    const totalElements = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))
    const safePageNumber = Math.min(Math.max(1, pageNumber), totalPages)
    const start = (safePageNumber - 1) * pageSize
    const end = safePageNumber * pageSize
    const content = filtered.slice(start, end).map(toLogItem)

    const actionOptions = unique(state.logs.map((log) => log.action))
    const resourceTypeOptions = unique(state.logs.map((log) => log.resourceType))

    return HttpResponse.json({
      pageNumber: safePageNumber,
      pageSize,
      totalElements,
      totalPages,
      content,
      projectOptions: state.projectOptions,
      actionOptions,
      resourceTypeOptions,
    })
  }),

  http.get("*/infera-api/tenants/:tenantId/audit/logs/:logId", async ({ params }) => {
    await delay(220)
    const tenantId = params.tenantId as string
    const logId = params.logId as string
    const state = getStoreState(tenantId)
    const detail = state.logs.find((item) => item.logId === logId)

    if (!detail) {
      return HttpResponse.json(
        {
          message: "审计记录不存在",
        },
        {
          status: 404,
        },
      )
    }

    return HttpResponse.json(detail)
  }),
]

mockRegistry.register(...tenantAuditHandlers)
