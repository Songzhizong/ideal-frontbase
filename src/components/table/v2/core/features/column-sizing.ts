import type { ColumnSizingState, OnChangeFn } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import type {
  ColumnSizingFeatureOptions,
  DataTableActions,
  DataTableActivity,
  DataTableFeatureRuntime,
  PreferenceEnvelope,
} from "../types"
import {
  applyPreferenceMigrations,
  createJsonLocalStoragePreferenceStorage,
  mergeRecordPreference,
} from "../utils/preference-storage"
import { useStableCallback, useStableObject } from "../utils/reference-stability"

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

function shallowEqualSizing(a: ColumnSizingState, b: ColumnSizingState): boolean {
  if (a === b) return true
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (!Object.hasOwn(b, key)) return false
    if (!Object.is(a[key], b[key])) return false
  }
  return true
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
      const base =
        typeof overrideValue === "number" && Number.isFinite(overrideValue) && overrideValue > 0
          ? overrideValue
          : typeof column.size === "number" && Number.isFinite(column.size) && column.size > 0
            ? column.size
            : 150
      next[column.id] = base
    }
    return next
  }, [args.columns, args.feature?.defaultSizing])

  const storage = useMemo(() => {
    if (!enabled) return args.feature?.storage
    if (args.feature?.storage) return args.feature.storage
    return createJsonLocalStoragePreferenceStorage<Record<string, number>>({
      schemaVersion,
      parse: parseSizingRecord,
    })
  }, [enabled, args.feature?.storage, schemaVersion])

  const [preferencesReady, setPreferencesReady] = useState(
    () => !enabled || Boolean(storage?.getSync),
  )

  const [envelope, setEnvelope] = useState<PreferenceEnvelope<Record<string, number>> | null>(
    () => {
      if (!enabled) return null
      if (!storage?.getSync) return null
      return storage.getSync(storageKey)
    },
  )

  useEffect(() => {
    if (!enabled) return
    if (!storage) return
    if (storage.getSync) {
      setPreferencesReady(true)
      setEnvelope(storage.getSync(storageKey))
      return
    }

    let cancelled = false
    setPreferencesReady(false)
    void storage
      .get(storageKey)
      .then((value) => {
        if (cancelled) return
        setEnvelope(value)
        setPreferencesReady(true)
      })
      .catch(() => {
        if (cancelled) return
        setEnvelope(null)
        setPreferencesReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, storageKey, storage])

  const mergedSizing = useMemo<ColumnSizingState>(() => {
    if (!enabled) return {}
    const migratedEnvelope = envelope
      ? applyPreferenceMigrations({
          envelope,
          schemaVersion,
          ctx: { columnIds },
          ...(args.feature?.migrate ? { migrate: args.feature.migrate } : {}),
        })
      : null
    const merged = mergeRecordPreference({
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
    return merged
  }, [enabled, envelope, schemaVersion, columnIds, args.feature?.migrate, defaults, constraints])

  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => mergedSizing)

  useEffect(() => {
    if (!enabled) return
    setColumnSizing((prev) => (shallowEqualSizing(prev, mergedSizing) ? prev : mergedSizing))
  }, [enabled, mergedSizing])

  const persist = useStableCallback(async (nextSizing: ColumnSizingState) => {
    if (!enabled) return
    if (!storage) return
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
    const nextEnvelope: PreferenceEnvelope<Record<string, number>> = {
      schemaVersion,
      updatedAt: Date.now(),
      value: merged,
    }
    setEnvelope(nextEnvelope)
    await storage.set(storageKey, nextEnvelope)
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
    setEnvelope(null)
    if (!storage) return
    if (storage.remove) {
      void storage.remove(storageKey)
      return
    }
    void persist(defaults)
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
