import type { ColumnOrderState, OnChangeFn } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import type {
  ColumnOrderFeatureOptions,
  DataTableActions,
  DataTableActivity,
  DataTableFeatureRuntime,
} from "../types"
import { applyPreferenceMigrations } from "../utils/preference-storage"
import { useStableCallback, useStableObject } from "../utils/reference-stability"
import { usePreference } from "../utils/use-preference"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

function parseColumnOrder(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  return value.filter((item): item is string => typeof item === "string")
}

function normalizeColumnOrder(args: {
  columnIds: string[]
  order: string[] | null | undefined
  fallbackOrder?: string[]
}): string[] {
  const allowed = new Set(args.columnIds)
  const unique = new Set<string>()
  const next: string[] = []
  const source = args.order ?? args.fallbackOrder ?? []

  for (const columnId of source) {
    if (!allowed.has(columnId) || unique.has(columnId)) continue
    unique.add(columnId)
    next.push(columnId)
  }

  for (const columnId of args.columnIds) {
    if (unique.has(columnId)) continue
    unique.add(columnId)
    next.push(columnId)
  }

  return next
}

function moveColumnOrder(args: {
  order: string[]
  columnId: string
  direction: "left" | "right"
}): string[] {
  const index = args.order.indexOf(args.columnId)
  if (index < 0) return args.order
  const targetIndex = args.direction === "left" ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= args.order.length) return args.order
  const next = args.order.slice()
  ;[next[index], next[targetIndex]] = [next[targetIndex] as string, next[index] as string]
  return next
}

export function useColumnOrderFeature<TData, TFilterSchema>(args: {
  feature: ColumnOrderFeatureOptions | undefined
  columnIds: string[]
}): {
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
  const enabled = isFeatureEnabled(args.feature)
  const storageKey = args.feature?.storageKey ?? ""
  const persistenceEnabled = enabled && storageKey.trim() !== ""
  const schemaVersion = args.feature?.schemaVersion ?? 1

  const defaults = useMemo(() => {
    return normalizeColumnOrder({
      columnIds: args.columnIds,
      order: args.feature?.defaultOrder,
    })
  }, [args.columnIds, args.feature?.defaultOrder])

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
    parse: parseColumnOrder,
  })

  const mergedColumnOrder = useMemo<ColumnOrderState>(() => {
    if (!enabled) return []
    if (!persistenceEnabled) return defaults
    const migratedEnvelope = envelope
      ? applyPreferenceMigrations({
          envelope,
          schemaVersion,
          ctx: { columnIds: args.columnIds },
          ...(args.feature?.migrate ? { migrate: args.feature.migrate } : {}),
        })
      : null
    return normalizeColumnOrder({
      columnIds: args.columnIds,
      order: migratedEnvelope?.value ?? envelope?.value ?? defaults,
      fallbackOrder: defaults,
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

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => mergedColumnOrder)

  useEffect(() => {
    if (!enabled) return
    setColumnOrder(mergedColumnOrder)
  }, [enabled, mergedColumnOrder])

  const persist = useStableCallback(async (nextOrder: ColumnOrderState) => {
    if (!persistenceEnabled) return
    const normalized = normalizeColumnOrder({
      columnIds: args.columnIds,
      order: nextOrder,
      fallbackOrder: defaults,
    })
    await persistEnvelope(normalized)
  })

  const onColumnOrderChange: OnChangeFn<ColumnOrderState> = useStableCallback((updater) => {
    if (!enabled) return
    setColumnOrder((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      const normalized = normalizeColumnOrder({
        columnIds: args.columnIds,
        order: next,
        fallbackOrder: defaults,
      })
      void persist(normalized)
      return normalized
    })
  })

  const setColumnOrderAction = useStableCallback((nextOrder: string[]) => {
    if (!enabled) return
    const normalized = normalizeColumnOrder({
      columnIds: args.columnIds,
      order: nextOrder,
      fallbackOrder: defaults,
    })
    setColumnOrder(normalized)
    if (!persistenceEnabled) return
    void persistEnvelope(normalized)
  })

  const moveColumn = useStableCallback((columnId: string, direction: "left" | "right") => {
    if (!enabled) return
    setColumnOrder((prev) => {
      const normalizedPrev = normalizeColumnOrder({
        columnIds: args.columnIds,
        order: prev,
        fallbackOrder: defaults,
      })
      const next = moveColumnOrder({
        order: normalizedPrev,
        columnId,
        direction,
      })
      void persist(next)
      return next
    })
  })

  const resetColumnOrder = useStableCallback(() => {
    if (!enabled) return
    setColumnOrder(defaults)
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
          columnOrder,
        },
        onColumnOrderChange,
      }
    },
    patchActions: (_actions: DataTableActions) => {
      if (!enabled) return {}
      return {
        setColumnOrder: setColumnOrderAction,
        moveColumn,
        resetColumnOrder,
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
      resetColumnOrder()
    },
  })

  return { runtime }
}
