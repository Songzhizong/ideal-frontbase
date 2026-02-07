import { useEffect, useMemo, useState } from "react"
import type {
  DataTableActions,
  DataTableActivity,
  DataTableFeatureRuntime,
  DensityFeatureOptions,
} from "../types"
import { applyPreferenceMigrations } from "../utils/preference-storage"
import { useStableCallback, useStableObject } from "../utils/reference-stability"
import { usePreference } from "../utils/use-preference"

type DensityValue = "compact" | "comfortable"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

function parseDensityValue(value: unknown): DensityValue | null {
  return value === "compact" || value === "comfortable" ? value : null
}

export function useDensityFeature<TData, TFilterSchema>(args: {
  feature: DensityFeatureOptions | undefined
}): {
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
  const enabled = isFeatureEnabled(args.feature)
  const storageKey = args.feature?.storageKey ?? ""
  const persistenceEnabled = enabled && storageKey.trim() !== ""
  const schemaVersion = args.feature?.schemaVersion ?? 1
  const defaultDensity: DensityValue = args.feature?.default ?? "compact"

  const {
    envelope,
    preferencesReady,
    storage,
    persist,
    remove: removeStorage,
  } = usePreference({
    enabled: persistenceEnabled,
    storageKey,
    schemaVersion,
    storage: args.feature?.storage,
    parse: parseDensityValue,
  })

  const mergedDensity = useMemo<DensityValue>(() => {
    if (!enabled) return defaultDensity
    if (!persistenceEnabled) return defaultDensity
    const migratedEnvelope = envelope
      ? applyPreferenceMigrations({
          envelope,
          schemaVersion,
          ctx: { columnIds: [] },
          ...(args.feature?.migrate ? { migrate: args.feature.migrate } : {}),
        })
      : null
    return migratedEnvelope?.value ?? envelope?.value ?? defaultDensity
  }, [enabled, persistenceEnabled, envelope, schemaVersion, args.feature?.migrate, defaultDensity])

  const [density, setDensity] = useState<DensityValue>(() => mergedDensity)

  useEffect(() => {
    if (!enabled) return
    setDensity(mergedDensity)
  }, [enabled, mergedDensity])

  const setDensityPreference = useStableCallback((nextDensity: DensityValue) => {
    if (!enabled) return
    setDensity(nextDensity)
    if (!persistenceEnabled) return
    void persist(nextDensity)
  })

  const resetDensity = useStableCallback(() => {
    if (!enabled) return
    setDensityPreference(defaultDensity)
    if (!persistenceEnabled) return
    void removeStorage().then(() => {
      if (!storage?.remove) {
        void persist(defaultDensity)
      }
    })
  })

  const runtime: DataTableFeatureRuntime<TData, TFilterSchema> = useStableObject({
    patchTableOptions: () => {
      if (!enabled) return {}
      return {
        meta: {
          dtDensity: density,
          dtSetDensity: setDensityPreference,
        },
      }
    },
    patchActions: (_actions: DataTableActions) => {
      if (!enabled) return {}
      return {
        resetDensity,
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
      resetDensity()
    },
  })

  return { runtime }
}
