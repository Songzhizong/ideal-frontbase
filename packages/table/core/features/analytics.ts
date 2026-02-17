import type { AnalyticsFeatureOptions, DataTableFeatureRuntime } from "../types"
import { useStableObject } from "../utils/reference-stability"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

export function useAnalyticsFeature<TData, TFilterSchema>(args: {
  feature: AnalyticsFeatureOptions<TData> | undefined
}): {
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
  const enabled = isFeatureEnabled(args.feature)

  const runtime: DataTableFeatureRuntime<TData, TFilterSchema> = useStableObject({
    patchMeta: () => {
      if (!enabled) return {}
      return {
        dtAnalyticsEnabled: true,
        dtAnalyticsGroupBy: args.feature?.groupBy,
        dtAnalyticsGroupLabel: args.feature?.groupLabel,
        dtAnalyticsSummaryLabel: args.feature?.summary?.label,
        dtAnalyticsSummaryLabelColumnId: args.feature?.summary?.labelColumnId,
        dtAnalyticsSummaryValues: args.feature?.summary?.values,
      }
    },
  })

  return { runtime }
}
