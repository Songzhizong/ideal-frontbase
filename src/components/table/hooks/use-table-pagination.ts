import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type {
	ColumnDef,
	OnChangeFn,
	RowSelectionState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { PageInfo } from "@/types/pagination"

export interface PaginationState {
	pageNumber: number
	pageSize: number
	totalElements: number
	totalPages: number
}

export interface SortingParams {
	field?: string
	order?: "asc" | "desc"
}

export interface FilterParams {
	[key: string]: unknown
}

export interface UseTablePaginationOptions<TData, TResponse = PageInfo<TData>> {
	/**
	 * Query key for TanStack Query
	 */
	queryKey: unknown[]
	/**
	 * API function to fetch paginated data
	 */
	queryFn: (params: {
		pageNumber: number
		pageSize: number
		sorting?: SortingParams
		filters?: FilterParams
		globalFilter?: string
	}) => Promise<TResponse>
	/**
	 * Transform response to pagination data
	 * Can be customized to handle different API response formats
	 */
	transform?: (response: TResponse) => PageInfo<TData>
	/**
	 * Columns definition
	 */
	columns: ColumnDef<TData>[]
	/**
	 * Get row ID (optional)
	 */
	getRowId?: (row: TData) => string
	/**
	 * Initial page number
	 * @default 1
	 */
	initialPage?: number
	/**
	 * Initial page size
	 * @default 10
	 */
	initialPageSize?: number
	/**
	 * Initial column visibility state
	 */
	initialColumnVisibility?: VisibilityState
	/**
	 * Enable server-side sorting
	 * @default false
	 */
	enableServerSorting?: boolean
	/**
	 * Enable server-side filtering
	 * @default false
	 */
	enableServerFiltering?: boolean
	/**
	 * Callback when data is fetched
	 */
	onFetched?: (response: TResponse) => void | Promise<void>
	/**
	 * Controlled page number
	 */
	pageNumber?: number
	/**
	 * Controlled page size
	 */
	pageSize?: number
	/**
	 * Callback when pagination params change (for controlled mode)
	 */
	onPaginationChange?: (params: { pageNumber: number; pageSize: number }) => void | Promise<void>
	/**
	 * Controlled column visibility
	 */
	columnVisibility?: VisibilityState
	/**
	 * Callback when column visibility changes
	 */
	onColumnVisibilityChange?: OnChangeFn<VisibilityState>
}

/**
 * Table hook with pagination and TanStack Query integration
 * Enhanced with server-side sorting and filtering support
 * Creates TanStack Table instance as single source of truth
 */
export function useTablePagination<TData, TResponse = PageInfo<TData>>(
	options: UseTablePaginationOptions<TData, TResponse>,
) {
	const {
		queryKey,
		queryFn,
		transform,
		columns,
		getRowId,
		initialPage = 1,
		initialPageSize = 10,
		initialColumnVisibility,
		pageNumber: controlledPageNumber,
		pageSize: controlledPageSize,
		enableServerSorting = false,
		enableServerFiltering = false,
		onFetched,
		onPaginationChange,
		columnVisibility: controlledColumnVisibility,
		onColumnVisibilityChange,
	} = options

	// Internal pagination state (used if not controlled)
	const [internalPagination, setInternalPagination] = useState({
		pageNumber: initialPage,
		pageSize: initialPageSize,
	})

	// Actual pageNumber and pageSize being used
	const pageNumber = controlledPageNumber ?? internalPagination.pageNumber
	const pageSize = controlledPageSize ?? internalPagination.pageSize

	// Sorting state (for server-side sorting)
	const [sorting, setSorting] = useState<SortingState>([])
	const sortingParams = useMemo<SortingParams | undefined>(() => {
		if (!enableServerSorting || sorting.length === 0 || !sorting[0]) return undefined
		return {
			field: sorting[0].id,
			order: sorting[0].desc ? "desc" : "asc",
		}
	}, [sorting, enableServerSorting])

	// Filtering state (for server-side filtering)
	const [filters, setFilters] = useState<FilterParams>({})

	// Global filter state (for search)
	const [globalFilter, setGlobalFilter] = useState<string>("")

	// Column visibility state (internal if not controlled)
	const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>(
		initialColumnVisibility || {},
	)

	// Row selection state
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

	// Empty state
	const [empty, setEmpty] = useState(false)

	// Pagination controls (defined before useEffect that uses them)
	const setPage = useCallback(
		(page: number) => {
			if (onPaginationChange) {
				onPaginationChange({ pageNumber: page, pageSize })
			} else {
				setInternalPagination((prev) => ({ ...prev, pageNumber: page }))
			}
		},
		[onPaginationChange, pageSize],
	)

	const setPageSize = useCallback(
		(size: number) => {
			if (onPaginationChange) {
				onPaginationChange({ pageNumber: 1, pageSize: size })
			} else {
				setInternalPagination({ pageSize: size, pageNumber: 1 })
			}
		},
		[onPaginationChange],
	)

	// Auto-reset page index when filters or global filter change
	useEffect(() => {
		if (enableServerFiltering && Object.keys(filters).length > 0) {
			setPage(1)
		}
	}, [filters, enableServerFiltering, setPage])

	useEffect(() => {
		if (globalFilter) {
			setPage(1)
		}
	}, [globalFilter, setPage])

	// Fetch data with pagination, sorting, and filtering
	const query = useQuery({
		queryKey: [
			...queryKey,
			pageNumber,
			pageSize,
			...(enableServerSorting ? [sortingParams] : []),
			...(enableServerFiltering ? [filters] : []),
			globalFilter,
		],
		queryFn: () =>
			queryFn({
				pageNumber,
				pageSize,
				...(enableServerSorting && sortingParams && { sorting: sortingParams }),
				...(enableServerFiltering && Object.keys(filters).length > 0 && { filters }),
				globalFilter,
			}),
		placeholderData: keepPreviousData,
	})

	// Default transform function
	const defaultTransform = useCallback((response: TResponse): PageInfo<TData> => {
		// Assume response is already PageInfo<TData>
		return response as unknown as PageInfo<TData>
	}, [])

	const pageData = useMemo(() => {
		if (!query.data) return { data: [], pageInfo: null as null }
		const transformed = (transform || defaultTransform)(query.data)
		return {
			data: transformed.content,
			pageInfo: {
				pageNumber: transformed.pageNumber,
				pageSize: transformed.pageSize,
				totalElements: transformed.totalElements,
				totalPages: transformed.totalPages,
			} as const,
		}
	}, [query.data, transform, defaultTransform])

	// Derived pagination state
	const pagination = useMemo<PaginationState>(
		() => ({
			pageNumber,
			pageSize,
			totalElements: pageData.pageInfo?.totalElements ?? 0,
			totalPages: pageData.pageInfo?.totalPages ?? 0,
		}),
		[pageNumber, pageSize, pageData.pageInfo],
	)

	const nextPage = useCallback(() => {
		if (pagination.pageNumber < pagination.totalPages) {
			setPage(pagination.pageNumber + 1)
		}
	}, [pagination.pageNumber, pagination.totalPages, setPage])

	const previousPage = useCallback(() => {
		if (pagination.pageNumber > 1) {
			setPage(pagination.pageNumber - 1)
		}
	}, [pagination.pageNumber, setPage])

	// Create TanStack Table instance (single source of truth)
	const table = useReactTable({
		data: pageData.data ?? [], // Defensive: always ensure array
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		manualSorting: enableServerSorting,
		enableRowSelection: true,
		autoResetPageIndex: false, // Prevent auto-reset on data change
		...(getRowId && { getRowId }),
		state: {
			sorting,
			rowSelection,
			globalFilter,
			columnVisibility: controlledColumnVisibility ?? internalColumnVisibility,
			pagination: {
				pageIndex: pageNumber - 1,
				pageSize,
			},
		},
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		onColumnVisibilityChange: onColumnVisibilityChange || setInternalColumnVisibility,
		onPaginationChange: (updater) => {
			if (typeof updater === "function") {
				const newState = updater({
					pageIndex: pageNumber - 1,
					pageSize,
				})
				setPage(newState.pageIndex + 1)
				setPageSize(newState.pageSize)
			} else {
				setPage(updater.pageIndex + 1)
				setPageSize(updater.pageSize)
			}
		},
		pageCount: pagination.totalPages,
	})

	// Update empty state when data changes
	useEffect(() => {
		setEmpty(pageData.data.length === 0)
	}, [pageData.data.length])

	// Call onFetched when data is fetched
	useEffect(() => {
		if (query.data) {
			onFetched?.(query.data)
		}
	}, [query.data, onFetched])

	return {
		// TanStack Table instance - single source of truth
		table,
		// Query states
		loading: query.isLoading,
		fetching: query.isFetching,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
		// UI states
		empty,
		// Pagination
		pagination,
		setPage,
		setPageSize,
		nextPage,
		previousPage,
		// Filtering (for server-side)
		filters,
		setFilters,
		// Global filter (for search)
		globalFilter,
		setGlobalFilter,
	}
}
