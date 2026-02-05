# 表格组件 V2 设计文档

本文档描述一个“彻底不兼容升级”的表格组件体系。它以 **Headless 内核 + 状态/数据源适配器 + UI 组合组件** 为核心，目标是让业务接入表格时只需要配置：列定义、数据源、状态来源与功能开关，其他能力均标准化、可复用、可持久化。

> 范围：仅描述对外 API 与模块分层设计，不包含具体实现代码。

---

## 1. 背景与问题

当前体系具备良好的架构原则（以 TanStack Table 的 `table` 实例为单一事实来源），但在实际使用中仍存在“能力入口分散”的现象：

- URL 同步：业务层 `useDataTable`、组件层 `DataTableSearch` 都会操作 URL（两套口径）。
- UI 状态：`loading/empty/fetching/error` 在 Hook 与 UI 之间缺少统一状态模型，导致调用方需要拼装 props。
- 功能扩展：列显示、列宽、固定列、选择/批量操作等能力缺少统一的 feature 接入方式与持久化约束。
- 组合方式过多：`PaginatedTable`、`DataTableContainer`、`DataTablePagination`、`DataTableToolbar`、`DataTableFilterBar` 的责任边界可以更清晰并进一步收敛。

V2 方案以“统一 dt（data-table instance）模型”为中心，通过适配器与 feature 配置，把分散能力收敛到一个核心 API。

---

## 2. 目标与非目标

### 2.1 目标

- 一个核心 Hook：`useDataTable()` 统一产出 `dt`（包含 table、状态、动作、分页、筛选）。
- UI 组件只消费 `dt`：不再要求调用方显式传 `loading/empty/pagination/onPageChange...`。
- 状态来源可插拔：支持 `URL` / `受控` / `内部` 三种模式，且对业务暴露一致的 `dt.filters` 与 `dt.actions`。
- 数据源可插拔：支持 `remote`（TanStack Query）与 `local`（前端数据）等统一接口。
- 功能以 feature 开关接入：selection、columnVisibility、columnSizing、pinning、expansion、density 等按需启用并可持久化。
- 全局/局部 i18n 统一：所有文本与可访问性名称都通过 config 统一管理，组件可局部覆盖。

### 2.2 非目标

- 不追求与现有 API 兼容。
- 不在 V2 第一阶段实现虚拟滚动；只预留 API 形状。
- 不在 Hook 内部绑定具体 UI 组件库（shadcn），UI 层单独实现。

---

## 3. 核心设计原则

- **Single Source of Truth**：所有表格交互状态（排序、筛选、分页、选择、列可见性、列宽等）最终进入 TanStack Table 的 state（或与其一一映射）。
- **One dt to rule them all**：业务只拿到一个 `dt` 对象作为表格的唯一入口。
- **Adapters over branches**：URL/受控/内部状态通过适配器实现，不在业务层写分支逻辑。
- **Features are configuration**：功能通过 `features` 描述，而非“额外组件 + 额外状态 + 额外约定”。
- **UI is a pure consumer**：UI 只读取 `dt` 并调用 `dt.actions`，不再自行操作 URL、Query、TanStack Table state。

---

## 4. 对外 API（建议形态）

### 4.1 `useDataTable`：统一入口

```ts
export interface UseDataTableOptions<TData, TFilterSchema> {
  columns: ColumnDef<TData>[]
  dataSource: DataSource<TData, TFilterSchema>
  state: TableStateAdapter<TFilterSchema>
  features?: DataTableFeatures<TData, TFilterSchema>
  getRowId?: (row: TData) => string
}

export function useDataTable<TData, TFilterSchema>(
  options: UseDataTableOptions<TData, TFilterSchema>,
): DataTableInstance<TData, TFilterSchema>
```

### 4.2 `DataTableInstance`：统一返回值

```ts
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

// selection 始终存在，未启用时 enabled=false，其余字段为默认空值
export interface DataTableSelection<TData> {
  enabled: boolean
  mode: "page" | "cross-page"
  selectedRowIds: string[]
  selectedRowsCurrentPage: TData[]
}

export interface DataTableInstance<TData, TFilterSchema> {
  table: Table<TData>
  status: DataTableStatus
  activity: DataTableActivity
  pagination: DataTablePagination
  filters: TableFilters<TFilterSchema>
  actions: DataTableActions
  selection: DataTableSelection<TData>  // 始终存在，通过 enabled 判断是否可用
  errors?: {
    blocking?: unknown
    nonBlocking?: unknown
  }
  meta: {
    feature: {
      selectionEnabled: boolean
      columnVisibilityEnabled: boolean
      columnSizingEnabled: boolean
      pinningEnabled: boolean
      expansionEnabled: boolean
      densityEnabled: boolean
    }
  }
}
```

说明：

- `status` 只表达“主渲染态”。当已有可渲染数据但本轮刷新失败时，`status` 仍为 `ready`，错误写入 `errors.nonBlocking`，UI 以轻量提示/按钮重试呈现，不打断阅读。
- `activity.preferencesReady` 用于表达偏好（列显隐/列宽/density 等）是否已完成 hydration；避免“先用默认值渲染 → 异步回填跳变”。
- `selection` **始终存在**，通过 `enabled` 字段判断能力是否启用（未启用时 `enabled=false`，其余字段为默认空值）。这样设计避免业务层每次使用都需要判断可空性。`selectedRowsCurrentPage` 永远只代表当前页可见行数据，跨页批量应以 `selectedRowIds` 为主。

