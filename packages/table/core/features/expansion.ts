import type { ExpandedState } from "@tanstack/react-table"
import { getExpandedRowModel } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import type { DataTableActions, DataTableFeatureRuntime, ExpansionFeatureOptions } from "../types"
import { useStableCallback, useStableObject } from "../utils/reference-stability"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

export function useExpansionFeature<TData, TFilterSchema>(args: {
  feature: ExpansionFeatureOptions<TData> | undefined
}): {
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
  const enabled = isFeatureEnabled(args.feature)
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const expandRow = useStableCallback((rowId: string) => {
    if (!enabled) return
    setExpanded((prev) => ({ ...(prev === true ? {} : prev), [rowId]: true }))
  })

  const collapseRow = useStableCallback((rowId: string) => {
    if (!enabled) return
    setExpanded((prev) => {
      if (prev === true) return {}
      const next = { ...prev }
      delete next[rowId]
      return next
    })
  })

  const toggleRowExpanded = useStableCallback((rowId: string) => {
    if (!enabled) return
    setExpanded((prev) => {
      if (prev === true) return {}
      const next = { ...prev }
      next[rowId] = !next[rowId]
      if (!next[rowId]) {
        delete next[rowId]
      }
      return next
    })
  })

  const expandAll = useStableCallback(() => {
    if (!enabled) return
    setExpanded(true)
  })

  const collapseAll = useStableCallback(() => {
    if (!enabled) return
    setExpanded({})
  })

  const expandToDepth = useStableCallback((depth: number) => {
    if (!enabled) return
    if (depth <= 0) {
      collapseAll()
      return
    }
    expandAll()
  })

  const runtime: DataTableFeatureRuntime<TData, TFilterSchema> = useStableObject(
    useMemo(
      () => ({
        patchTableOptions: () => {
          if (!enabled) return {}
          return {
            enableExpanding: true,
            getExpandedRowModel: getExpandedRowModel(),
            ...(args.feature?.getRowCanExpand
              ? { getRowCanExpand: args.feature.getRowCanExpand }
              : {}),
            state: {
              expanded,
            },
            onExpandedChange: setExpanded,
          }
        },
        patchActions: (_actions: DataTableActions) => {
          if (!enabled) return {}
          return {
            expandRow,
            collapseRow,
            toggleRowExpanded,
            expandAll,
            collapseAll,
            expandToDepth,
          }
        },
        onReset: () => {
          if (!enabled) return
          collapseAll()
        },
      }),
      [
        enabled,
        args.feature?.getRowCanExpand,
        expanded,
        expandRow,
        collapseRow,
        toggleRowExpanded,
        expandAll,
        collapseAll,
        expandToDepth,
      ],
    ),
  )

  return { runtime }
}
