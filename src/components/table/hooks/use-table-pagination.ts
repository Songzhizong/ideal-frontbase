import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { ColumnDef, RowSelectionState, SortingState, Updater } from "@tanstack/react-table"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { PageInfo } from "@/types/pagination"
import { type TableColumnCheck, useBaseTable } from "./use-base-table"

export type { TableColumnCheck } from "./use-base-table"

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
	 * Get column checks for visibility control
	 */
	getColumnChecks?: (columns: ColumnDef<TData>[]) => TableColumnCheck[]
	/**
	 * Unique table ID for storing settings
	 */
	tableId?: string
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
}

/**
 * Table hook with pagination and TanStack Query integration
 * Enhanced with server-side sorting and filtering support
 * Uses TanStack Table's columnVisibility state
 */
export function useTablePagination<TData, TResponse = PageInfo<TData>>(
	options: UseTablePaginationOptions<TData, TResponse>,
) {
	const {
		queryKey,
		queryFn,
		transform,
		columns: baseColumns,
		getColumnChecks,
		tableId,
		initialPage = 1,
		initialPageSize = 10,
		pageNumber: controlledPageNumber,
		pageSize: controlledPageSize,
		enableServerSorting = false,
		enableServerFiltering = false,
		onFetched,
		onPaginationChange,
	} = options

	const baseTable = useBaseTable({
		columns: baseColumns,
		...(getColumnChecks && { getColumnChecks }),
		...(tableId && { tableId }),
	})

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

	// Fetch data with pagination, sorting, and filtering
	const query = useQuery({
		queryKey: [
			...queryKey,
			pageNumber,
			pageSize,
			...(enableServerSorting ? [sortingParams] : []),
			...(enableServerFiltering ? [filters] : []),
		],
		queryFn: () =>
			queryFn({
				pageNumber,
				pageSize,
				...(enableServerSorting && sortingParams && { sorting: sortingParams }),
				...(enableServerFiltering && Object.keys(filters).length > 0 && { filters }),
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

	// Pagination controls
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

	// Update empty state when data changes
	useEffect(() => {
		baseTable.setEmpty(pageData.data.length === 0)
	}, [pageData.data.length, baseTable.setEmpty])

	// Call onFetched when data is fetched
	useEffect(() => {
		if (query.data) {
			onFetched?.(query.data)
		}
	}, [query.data, onFetched])

	// Row selection state
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

	const handleRowSelectionChange = useCallback(
		(updater: RowSelectionState | Updater<RowSelectionState>) => {
			setRowSelection((prev) => (typeof updater === "function" ? updater(prev) : updater))
		},
		[],
	)

	return {
		loading: query.isLoading,
		fetching: query.isFetching,
		data: pageData.data,
		pagination,
		setPage,
		setPageSize,
		nextPage,
		previousPage,
		sorting,
		setSorting,
		filters,
		setFilters,
		refetch: query.refetch,
		isError: query.isError,
		error: query.error,
		rowSelection,
		onRowSelectionChange: handleRowSelectionChange,
		...baseTable,
	}
}
