import { format, formatDistanceToNow, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import type { ProjectAlertSeverity, ProjectDeploymentResult } from "../types/project-dashboard"

const CURRENCY_FORMATTER = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const INTEGER_FORMATTER = new Intl.NumberFormat("zh-CN")

const COMPACT_INTEGER_FORMATTER = new Intl.NumberFormat("zh-CN", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const ALERT_SEVERITY_CLASSNAME_MAP: Readonly<Record<ProjectAlertSeverity, string>> = {
  Critical: "border-destructive/30 bg-destructive/10 text-destructive",
  High: "border-error/30 bg-error-subtle text-error-on-subtle",
  Medium: "border-warning/30 bg-warning-subtle text-warning-on-subtle",
  Low: "border-info/30 bg-info-subtle text-info-on-subtle",
}

export function formatCurrency(value: number) {
  return CURRENCY_FORMATTER.format(value)
}

export function formatInteger(value: number) {
  return INTEGER_FORMATTER.format(value)
}

export function formatCompactInteger(value: number) {
  return COMPACT_INTEGER_FORMATTER.format(value)
}

export function formatErrorRate(value: number) {
  return `${value.toFixed(2)}%`
}

export function formatDateTime(dateValue: string) {
  return format(parseISO(dateValue), "MM-dd HH:mm")
}

export function formatRelativeTime(dateValue: string) {
  const date = parseISO(dateValue)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) {
    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN })
  }

  return format(date, "HH:mm")
}

export function getAlertSeverityClassName(severity: ProjectAlertSeverity) {
  return ALERT_SEVERITY_CLASSNAME_MAP[severity]
}

export function formatAlertSeverity(severity: ProjectAlertSeverity) {
  switch (severity) {
    case "Critical":
      return "Critical"
    case "High":
      return "High"
    case "Medium":
      return "Medium"
    case "Low":
      return "Low"
    default:
      return "Unknown"
  }
}

export function getDeploymentResultLabel(result: ProjectDeploymentResult) {
  switch (result) {
    case "Succeeded":
      return "发布成功"
    case "Failed":
      return "发布失败"
    case "RollingBack":
      return "回滚中"
    default:
      return "未知"
  }
}
