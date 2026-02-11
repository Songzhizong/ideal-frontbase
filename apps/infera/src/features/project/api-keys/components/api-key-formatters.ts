import type { ApiKeyScope, ApiKeyStatus, ApiKeyUsagePoint, ApiKeyUsageRange } from "../types"

const SCOPE_LABEL_MAP: Record<ApiKeyScope, string> = {
  "inference:invoke": "推理调用",
  "metrics:read": "指标读取",
  "logs:read": "日志读取",
  "audit:read": "审计读取",
}

const RANGE_HOURS: Record<ApiKeyUsageRange, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
}

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return "操作失败，请稍后重试。"
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "-"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("zh-CN", { hour12: false })
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })
}

export function formatPercent(value: number, maximumFractionDigits = 2) {
  return `${formatNumber(value, maximumFractionDigits)}%`
}

export function formatLimit(limit: number | null) {
  if (limit === null) {
    return "不限"
  }
  return formatNumber(limit, 0)
}

export function formatScopeLabel(scope: ApiKeyScope) {
  return SCOPE_LABEL_MAP[scope]
}

export function getApiKeyStatusBadgeClassName(status: ApiKeyStatus) {
  if (status === "Active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }
  if (status === "Revoked") {
    return "border-destructive/30 bg-destructive/10 text-destructive"
  }
  return "border-amber-200 bg-amber-50 text-amber-700"
}

export function getApiKeyStatusText(status: ApiKeyStatus) {
  if (status === "Active") {
    return "Active"
  }
  if (status === "Revoked") {
    return "Revoked"
  }
  return "Expired"
}

export function sliceUsageByRange(points: ApiKeyUsagePoint[], range: ApiKeyUsageRange) {
  const maxHours = RANGE_HOURS[range]
  if (points.length <= maxHours) {
    return points
  }
  return points.slice(-maxHours)
}

export function downloadTextFile(filename: string, content: string) {
  if (typeof window === "undefined") {
    return
  }
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.URL.revokeObjectURL(url)
}
