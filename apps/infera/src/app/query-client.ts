import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getHttpErrorMessage, getResourceInUsePayload } from "@/features/core/api/http-client"
import { showResourceInUseDialog } from "@/features/core/api/resource-in-use-dialog"
import { isApiError, isUnauthorizedError } from "@/packages/error-core"

type OnUnauthorizedFn = () => void

let onUnauthorized: OnUnauthorizedFn = () => {}
const RATE_LIMIT_TOAST_ID = "infera-rate-limit-countdown"
let rateLimitCountdownTimer: ReturnType<typeof setInterval> | null = null
let rateLimitDeadline = 0

export function configureQueryClient(options: { onUnauthorized: OnUnauthorizedFn }) {
  onUnauthorized = options.onUnauthorized
}

function stopRateLimitCountdown() {
  if (rateLimitCountdownTimer !== null) {
    clearInterval(rateLimitCountdownTimer)
    rateLimitCountdownTimer = null
  }
  rateLimitDeadline = 0
}

function getRateLimitRemainingSeconds() {
  if (rateLimitDeadline <= 0) {
    return 0
  }

  return Math.max(0, Math.ceil((rateLimitDeadline - Date.now()) / 1000))
}

function renderRateLimitToast() {
  const remaining = getRateLimitRemainingSeconds()

  if (remaining <= 0) {
    toast.success("限流窗口已结束，可重新尝试。", {
      id: RATE_LIMIT_TOAST_ID,
      duration: 3000,
    })
    stopRateLimitCountdown()
    return
  }

  toast.error(`已触发限流/预算限制，请在 ${remaining} 秒后重试。`, {
    id: RATE_LIMIT_TOAST_ID,
    duration: 1500,
  })
}

function startRateLimitCountdown(retryAfterSeconds: number) {
  const nextDeadline = Date.now() + retryAfterSeconds * 1000
  if (nextDeadline > rateLimitDeadline) {
    rateLimitDeadline = nextDeadline
  }

  renderRateLimitToast()

  if (rateLimitCountdownTimer !== null) {
    return
  }

  rateLimitCountdownTimer = setInterval(() => {
    renderRateLimitToast()
  }, 1000)
}

/**
 * 统一处理 API 错误（命令式调用 / 非 React Query 场景可复用）
 * @returns 是否已识别并处理该错误
 */
export function handleApiError(error: unknown): boolean {
  if (!isApiError(error)) return false

  if (isUnauthorizedError(error)) {
    onUnauthorized()
    return true
  }

  if (error.status === 429 && error.retryAfterSeconds !== null && error.retryAfterSeconds > 0) {
    startRateLimitCountdown(error.retryAfterSeconds)
    return true
  }

  const resourceInUsePayload = getResourceInUsePayload(error)
  if (resourceInUsePayload) {
    showResourceInUseDialog(resourceInUsePayload)
    return true
  }

  toast.error(getHttpErrorMessage(error))
  return true
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 300_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
