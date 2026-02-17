import type { OnChangeFn, VisibilityState } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import type {
  ColumnVisibilityFeatureOptions,
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

function parseVisibilityRecord(value: unknown): Record<string, boolean> | null {
  if (!isRecord(value)) return null
  const next: Record<string, boolean> = {}
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== "boolean") continue
    next[key] = item
  }
  return next
}

export function useColumnVisibilityFeature<TData, TFilterSchema>(args: {
  feature: ColumnVisibilityFeatureOptions | undefined
  columnIds: string[]
}): {
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
  const enabled = isFeatureEnabled(args.feature)
  const storageKey = args.feature?.storageKey ?? ""
  const persistenceEnabled = enabled && storageKey.trim() !== ""
  const schemaVersion = args.feature?.schemaVersion ?? 1

  const defaults = useMemo<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {}
    const overrides = args.feature?.defaultVisible
    for (const columnId of args.columnIds) {
      next[columnId] = overrides?.[columnId] ?? true
    }
    return next
  }, [args.columnIds, args.feature?.defaultVisible])

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
    parse: parseVisibilityRecord,
  })

  const mergedVisibility = useMemo<VisibilityState>(() => {
    if (!enabled) return {}
    if (!persistenceEnabled) return defaults
    const stored = envelope?.value ?? null
    const migratedEnvelope = envelope
      ? applyPreferenceMigrations({
          envelope,
          schemaVersion,
          ctx: { columnIds: args.columnIds },
          ...(args.feature?.migrate ? { migrate: args.feature.migrate } : {}),
        })
      : null
    return mergeRecordPreference({
      stored: migratedEnvelope?.value ?? stored,
      defaults,
      ctx: { columnIds: args.columnIds },
    })
  }, [
    enabled,
    persistenceEnabled,
    envelope,
    schemaVersion,
    args.columnIds,
    args.feature?.migrate,
    defaults,
  ])

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => mergedVisibility)

  useEffect(() => {
    if (!enabled) return
    setColumnVisibility((prev) =>
      shallowEqual(prev as Record<string, unknown>, mergedVisibility as Record<string, unknown>)
        ? prev
        : mergedVisibility,
    )
  }, [enabled, mergedVisibility])

  const persist = useStableCallback(async (nextVisibility: VisibilityState) => {
    if (!persistenceEnabled) return
    const merged = mergeRecordPreference({
      stored: nextVisibility,
      defaults,
      ctx: { columnIds: args.columnIds },
    })
    await persistEnvelope(merged)
  })

  const onColumnVisibilityChange: OnChangeFn<VisibilityState> = useStableCallback((updater) => {
    if (!enabled) return
    setColumnVisibility((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      void persist(next)
      return next
    })
  })

  const resetColumnVisibility = useStableCallback(() => {
    if (!enabled) return
    setColumnVisibility(defaults)
    if (!persistenceEnabled) return
    void removeStorage().then(() => {
      if (!storage?.remove) {
        void persistEnvelope(defaults)
      }
    })
  })

  const runtime: DataTableFeatureRuntime<TData, TFilterSchema> = useStableObject({
    patchTableOptions: () => {
      if (!enabled) return {}
      return {
        state: {
          columnVisibility,
        },
        onColumnVisibilityChange,
      }
    },
    patchActions: (_actions: DataTableActions) => {
      if (!enabled) return {}
      return {
        resetColumnVisibility,
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
      resetColumnVisibility()
    },
  })

  return { runtime }
}
