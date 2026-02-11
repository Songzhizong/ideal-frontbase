export function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return "操作失败，请稍后重试。"
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("zh-CN", { hour12: false })
}

export function formatNumber(value: number, fractionDigits = 2) {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  })
}

export function formatPercent(value: number, fractionDigits = 2) {
  return `${formatNumber(value, fractionDigits)}%`
}

export function buildTrafficSummary(
  traffic: readonly {
    revisionId: string
    weight: number
  }[],
) {
  if (traffic.length === 0) {
    return "暂无流量"
  }
  return traffic.map((item) => `${item.revisionId} ${formatPercent(item.weight, 0)}`).join(" · ")
}

export function csvEscape(value: string | number) {
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

  const blob = new Blob([content], {
    type: "text/csv;charset=utf-8",
  })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.URL.revokeObjectURL(url)
}

export function isCidrFormat(value: string) {
  return /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(value.trim())
}
