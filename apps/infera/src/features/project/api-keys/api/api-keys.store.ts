import type { ApiKeyScope, ApiKeyStatus, ProjectApiKeyDetail } from "../types"
import { createApiKeySeeds } from "./api-keys.seed"

interface ApiKeysStore {
  keys: ProjectApiKeyDetail[]
  scopeOptions: ApiKeyScope[]
}

const store = new Map<string, ApiKeysStore>()

function getStoreKey(tenantId: string, projectId: string) {
  return `${tenantId}:${projectId}`
}

function cloneAuditItems(audits: ProjectApiKeyDetail["audits"]) {
  return audits.map((item) => ({ ...item }))
}

function cloneUsagePoints(points: ProjectApiKeyDetail["usage"]) {
  return points.map((item) => ({ ...item }))
}

function cloneUsageTopServices(rows: ProjectApiKeyDetail["usageTopServices"]) {
  return rows.map((item) => ({ ...item }))
}

export function cloneApiKeyDetail(apiKey: ProjectApiKeyDetail): ProjectApiKeyDetail {
  return {
    ...apiKey,
    scopes: [...apiKey.scopes],
    usage: cloneUsagePoints(apiKey.usage),
    usageTopServices: cloneUsageTopServices(apiKey.usageTopServices),
    audits: cloneAuditItems(apiKey.audits),
  }
}

function resolveApiKeyStatus(apiKey: ProjectApiKeyDetail): ApiKeyStatus {
  if (apiKey.revokedAt) {
    return "Revoked"
  }
  if (apiKey.expiresAt) {
    const expiresAt = new Date(apiKey.expiresAt)
    if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= Date.now()) {
      return "Expired"
    }
  }
  return "Active"
}

export function synchronizeApiKeyStatuses(currentStore: ApiKeysStore) {
  currentStore.keys.forEach((item) => {
    item.status = resolveApiKeyStatus(item)
  })
}

export function ensureApiKeysStore(tenantId: string, projectId: string) {
  const key = getStoreKey(tenantId, projectId)
  const existing = store.get(key)
  if (existing) {
    synchronizeApiKeyStatuses(existing)
    return existing
  }

  const seed = createApiKeySeeds(projectId)
  store.set(key, seed)
  synchronizeApiKeyStatuses(seed)
  return seed
}

export function appendApiKeyAudit(apiKey: ProjectApiKeyDetail, action: string) {
  apiKey.audits.unshift({
    auditId: `audit-${Math.random().toString(36).slice(2, 10)}`,
    action,
    actor: "current.user@mock.ai",
    happenedAt: new Date().toISOString(),
  })
}

export function isApiKeyExpiringSoon(apiKey: ProjectApiKeyDetail, days = 7) {
  if (!apiKey.expiresAt) {
    return false
  }
  const expiresAt = new Date(apiKey.expiresAt)
  if (Number.isNaN(expiresAt.getTime())) {
    return false
  }
  const now = Date.now()
  const diff = expiresAt.getTime() - now
  const threshold = days * 24 * 60 * 60 * 1000
  return diff > 0 && diff <= threshold
}

export function generateApiKeyId() {
  return `ak-${Math.random().toString(36).slice(2, 10)}`
}

export function generateApiSecret() {
  return `infera_sk_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}
