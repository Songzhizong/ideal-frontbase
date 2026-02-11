import {
  formatCurrency as formatCurrencyBase,
  formatDateTime as formatDateTimeBase,
  formatPercent,
} from "./tenant-quotas-budgets-formatters"

export function formatDateTime(value: string) {
  return formatDateTimeBase(value)
}

export function formatCurrency(value: number | null) {
  return formatCurrencyBase(value)
}

export function toPercentLabel(value: number) {
  return formatPercent(value)
}