### 4.3 `actions`：所有交互动作统一出口

> **设计原则**：所有方法始终存在，未启用对应 feature 时为 no-op（空函数）。这样设计让调用方无需判断方法是否存在，API 签名更稳定。

```ts
export interface DataTableActions {
  // 数据操作
  refetch: () => void | Promise<void>       // 刷新数据，非远程数据源时为 no-op
  retry: () => void | Promise<void>         // 重试失败请求，无错误时为 no-op
  resetAll: () => void                      // 重置所有状态

  // 分页与排序
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSort: (sort: { field: string; order: "asc" | "desc" }[]) => void  // 数组格式，单列时只传一个元素，空数组清除排序
  clearSort: () => void

  // 选择操作（未启用 selection 时为 no-op）
  clearSelection: () => void
  selectAllCurrentPage: () => void
  selectAllMatching: () => void | Promise<void>

  // 偏好重置（未启用对应 feature 时为 no-op）
  resetColumnVisibility: () => void
  resetColumnSizing: () => void
  resetDensity: () => void
}
```

### 4.4 `filters`：强类型筛选模型（替代松散的 Record）

```ts
export interface TableFilters<TFilterSchema> {
  state: TFilterSchema
  set: <K extends keyof TFilterSchema>(key: K, value: TFilterSchema[K]) => void
  setBatch: (updates: Partial<TFilterSchema>) => void  // 批量更新，只触发一次状态变更
  reset: () => void
}
```

说明：

- `TFilterSchema` 由状态适配器决定（URL/受控/内部）。
- URL 模式下建议由 parser/schema 推导出值类型，避免 `any`。

---

## 5. 核心契约（必须形式化）

V2 的可控性来自“接口契约硬约束 + 组合顺序确定”。核心约定：

- State Adapter 只负责“读写状态 + 业务行为约定（例如筛选变化重置 page）”，不负责发请求与拼 queryKey。
- Data Source 只负责“把 query 变成 rows + pagination + activity”，不关心 URL 与 UI。
- Feature 以统一运行时接口注入 tableOptions/state/actions/meta，core 不能靠 if/else 堆叠能力。

### 5.1 `TableStateAdapter<TFilterSchema>`

```ts
export interface TableSort {
  field: string
  order: "asc" | "desc"
}

export interface TableStateSnapshot<TFilterSchema> {
  page: number
  size: number
  sort: TableSort[]  // 数组格式，空数组表示无排序；单列排序时只使用第一个元素
  filters: TFilterSchema
}

export type TableStateChangeReason =
  | "init"
  | "page"
  | "size"
  | "sort"
  | "filters"
  | "reset"

export interface TableStateAdapter<TFilterSchema> {
  getSnapshot: () => TableStateSnapshot<TFilterSchema>
  setSnapshot: (
    next: TableStateSnapshot<TFilterSchema>,
    reason: TableStateChangeReason,
  ) => void
  subscribe: (listener: () => void) => () => void
}
```

约定：

- `getSnapshot` 必须同步可用（用于首屏初始化）。URL/受控/内部三种模式都要满足。
- `setSnapshot` 的行为约束（例如筛选变化自动 page=1）必须在 adapter 内完成，避免 core 与 UI 重复实现。
- `subscribe` 仅用于驱动 core 重新计算 query 与触发 dataSource；UI 不直接订阅 adapter。

### 5.2 `DataSource<TData, TFilterSchema>`

```ts
export interface DataTableQuery<TFilterSchema> {
  page: number
  size: number
  sort: { field: string; order: "asc" | "desc" } | null
  filters: TFilterSchema
}

export interface DataTableDataResult<TData> {
  rows: TData[]
  pageCount: number
  total?: number
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
```

约定：

- `query.filters` 必须保持强类型贯通，dataSource 不得退化为 `Record<string, unknown>`。
- dataSource 可以自行决定缓存与请求策略（例如 TanStack Query），但不拥有 URL 读写权。

### 5.3 `DataTableFeature<TData, TFilterSchema>`（运行时接口）

```ts
export interface DataTableFeatureRuntime<TData, TFilterSchema> {
  patchTableOptions?: (args: {
    getRowId?: (row: TData) => string
  }) => Partial<TableOptions<TData>>
  patchActions?: (actions: DataTableActions) => Partial<DataTableActions>
  patchMeta?: (meta: DataTableInstance<TData, TFilterSchema>["meta"]) => unknown
  patchActivity?: (activity: DataTableActivity) => Partial<DataTableActivity>
  onReset?: () => void
}
```

约定：

- core 以确定顺序应用 features：`state -> features -> table -> dataSource -> dt`。
- feature 不得直接依赖 URL/Query，只能通过 runtime patch 与 storage/hydration 接口间接影响行为。

---

## 6. 状态适配器（State Adapters）

状态适配器负责提供：

- 初始状态（page/size/sort/filters）
- 状态变更写入（URL / props 回调 / 内部 state）
- 业务约定（例如 filter 或搜索改变时自动把 page 重置为 1）

