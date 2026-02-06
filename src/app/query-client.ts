import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getApiErrorMessage, isApiError, isUnauthorizedError } from "@/lib/api-error"

type OnUnauthorizedFn = () => void

let onUnauthorized: OnUnauthorizedFn = () => {}

export function configureQueryClient(options: { onUnauthorized: OnUnauthorizedFn }) {
  onUnauthorized = options.onUnauthorized
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

  toast.error(getApiErrorMessage(error))
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
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
