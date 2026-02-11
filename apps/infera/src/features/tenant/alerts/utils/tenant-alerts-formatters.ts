import type {
  TenantAlertOverageAction,
  TenantAlertSeverity,
  TenantAlertStatus,
  TenantAlertType,
} from "../types/tenant-alerts"

const ALERT_TYPE_LABEL_MAP: Readonly<Record<TenantAlertType, string>> = {
  cost: "成本",
  error_rate: "错误率",
  latency: "延迟",
  pending_timeout: "Pending 超时",
  cold_start: "冷启动",
}

const ALERT_STATUS_LABEL_MAP: Readonly<Record<TenantAlertStatus, string>> = {
  Open: "Open",
  Ack: "Ack",
  Resolved: "Resolved",
}

const ALERT_SEVERITY_LABEL_MAP: Readonly<Record<TenantAlertSeverity, string>> = {
  S1: "S1",
  S2: "S2",
  S3: "S3",
}

const ALERT_OVERAGE_ACTION_LABEL_MAP: Readonly<Record<TenantAlertOverageAction, string>> = {
  alert_only: "仅告警",
  block_inference: "阻断推理",
}

export function formatAlertType(type: TenantAlertType) {
  return ALERT_TYPE_LABEL_MAP[type]
}

export function formatAlertStatus(status: TenantAlertStatus) {
  return ALERT_STATUS_LABEL_MAP[status]
}

export function formatAlertSeverity(severity: TenantAlertSeverity) {
  return ALERT_SEVERITY_LABEL_MAP[severity]
}

export function formatOverageAction(action: TenantAlertOverageAction | null) {
  if (!action) {
    return "-"
  }
  return ALERT_OVERAGE_ACTION_LABEL_MAP[action]
}

export function formatNumberWithUnit(value: number, unit: string) {
  if (unit === "%") {
    return `${value.toFixed(2)}%`
  }

  if (unit === "ms") {
    return `${Math.round(value)} ms`
  }

  if (unit === "min") {
    return `${Math.round(value)} 分钟`
  }

  if (unit === "CNY") {
    return `¥${value.toFixed(2)}`
  }

  return `${value}${unit ? ` ${unit}` : ""}`
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleString("zh-CN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function getSeverityBadgeClassName(severity: TenantAlertSeverity) {
  if (severity === "S1") {
    return "border-destructive/20 bg-destructive/10 text-destructive"
  }

  if (severity === "S2") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-500"
  }

  return "border-sky-500/20 bg-sky-500/10 text-sky-500"
}

export function getStatusBadgeClassName(status: TenantAlertStatus) {
  if (status === "Open") {
    return "border-destructive/20 bg-destructive/10 text-destructive"
  }

  if (status === "Ack") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-500"
  }

  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
}