### 6.1 `state.url(...)`

```ts
export interface TableCodec<TOutput> {
  parse: (input: Record<string, string | string[] | undefined>) => TOutput
  serialize: (value: TOutput) => Record<string, string | null | undefined>
}

export type UrlStateMiddleware<TFilterSchema> = (args: {
  prev: { page: number; size: number; sort: { field: string; order: "asc" | "desc" }[]; filters: TFilterSchema }
  next: { page: number; size: number; sort: { field: string; order: "asc" | "desc" }[]; filters: TFilterSchema }
}) => {
  page: number
  size: number
  sort: { field: string; order: "asc" | "desc" }[]
  filters: TFilterSchema
}

export interface UrlStateOptions<TParsers> {
  key: string
  parsers?: TParsers
  codec?: TableCodec<InferParserValues<TParsers>>
  defaults?: Partial<InferParserValues<TParsers>>
  behavior?: {
    history?: "push" | "replace"
    resetPageOnFilterChange?: boolean
    resetPageOnSearchChange?: boolean
    middleware?: UrlStateMiddleware<InferParserValues<TParsers>>
  }
}

export function stateUrl<TParsers>(
  options: UrlStateOptions<TParsers>,
): TableStateAdapter<InferParserValues<TParsers>>
```

约定：

- `page/size/sort/q` 等保留字段由 V2 统一管理，不再允许组件各自写入。
- `sort` 字符串序列化规范统一为 `field.asc|field.desc`（或 `field.asc` 这种），由 adapter 解析与生成。
- URL 入参天然是字符串，`parsers/codec` 是唯一的类型转换入口；业务不得在 UI 层自行做 string → number/date 的隐式转换。
- 默认实现路径以 TanStack Router 的 search 语义为准：adapter 通过 Router 的 search 读写完成状态同步；`key` 用作命名空间前缀，避免与页面其他 search 参数冲突。

强类型建议：

- 优先使用 TanStack Router 的搜索校验/解析能力（例如 schema/validator），`codec` 作为可选的严格校验入口（例如 `zod`），将校验失败映射为默认值或剔除非法字段。

### 6.2 `state.controlled(...)`

```ts
export interface ControlledStateOptions<TFilterSchema> {
  value: {
    page: number
    size: number
    sort: { field: string; order: "asc" | "desc" }[]
    filters: TFilterSchema
  }
  onChange: (next: ControlledStateOptions<TFilterSchema>["value"]) => void
  behavior?: {
    resetPageOnFilterChange?: boolean
  }
}

export function stateControlled<TFilterSchema>(
  options: ControlledStateOptions<TFilterSchema>,
): TableStateAdapter<TFilterSchema>
```

### 6.3 `state.internal(...)`

```ts
export interface InternalStateOptions<TFilterSchema> {
  initial: {
    page?: number
    size?: number
    sort?: { field: string; order: "asc" | "desc" }[]
    filters?: TFilterSchema
  }
  behavior?: {
    resetPageOnFilterChange?: boolean
  }
}

export function stateInternal<TFilterSchema>(
  options: InternalStateOptions<TFilterSchema>,
): TableStateAdapter<TFilterSchema>
```

---

## 7. 数据源适配器（Data Sources）

数据源只负责“给 rows + 分页信息”，不关心 UI、URL、feature。

### 7.1 `dataSource.remote(...)`（TanStack Query）

```ts
export interface RemoteDataSourceOptions<TData, TFilterSchema, TResponse> {
  queryKey: unknown[]
  queryFn: (params: {
    page: number
    size: number
    sort: { field: string; order: "asc" | "desc" }[]
    filters: TFilterSchema
  }) => Promise<TResponse>
  map: (response: TResponse) => {
    rows: TData[]
    pageCount: number
    total?: number
  }
}

export function remote<TData, TFilterSchema, TResponse>(
  options: RemoteDataSourceOptions<TData, TFilterSchema, TResponse>,
): DataSource<TData, TFilterSchema>
```

约定：

- `queryKey` 由 core 统一追加 state 依赖（filters/sort/page/size），业务无需手动拼接。
- `map` 是唯一的“非标准响应格式”入口。
- 必须明确区分“进入 queryKey 的状态”和“只进入 queryFn 的参数”，避免缓存污染与不必要 refetch。
- `filters/sort` 用于 queryKey 时必须稳定化（例如结构化序列化、稳定 key 排序或结构共享）；稳定化策略由 core 统一完成，避免业务各自实现导致缓存碎片化。

### 7.2 `dataSource.local(...)`

```ts
export interface LocalDataSourceOptions<TData> {
  rows: TData[]
  total?: number
}

export function local<TData, TFilterSchema>(
  options: LocalDataSourceOptions<TData>,
): DataSource<TData, TFilterSchema>
```

---

## 8. Feature 配置（Features）

feature 的职责是：声明需要哪些 TanStack state、是否持久化、是否注入额外列/工具组件所需信息。

