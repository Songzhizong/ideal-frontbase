import type { TenantOverviewRange } from "../types/tenant-overview"

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 2,
})

const compactCurrencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  notation: "compact",
  maximumFractionDigits: 1,
})

const integerFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
})

const compactNumberFormatter = new Intl.NumberFormat("zh-CN", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const shortDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
})

const longDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

function toValidDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatCurrency(value: number | null) {
  if (value === null) {
    return "—"
  }

  return currencyFormatter.format(value)
}

export function formatCompactCurrency(value: number) {
  return compactCurrencyFormatter.format(value)
}

export function formatInteger(value: number) {
  return integerFormatter.format(value)
}

export function formatTokenCount(value: number) {
  if (Math.abs(value) >= 10000) {
    return compactNumberFormatter.format(value)
  }

  return integerFormatter.format(value)
}

export function formatTrendDateLabel(dateIso: string, range: TenantOverviewRange) {
  const date = toValidDate(dateIso)
  if (!date) {
    return dateIso
  }

  return range === "30d" ? longDateFormatter.format(date) : shortDateFormatter.format(date)
}

export function formatDateTime(dateIso: string) {
  const date = toValidDate(dateIso)
  if (!date) {
    return dateIso
  }

  return dateTimeFormatter.format(date)
}
