import { z } from "zod"
import type { ApiKeyFilterState, ProjectApiKeySummary } from "../types"
import {
  cloneApiKeyDetail,
  ensureApiKeysStore,
  isApiKeyExpiringSoon,
  synchronizeApiKeyStatuses,
} from "./api-keys.store"

const ReadParamsSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
})

const FilterSchema = z.object({
  q: z.string(),
  status: z.enum(["All", "Active", "Revoked", "Expired"]),
  scope: z.enum(["All", "inference:invoke", "metrics:read", "logs:read", "audit:read"]),
  expiringSoon: z.enum(["all", "yes", "no"]),
})

function toSummary(apiKey: ReturnType<typeof cloneApiKeyDetail>): ProjectApiKeySummary {
  return {
    apiKeyId: apiKey.apiKeyId,
    name: apiKey.name,
    scopes: [...apiKey.scopes],
    rpmLimit: apiKey.rpmLimit,
    dailyTokenLimit: apiKey.dailyTokenLimit,
    expiresAt: apiKey.expiresAt,
    status: apiKey.status,
    lastUsedAt: apiKey.lastUsedAt,
    createdAt: apiKey.createdAt,
    note: apiKey.note,
  }
}

export async function getProjectApiKeys(
  tenantId: string,
  projectId: string,
  filters: ApiKeyFilterState,
) {
  const params = ReadParamsSchema.parse({ tenantId, projectId })
  const parsedFilters = FilterSchema.parse(filters)
  const currentStore = ensureApiKeysStore(params.tenantId, params.projectId)
  synchronizeApiKeyStatuses(currentStore)

  const keyword = parsedFilters.q.trim().toLowerCase()

  return currentStore.keys
    .filter((apiKey) => {
      if (parsedFilters.status !== "All" && apiKey.status !== parsedFilters.status) {
        return false
      }

      if (parsedFilters.scope !== "All" && !apiKey.scopes.includes(parsedFilters.scope)) {
        return false
      }

      if (parsedFilters.expiringSoon === "yes" && !isApiKeyExpiringSoon(apiKey)) {
        return false
      }

      if (parsedFilters.expiringSoon === "no" && isApiKeyExpiringSoon(apiKey)) {
        return false
      }

      if (!keyword) {
        return true
      }

      const searchable = [apiKey.apiKeyId, apiKey.name, apiKey.scopes.join(" "), apiKey.note]
        .join(" ")
        .toLowerCase()

      return searchable.includes(keyword)
    })
    .map((item) => cloneApiKeyDetail(item))
    .sort((left, right) => {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })
    .map((item) => toSummary(item))
}

export async function getProjectApiKeyDetail(
  tenantId: string,
  projectId: string,
  apiKeyId: string,
) {
  const params = ReadParamsSchema.extend({
    apiKeyId: z.string().trim().min(1),
  }).parse({ tenantId, projectId, apiKeyId })

  const currentStore = ensureApiKeysStore(params.tenantId, params.projectId)
  synchronizeApiKeyStatuses(currentStore)
  const apiKey = currentStore.keys.find((item) => item.apiKeyId === params.apiKeyId)

  if (!apiKey) {
    throw new Error("API Key 不存在")
  }

  return cloneApiKeyDetail(apiKey)
}

export async function getApiKeyScopeOptions(tenantId: string, projectId: string) {
  const params = ReadParamsSchema.parse({ tenantId, projectId })
  return [...ensureApiKeysStore(params.tenantId, params.projectId).scopeOptions]
}
