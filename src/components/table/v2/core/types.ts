import type { ColumnDef, ColumnMeta, Row, Table, TableOptions } from "@tanstack/react-table"
import type { inferParserType, ParserMap } from "nuqs"
import type { ReactNode } from "react"
import type { PreferenceEnvelope, PreferenceMigration } from "@/components/table/v2"

export type DataTableColumnDef<TData> = ColumnDef<TData, never>

export type {
  PreferenceEnvelope,
  PreferenceMergeContext,
  PreferenceMigration,
  PreferenceMigrationContext,
} from "./utils/preference-storage"

export type DataTableStatus =
  | { type: "error"; error: unknown }
  | { type: "empty" }
  | { type: "ready" }

export interface DataTableActivity {
  isInitialLoading: boolean
  isFetching: boolean
  preferencesReady: boolean
}

export interface DataTablePagination {
  page: number
  size: number
  pageCount: number
  total?: number
}

export type DataTableSelectionScope =
  | {
      type: "ids"
      rowIds: string[]
    }
  | {
      type: "all"
      excludedRowIds: string[]
    }

export interface DataTableSelection<TData> {
  enabled: boolean
  mode: "page" | "cross-page"
  selectedRowIds: string[]
  selectedRowsCurrentPage: TData[]
  selectionScope: DataTableSelectionScope
  crossPage?: {
    selection: CrossPageSelection
    totalSelected: number | "all"
    isAllSelected: boolean
  }
}

export interface CrossPageSelection {
  mode: "include" | "exclude"
  rowIds: Set<string>
}

export interface DataTableTree {
  enabled: boolean
  expandedRowIds: string[]
  loadingRowIds: string[]
}

export interface DataTableDragSort {
  enabled: boolean
  isDragging: boolean
  activeId: string | null
}

export interface DataTableError {
  severity: "blocking" | "non-blocking"
  code?: string
  message?: string
  original: unknown
  retryable?: boolean
}

export interface DataTableErrors {
  blocking?: DataTableError
  nonBlocking?: DataTableError
}

export interface DataTableActions {
  refetch: () => void | Promise<void>
  retry: (options?: { resetInvalidFilters?: boolean }) => void | Promise<void>
  resetAll: () => void

  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSort: (sort: { field: string; order: "asc" | "desc" }[]) => void
  clearSort: () => void

  clearSelection: () => void
  selectAllCurrentPage: () => void
  selectAllMatching: () => void | Promise<void>

  resetColumnVisibility: () => void
  resetColumnSizing: () => void
  setColumnPin: (columnId: string, pin: "left" | "right" | false) => void
  resetColumnPinning: () => void
  setColumnOrder: (columnOrder: string[]) => void
  moveColumn: (columnId: string, direction: "left" | "right") => void
  resetColumnOrder: () => void
  resetDensity: () => void

  expandRow: (rowId: string) => void
  collapseRow: (rowId: string) => void
  toggleRowExpanded: (rowId: string) => void
  expandAll: () => void
  collapseAll: () => void
  expandToDepth: (depth: number) => void

  moveRow: (activeId: string, overId: string) => void | Promise<void>
}

export interface TableFilters<TFilterSchema> {
  state: TFilterSchema
  set: <K extends keyof TFilterSchema>(key: K, value: TFilterSchema[K]) => void
  setBatch: (updates: Partial<TFilterSchema>) => void
  reset: () => void
}

export interface DataTableInstance<TData, TFilterSchema> {
  __version: "2.0"
  table: Table<TData>
  status: DataTableStatus
  activity: DataTableActivity
  pagination: DataTablePagination
  filters: TableFilters<TFilterSchema>
  actions: DataTableActions
  selection: DataTableSelection<TData>
  tree: DataTableTree
  dragSort: DataTableDragSort
  errors?: DataTableErrors
  meta: {
    feature: {
      selectionEnabled: boolean
      columnVisibilityEnabled: boolean
      columnSizingEnabled: boolean
      pinningEnabled: boolean
      columnOrderEnabled: boolean
      virtualizationEnabled: boolean
      analyticsEnabled: boolean
      expansionEnabled: boolean
      densityEnabled: boolean
      treeEnabled: boolean
      dragSortEnabled: boolean
    }
    state?: {
      searchKey?: string
    }
    data?: {
      extraMeta?: Record<string, unknown>
    }
  }
}

export interface UseDataTableOptions<TData, TFilterSchema> {
  columns: DataTableColumnDef<TData>[]
  dataSource: DataSource<TData, TFilterSchema>
  state: TableStateAdapter<TFilterSchema>
  features?: DataTableFeatures<TData, TFilterSchema>
  getRowId?: (row: TData) => string
}

export interface TableSort {
  field: string
  order: "asc" | "desc"
}

export interface TableStateSnapshot<TFilterSchema> {
  page: number
  size: number
  sort: TableSort[]
  filters: TFilterSchema
}

