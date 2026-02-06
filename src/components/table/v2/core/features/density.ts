import { useEffect, useMemo, useState } from "react"
import type {
	DataTableActions,
	DataTableActivity,
	DataTableFeatureRuntime,
	DensityFeatureOptions,
	PreferenceEnvelope,
} from "../types"
import {
	applyPreferenceMigrations,
	createJsonLocalStoragePreferenceStorage,
} from "../utils/preference-storage"
import { useStableCallback, useStableObject } from "../utils/reference-stability"

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
	const schemaVersion = args.feature?.schemaVersion ?? 1
	const defaultDensity: DensityValue = args.feature?.default ?? "compact"

	const storage = useMemo(() => {
		if (!enabled) return args.feature?.storage
		if (args.feature?.storage) return args.feature.storage
		return createJsonLocalStoragePreferenceStorage<DensityValue>({
			schemaVersion,
			parse: parseDensityValue,
		})
	}, [enabled, args.feature?.storage, schemaVersion])

	const [preferencesReady, setPreferencesReady] = useState(
		() => !enabled || Boolean(storage?.getSync),
	)

	const [envelope, setEnvelope] = useState<PreferenceEnvelope<DensityValue> | null>(() => {
		if (!enabled) return null
		if (!storage?.getSync) return null
		return storage.getSync(storageKey)
	})

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

	const mergedDensity = useMemo<DensityValue>(() => {
		if (!enabled) return defaultDensity
		const migratedEnvelope = envelope
			? applyPreferenceMigrations({
					envelope,
					schemaVersion,
					ctx: { columnIds: [] },
					...(args.feature?.migrate ? { migrate: args.feature.migrate } : {}),
				})
			: null
		return migratedEnvelope?.value ?? envelope?.value ?? defaultDensity
	}, [enabled, envelope, schemaVersion, args.feature?.migrate, defaultDensity])

	const [density, setDensity] = useState<DensityValue>(() => mergedDensity)

	useEffect(() => {
		if (!enabled) return
		setDensity(mergedDensity)
	}, [enabled, mergedDensity])

	const persist = useStableCallback(async (nextDensity: DensityValue) => {
		if (!enabled) return
		if (!storage) return
		const nextEnvelope: PreferenceEnvelope<DensityValue> = {
			schemaVersion,
			updatedAt: Date.now(),
			value: nextDensity,
		}
		setEnvelope(nextEnvelope)
		await storage.set(storageKey, nextEnvelope)
	})

	const setDensityPreference = useStableCallback((nextDensity: DensityValue) => {
		if (!enabled) return
		setDensity(nextDensity)
		void persist(nextDensity)
	})

	const resetDensity = useStableCallback(() => {
		if (!enabled) return
		setDensityPreference(defaultDensity)
		setEnvelope(null)
		if (!storage) return
		if (storage.remove) {
			void storage.remove(storageKey)
		}
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
