import { format } from "date-fns"
import type { TenantInvoiceStatus, TenantPaymentMethodStatus } from "../types/tenant-billing"

function getNumberFormatter(options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("zh-CN", options)
}

export function formatCurrency(value: number) {
  return getNumberFormatter({
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatInteger(value: number) {
  return getNumberFormatter({
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatTokenCount(value: number) {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)} 亿`
  }

  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)} 万`
  }

  return formatInteger(value)
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

export function formatDateTime(value: string) {
  return format(new Date(value), "yyyy-MM-dd HH:mm")
}

export function formatDate(value: string) {
  return format(new Date(value), "MM-dd")
}

export function formatBillingPeriod(startAt: string, endAt: string) {
  return `${format(new Date(startAt), "yyyy-MM-dd")} ~ ${format(new Date(endAt), "yyyy-MM-dd")}`
}

export function getInvoiceStatusLabel(status: TenantInvoiceStatus) {
  if (status === "Paid") {
    return "已支付"
  }
  if (status === "Unpaid") {
    return "待支付"
  }
  return "已逾期"
}

export function getPaymentMethodStatusLabel(status: TenantPaymentMethodStatus) {
  if (status === "Active") {
    return "可用"
  }
  if (status === "Expired") {
    return "已过期"
  }
  return "待验证"
}

export function downloadCsv(filename: string, rows: readonly string[][]) {
  const content = rows
    .map((row) =>
      row
        .map((cell) => {
          const escaped = cell.replaceAll('"', '""')
          return `"${escaped}"`
        })
        .join(","),
    )
    .join("\n")

  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = objectUrl
  link.download = filename
  link.click()
  URL.revokeObjectURL(objectUrl)
}