```ts
export interface TablePreferenceStorage<TValue> {
  getSync?: (key: string) => TValue | null
  get: (key: string) => Promise<TValue | null>
  set: (key: string, value: TValue) => Promise<void>
  remove?: (key: string) => Promise<void>
}

// 统一 feature 配置格式：{ enabled?: boolean, ...options }
// 所有 feature 的 enabled 默认为 true（传入配置对象即表示启用）

export interface SelectionFeatureOptions {
  enabled?: boolean
  mode?: "page" | "cross-page"
}

export interface ColumnVisibilityFeatureOptions {
  enabled?: boolean
  storageKey: string
  defaultVisible?: Record<string, boolean>
  storage?: TablePreferenceStorage<Record<string, boolean>>
}

export interface ColumnSizingFeatureOptions {
  enabled?: boolean
  storageKey: string
  defaultSizing?: Record<string, number>
  storage?: TablePreferenceStorage<Record<string, number>>
}

export interface PinningFeatureOptions {
  enabled?: boolean
  left?: string[]
  right?: string[]
}

export interface ExpansionFeatureOptions<TData> {
  enabled?: boolean
  getRowCanExpand?: (row: Row<TData>) => boolean
}

export interface DensityFeatureOptions {
  enabled?: boolean
  storageKey: string
  default?: "compact" | "comfortable"
  storage?: TablePreferenceStorage<"compact" | "comfortable">
}

export interface DataTableFeatures<TData, TFilterSchema> {
  selection?: SelectionFeatureOptions
  columnVisibility?: ColumnVisibilityFeatureOptions
  columnSizing?: ColumnSizingFeatureOptions
  pinning?: PinningFeatureOptions
  expansion?: ExpansionFeatureOptions<TData>
  density?: DensityFeatureOptions
}
```

约定：

- **统一配置格式**：所有 feature 配置都包含 `enabled` 字段（默认 `true`）。如需禁用已配置的 feature，设置 `enabled: false`。
- 如果 `selection` 启用，core 将提供一个标准的 selection column 工厂（或直接注入）。
- `selection.mode = "page"`：翻页后不保留上一页选择（默认更简单，适配大多数场景）。
- `selection.mode = "cross-page"`：必须提供 `getRowId`，且 selection 内部语义升级为“选中的 RowId 集合”；翻页后可重建选中状态。
- 如果 `columnVisibility/columnSizing/density` 启用，必须指定 `storageKey`，避免“没持久化导致体验不一致”。
- 偏好存储 hydration：优先使用 `getSync`（例如 localStorage）在首屏同步注入，`get` 作为异步兜底（例如 indexedDB/远端）；当存在异步 hydration 时，core 必须将 `activity.preferencesReady` 置为 `false`，并在 hydration 完成后再置为 `true`，以便 UI 避免布局跳变。

---

## 9. UI API（组件层，对外导出建议）

UI 层只依赖 `dt`，不直接依赖 URL/Query。

### 9.1 Root 与子组件

```tsx
export function DataTableRoot<TData, TFilterSchema>(props: {
  dt: DataTableInstance<TData, TFilterSchema>
  height?: string
  className?: string
  children: ReactNode
}): JSX.Element

export function DataTableToolbar(props: { children?: ReactNode }): JSX.Element
export function DataTableSearch(props: {
  filterKey?: string
  placeholder?: string
  debounceMs?: number
}): JSX.Element
export function DataTableColumnToggle(): JSX.Element
export function DataTableTable(props?: {
  renderEmpty?: () => ReactNode
  renderError?: (error: unknown, retry?: () => void | Promise<void>) => ReactNode
}): JSX.Element
export function DataTablePagination(): JSX.Element
export function DataTableSelectionBar<TData>(props: {
  actions?: (args: {
    selectedRowIds: string[]
    selectedRowsCurrentPage: TData[]
    mode: "page" | "cross-page"
  }) => ReactNode
}): JSX.Element
```

说明：

- `DataTableSearch` 只更新 `dt.filters.set(filterKey, value)`，默认 `filterKey = "q"`。
- `DataTableSearch.debounceMs` 默认 300ms；URL 模式下由 state adapter 负责将“输入态”和“已提交态”统一为一个规范（UI 不直接操作 URL）。
- `DataTablePagination` 调用 `dt.actions.setPage/setPageSize`，显示 `dt.pagination`。
- `DataTableTable` 仅渲染 table（header/body/empty/error/loading），其状态来自 `dt.status`。
- `DataTableSelectionBar` 以 `selectedRowIds` 为跨页批量的主入口；`selectedRowsCurrentPage` 仅用于“当前页批量”或展示选中摘要。

### 9.2 默认布局（一把梭用法）

```tsx
const dt = useDataTable({
  columns,
  dataSource: remote({ queryKey: ["users"], queryFn: getUsers, map }),
  state: stateUrl({ key: "users", parsers }),
  features: { selection: true, columnVisibility: { storageKey: "users.columns" } },
})

return (
  <DataTableRoot dt={dt} height="calc(100vh - 240px)">
    <DataTableToolbar>
      <DataTableSearch filterKey="q" />
      <DataTableColumnToggle />
    </DataTableToolbar>
    <DataTableTable />
    <DataTableSelectionBar
      actions={({ selectedRowIds, selectedRowsCurrentPage, mode }) => (
        <BatchActions
          selectedRowIds={selectedRowIds}
          selectedRowsCurrentPage={selectedRowsCurrentPage}
          mode={mode}
        />
      )}
    />
    <DataTablePagination />
  </DataTableRoot>
)
```

