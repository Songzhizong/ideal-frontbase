import { keepPreviousData, type UseQueryOptions, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import type { FilterParams, SortingParams } from "@/components/table"
import type { PageInfo } from "@/types/pagination"

export interface UseTableQueryOptions<TData, TResponse = PageInfo<TData>> {
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
   * Required if TResponse is not PageInfo<TData>
   */
  transform?: (response: TResponse) => PageInfo<TData>
  /**
   * Current page number
   */
  pageNumber: number
  /**
   * Current page size
   */
  pageSize: number
  /**
   * Sorting parameters (for server-side sorting)
   */
  sorting?: SortingParams
  /**
   * Filter parameters (for server-side filtering)
   */
  filters?: FilterParams
  /**
   * Global filter (for search)
   */
  globalFilter?: string
  /**
   * Callback when data is fetched
   */
  onSuccess?: (data: TResponse) => void | Promise<void>
  /**
   * Additional query options
   */
  queryOptions?: Omit<UseQueryOptions<TResponse>, "queryKey" | "queryFn">
}

/**
 * Type guard to check if data matches PageInfo structure
 */
function isPageInfo<TData>(data: unknown): data is PageInfo<TData> {
  return (
    typeof data === "object" &&
    data !== null &&
    "content" in data &&
    "pageNumber" in data &&
    "pageSize" in data &&
    "totalElements" in data &&
    "totalPages" in data &&
    Array.isArray((data as PageInfo<TData>).content)
  )
}

/**
 * Low-level hook for data fetching with TanStack Query
 * Handles pagination, sorting, and filtering parameters
 * Can be used independently or as part of useTablePagination
 *
 * @example
 * ```tsx
 * const { pageData, loading, refetch } = useTableQuery({
 *   queryKey: ['users'],
 *   queryFn: fetchUsers,
 *   pageNumber: 1,
 *   pageSize: 10,
 * })
 * ```
 */
export function useTableQuery<TData, TResponse = PageInfo<TData>>(
  options: UseTableQueryOptions<TData, TResponse>,
) {
  const {
    queryKey,
    queryFn,
    transform,
    pageNumber,
    pageSize,
    sorting,
    filters,
    globalFilter,
    onSuccess,
    queryOptions,
  } = options

  // Build query key with all parameters
  const query = useQuery({
    queryKey: [...queryKey, pageNumber, pageSize, sorting, filters, globalFilter],
    queryFn: () => {
      // Build params object, only include defined values
      const params: {
        pageNumber: number
        pageSize: number
        sorting?: SortingParams
        filters?: FilterParams
        globalFilter?: string
      } = {
        pageNumber,
        pageSize,
      }

      if (sorting !== undefined) params.sorting = sorting
      if (filters !== undefined) params.filters = filters
      if (globalFilter !== undefined) params.globalFilter = globalFilter

      return queryFn(params)
    },
    placeholderData: keepPreviousData,
    ...queryOptions,
  })

  // Transform and validate response data
  const pageData = useMemo(() => {
    if (!query.data) return null

    // If transform is provided, use it
    if (transform) {
      return transform(query.data)
    }

    // Otherwise, validate that response matches PageInfo structure
    if (isPageInfo<TData>(query.data)) {
      return query.data
    }

    // If no transform and data doesn't match PageInfo, throw error
    throw new Error(
      "Response does not match PageInfo structure. Please provide a transform function to convert your API response to PageInfo format.",
    )
  }, [query.data, transform])

  // Call onSuccess when data is fetched
  useEffect(() => {
    if (query.data && onSuccess) {
      void onSuccess(query.data)
    }
  }, [query.data, onSuccess])

  return {
    /**
     * Transformed page data (null if loading or no data)
     */
    pageData,
    /**
     * Raw TanStack Query instance
     */
    query,
    /**
     * Loading state (initial load)
     */
    loading: query.isLoading,
    /**
     * Fetching state (includes refetch)
     */
    fetching: query.isFetching,
    /**
     * Error state
     */
    isError: query.isError,
    /**
     * Error object
     */
    error: query.error,
    /**
     * Refetch function
     */
    refetch: query.refetch,
  }
}
