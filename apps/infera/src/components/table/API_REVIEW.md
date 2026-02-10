# 表格组件 API 设计审视报告

本文档用于记录当前表格组件（`src/components/table`）的 API 现状、缺失能力与建议的 API 设计，便于后续分批实现。

---

## 1. 现有对外 API 概览（以入口导出为准）

### 1.1 聚合入口

- 入口导出：`src/components/table/index.ts`
- 导出分层：`components / context / hooks`

### 1.2 组件层（components）

导出清单（见 `src/components/table/components/index.ts`）：

- `DataTable` / `DataTableContent`
- `DataTableContainer`
- `DataTablePagination`
- `DataTableToolbar`
- `DataTableFilterBar`
- `DataTableSearch`
- `DataTableColumnToggle`
- `PaginatedTable`
- `getSelectColumn`

### 1.3 上下文层（context）

导出清单（见 `src/components/table/context/index.ts`）：

- `TableProvider` / `useTableContext`
- `TableConfigProvider` / `useTableConfig`
- `TableI18nConfig`

### 1.4 Hook 层（hooks）

导出清单（见 `src/components/table/hooks/index.ts`）：

- `useTablePagination`
- `useTableQuery`
- `useTableInstance`
- `useElementSize`
- 相关类型：`PaginationState / SortingParams / FilterParams / UseTablePaginationOptions / UseTableQueryOptions / UseTableInstanceOptions`

### 1.5 组合关系（当前推荐接入方式）

- 业务层（URL 同步与查询）：`src/hooks/use-data-table.ts` 提供 `useDataTable`
- “一站式” UI：`PaginatedTable`（内部组合 `TableProvider + DataTableContainer + DataTable + DataTablePagination`）
- “Compound Components” 模式：`TableProvider` 包裹后，`DataTable` / `DataTablePagination` 等可从 Context 取通用状态减少 props 传递

---

## 2. 缺失能力与建议 API（按重要程度/常用频率排序）

### P0（大多数项目高频，直接影响落地效率）

#### P0.1 Error 状态 + Retry 标准化（表格级错误态）

现状：

- `useTablePagination` 暴露 `isError/error/refetch`，但 UI 层没有一等入口渲染错误态，也缺少统一的 Retry 机制。

建议 API（优先以增量方式扩展，不破坏现有用法）：

```ts
export interface TableContextValue<TData = unknown> {
  table: Table<TData>
  loading: boolean
  empty: boolean
  fetching?: boolean
  error?: unknown
  onRetry?: () => void | Promise<void>
}
```

```ts
export interface DataTableProps<TData> {
  table: TanStackTable<TData>
  errorText?: string
  errorState?: ReactNode
}
```

实施要点：

- Context 提供 `error/onRetry`，`DataTableContent` 使用 Context 兜底显示错误态（允许 props 覆盖）。
- `PaginatedTable` 可以自动透传 `fetching/error/onRetry`（例如 `onRetry = refetch`）。

#### P0.2 Selection 批量操作配套（Selection Bar）

现状：

- 已提供 `getSelectColumn()`，但缺少 “已选择数量 / 清空选择 / 批量按钮” 的标准组件。

建议 API：

```tsx
export interface DataTableSelectionBarProps<TData> {
  table?: Table<TData>
  actions?: (selectedRows: TData[]) => ReactNode
  className?: string
}

export function DataTableSelectionBar<TData>(props: DataTableSelectionBarProps<TData>): JSX.Element
```

实施要点：

- 默认从 `useTableContext()` 取 `table`，支持通过 props 覆盖。
- 内部使用 `table.getSelectedRowModel()`、`table.resetRowSelection()`。

#### P0.3 i18n 文案落地与统一口径（避免硬编码）

现状：

- `TableI18nConfig` 已定义不少文案 key，但部分组件仍存在硬编码中文/英文。

建议 API（保持与 Pagination 的 `text` 覆盖模式一致）：

