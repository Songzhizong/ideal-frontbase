import { type AuditSuccessEvent, api, configureApiClient } from "@/packages/api-core"
import { type ApiError, getApiErrorMessage } from "@/packages/error-core"

function containsProblemToken(error: ApiError, token: string): boolean {
  const source = `${error.problem?.type ?? ""} ${error.problem?.title ?? ""} ${error.problem?.detail ?? ""}`
  return source.toLowerCase().includes(token.toLowerCase())
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getProblemRecordCandidates(error: ApiError) {
  return [error.problem?.data, error.problem?.properties].filter(isRecord)
}

function getStringField(record: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string") {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }

  return null
}

function getNumberField(record: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }
    if (typeof value === "string") {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return null
}

function collectScopeList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  if (typeof value === "string") {
    return value
      .split(/[,\s]+/u)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  return []
}

function getMissingScopes(error: ApiError) {
  const candidates = getProblemRecordCandidates(error)

  for (const candidate of candidates) {
    const scopes = collectScopeList(
      candidate.missing_scopes ??
        candidate.missingScopes ??
        candidate.required_scopes ??
        candidate.requiredScopes ??
        candidate.scopes ??
        candidate.scope,
    )

    if (scopes.length > 0) {
      return scopes
    }
  }

  return []
}

function isServiceInactive(error: ApiError) {
  return containsProblemToken(error, "inactive") || containsProblemToken(error, "scale_to_zero")
}

function parseDependencyList(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter(isRecord)
  }

  if (isRecord(value)) {
    const nested =
      value.dependencies ?? value.dependency_list ?? value.in_use_by ?? value.referenced_by
    if (Array.isArray(nested)) {
      return nested.filter(isRecord)
    }

    if (
      getStringField(value, [
        "service_name",
        "serviceName",
        "resource_name",
        "resourceName",
        "revision_id",
        "revisionId",
      ])
    ) {
      return [value]
    }
  }

  return []
}

function normalizeTrafficWeight(rawWeight: number | null, rawLabel: string | null) {
  if (rawLabel) {
    return rawLabel
  }
  if (rawWeight === null) {
    return null
  }

  const normalized = rawWeight <= 1 ? rawWeight * 100 : rawWeight
  return `${normalized.toFixed(0)}%`
}

export interface ResourceInUseDependency {
  key: string
  serviceName: string
  resourceType: string
  revisionId: string | null
  environment: string | null
  trafficWeight: string | null
  endpoint: string | null
  to: string | null
}

export interface ResourceInUsePayload {
  title: string
  description: string
  dependencies: ResourceInUseDependency[]
}

function toResourceInUseDependency(
  item: Record<string, unknown>,
  index: number,
): ResourceInUseDependency {
  const serviceName =
    getStringField(item, [
      "service_name",
      "serviceName",
      "name",
      "resource_name",
      "resourceName",
    ]) ?? `依赖资源 ${index + 1}`
  const resourceType =
    getStringField(item, ["resource_type", "resourceType", "type", "kind"]) ?? "unknown"
  const revisionId = getStringField(item, [
    "revision_id",
    "revisionId",
    "service_revision_id",
    "serviceRevisionId",
  ])
  const environment = getStringField(item, [
    "env",
    "environment",
    "environment_tag",
    "environmentTag",
  ])
  const endpoint = getStringField(item, ["endpoint", "url"])
  const to = getStringField(item, ["to", "path", "href", "link", "jump_to", "jumpTo"])
  const trafficWeight = normalizeTrafficWeight(
    getNumberField(item, ["traffic_weight", "trafficWeight", "weight"]),
    getStringField(item, ["traffic_weight_label", "trafficWeightLabel"]),
  )

  return {
    key: `${serviceName}-${revisionId ?? index}`,
    serviceName,
    resourceType,
    revisionId,
    environment,
    trafficWeight,
    endpoint,
    to,
  }
}

export function getResourceInUsePayload(error: ApiError): ResourceInUsePayload | null {
  if (error.status !== 409 || !containsProblemToken(error, "resource_in_use")) {
    return null
  }

  const dependencyRecords = getProblemRecordCandidates(error).flatMap((candidate) =>
    parseDependencyList(candidate),
  )
  const dependencies = dependencyRecords.map((item, index) =>
    toResourceInUseDependency(item, index),
  )

  return {
    title: "资源正在被依赖，无法完成当前操作",
    description: "请先处理依赖项后再重试。",
    dependencies,
  }
}

export function getHttpErrorMessage(error: ApiError): string {
  if (error.status === 429) {
    if (error.retryAfterSeconds !== null) {
      return `已触发限流/预算限制，请在 ${error.retryAfterSeconds} 秒后重试。`
    }
    return "已触发限流/预算限制，请稍后重试。"
  }

  if (error.status === 503) {
    if (isServiceInactive(error)) {
      return "服务暂不可用（可能在冷启动或容量不足）。当前服务可能处于 Inactive 状态，Scale-to-Zero 冷启动通常需要 30 秒至 2 分钟。"
    }
    return "服务暂不可用（可能在冷启动或容量不足）。"
  }

  if (error.status === 403) {
    if (containsProblemToken(error, "insufficient_scope")) {
      const missingScopes = getMissingScopes(error)
      if (missingScopes.length > 0) {
        return `当前 API Key 权限不足（缺少 scope：${missingScopes.join("、")}）。`
      }
      return "当前 API Key 权限不足（缺少所需 scope）。"
    }
    return "当前无权限执行该操作。"
  }

  if (error.status === 409) {
    if (containsProblemToken(error, "resource_in_use")) {
      return "资源正在被依赖使用，请先处理依赖后再重试。"
    }
    return "资源状态冲突，请刷新后重试。"
  }

  return getApiErrorMessage(error)
}

export interface ConfigureHttpClientOptions {
  getToken: () => string | null
  getTenantId: () => string | null
  onAuditSuccess?: (event: AuditSuccessEvent) => void
}

export function configureHttpClient(options: ConfigureHttpClientOptions) {
  configureApiClient(options)
}

export type { AuditSuccessEvent as HttpAuditSuccessEvent }
export { api }
