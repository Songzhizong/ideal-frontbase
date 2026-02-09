import type { DataTableFeatureRuntime, VirtualizationFeatureOptions } from "../types"
import { useStableObject } from "../utils/reference-stability"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

export function useVirtualizationFeature<TData, TFilterSchema>(args: {
  feature: VirtualizationFeatureOptions | undefined
}): {
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
  const enabled = isFeatureEnabled(args.feature)
  const mode = args.feature?.mode === "infinite" ? "infinite" : "windowed"
  const rowHeight =
    typeof args.feature?.rowHeight === "number" && Number.isFinite(args.feature.rowHeight)
      ? Math.max(24, args.feature.rowHeight)
      : 44
  const overscan =
    typeof args.feature?.overscan === "number" && Number.isFinite(args.feature.overscan)
      ? Math.max(0, Math.floor(args.feature.overscan))
      : 6
  const loadMoreOffset =
    typeof args.feature?.loadMoreOffset === "number" && Number.isFinite(args.feature.loadMoreOffset)
      ? Math.max(0, args.feature.loadMoreOffset)
      : rowHeight * 4

  const runtime: DataTableFeatureRuntime<TData, TFilterSchema> = useStableObject({
    patchMeta: () => {
      if (!enabled) return {}
      return {
        dtVirtualizationEnabled: true,
        dtVirtualizationMode: mode,
        dtVirtualizationRowHeight: rowHeight,
        dtVirtualizationOverscan: overscan,
        dtVirtualizationLoadMore: args.feature?.loadMore,
        dtVirtualizationLoadMoreOffset: loadMoreOffset,
      }
    },
  })

  return { runtime }
}
