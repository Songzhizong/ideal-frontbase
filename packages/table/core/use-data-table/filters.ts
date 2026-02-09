import type { TableFilters, TableStateAdapter } from "../types"
import { useStableCallback, useStableObject } from "../utils/reference-stability"

export function useTableFilters<TFilterSchema>(args: {
  adapter: TableStateAdapter<TFilterSchema>
  snapshotFilters: TFilterSchema
  initialFilters: TFilterSchema
}): TableFilters<TFilterSchema> {
  const setFilter = useStableCallback(
    <K extends keyof TFilterSchema>(key: K, value: TFilterSchema[K]) => {
      const next = args.adapter.getSnapshot()
      args.adapter.setSnapshot(
        {
          ...next,
          filters: {
            ...next.filters,
            [key]: value,
          },
        },
        "filters",
      )
    },
  )

  const setBatch = useStableCallback((updates: Partial<TFilterSchema>) => {
    const next = args.adapter.getSnapshot()
    args.adapter.setSnapshot(
      {
        ...next,
        filters: {
          ...next.filters,
          ...updates,
        },
      },
      "filters",
    )
  })

  const resetFilters = useStableCallback(() => {
    const next = args.adapter.getSnapshot()
    args.adapter.setSnapshot(
      {
        ...next,
        filters: args.initialFilters,
      },
      "filters",
    )
  })

  return useStableObject({
    state: args.snapshotFilters,
    set: setFilter,
    setBatch,
    reset: resetFilters,
  })
}
