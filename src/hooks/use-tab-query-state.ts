import { parseAsString, type SingleParserBuilder, useQueryStates } from "nuqs"
import { useCallback, useMemo } from "react"

export interface TabConfig {
	/**
	 * Unique parameters owned by this tab that should be cleared when switching away
	 */
	exclusiveParams?: string[]
}

export interface UseTabQueryStateOptions<T extends string> {
	/**
	 * The query parameter name for the tab
	 * @default "tab"
	 */
	key?: string
	/**
	 * Default tab value
	 */
	defaultValue: T
	/**
	 * Configuration for each tab
	 */
	tabs: Record<T, TabConfig>
	/**
	 * Common parameters to clear on every tab switch (e.g., page, q)
	 */
	commonParamsToClear?: string[]
}

/**
 * A specialized hook for managing tab state in the URL with automatic parameter cleanup.
 * Prevents URL pollution by clearing tab-specific filters when switching views.
 */
export function useTabQueryState<T extends string>({
	key = "tab",
	defaultValue,
	tabs,
	commonParamsToClear = ["page", "size", "q", "sort"],
}: UseTabQueryStateOptions<T>) {
	// 1. Define all possible parameters that might need clearing
	// We use parseAsString for all to allow setting them to null (clearing)
	const allParams: Record<string, SingleParserBuilder<string>> = {
		[key]: parseAsString.withDefault(defaultValue),
	}

	const exclusiveParams = useMemo(() => {
		const result = new Set<string>()
		for (const config of Object.values<TabConfig>(tabs)) {
			if (config.exclusiveParams) {
				for (const p of config.exclusiveParams) {
					result.add(p)
				}
			}
		}
		return Array.from(result)
	}, [tabs])

	// Initialize all parameters in nuqs
	for (const p of [...exclusiveParams, ...commonParamsToClear]) {
		allParams[p] = parseAsString // Flexible parser to allow null/clearing
	}

	const [states, setStates] = useQueryStates(allParams, {
		shallow: false,
	})

	const activeTab = (states[key] as T) || defaultValue

	const setTab = useCallback(
		(newTab: T) => {
			const newState: Record<string, null | string> = {
				[key]: newTab,
			}

			// 1. Clear common parameters
			for (const p of commonParamsToClear) {
				newState[p] = null
			}

			// 2. Clear exclusive parameters of other tabs
			for (const [tabValue, config] of Object.entries<TabConfig>(tabs)) {
				if (tabValue !== newTab && config.exclusiveParams) {
					for (const p of config.exclusiveParams) {
						newState[p] = null
					}
				}
			}

			void setStates(newState)
		},
		[key, commonParamsToClear, tabs, setStates],
	)

	return [activeTab, setTab] as const
}