---

## 10. 状态机与 UI 反馈标准

### 10.1 status 规范

- `error`：展示 error state，并提供 retry（`dt.actions.retry`）。
- `empty`：展示 empty state（允许 i18n/slot 覆盖）。
- `ready`：正常渲染 rows。

### 10.2 fetching（刷新态）

刷新态不进入 `status`，统一由 `dt.activity.isFetching` 表达：

- `dt.activity.isInitialLoading = true`：首次加载且无可渲染数据，UI 展示骨架屏/全屏 loading。
- `dt.activity.isFetching = true`：已有数据但后台刷新（翻页、筛选、排序触发的请求），UI 建议展示轻量反馈（进度条/局部蒙层/按钮 loading），避免打断阅读。

约定：

- `status` 只表达“主渲染态”（error/empty/ready），避免与 fetching 组合导致状态机膨胀。
- “stale 数据 + error”：当存在可渲染数据且请求失败时，保持 `status=ready`，同时设置 `errors.nonBlocking`；UI 以非阻断方式展示错误与重试入口（toast/banner/按钮态）。

---

## 11. 性能与引用稳定性约束

V2 必须保证“重渲染不扩散”，否则会出现每次 dt 变化导致 Cell 全量刷新。

约定：

- `useDataTable` 内部必须保证这些引用稳定：
  - `dt.actions`：使用稳定的回调与 memo 容器。
  - `dt.filters`：对外暴露的对象引用稳定，只在其内部字段变化。
  - `dt`：可以不要求整体对象稳定，但 UI 侧 Context 不应直接以“整对象变化”驱动所有子组件刷新。
- UI 层建议：
  - 采用拆分 Context（例如 `TableContext/ActionsContext/ConfigContext`）或 selector 模式，减少不相关状态变化造成的重渲染。
  - 对 Cell/Row 等热点组件使用 memo（在不破坏正确性的前提下）。

---

## 12. i18n 与可访问性约束

### 12.1 i18n

所有文案统一来自 `TableConfigProvider`：

- `emptyText/loadingText/refreshingText`
- pagination 文案
- column toggle 文案
- search placeholder

组件允许局部覆盖，但不得硬编码默认值。

建议接口形态：

```ts
export interface DataTableI18n {
  emptyText: string
  loadingText: string
  refreshingText: string
  retryText: string
  searchPlaceholder: string
  columnToggleLabel: string
  selectionCheckboxLabel: string
  pagination: {
    prevPage: string
    nextPage: string
    pageSize: string
    total: (total: number) => string
  }
}
```

### 12.2 可访问性

- icon-only button 必须有可访问性名称（`aria-label`），且默认从 i18n 提供。
- selection checkbox 的 `aria-label` 统一配置，不在列定义里写死英文。

---

## 13. 推荐的目录结构（V2）

> 仅建议，不强制。核心目的：隔离 core 与 ui，避免相互污染。

```
src/components/table/v2/
  core/
    use-data-table.ts
    data-source/
      remote.ts
      local.ts
    state/
      url.ts
      controlled.ts
      internal.ts
    features/
      selection.ts
      column-visibility.ts
      column-sizing.ts
      pinning.ts
      expansion.ts
      density.ts
    types.ts
  ui/
    root.tsx
    toolbar.tsx
    search.tsx
    table.tsx
    pagination.tsx
    selection-bar.tsx
    column-toggle.tsx
  index.ts
```

---

## 14. 分阶段实施计划（建议）

### 阶段 1：dt 统一模型

- 完成 `useDataTable`（内部组合 state adapter + dataSource + TanStack table state）。
- 完成 `DataTableRoot + DataTableTable + DataTablePagination`（最小 UI 闭环）。

### 阶段 2：feature 基础能力

- selection（含 selection column 与 selection bar）
- columnVisibility（含持久化）
- columnSizing（含持久化，先不做拖拽 UI 也可先接 state）

### 阶段 3：高级能力

- pinning、expansion、density
- 虚拟滚动 API 预留 → 评估是否引入 `@tanstack/react-virtual`

---

## 15. 状态机与流程图

### 15.1 主状态机（Status）

```mermaid
stateDiagram-v2
    [*] --> InitialLoading: 组件挂载

    InitialLoading --> Ready: 首次加载成功<br/>rows.length > 0
    InitialLoading --> Empty: 首次加载成功<br/>rows.length = 0
    InitialLoading --> Error: 首次加载失败

    Ready --> Ready: 刷新成功
    Ready --> Ready: 刷新失败<br/>保留旧数据<br/>errors.nonBlocking
    Ready --> Empty: 刷新成功<br/>rows.length = 0

    Empty --> Ready: 刷新成功<br/>rows.length > 0
    Empty --> Empty: 刷新成功<br/>仍无数据
    Empty --> Error: 刷新失败<br/>无可用数据

    Error --> Ready: 重试成功<br/>rows.length > 0
    Error --> Empty: 重试成功<br/>rows.length = 0
    Error --> Error: 重试失败
```

### 15.2 Status 与 Activity 协作矩阵

