import type {
  ApiKeyScope,
  ApiKeyStatus,
  ApiKeyUsagePoint,
  ApiKeyUsageTopService,
  ProjectApiKeyDetail,
} from "../types"

interface ApiKeySeedStore {
  scopeOptions: ApiKeyScope[]
  keys: ProjectApiKeyDetail[]
}

const DEFAULT_SCOPES: ApiKeyScope[] = [
  "inference:invoke",
  "metrics:read",
  "logs:read",
  "audit:read",
]

function toIsoFromNow(hoursAgo: number) {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
}

export function buildApiKeyUsageSeries(seed: number): ApiKeyUsagePoint[] {
  return Array.from({ length: 72 }, (_, index) => {
    const hoursAgo = 71 - index
    const requests = 24 + ((seed * 17 + index * 9) % 42)
    const status4xx = index % 12 === 0 ? 3 : 1 + ((seed + index) % 2)
    const status5xx = index % 18 === 0 ? 1 : 0
    const status2xx = Math.max(0, requests - status4xx - status5xx)
    const promptTokens = requests * (48 + ((seed + index) % 26))
    const completionTokens = requests * (82 + ((seed * 2 + index) % 44))

    return {
      timestamp: toIsoFromNow(hoursAgo),
      requests,
      status2xx,
      status4xx,
      status5xx,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      latencyMs: 42 + ((seed * 11 + index * 7) % 61),
    }
  })
}

export function buildApiKeyUsageTopServices(seed: number): ApiKeyUsageTopService[] {
  const services = [
    {
      serviceId: "svc-chat-gateway",
      serviceName: "chat-gateway",
    },
    {
      serviceId: "svc-rag-router",
      serviceName: "rag-router",
    },
    {
      serviceId: "svc-embed-worker",
      serviceName: "embed-worker",
    },
  ]

  return services.map((service, index) => {
    const requests = 1280 + seed * 23 - index * 210
    const totalTokens = requests * (132 + index * 16)
    const errorRate = 0.7 + index * 0.5 + ((seed + index) % 4) * 0.15

    return {
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      requests,
      totalTokens,
      p95LatencyMs: 52 + index * 10,
      errorRate,
    }
  })
}

function createAudit(action: string, happenedAt: string) {
  return {
    auditId: `audit-${Math.random().toString(36).slice(2, 10)}`,
    action,
    actor: "current.user@mock.ai",
    happenedAt,
  }
}

function createSeedKey(input: {
  apiKeyId: string
  name: string
  scopes: ApiKeyScope[]
  status: ApiKeyStatus
  createdAt: string
  updatedAt: string
  expiresAt: string | null
  revokedAt: string | null
  lastUsedAt: string | null
  rpmLimit: number | null
  dailyTokenLimit: number | null
  note: string
  usageSeed: number
}): ProjectApiKeyDetail {
  return {
    apiKeyId: input.apiKeyId,
    name: input.name,
    scopes: input.scopes,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    expiresAt: input.expiresAt,
    revokedAt: input.revokedAt,
    lastUsedAt: input.lastUsedAt,
    rpmLimit: input.rpmLimit,
    dailyTokenLimit: input.dailyTokenLimit,
    note: input.note,
    createdBy: "owner@infera.mock",
    usage: buildApiKeyUsageSeries(input.usageSeed),
    usageTopServices: buildApiKeyUsageTopServices(input.usageSeed),
    audits: [
      createAudit("project.api_key.create", input.createdAt),
      createAudit("project.api_key.update", input.updatedAt),
    ],
  }
}

export function createApiKeySeeds(projectId: string): ApiKeySeedStore {
  const now = Date.now()

  return {
    scopeOptions: DEFAULT_SCOPES,
    keys: [
      createSeedKey({
        apiKeyId: `ak-${projectId.slice(0, 6)}-chat`,
        name: "chat-gateway-prod",
        scopes: ["inference:invoke", "metrics:read"],
        status: "Active",
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 36).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 60).toISOString(),
        revokedAt: null,
        lastUsedAt: new Date(now - 1000 * 60 * 11).toISOString(),
        rpmLimit: 1800,
        dailyTokenLimit: 9_000_000,
        note: "生产流量主 Key",
        usageSeed: 7,
      }),
      createSeedKey({
        apiKeyId: `ak-${projectId.slice(0, 6)}-eval`,
        name: "eval-batch-runner",
        scopes: ["inference:invoke", "metrics:read", "logs:read"],
        status: "Active",
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 15).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
        expiresAt: null,
        revokedAt: null,
        lastUsedAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
        rpmLimit: null,
        dailyTokenLimit: 5_000_000,
        note: "评估任务批处理",
        usageSeed: 11,
      }),
      createSeedKey({
        apiKeyId: `ak-${projectId.slice(0, 6)}-legacy`,
        name: "legacy-client",
        scopes: ["inference:invoke"],
        status: "Revoked",
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 80).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
        expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 45).toISOString(),
        revokedAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
        lastUsedAt: new Date(now - 1000 * 60 * 60 * 24 * 8).toISOString(),
        rpmLimit: 600,
        dailyTokenLimit: 1_000_000,
        note: "历史客户端，已完成迁移",
        usageSeed: 4,
      }),
      createSeedKey({
        apiKeyId: `ak-${projectId.slice(0, 6)}-expired`,
        name: "temporary-debug",
        scopes: ["inference:invoke", "logs:read"],
        status: "Expired",
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 24).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
        expiresAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        revokedAt: null,
        lastUsedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        rpmLimit: 300,
        dailyTokenLimit: 400_000,
        note: "临时联调 Key",
        usageSeed: 18,
      }),
    ],
  }
}
