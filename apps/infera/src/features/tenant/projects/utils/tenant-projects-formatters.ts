import type { TenantProjectCostRange } from "../types/tenant-projects"

const CURRENCY_FORMATTER = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 2,
})

const TOKEN_FORMATTER = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export const TENANT_PROJECT_COST_RANGE_OPTIONS: ReadonlyArray<{
  value: TenantProjectCostRange
  label: string
}> = [
  {
    value: "lt_1000",
    label: "< ¥1,000",
  },
  {
    value: "between_1000_5000",
    label: "¥1,000 - ¥5,000",
  },
  {
    value: "between_5000_20000",
    label: "¥5,000 - ¥20,000",
  },
  {
    value: "gte_20000",
    label: ">= ¥20,000",
  },
]

export function formatCurrency(value: number) {
  return CURRENCY_FORMATTER.format(value)
}

export function formatTokenCount(value: number) {
  return TOKEN_FORMATTER.format(value)
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "--"
  }

  return DATE_TIME_FORMATTER.format(date)
}

export function normalizeProjectName(value: string) {
  return value.trim().toLowerCase()
}

export function buildProjectIdFromName(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  if (normalized.length === 0) {
    return "project-new"
  }

  return `project-${normalized}`
}