| 场景 | status.type | activity.isInitialLoading | activity.isFetching | errors |
|------|-------------|---------------------------|---------------------|--------|
| 首次加载中 | - | `true` | `true` | - |
| 首次加载成功，有数据 | `ready` | `false` | `false` | - |
| 首次加载成功，无数据 | `empty` | `false` | `false` | - |
| 首次加载失败 | `error` | `false` | `false` | `blocking` |
| 有数据，后台刷新中 | `ready` | `false` | `true` | - |
| 有数据，刷新成功 | `ready` | `false` | `false` | - |
| 有数据，刷新失败 | `ready` | `false` | `false` | `nonBlocking` |
| 无数据，刷新失败 | `error` | `false` | `false` | `blocking` |

### 15.3 偏好 Hydration 要点

- 优先使用 `getSync`（如 localStorage）在首屏同步注入偏好
- 异步 hydration 期间 `activity.preferencesReady = false`
- hydration 完成后置为 `true`，UI 可据此避免布局跳变

---

## 16. 错误处理策略细化

### 16.2 错误类型定义

```ts
export type ErrorSeverity = "blocking" | "nonBlocking"

export interface DataTableError {
  severity: ErrorSeverity
  code: string
  message: string
  original: unknown
  retryable: boolean
}

export interface DataTableErrors {
  blocking?: DataTableError
  nonBlocking?: DataTableError
}
```

### 16.3 HTTP 状态码映射规则

| HTTP 状态码 | 场景 | 处理策略 |
|-------------|------|----------|
| 400 Bad Request | 请求参数错误 | blocking（首次）/ nonBlocking（刷新），提示用户修改筛选条件 |
| 401 Unauthorized | 未认证 | blocking，触发登录流程 |
| 403 Forbidden | 无权限 | blocking，展示权限不足提示 |
| 404 Not Found | 资源不存在 | 根据业务决定：可作为 empty 或 error |
| 408 / 504 Timeout | 超时 | 保留旧数据（如有），retryable=true |
| 429 Too Many Requests | 限流 | 保留旧数据（如有），retryable=true，建议延迟重试 |
| 500-503 Server Error | 服务端错误 | 保留旧数据（如有），retryable=true |
| Network Error | 网络断开 | 保留旧数据（如有），retryable=true |

### 16.4 UI 错误反馈规范

```tsx
// blocking 错误：全屏覆盖
interface BlockingErrorProps {
  error: DataTableError
  onRetry?: () => void
}

// nonBlocking 错误：轻量提示
interface NonBlockingErrorProps {
  error: DataTableError
  onRetry?: () => void
  onDismiss?: () => void
}
```

**blocking 错误 UI 规范：**
- 替代整个表格内容区域
- 显示错误图标、错误信息、重试按钮
- 如果 `retryable=false`，隐藏重试按钮

**nonBlocking 错误 UI 规范：**
- 以 Toast / Banner 形式展示在表格上方
- 不打断当前数据阅读
- 提供"重试"和"关闭"操作
- 超时后自动消失（建议 5-10 秒）

---

## 17. 排序扩展设计（预留）

当前 V2 仅支持**单列排序**，但 API 设计已预留多列排序扩展空间：

| 特性 | 当前 (V2.0) | 未来扩展 |
|------|-------------|----------|
| 排序类型 | `TableSort[]`（单元素） | `TableSort[]`（多元素） |
| URL 格式 | `?sort=name.asc` | `?sort=name.asc,createdAt.desc` |
| Feature 开关 | - | `multiSort: { enabled, maxColumns }` |

向后兼容策略：通过归一化函数在单列与多列格式间转换。

---

## 18. 虚拟滚动接入设计（预留）

V2.0 **不实现**虚拟滚动，仅预留 API 形状，后续版本渐进接入。

### API 预留

```ts
export interface VirtualizationOptions {
  mode: "windowed" | "infinite"
  estimatedRowHeight: number
  overscan?: number // 默认 5
  getRowHeight?: (index: number) => number
}
```

### 分阶段实施

| 阶段 | 能力 | 说明 |
|------|------|------|
| V2.0 | 不实现 | 仅预留 API 形状 |
| V2.1 | windowed 模式 | 垂直虚拟滚动，固定行高 |
| V2.2 | 动态行高支持 | 支持 getRowHeight |
| V2.3 | infinite 模式 | 结合分页的无限滚动 |

### 约束

- 表头必须 sticky，tbody 独立滚动
- Selection 必须基于 rowId，不能依赖 DOM 索引

---

## 19. 跨页选择语义

### 19.1 选择模式对比

```mermaid
flowchart LR
    subgraph PageMode["page 模式"]
        A1[翻页] --> A2[清空选择]
        A3[选中行] --> A4[仅当前页数据]
    end

    subgraph CrossPageMode["cross-page 模式"]
        B1[翻页] --> B2[保留选择]
        B3[选中行] --> B4[跨页 ID 集合]
    end
```

### 19.2 跨页选择状态模型

