import { useMemo } from "react"
import type { DataTableFeatureRuntime, PinningFeatureOptions } from "../types"
import { useStableObject } from "../utils/reference-stability"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
	if (!feature) return false
	return feature.enabled !== false
}

export function usePinningFeature<TData, TFilterSchema>(args: {
	feature: PinningFeatureOptions | undefined
}): {
	runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
	const enabled = isFeatureEnabled(args.feature)
	const pinning = useMemo(() => {
		return {
			left: args.feature?.left ?? [],
			right: args.feature?.right ?? [],
		}
	}, [args.feature?.left, args.feature?.right])

	const runtime: DataTableFeatureRuntime<TData, TFilterSchema> = useStableObject({
		patchTableOptions: () => {
			if (!enabled) return {}
			return {
				enablePinning: true,
				state: {
					columnPinning: pinning,
				},
			}
		},
	})

	return { runtime }
}
