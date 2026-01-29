import { parseAsString, useQueryStates } from "nuqs"
import { useCallback } from "react"

export interface UsersFilters {
	username?: string
	email?: string
	phone?: string
	status?: string
	mfaEnabled?: string
	userGroups?: string
}

const filtersParser = {
	username: parseAsString.withDefault(""),
	email: parseAsString.withDefault(""),
	phone: parseAsString.withDefault(""),
	status: parseAsString.withDefault("all"),
	mfaEnabled: parseAsString.withDefault("all"),
	userGroups: parseAsString.withDefault("all"),
}

export function useUsersFilters() {
	// URL state for filtering (used by API and DataTableSearch components)
	const [urlFilters, setUrlFilters] = useQueryStates(filtersParser, {
		shallow: false,
	})

	// Update select filters immediately (no debounce needed)
	const updateSelectFilter = useCallback(
		(key: "status" | "mfaEnabled" | "userGroups", value: string) => {
			setUrlFilters({ [key]: value })
		},
		[setUrlFilters],
	)

	const resetFilters = useCallback(() => {
		const resetValues = {
			username: "",
			email: "",
			phone: "",
			status: "all",
			mfaEnabled: "all",
			userGroups: "all",
		}
		setUrlFilters(resetValues)
	}, [setUrlFilters])

	const getApiFilters = useCallback(() => {
		const apiFilters: Record<string, string> = {}

		if (urlFilters.username) apiFilters.username = urlFilters.username
		if (urlFilters.email) apiFilters.email = urlFilters.email
		if (urlFilters.phone) apiFilters.phone = urlFilters.phone
		if (urlFilters.status && urlFilters.status !== "all") apiFilters.status = urlFilters.status
		if (urlFilters.mfaEnabled && urlFilters.mfaEnabled !== "all")
			apiFilters.mfaEnabled = urlFilters.mfaEnabled
		if (urlFilters.userGroups && urlFilters.userGroups !== "all")
			apiFilters.userGroups = urlFilters.userGroups

		return apiFilters
	}, [urlFilters])

	return {
		// URL state for selects and API
		urlFilters,
		updateSelectFilter,
		// Actions
		resetFilters,
		getApiFilters,
	}
}