```ts
export interface CrossPageSelection {
  mode: "include" | "exclude"
  rowIds: Set<string>
  // mode = "include": rowIds 表示被选中的行
  // mode = "exclude": rowIds 表示被排除的行（用于"全选后取消部分"场景）
}

export interface DataTableSelection<TData> {
  mode: "page" | "cross-page"

  // page 模式
  selectedRowIds: string[] // 当前页选中的 ID
  selectedRowsCurrentPage: TData[] // 当前页选中的行数据

  // cross-page 模式扩展
  crossPage?: {
    selection: CrossPageSelection
    totalSelected: number | "all" // 选中总数或"全部"
    isAllSelected: boolean
  }
}
```

### 19.3 全选语义

```ts
export interface DataTableActions {
  // ...existing actions

  // 全选当前页
  selectAllCurrentPage?: () => void

  // 全选所有匹配项（跨页）
  selectAllMatching?: () => void | Promise<void>

  // 切换为"全选排除模式"
  // 返回值：是否需要向后端请求所有 ID
  toggleSelectAllMatching?: () => {
    needsFetch: boolean
    fetch?: () => Promise<string[]>
  }

  // 清空选择
  clearSelection?: () => void

  // 反选（可选）
  invertSelection?: () => void
}
```

### 19.4 全选策略选项

```ts
export interface SelectionFeatureOptions {
  mode: "page" | "cross-page"

  // cross-page 模式专用配置
  crossPage?: {
    // 全选策略
    selectAllStrategy: "client" | "server"

    // client: 前端标记为"全选排除模式"，不请求所有 ID
    //   - 优点：无需额外请求
    //   - 缺点：批量操作时需后端支持"全选排除"语义

    // server: 请求所有匹配的 ID
    //   - 优点：前端持有完整 ID 列表
    //   - 缺点：大数据量时性能问题

    // server 模式时必须提供
    fetchAllIds?: (filters: TFilterSchema) => Promise<string[]>

    // 最大选择数量（超出时提示用户）
    maxSelection?: number
  }
}
```



---

## 20. 筛选器 UI 层规范

### 20.1 筛选器组件体系

```
DataTableToolbar
├── DataTableSearch          # 全局搜索（默认 filterKey="q"）
├── DataTableFilterBar       # 筛选条容器
│   ├── DataTableFilterItem  # 单个筛选项
│   └── DataTableFilterReset # 重置筛选
└── DataTableActiveFilters   # 已激活筛选标签展示
```

### 20.2 筛选器类型定义

```ts
export type FilterType =
  | "text"           // 文本输入
  | "select"         // 单选下拉
  | "multi-select"   // 多选下拉
  | "date"           // 日期选择
  | "date-range"     // 日期范围
  | "number-range"   // 数字范围
  | "boolean"        // 布尔开关
  | "custom"         // 自定义渲染

export interface FilterDefinition<TFilterSchema, K extends keyof TFilterSchema> {
  key: K
  label: string
  type: FilterType

  // 类型特定配置
  options?: { label: string; value: TFilterSchema[K] }[] // 用于 select/multi-select
  placeholder?: string

  // 自定义渲染
  render?: (props: {
    value: TFilterSchema[K]
    onChange: (value: TFilterSchema[K]) => void
  }) => ReactNode

  // 显示控制
  defaultVisible?: boolean // 是否默认显示在筛选条
  alwaysVisible?: boolean  // 是否始终显示（不可收起）
}

export interface DataTableFilterBarProps<TFilterSchema> {
  filters: FilterDefinition<TFilterSchema, keyof TFilterSchema>[]
  showActiveFilters?: boolean // 是否显示已激活筛选标签
  collapsible?: boolean       // 是否可折叠
  maxVisible?: number         // 默认显示的最大筛选项数
}
```

### 20.3 筛选器与 dt.filters 协作

```tsx
// 筛选器组件内部实现
function DataTableFilterItem<TFilterSchema, K extends keyof TFilterSchema>({
  definition,
}: {
  definition: FilterDefinition<TFilterSchema, K>
}) {
  const dt = useDataTableContext()

  // 从 dt.filters.state 读取当前值
  const value = dt.filters.state[definition.key]

  // 通过 dt.filters.set 更新值
  const handleChange = (newValue: TFilterSchema[K]) => {
    dt.filters.set(definition.key, newValue)
    // 注意：state adapter 会自动处理 resetPageOnFilterChange
  }

  return renderFilterByType(definition.type, { value, onChange: handleChange })
}
```

### 20.4 已激活筛选标签

```tsx
export function DataTableActiveFilters<TFilterSchema>(props: {
  filters: FilterDefinition<TFilterSchema, keyof TFilterSchema>[]
  renderTag?: (props: {
    filter: FilterDefinition<TFilterSchema, keyof TFilterSchema>
    value: unknown
    onRemove: () => void
  }) => ReactNode
}): JSX.Element
```

**默认行为：**
- 只展示值不为 `null`/`undefined`/空字符串/空数组的筛选项
- 以 Tag/Chip 形式展示，点击 X 可移除单个筛选
- 支持"清除全部"操作

---

## 21. 列定义扩展约定

### 21.1 扩展的 ColumnMeta

