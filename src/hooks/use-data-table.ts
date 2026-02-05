import type { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { useCallback, useEffect, useMemo } from "react"
import { useDebouncedCallback } from "use-debounce"
import { useTablePagination } from "@/components/table"
import type { PageInfo } from "@/types/pagination"

/**
 * Options for useDataTable hook
 */
export interface UseDataTableOptions<TData> {
	/**
	 * Query key for TanStack Query
	 */
	queryKey: unknown[]
	/**
	 * API function that receives URL state as params
	 * The params will include: pageNumber, pageSize, and all filter values
	 */
	queryFn: (params: Record<string, unknown>) => Promise<PageInfo<TData>>
	/**
	 * Column definitions for the table
	 */
	columns: ColumnDef<TData>[]
	/**
	 * Filter parsers for nuqs (business-specific filters)
	 * @example { status: parseAsString, role: parseAsString }
	 */
	// biome-ignore lint/suspicious/noExplicitAny: nuqs types are complex
	filterParsers?: Record<string, any>
	/**
	 * Default values for filters
	 */
	defaultFilters?: Record<string, unknown>
	/**
	 * Initial page size
	 * @default 10
	 */
	initialPageSize?: number
	/**
	 * Enable server-side sorting
	 * @default true
	 */
	enableServerSorting?: boolean
	/**
	 * Debounce delay for search input (ms)
	 * @default 500
	 */
	searchDebounce?: number
	/**
	 * Get row ID (optional)
	 */
	getRowId?: (row: TData) => string
}

/**
 * Simplified data table hook that automatically handles:
 * - URL state management (pagination + filters + search)
 * - Automatic page reset when filters change
 * - Debounced search
 * - Server-side pagination and sorting
 * - Type-safe filter state
 *
 * @example
 * ```tsx
 * const { table, filters, loading, empty } = useDataTable({
 *   queryKey: ['users'],
 *   queryFn: getUsers,
 *   columns: usersColumns,
 *   filterParsers: {
 *     status: parseAsString,
 *     role: parseAsString
 *   }
 * })
 *
 * // In JSX:
 * <Input onChange={(e) => filters.onSearch(e.target.value)} />
 * <Select value={filters.state.status} onValueChange={(v) => filters.set('status', v)} />
 * <Button onClick={filters.reset}>Reset</Button>
 * ```
 */
export function useDataTable<TData>({
	queryKey,
	queryFn,
	columns,
	filterParsers = {},
	defaultFilters = {},
	initialPageSize = 10,
	enableServerSorting = true,
	searchDebounce = 500,
	getRowId,
}: UseDataTableOptions<TData>) {
	// 1. Unified URL state management (pagination + search + business filters)
	const [urlState, setUrlState] = useQueryStates(
		{
			page: parseAsInteger.withDefault(1),
			size: parseAsInteger.withDefault(initialPageSize),
			sort: parseAsString,
			q: parseAsString,
			...filterParsers,
		},
		{
			shallow: false,
			history: "push",
		},
	)

	// 2. Filter operations (auto-reset page to 1)
	const setFilter = useCallback(
		(key: string, value: unknown) => {
			const normalizedValue = typeof value === "string" && value.length === 0 ? null : value
			void setUrlState((old) => ({
				...old,
				[key]: normalizedValue,
				page: 1, // 🔥 Core: Auto-reset page when any filter changes
			}))
		},
		[setUrlState],
	)

	// 3. Debounced search
	const onSearch = useDebouncedCallback((value: string) => {
		setFilter("q", value || null)
	}, searchDebounce)

	// 4. Reset all filters
	const resetFilters = useCallback(() => {
		const resetState: Record<string, unknown> = {
			page: 1,
			size: urlState.size,
			sort: null,
			q: null,
		}

		// Reset all business filters to their defaults
		for (const key of Object.keys(filterParsers)) {
			resetState[key] = defaultFilters[key] ?? null
		}

		void setUrlState(resetState)
	}, [setUrlState, urlState.size, filterParsers, defaultFilters])

	// 5. Transform URL state to API params
	const apiParams = useMemo(() => {
		const params: Record<string, unknown> = {
			pageNumber: urlState.page,
			pageSize: urlState.size,
		}

		// Add search query
		if (urlState.q) {
			params.q = urlState.q
		}

		// Add sorting
		if (urlState.sort) {
			const [field, order] = urlState.sort.split(".")
			if (field && order) {
				params.sorting = { field, order: order as "asc" | "desc" }
			}
		}

		// Add business filters (exclude null/undefined/empty/"all" values)
		for (const [key, value] of Object.entries(urlState)) {
			if (
				key !== "page" &&
				key !== "size" &&
				key !== "sort" &&
				key !== "q" &&
				value != null &&
				value !== "" &&
				value !== "all"
			) {
				params[key] = value
			}
		}

		return params
	}, [urlState])

	const sorting = useMemo<SortingState>(() => {
		if (!urlState.sort) return []
		const [field, order] = urlState.sort.split(".")
		if (!field || (order !== "asc" && order !== "desc")) return []
		return [{ id: field, desc: order === "desc" }]
	}, [urlState.sort])

	const onSortingChange = useCallback<OnChangeFn<SortingState>>(
		(updater) => {
			const next = typeof updater === "function" ? updater(sorting) : updater
			const first = next[0]
			const sort = first ? `${first.id}.${first.desc ? "desc" : "asc"}` : null
			void setUrlState((old) => ({
				...old,
				sort,
				page: 1,
			}))
		},
		[setUrlState, sorting],
	)

	// 6. Call underlying useTablePagination
	// Exclude pagination params from the key since useTablePagination adds them
	// but include all other business filters/sorting/search to trigger refetch
	const { pageNumber, pageSize, ...extraParams } = apiParams

	const tableQuery = useTablePagination({
		queryKey: [...queryKey, extraParams], // 🔥 Include business filters in the key
		queryFn: async () => queryFn(apiParams),
		columns,
		pageNumber: urlState.page,
		pageSize: urlState.size,
		onPaginationChange: ({ pageNumber, pageSize }) => {
			void setUrlState({ page: pageNumber, size: pageSize })
		},
		enableServerSorting,
		sorting,
		onSortingChange,
		...(getRowId && { getRowId }),
	})

	// 7. Auto-correct page number if it exceeds total pages
	const { pagination, setPage } = tableQuery
	useEffect(() => {
		if (pagination.totalPages > 0 && pagination.pageNumber > pagination.totalPages) {
			setPage(pagination.totalPages)
		}
	}, [pagination.pageNumber, pagination.totalPages, setPage])

	// 8. Return simplified API
	return {
		...tableQuery,
		/**
		 * Filter controls
		 */
		filters: {
			/**
			 * Current filter state (type-safe)
			 */
			state: urlState,
			/**
			 * Set a single filter value (auto-resets page to 1)
			 */
			set: setFilter,
			/**
			 * Reset all filters to defaults
			 */
			reset: resetFilters,
			/**
			 * Debounced search handler (bind to search input onChange)
			 */
			onSearch,
		},
	}
}
