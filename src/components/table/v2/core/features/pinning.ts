import type { ColumnPinningState, OnChangeFn } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import type {
  DataTableActions,
  DataTableActivity,
  DataTableFeatureRuntime,
  PinningFeatureOptions,
} from "../types"
import { applyPreferenceMigrations } from "../utils/preference-storage"
import { useStableCallback, useStableObject } from "../utils/reference-stability"
import { usePreference } from "../utils/use-preference"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

type PinningPreferenceValue = {
  left: string[]
  right: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parsePinningState(value: unknown): PinningPreferenceValue | null {
  if (!isRecord(value)) return null
  const left = Array.isArray(value.left)
    ? value.left.filter((item): item is string => typeof item === "string")
    : []
  const right = Array.isArray(value.right)
    ? value.right.filter((item): item is string => typeof item === "string")
    : []
  return {
    left,
    right,
  }
}

function normalizePinningState(args: {
  columnIds: string[]
  pinning: ColumnPinningState | PinningPreferenceValue | null | undefined
  fallback?: PinningPreferenceValue
}): PinningPreferenceValue {
  const allowed = new Set(args.columnIds)
  const leftSet = new Set<string>()
  const rightSet = new Set<string>()
  const left: string[] = []
  const right: string[] = []

  const sourceLeft = args.pinning?.left ?? args.fallback?.left ?? []
  const sourceRight = args.pinning?.right ?? args.fallback?.right ?? []

  for (const columnId of sourceLeft) {
    if (!allowed.has(columnId) || leftSet.has(columnId)) continue
    leftSet.add(columnId)
    left.push(columnId)
  }

  for (const columnId of sourceRight) {
    if (!allowed.has(columnId) || leftSet.has(columnId) || rightSet.has(columnId)) continue
    rightSet.add(columnId)
    right.push(columnId)
  }

  return { left, right }
}

function arePinningStatesEqual(a: PinningPreferenceValue, b: PinningPreferenceValue): boolean {
  if (a.left.length !== b.left.length) return false
  if (a.right.length !== b.right.length) return false
  for (let index = 0; index < a.left.length; index += 1) {
    if (a.left[index] !== b.left[index]) return false
  }
  for (let index = 0; index < a.right.length; index += 1) {
    if (a.right[index] !== b.right[index]) return false
  }
  return true
}

export function usePinningFeature<TData, TFilterSchema>(args: {
  feature: PinningFeatureOptions | undefined
  columnIds: string[]
}): {
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
  const enabled = isFeatureEnabled(args.feature)
  const storageKey = args.feature?.storageKey ?? ""
  const persistenceEnabled = enabled && storageKey.trim() !== ""
  const schemaVersion = args.feature?.schemaVersion ?? 1

  const defaults = useMemo<PinningPreferenceValue>(() => {
    return normalizePinningState({
      columnIds: args.columnIds,
      pinning: {
        left: args.feature?.left ?? [],
        right: args.feature?.right ?? [],
      },
    })
  }, [args.columnIds, args.feature?.left, args.feature?.right])

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
    parse: parsePinningState,
  })

  const mergedPinning = useMemo<PinningPreferenceValue>(() => {
    if (!enabled) return { left: [], right: [] }
    if (!persistenceEnabled) return defaults
    const migratedEnvelope = envelope
      ? applyPreferenceMigrations({
          envelope,
          schemaVersion,
          ctx: { columnIds: args.columnIds },
          ...(args.feature?.migrate ? { migrate: args.feature.migrate } : {}),
        })
      : null
    return normalizePinningState({
      columnIds: args.columnIds,
      pinning: migratedEnvelope?.value ?? envelope?.value ?? defaults,
      fallback: defaults,
    })
  }, [
    enabled,
    persistenceEnabled,
    defaults,
    envelope,
    schemaVersion,
    args.columnIds,
    args.feature?.migrate,
  ])

  const [pinning, setPinning] = useState<PinningPreferenceValue>(() => mergedPinning)

  useEffect(() => {
    if (!enabled) return
    setPinning((prev) => (arePinningStatesEqual(prev, mergedPinning) ? prev : mergedPinning))
  }, [enabled, mergedPinning])

  const persist = useStableCallback(async (nextPinning: ColumnPinningState) => {
    if (!persistenceEnabled) return
    const normalized = normalizePinningState({
      columnIds: args.columnIds,
      pinning: nextPinning,
      fallback: defaults,
    })
    await persistEnvelope(normalized)
  })

  const onColumnPinningChange: OnChangeFn<ColumnPinningState> = useStableCallback((updater) => {
    if (!enabled) return
    setPinning((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      const normalized = normalizePinningState({
        columnIds: args.columnIds,
        pinning: next,
        fallback: defaults,
      })
      void persist(normalized)
      return normalized
    })
  })

  const setColumnPin = useStableCallback((columnId: string, pin: "left" | "right" | false) => {
    if (!enabled) return
    if (!args.columnIds.includes(columnId)) return
    setPinning((prev) => {
      const normalizedPrev = normalizePinningState({
        columnIds: args.columnIds,
        pinning: prev,
        fallback: defaults,
      })
      const left = normalizedPrev.left.filter((id) => id !== columnId)
      const right = normalizedPrev.right.filter((id) => id !== columnId)

      if (pin === "left") left.push(columnId)
      if (pin === "right") right.push(columnId)

      const next = normalizePinningState({
        columnIds: args.columnIds,
        pinning: { left, right },
        fallback: defaults,
      })
      void persist(next)
      return next
    })
  })

  const resetColumnPinning = useStableCallback(() => {
    if (!enabled) return
    setPinning(defaults)
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
        enablePinning: true,
        state: {
          columnPinning: pinning,
        },
        onColumnPinningChange,
      }
    },
    patchActions: (_actions: DataTableActions) => {
      if (!enabled) return {}
      return {
        setColumnPin,
        resetColumnPinning,
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
      resetColumnPinning()
    },
  })

  return { runtime }
}