```ts
import type { ColumnDef, ColumnMeta } from "@tanstack/react-table"

// V2 扩展的 ColumnMeta
export interface DataTableColumnMeta extends ColumnMeta<unknown, unknown> {
  // 显示控制
  headerClassName?: string
  cellClassName?: string

  // 功能声明
  sortable?: boolean      // 是否可排序（覆盖自动推断）
  filterable?: boolean    // 是否可筛选
  filterKey?: string      // 对应的 filterSchema key

  // 持久化控制
  hideable?: boolean      // 是否允许用户隐藏，默认 true
  resizable?: boolean     // 是否允许调整宽度，默认 true

  // 固定列
  pinned?: "left" | "right" | false

  // i18n
  headerLabel?: string    // 用于 column toggle 等场景的显示名称
}
```

### 21.2 列定义 Helper 函数

V2 提供以下标准列工厂函数（通过 `createColumnHelper` 调用）：

| 函数 | 用途 | 内置配置 |
|------|------|----------|
| `select()` | 选择列 | `id: __select__`, 40px 宽, 不可隐藏/调整 |
| `expand()` | 展开列 | `id: __expand__`, 40px 宽, 不可隐藏/调整 |
| `actions(render)` | 操作列 | `id: __actions__`, 80px 宽, 固定右侧 |

### 21.3 类型安全的列定义工厂

```ts
// 提供类型推断的列定义工厂
export function createColumnHelper<TData>() {
  return {
    accessor<TValue>(
      accessor: keyof TData | ((row: TData) => TValue),
      column: Omit<ColumnDef<TData, TValue>, "accessorKey" | "accessorFn">
    ): ColumnDef<TData, TValue> {
      if (typeof accessor === "string") {
        return { ...column, accessorKey: accessor } as ColumnDef<TData, TValue>
      }
      return { ...column, accessorFn: accessor } as ColumnDef<TData, TValue>
    },

    display(column: Omit<ColumnDef<TData>, "accessorKey" | "accessorFn">): ColumnDef<TData> {
      return column as ColumnDef<TData>
    },

    select: () => createSelectColumn<TData>(),
    expand: () => createExpandColumn<TData>(),
    actions: (render: (row: TData) => ReactNode) => createActionsColumn(render),
  }
}

// 使用示例
const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.select(),
  columnHelper.accessor("name", {
    header: "姓名",
    meta: { sortable: true, filterable: true, filterKey: "name" },
  }),
  columnHelper.accessor("email", {
    header: "邮箱",
    meta: { sortable: true },
  }),
  columnHelper.accessor((row) => row.createdAt, {
    id: "createdAt",
    header: "创建时间",
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  columnHelper.actions((row) => <UserActions user={row} />),
]
```

---

## 22. 测试策略

> 详见 [TESTING.md](TESTING.md)

---

## 23. API 稳定性保障

> V2 的核心目标之一是**长期 API 稳定**，避免未来频繁 Breaking Changes。本节总结设计决策与保障策略。

### 23.1 类型设计原则

| 原则 | 说明 | 示例 |
|------|------|------|
| **数组优于联合** | 即使当前只支持单值，也使用数组类型 | `sort: TableSort[]` 而非 `TableSort \| null` |
| **始终存在优于可选** | 避免业务层频繁判断可空 | `selection` 始终存在，通过 `enabled` 判断 |
| **no-op 优于可选方法** | 调用方无需判断方法是否存在 | `actions.clearSelection()` 始终可调用 |
| **对象优于布尔** | 便于未来扩展配置项 | `selection: { enabled, mode }` 而非 `selection: true` |
| **批量操作预留** | 常见操作提前提供批量版本 | `filters.setBatch()` |

### 23.2 向前兼容策略

当需要扩展 API 时，遵循以下策略：

```ts
// ✅ 兼容扩展：添加可选字段
interface TableSort {
  field: string
  order: "asc" | "desc"
  priority?: number  // 新增，可选
}

// ❌ Breaking Change：修改字段类型
interface TableSort {
  field: string
  order: "asc" | "desc" | "none"  // 破坏性，禁止
}
```

### 23.3 Deprecation 策略

1. **废弃周期**：废弃的 API 至少保留 **2 个次要版本**
2. **运行时警告**：废弃 API 调用时在开发环境输出 console.warn
3. **类型标记**：使用 `@deprecated` JSDoc 标记
4. **迁移文档**：每个废弃 API 提供迁移指南

```ts
/**
 * @deprecated 使用 `actions.setSort([])` 清除排序
 * 将在 v2.3 移除
 */
actions.clearSort: () => void
```

### 23.4 版本化策略

```ts
// DataTableInstance 包含版本字段，便于调试与迁移检测
interface DataTableInstance<TData, TFilterSchema> {
  __version: "2.0"  // 当前版本
  // ...
}
```

### 23.5 扩展点预留

| 预留点 | 说明 |
|--------|------|
| `status.type` | 预留未来可能的状态如 `"partial"`, `"stale"` |
| `DataTableColumnMeta.custom` | 业务层自定义字段入口 |
| `TableFilters.meta` | 预留筛选项元信息扩展 |
| `DataTableFeatures` 新 feature | 通过可选字段添加，不影响现有配置 |

### 23.6 Breaking Change 检查清单

发布新版本前必须确认：

- [ ] 新增字段均为可选或有合理默认值
- [ ] 类型签名变更有兼容层
- [ ] 废弃 API 有迁移文档
- [ ] 运行时行为变更有 feature flag 控制
- [ ] 主要变更在 CHANGELOG 中记录

