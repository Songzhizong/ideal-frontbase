import type { ColumnSizingState, OnChangeFn } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import type {
  ColumnSizingFeatureOptions,
  DataTableActions,
  DataTableActivity,
  DataTableFeatureRuntime,
} from "../types"
import { applyPreferenceMigrations, mergeRecordPreference } from "../utils/preference-storage"
import { shallowEqual, useStableCallback, useStableObject } from "../utils/reference-stability"
import { usePreference } from "../utils/use-preference"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseSizingRecord(value: unknown): Record<string, number> | null {
  if (!isRecord(value)) return null
  const next: Record<string, number> = {}
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== "number") continue
    if (!Number.isFinite(item) || item <= 0) continue
    next[key] = item
  }
  return next
}

export function useColumnSizingFeature<TData, TFilterSchema>(args: {
  feature: ColumnSizingFeatureOptions | undefined
  columns: Array<{
    id: string
    size: number | undefined
    minSize: number | undefined
    maxSize: number | undefined
  }>
}): {
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
  const enabled = isFeatureEnabled(args.feature)
  const storageKey = args.feature?.storageKey ?? ""
  const persistenceEnabled = enabled && storageKey.trim() !== ""
  const schemaVersion = args.feature?.schemaVersion ?? 1
  const columnIds = useMemo(() => args.columns.map((column) => column.id), [args.columns])

  const constraints = useMemo(() => {
    const next: Record<string, { min?: number; max?: number }> = {}
    for (const column of args.columns) {
      const constraint: { min?: number; max?: number } = {}
      if (typeof column.minSize === "number" && Number.isFinite(column.minSize)) {
        constraint.min = column.minSize
      }
      if (typeof column.maxSize === "number" && Number.isFinite(column.maxSize)) {
        constraint.max = column.maxSize
      }
      next[column.id] = constraint
    }
    return next
  }, [args.columns])

  const defaults = useMemo<Record<string, number>>(() => {
    const next: Record<string, number> = {}
    const overrides = args.feature?.defaultSizing
    for (const column of args.columns) {
      const overrideValue = overrides?.[column.id]
      next[column.id] =
        typeof overrideValue === "number" && Number.isFinite(overrideValue) && overrideValue > 0
          ? overrideValue
          : typeof column.size === "number" && Number.isFinite(column.size) && column.size > 0
            ? column.size
            : 150
    }
    return next
  }, [args.columns, args.feature?.defaultSizing])

  const {
    envelope,
    preferencesReady,
    storage,
    persist: persistEnvelope,
    remove: removeStorage,
  } = usePreference({
    enabled: persistenceEnabled,
    storageKey,
    schemaVersion,
    storage: args.feature?.storage,
    parse: parseSizingRecord,
  })

  const mergedSizing = useMemo<ColumnSizingState>(() => {
    if (!enabled) return {}
    if (!persistenceEnabled) return defaults
    const migratedEnvelope = envelope
      ? applyPreferenceMigrations({
          envelope,
          schemaVersion,
          ctx: { columnIds },
          ...(args.feature?.migrate ? { migrate: args.feature.migrate } : {}),
        })
      : null
    return mergeRecordPreference({
      stored: migratedEnvelope?.value ?? envelope?.value ?? null,
      defaults,
      ctx: { columnIds },
      normalize: ({ columnId, value, defaultValue }) => {
        const constraint = constraints[columnId]
        const numeric =
          typeof value === "number" && Number.isFinite(value) && value > 0 ? value : defaultValue
        const min = constraint?.min
        const max = constraint?.max
        if (typeof min === "number" && Number.isFinite(min)) {
          if (numeric < min) return min
        }
        if (typeof max === "number" && Number.isFinite(max)) {
          if (numeric > max) return max
        }
        return numeric
      },
    })
  }, [
    enabled,
    persistenceEnabled,
    envelope,
    schemaVersion,
    columnIds,
    args.feature?.migrate,
    defaults,
    constraints,
  ])

  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => mergedSizing)

  useEffect(() => {
    if (!enabled) return
    setColumnSizing((prev) =>
      shallowEqual(prev as Record<string, unknown>, mergedSizing as Record<string, unknown>)
        ? prev
        : mergedSizing,
    )
  }, [enabled, mergedSizing])

  const persist = useStableCallback(async (nextSizing: ColumnSizingState) => {
    if (!persistenceEnabled) return
    const merged = mergeRecordPreference({
      stored: nextSizing,
      defaults,
      ctx: { columnIds },
      normalize: ({ columnId, value, defaultValue }) => {
        const constraint = constraints[columnId]
        const numeric =
          typeof value === "number" && Number.isFinite(value) && value > 0 ? value : defaultValue
        const min = constraint?.min
        const max = constraint?.max
        if (typeof min === "number" && Number.isFinite(min)) {
          if (numeric < min) return min
        }
        if (typeof max === "number" && Number.isFinite(max)) {
          if (numeric > max) return max
        }
        return numeric
      },
    })
    await persistEnvelope(merged)
  })

  const onColumnSizingChange: OnChangeFn<ColumnSizingState> = useStableCallback((updater) => {
    if (!enabled) return
    setColumnSizing((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      void persist(next)
      return next
    })
  })

  const resetColumnSizing = useStableCallback(() => {
    if (!enabled) return
    setColumnSizing(defaults)
    if (!persistenceEnabled) return
    void removeStorage().then(() => {
      if (!storage?.remove) {
        void persist(defaults)
      }
    })
  })

  const runtime: DataTableFeatureRuntime<TData, TFilterSchema> = useStableObject({
    patchTableOptions: () => {
      if (!enabled) return {}
      return {
        enableColumnResizing: true,
        columnResizeMode: "onChange",
        state: {
          columnSizing,
        },
        onColumnSizingChange,
      }
    },
    patchActions: (_actions: DataTableActions) => {
      if (!enabled) return {}
      return {
        resetColumnSizing,
      }
    },
    patchActivity: (activity: DataTableActivity) => {
      if (!enabled) return {}
      return {
        preferencesReady: activity.preferencesReady && preferencesReady,
      }
    },
    onReset: () => {
      if (!enabled) return
      resetColumnSizing()
    },
  })

  return { runtime }
}
