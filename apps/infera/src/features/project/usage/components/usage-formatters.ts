export function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return "操作失败，请稍后重试。"
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

export function formatCurrency(value: number) {
  return `¥${formatNumber(value, 2)}`
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("zh-CN", { hour12: false })
}

export function formatTrendTick(timestamp: string, granularity: "hour" | "day") {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return timestamp
  }
  if (granularity === "hour") {
    return date.toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit" })
  }
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })
}

function csvEscape(value: string | number) {
  if (typeof value === "number") {
    return String(value)
  }
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>,
) {
  if (typeof window === "undefined") {
    return
  }

  const content = [headers, ...rows]
    .map((row) => row.map((cell) => csvEscape(cell)).join(","))
    .join("\n")

  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.URL.revokeObjectURL(url)
}