```ts
export type TableTextOverrides = Partial<TableI18nConfig>

export interface DataTableSearchProps {
  text?: Pick<TableTextOverrides, "searchPlaceholder">
}

export interface DataTableColumnToggleProps<TData> {
  table: Table<TData>
  text?: Pick<TableTextOverrides, "columns" | "toggleColumns">
}

export interface DataTableFilterBarProps {
  text?: Pick<TableTextOverrides, "clearFilters" | "filterPlaceholder">
  expandText?: string
  collapseText?: string
}
```

实施要点：

- 默认值从 `useTableConfig().i18n` 读取，组件 props 覆盖优先。
- icon-only 按钮补齐可访问性名称（`aria-label`）并从 i18n 取值。

#### P0.4 DataTable props 收敛（Context 优先，减少必填参数）

现状：

- 在 `TableProvider` 内部，规范允许忽略 `loading/empty` 等通用 props，但 `DataTableProps` 目前仍要求显式传入。

建议 API（向后兼容：由必填改为可选，默认从 Context/Config 兜底）：

```ts
export type DataTableProps<TData> = {
  table: TanStackTable<TData>
  className?: string
  maxHeight?: string
  loading?: boolean
  fetching?: boolean
  empty?: boolean
  emptyText?: string
  emptyState?: ReactNode
  loadingState?: ReactNode
}
```

---

### P1（常见但可按需迭代）

#### P1.1 列宽拖拽调整 + 持久化（Column Resizing）

动机：

- 后台项目中常见，且你现在的渲染已经使用 `getSize()`，具备接入基础。

建议 API：

```ts
export interface UseColumnSizingStorageOptions {
  storageKey: string
  defaultSizing?: Record<string, number>
}

export function useColumnSizingStorage(options: UseColumnSizingStorageOptions): {
  columnSizing: Record<string, number>
  onColumnSizingChange: OnChangeFn<Record<string, number>>
  resetColumnSizing: () => void
}
```

```ts
export interface DataTableProps<TData> {
  enableColumnResize?: boolean
  columnResizeMode?: "onChange" | "onEnd"
}
```

#### P1.2 列固定（Pin/Sticky Columns）

动机：

- “选择列 + 操作列” 几乎都会需要固定左右列以改善可用性。

建议 API：

```ts
export interface UseTableInstanceOptions<TData> {
  columnPinning?: ColumnPinningState
  onColumnPinningChange?: OnChangeFn<ColumnPinningState>
}
```

#### P1.3 行展开（Row Expansion / Detail Panel）

动机：

- 详情信息密度高时，行展开比跳转详情页更高效。

建议 API：

```ts
export interface DataTableProps<TData> {
  renderRowSubComponent?: (row: Row<TData>) => ReactNode
  getRowCanExpand?: (row: Row<TData>) => boolean
}

export function getExpandColumn<TData>(): ColumnDef<TData>
```

#### P1.4 Loading Skeleton

建议 API：

```ts
export interface DataTableProps<TData> {
  loadingVariant?: "spinner" | "skeleton"
  skeletonRows?: number
}
```

---

### P2（中低频/成本较高，建议后置）

#### P2.1 虚拟滚动（Virtualized Rows）

说明：

- 当前依赖中未引入 `@tanstack/react-virtual`，实现需要新增依赖或自研。

建议 API（先定形状，后续实现）：

```ts
export type DataTableVirtualOptions =
  | false
  | { estimateRowHeight: number; overscan?: number }

export interface DataTableProps<TData> {
  virtual?: DataTableVirtualOptions
}
```

#### P2.2 密度切换（Density）+ 偏好持久化

建议 API：

```ts
export type DataTableDensity = "compact" | "comfortable"

export interface TableConfigContextValue {
  i18n: TableI18nConfig
  density?: DataTableDensity
}
```

#### P2.3 移动端卡片化（Card Table）

建议 API：

```ts
export interface DataTableProps<TData> {
  responsive?: "scroll" | "cards"
  renderCard?: (row: Row<TData>) => ReactNode
}
```

---

## 3. 推荐实现顺序（按 ROI）

1. P0：Error/Retry + SelectionBar + i18n 落地 + DataTable props 收敛
2. P1：列宽调整/持久化 + 列固定 + 行展开
3. P2：虚拟滚动 + 密度/偏好 + 移动端卡片化