export type TableStateChangeReason = "init" | "page" | "size" | "sort" | "filters" | "reset"

export interface TableStateAdapter<TFilterSchema> {
  getSnapshot: () => TableStateSnapshot<TFilterSchema>
  setSnapshot: (next: TableStateSnapshot<TFilterSchema>, reason: TableStateChangeReason) => void
  subscribe: (listener: () => void) => () => void
  searchKey?: string
}

export interface DataTableQuery<TFilterSchema> {
  page: number
  size: number
  sort: TableSort[]
  filters: TFilterSchema
}

export interface DataTableDataResult<TData> {
  rows: TData[]
  pageCount: number
  total?: number
  extraMeta?: Record<string, unknown>
}

export interface DataTableDataState<TData> {
  data: DataTableDataResult<TData> | null
  isInitialLoading: boolean
  isFetching: boolean
  error: unknown | null
  refetch?: () => void | Promise<void>
  retry?: () => void | Promise<void>
}

export interface DataSource<TData, TFilterSchema> {
  use: (query: DataTableQuery<TFilterSchema>) => DataTableDataState<TData>
}

export interface RemoteDataSourceOptions<TData, TFilterSchema, TResponse> {
  queryKey: unknown[]
  queryFn: (params: {
    page: number
    size: number
    sort: { field: string; order: "asc" | "desc" }[]
    filters: TFilterSchema
  }) => Promise<TResponse>
  map: (response: TResponse) => DataTableDataResult<TData>
  keepPreviousData?: boolean
}

export interface LocalDataSourceOptions<TData> {
  rows: TData[]
  total?: number
}

export interface DataTableFeatureRuntime<TData, TFilterSchema> {
  patchTableOptions?: (args: { getRowId?: (row: TData) => string }) => Partial<TableOptions<TData>>
  patchActions?: (actions: DataTableActions) => Partial<DataTableActions>
  patchMeta?: (meta: DataTableInstance<TData, TFilterSchema>["meta"]) => unknown
  patchActivity?: (activity: DataTableActivity) => Partial<DataTableActivity>
  onReset?: () => void
}

export interface TablePreferenceStorage<TValue> {
  getSync?: (key: string) => TValue | null
  get: (key: string) => Promise<TValue | null>
  set: (key: string, value: TValue) => Promise<void>
  remove?: (key: string) => Promise<void>
}

export interface SelectionFeatureOptions<TFilterSchema> {
  enabled?: boolean
  mode?: "page" | "cross-page"
  crossPage?: {
    selectAllStrategy?: "client" | "server"
    fetchAllIds?: (filters: TFilterSchema) => Promise<string[]>
    maxSelection?: number
  }
}

export interface ColumnVisibilityFeatureOptions {
  enabled?: boolean
  storageKey: string
  defaultVisible?: Record<string, boolean>
  schemaVersion?: number
  migrate?: PreferenceMigration<Record<string, boolean>>
  storage?: TablePreferenceStorage<PreferenceEnvelope<Record<string, boolean>>>
}

export interface ColumnSizingFeatureOptions {
  enabled?: boolean
  storageKey: string
  defaultSizing?: Record<string, number>
  schemaVersion?: number
  migrate?: PreferenceMigration<Record<string, number>>
  storage?: TablePreferenceStorage<PreferenceEnvelope<Record<string, number>>>
}

export interface PinningFeatureOptions {
  enabled?: boolean
  left?: string[]
  right?: string[]
  storageKey?: string
  schemaVersion?: number
  migrate?: PreferenceMigration<{
    left: string[]
    right: string[]
  }>
  storage?: TablePreferenceStorage<
    PreferenceEnvelope<{
      left: string[]
      right: string[]
    }>
  >
}

export interface ColumnOrderFeatureOptions {
  enabled?: boolean
  storageKey: string
  defaultOrder?: string[]
  schemaVersion?: number
  migrate?: PreferenceMigration<string[]>
  storage?: TablePreferenceStorage<PreferenceEnvelope<string[]>>
}

export interface ExpansionFeatureOptions<TData> {
  enabled?: boolean
  getRowCanExpand?: (row: Row<TData>) => boolean
}

export interface DensityFeatureOptions {
  enabled?: boolean
  storageKey: string
  default?: "compact" | "comfortable"
  schemaVersion?: number
  migrate?: PreferenceMigration<"compact" | "comfortable">
  storage?: TablePreferenceStorage<PreferenceEnvelope<"compact" | "comfortable">>
}

export interface TreeFeatureOptions<TData> {
  enabled?: boolean
  getSubRows?: (row: TData) => TData[] | undefined
  loadChildren?: (row: TData) => Promise<TData[]>
  getRowCanExpand?: (row: TData) => boolean
  defaultExpandedDepth?: number
  defaultExpandedRowIds?: string[]
  selectionBehavior?: "independent" | "cascade"
  allowNesting?: boolean
  indentSize?: number
}

