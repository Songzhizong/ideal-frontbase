export function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("zh-CN", { hour12: false })
}

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return "操作失败，请稍后重试。"
}

export function formatProgress(progress: number) {
  if (!Number.isFinite(progress)) {
    return "0%"
  }
  return `${Math.max(0, Math.min(100, Math.round(progress)))}%`
}
