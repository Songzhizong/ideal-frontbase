import {
  type ColumnDef,
  getCoreRowModel,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type Table,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { useCallback, useState } from "react"

export interface UseTableInstanceOptions<TData> {
  /**
   * Table data
   */
  data: TData[]
  /**
   * Column definitions
   */
  columns: ColumnDef<TData>[]
  /**
   * Get row ID function (optional)
   */
  getRowId?: (row: TData) => string

  // Pagination
  /**
   * Current page number (1-indexed)
   */
  pageNumber: number
  /**
   * Current page size
   */
  pageSize: number
  /**
   * Total number of pages
   */
  totalPages: number
  /**
   * Pagination change handler
   */
  onPaginationChange?: (params: { pageNumber: number; pageSize: number }) => void

  // Sorting
  /**
   * Enable server-side sorting
   * @default false
   */
  enableServerSorting?: boolean
  /**
   * Controlled sorting state
   */
  sorting?: SortingState
  /**
   * Sorting change handler
   */
  onSortingChange?: OnChangeFn<SortingState>

  // Column Visibility
  /**
   * Controlled column visibility state
   */
  columnVisibility?: VisibilityState
  /**
   * Column visibility change handler
   */
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>

  // Row Selection
  /**
   * Controlled row selection state
   */
  rowSelection?: RowSelectionState
  /**
   * Row selection change handler
   */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>

  // Global Filter
  /**
   * Controlled global filter state
   */
  globalFilter?: string
  /**
   * Global filter change handler
   */
  onGlobalFilterChange?: (value: string) => void
}

/**
 * Low-level hook for creating TanStack Table instance
 * Handles all table state management (sorting, filtering, selection, etc.)
 * Can be used independently or as part of useTablePagination
 *
 * @example
 * ```tsx
 * const table = useTableInstance({
 *   data: users,
 *   columns: userColumns,
 *   pageNumber: 1,
 *   pageSize: 10,
 *   totalPages: 5,
 *   onPaginationChange: ({ pageNumber, pageSize }) => {
 *     setPage(pageNumber)
 *     setPageSize(pageSize)
 *   },
 * })
 * ```
 */
export function useTableInstance<TData>(options: UseTableInstanceOptions<TData>): Table<TData> {
  const {
    data,
    columns,
    getRowId,
    pageNumber,
    pageSize,
    totalPages,
    onPaginationChange,
    enableServerSorting = false,
    sorting: controlledSorting,
    onSortingChange: controlledOnSortingChange,
    columnVisibility: controlledColumnVisibility,
    onColumnVisibilityChange: controlledOnColumnVisibilityChange,
    rowSelection: controlledRowSelection,
    onRowSelectionChange: controlledOnRowSelectionChange,
    globalFilter: controlledGlobalFilter,
    onGlobalFilterChange: controlledOnGlobalFilterChange,
  } = options

  // Internal states (used when not controlled)
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({})
  const [internalGlobalFilter, setInternalGlobalFilter] = useState<string>("")

  // Use controlled state if provided, otherwise use internal state
  const sorting = controlledSorting ?? internalSorting
  const onSortingChange = controlledOnSortingChange ?? setInternalSorting
  const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility
  const onColumnVisibilityChange = controlledOnColumnVisibilityChange ?? setInternalColumnVisibility
  const rowSelection = controlledRowSelection ?? internalRowSelection
  const onRowSelectionChange = controlledOnRowSelectionChange ?? setInternalRowSelection
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter
  const onGlobalFilterChange = controlledOnGlobalFilterChange ?? setInternalGlobalFilter

  // Create TanStack Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: enableServerSorting,
    enableRowSelection: true,
    autoResetPageIndex: false,
    ...(getRowId && { getRowId }),
    state: {
      sorting,
      rowSelection,
      globalFilter,
      columnVisibility,
      pagination: {
        pageIndex: pageNumber - 1, // TanStack Table uses 0-indexed
        pageSize,
      },
    },
    onSortingChange,
    onRowSelectionChange,
    onGlobalFilterChange,
    onColumnVisibilityChange,
    onPaginationChange: useCallback(
      (updater) => {
        if (!onPaginationChange) return

        const currentState = { pageIndex: pageNumber - 1, pageSize }
        const newState = typeof updater === "function" ? updater(currentState) : updater

        onPaginationChange({
          pageNumber: newState.pageIndex + 1, // Convert back to 1-indexed
          pageSize: newState.pageSize,
        })
      },
      [pageNumber, pageSize, onPaginationChange],
    ),
    pageCount: totalPages,
  })

  return table
}