export interface DragSortFeatureOptions<TData> {
  enabled?: boolean
  onReorder: (args: {
    activeId: string
    overId: string
    activeIndex: number
    overIndex: number
    activeRow: TData
    overRow: TData
    reorderedRows?: TData[]
    dropPosition?: "above" | "below" | "inside"
    activeParentId?: string | null
    overParentId?: string | null
    targetParentId?: string | null
    targetIndex?: number
  }) => void | Promise<void>
  onError?: (args: {
    error: unknown
    activeId: string
    overId: string
    dropPosition: "above" | "below" | "inside"
  }) => void
  handle?: boolean
  canDrag?: (row: TData) => boolean
  canDrop?: (activeRow: TData, overRow: TData) => boolean
  dragOverlay?: "row" | "ghost" | "minimal"
  allowNesting?: boolean
}

export interface VirtualizationFeatureOptions {
  enabled?: boolean
  mode?: "windowed" | "infinite"
  rowHeight?: number
  overscan?: number
  loadMore?: () => void | Promise<void>
  loadMoreOffset?: number
}

export interface AnalyticsFeatureOptions<TData> {
  enabled?: boolean
  groupBy?: (row: TData) => string
  groupLabel?: (args: { group: string; count: number }) => string
  summary?: {
    label?: string
    labelColumnId?: string
    values: Record<string, (rows: TData[]) => ReactNode>
  }
}

export interface DataTableFeatures<TData, TFilterSchema> {
  selection?: SelectionFeatureOptions<TFilterSchema>
  columnVisibility?: ColumnVisibilityFeatureOptions
  columnSizing?: ColumnSizingFeatureOptions
  pinning?: PinningFeatureOptions
  columnOrder?: ColumnOrderFeatureOptions
  virtualization?: VirtualizationFeatureOptions
  analytics?: AnalyticsFeatureOptions<TData>
  expansion?: ExpansionFeatureOptions<TData>
  density?: DensityFeatureOptions
  tree?: TreeFeatureOptions<TData>
  dragSort?: DragSortFeatureOptions<TData>
}

export interface DataTableColumnMeta extends ColumnMeta<unknown, unknown> {
  headerClassName?: string
  cellClassName?: string
  align?: "left" | "center" | "right"
  headerAlign?: "left" | "center" | "right"
  cellAlign?: "left" | "center" | "right"
  hideable?: boolean
  pinned?: "left" | "right" | false
  headerLabel?: string
}

export type FilterType =
  | "text"
  | "select"
  | "multi-select"
  | "date"
  | "date-range"
  | "number-range"
  | "boolean"
  | "custom"

export interface FilterOption<TValue> {
  label: string
  value: TValue
}

export interface FilterDefinition<
  TFilterSchema,
  K extends keyof TFilterSchema = keyof TFilterSchema,
> {
  key: K
  label: string
  type: FilterType
  options?: Array<FilterOption<TFilterSchema[K]>>
  placeholder?: string
  render?: (args: {
    value: TFilterSchema[K]
    onChange: (value: TFilterSchema[K]) => void
    onRemove: () => void
  }) => ReactNode
  defaultVisible?: boolean
  alwaysVisible?: boolean
}

export interface TableCodec<TOutput> {
  parse: (input: Record<string, string | string[] | undefined>) => TOutput
  serialize: (value: TOutput) => Record<string, string | null | undefined>
}

export type InferParserValues<TParsers extends ParserMap | undefined> = TParsers extends ParserMap
  ? inferParserType<TParsers>
  : Record<string, unknown>

export type UrlStateMiddleware<TFilterSchema> = (args: {
  prev: TableStateSnapshot<TFilterSchema>
  next: TableStateSnapshot<TFilterSchema>
}) => TableStateSnapshot<TFilterSchema>

export interface UrlStateOptions<TParsers extends ParserMap | undefined> {
  key: string
  parsers?: TParsers
  codec?: TableCodec<InferParserValues<TParsers>>
  defaults?: Partial<InferParserValues<TParsers>>
  behavior?: {
    history?: "push" | "replace"
    resetPageOnFilterChange?: boolean
    resetPageOnSearchChange?: boolean
    searchKey?: string
    middleware?: UrlStateMiddleware<InferParserValues<TParsers>>
  }
}

export interface ControlledStateOptions<TFilterSchema> {
  value: {
    page: number
    size: number
    sort: TableSort[]
    filters: TFilterSchema
  }
  onChange: (next: ControlledStateOptions<TFilterSchema>["value"]) => void
  behavior?: {
    resetPageOnFilterChange?: boolean
  }
}

export interface InternalStateOptions<TFilterSchema> {
  initial: {
    page?: number
    size?: number
    sort?: TableSort[]
    filters?: TFilterSchema
  }
  behavior?: {
    resetPageOnFilterChange?: boolean
  }
}
