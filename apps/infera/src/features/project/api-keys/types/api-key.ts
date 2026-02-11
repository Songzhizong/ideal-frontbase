export type ApiKeyScope = "inference:invoke" | "metrics:read" | "logs:read" | "audit:read"

export type ApiKeyStatus = "Active" | "Revoked" | "Expired"

export type ApiKeyUsageRange = "24h" | "7d" | "30d"

export interface ApiKeyFilterState {
  q: string
  status: ApiKeyStatus | "All"
  scope: ApiKeyScope | "All"
  expiringSoon: "all" | "yes" | "no"
}

export interface ProjectApiKeySummary {
  apiKeyId: string
  name: string
  scopes: ApiKeyScope[]
  rpmLimit: number | null
  dailyTokenLimit: number | null
  expiresAt: string | null
  status: ApiKeyStatus
  lastUsedAt: string | null
  createdAt: string
  note: string
}

export interface ApiKeyUsagePoint {
  timestamp: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  requests: number
  latencyMs: number
  status2xx: number
  status4xx: number
  status5xx: number
}

export interface ApiKeyUsageTopService {
  serviceId: string
  serviceName: string
  requests: number
  totalTokens: number
  p95LatencyMs: number
  errorRate: number
}

export interface ApiKeyAuditItem {
  auditId: string
  action: string
  actor: string
  happenedAt: string
}

export interface ProjectApiKeyDetail extends ProjectApiKeySummary {
  updatedAt: string
  revokedAt: string | null
  createdBy: string
  usage: ApiKeyUsagePoint[]
  usageTopServices: ApiKeyUsageTopService[]
  audits: ApiKeyAuditItem[]
}

export interface ApiKeyMutationInput {
  tenantId: string
  projectId: string
  apiKeyId: string
}

export interface CreateApiKeyInput {
  tenantId: string
  projectId: string
  name: string
  scopes: ApiKeyScope[]
  expiresAt: string | null
  rpmLimit: number | null
  dailyTokenLimit: number | null
  note: string
}

export interface CreateApiKeyResult {
  apiKey: ProjectApiKeyDetail
  secret: string
}

export interface RotateApiKeyInput extends ApiKeyMutationInput {
  revokeOldKey: boolean
}

export interface RotateApiKeyResult {
  newApiKey: ProjectApiKeyDetail
  secret: string
}

export interface RevokeApiKeyInput extends ApiKeyMutationInput {
  confirmText: string
}
