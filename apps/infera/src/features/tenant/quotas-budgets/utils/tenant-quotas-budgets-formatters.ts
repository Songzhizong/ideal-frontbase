import type {
  TenantBudgetOverageAction,
  TenantPolicyHistoryType,
} from "../types/tenant-quotas-budgets"

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})

const NUMBER_FORMATTER = new Intl.NumberFormat("zh-CN")
const CURRENCY_FORMATTER = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatDateTime(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) {
    return "--"
  }
  return DATE_TIME_FORMATTER.format(date)
}

export function formatNullableNumber(value: number | null) {
  if (value === null) {
    return "未限制"
  }

  return NUMBER_FORMATTER.format(value)
}

export function formatCurrency(value: number | null) {
  if (value === null) {
    return "未设置"
  }

  return CURRENCY_FORMATTER.format(value)
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

export function parseNullableNumberInput(rawValue: string) {
  const trimmed = rawValue.trim()
  if (trimmed.length === 0) {
    return null
  }

  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

export function getOverageActionLabel(action: TenantBudgetOverageAction) {
  if (action === "block_inference") {
    return "阻断推理"
  }

  return "仅告警"
}

export function getPolicyTypeLabel(type: TenantPolicyHistoryType) {
  if (type === "quotas") {
    return "配额"
  }

  return "预算"
}
