# 表格组件 V2 设计：UI 与交互规范

本文档聚焦组件层 API、状态反馈、i18n/a11y、错误处理与筛选器 UI 规范。

## 8.1 实现对齐补充（截至 2026-02-07）

以当前导出与实现为准（`packages/table/ui/*`）：

- `DataTableSelectionBar.actions` 回调参数当前额外包含：
  - `selectionScope`
  - `exportPayload`
- `DataTableTable` 已支持 `renderSubComponent`（行展开内容渲染）。
- `DataTableViewOptions` 已集成列显隐、密度切换、重置列固定、重置列顺序、重置全部。
- 文中的示例配置 `features: { selection: true }` 为旧写法；当前应使用对象写法（例如 `selection: { enabled: true }`）。

## 9. UI API（组件层，对外导出建议）

UI 层只依赖 `dt`，不直接依赖 URL/Query。

### 9.1 Root 与子组件

```tsx
export type DataTableScrollContainer = "root" | "window"

export interface DataTableLayoutOptions {
  scrollContainer?: DataTableScrollContainer
  stickyHeader?: boolean | { topOffset?: number }
  stickyPagination?: boolean | { bottomOffset?: number }
}

export function DataTableRoot<TData, TFilterSchema>(props: {
  dt: DataTableInstance<TData, TFilterSchema>
  height?: string
  className?: string
  layout?: DataTableLayoutOptions
  children: ReactNode
}): JSX.Element

export function DataTablePreset<TData, TFilterSchema>(props: {
  dt: DataTableInstance<TData, TFilterSchema>
  height?: string
  className?: string
  layout?: DataTableLayoutOptions
  query: DataTablePresetQueryProps<TFilterSchema>
  table?: Pick<DataTableTableProps<TData>, "renderSubComponent" | "renderEmpty" | "renderError">
  selectionBarActions?: DataTableSelectionBarProps<TData, TFilterSchema>["actions"]
  selectionBarClassName?: string
  pagination?: DataTablePaginationProps | false
}): JSX.Element

export function createDataTableQueryPreset<TFilterSchema>(
  options: DataTablePresetQueryProps<TFilterSchema>,
): DataTablePresetQueryProps<TFilterSchema>

export function DataTableViewOptions(props?: {
  showResetAll?: boolean
}): JSX.Element
export function DataTableColumnToggle(): JSX.Element
export function DataTableDensityToggle(): JSX.Element
export function DataTableTable(props?: {
  renderEmpty?: () => ReactNode
  renderError?: (error: unknown, retry?: () => void | Promise<void>) => ReactNode
}): JSX.Element
export function DataTablePagination(): JSX.Element
export function DataTableSelectionBar<TData, TFilterSchema = unknown>(props: {
  className?: string
  actions?: (args: {
    selectedRowIds: string[]
    selectedRowsCurrentPage: TData[]
    mode: "page" | "cross-page"
    selection: DataTableSelection<TData>
    selectionScope: DataTableSelection<TData>["selectionScope"]
    exportPayload: DataTableSelectionExportPayload<TFilterSchema>
  }) => ReactNode
 i18n?: DataTableI18nOverrides
}): JSX.Element
```

说明：

- 需要“一把梭”的标准 CRUD 列表，优先使用 `DataTablePreset`（`query` 必填）；需要深度定制时再回退到组合式（见 9.2）。
- `createDataTableQueryPreset()` 仅做 schema 校验与默认化，查询语义统一来自 `query.schema.fields`。
- `query.schema.search` 仅负责搜索行为（mode/defaultFieldId/debounce/placeholder），可搜索字段由 `fields[].search` 声明。
- `query.layout.mode` 提供 `inline` / `stacked` 两种标准布局，`query.layout.secondary` 控制隐藏条件展开区。
- `query.slots.actionsLeft/actionsRight` 提供动作区左右插槽，且 secondary 展开区固定全宽渲染。
- 活动 chips 由 `fields` 自动生成；单项清除与“清除全部”统一走字段 binding。
- `DataTablePagination` 调用 `dt.actions.setPage/setPageSize`，显示 `dt.pagination`。
- `DataTableTable` 仅渲染 table（header/body/empty/error/loading），其状态来自 `dt.status`。
- `DataTableSelectionBar` 以 `selectedRowIds` 为跨页批量的主入口；`selectedRowsCurrentPage` 仅用于“当前页批量”或展示选中摘要。
- 当 `selection.mode = "cross-page"` 时，UI 建议遵循跨页选择的标准交互（见 26.2），避免用户误解“到底选了多少条”。
- `DataTableViewOptions` 作为推荐的“低频视图配置入口”，统一承载密度切换、列设置与恢复默认操作。
- `DataTableColumnToggle` 与 `DataTableDensityToggle` 保留为底层原子组件，用于高度定制页面。
- `layout` 属于 UI 布局能力，不进入 core features；core 不感知滚动容器与 sticky 行为。

### 9.2 默认布局（一把梭用法）

```tsx
const dt = useDataTable({
  columns,
  dataSource: remote({ queryKey: ["users"], queryFn: getUsers, map }),
  state: stateUrl({ key: "users", parsers }),
  features: {
    selection: { enabled: true, mode: "page" },
    columnVisibility: { storageKey: "users.columns" },
  },
})

return (
  <DataTablePreset
    dt={dt}
    height="calc(100vh - 240px)"
    layout={{ scrollContainer: "root", stickyHeader: true }}
    query={createDataTableQueryPreset({
      schema: {
        fields: QUERY_FIELDS,
        search: { defaultFieldId: "keyword" },
      },
      slots: {
        actionsRight: <DataTableViewOptions />,
      },
    })}
  />
)
```

如需定制 toolbar、selectionBar、pagination 的布局或插槽，可使用组合式 API：

```tsx
return (
  <DataTableRoot
    dt={dt}
    height="calc(100vh - 240px)"
    layout={{
      scrollContainer: "root",
      stickyHeader: true,
    }}
  >
    <DataTableQueryPanel
      schema={{ fields: QUERY_FIELDS, search: { defaultFieldId: "keyword" } }}
      slots={{
        actionsRight: (
          <Button type="button" variant="outline" size="icon-sm" aria-label="刷新" onClick={dt.actions.refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        ),
      }}
    />
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

### 9.3 布局与滚动（Layout & Scrolling）

V2 将“表头吸顶 / 分页吸底”等能力定义为 UI 层布局规范，由 `DataTableRoot` 统一协调。这样可以保持 headless core 的纯粹性：core 只管理 `dt`（table/state/actions/data），不承载 DOM、滚动容器与 CSS sticky 语义。

#### 9.3.1 滚动容器策略

- `layout.scrollContainer = "root"`：表格在 `DataTableRoot` 内部滚动。此模式下通常需要 `height`（或由父容器约束高度）以形成稳定的滚动区域。
- `layout.scrollContainer = "window"`：表格跟随页面滚动。此模式下 sticky 需要使用 `topOffset/bottomOffset` 适配页面顶部导航、面包屑等占位。
- **偏移量注入**：推荐支持 CSS 变量 `--dt-sticky-top` / `--dt-sticky-bottom` 作为默认偏移源；业务层只需在布局容器上设置变量即可动态适配。
- **可选上下文**：如需更复杂的动态布局，可提供 `StickyContext` 供外部注入实时偏移量（优先级高于 CSS 变量）。

#### 9.3.2 表头吸顶（Sticky Header）

- 启用方式：`layout.stickyHeader = true` 或传 `{ topOffset }`。
- 推荐行为：
  - `"root"`：`DataTableTable` 的 header 区（如 `thead`）使用 `position: sticky; top: 0` 固定在滚动容器顶部。
  - `"window"`：header 区使用 `position: sticky; top: topOffset` 固定在窗口视口内。

#### 9.3.3 分页吸底（Bottom Dock / Sticky Pagination）

- `"root"`：分页不建议用 `sticky`。推荐由 `DataTableRoot` 使用布局容器（例如 column flex/grid）将 `DataTablePagination` 放在滚动区域之外，自然“吸底”，同时避免与虚拟滚动/表体高度计算产生耦合。
- `"window"`：可启用 `layout.stickyPagination = true` 或传 `{ bottomOffset }`，使分页在窗口滚动时保持在视口底部附近。

#### 9.3.4 约束与边界

- 层级（z-index）：sticky header 必须高于 `tbody`；如果启用 pinning，固定列 header 的交叉区域层级必须更高，避免遮挡/穿透。
- 视觉提示：当发生滚动且 sticky header 生效时，UI 建议提供轻量的分隔提示（例如阴影或边框），用于表达“已脱离正常文档流”。
- 高度约束：`scrollContainer="root"` 时必须存在确定的高度约束，否则内部滚动与吸顶行为会退化为普通流式布局。
- 虚拟滚动预留：未来引入虚拟滚动时，sticky header 可能由虚拟滚动实现接管；`layout` 的 API 形状保持不变，作为 UI 策略选择的入口。

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

### 10.3 主状态机（Status 流转）

```mermaid
stateDiagram-v2
    [*] --> InitialLoading: 组件挂载
    InitialLoading --> Ready: 首次加载成功（rows.length > 0）
    InitialLoading --> Empty: 首次加载成功（rows.length = 0）
    InitialLoading --> Error: 首次加载失败
    Ready --> Ready: 刷新成功/刷新失败保留旧数据
    Ready --> Empty: 刷新成功（rows = 0）
    Empty --> Ready: 刷新成功（rows > 0）
    Empty --> Error: 刷新失败
    Error --> Ready: 重试成功
    Error --> Error: 重试失败
```

### 10.4 Status 与 Activity 协作矩阵

| 场景         | status.type | isInitialLoading | isFetching | errors        |
|------------|-------------|------------------|------------|---------------|
| 首次加载中      | -           | `true`           | `true`     | -             |
| 首次加载成功，有数据 | `ready`     | `false`          | `false`    | -             |
| 首次加载成功，无数据 | `empty`     | `false`          | `false`    | -             |
| 首次加载失败     | `error`     | `false`          | `false`    | `blocking`    |
| 有数据，后台刷新中  | `ready`     | `false`          | `true`     | -             |
| 有数据，刷新失败   | `ready`     | `false`          | `false`    | `nonBlocking` |

---

## 11. 性能与引用稳定性约束

V2 必须保证“重渲染不扩散”，否则会出现每次 dt 变化导致 Cell 全量刷新。

约定：

- `useDataTable` 内部必须保证这些引用稳定：
  - `dt.actions`：使用稳定的回调与 memo 容器。
  - `dt.filters`：对外暴露的对象引用稳定，只在其内部字段变化。
  - `dt`：可以不要求整体对象稳定。
- 当前实现使用 `DataTableProvider` 直接提供 `dt` 单一 Context；若后续在大表格场景出现明显渲染压力，可演进为 Context 拆分或 selector 方案。
- 对 Cell/Row 等热点组件使用 memo（在不破坏正确性的前提下）。

selector API 形态建议如下：

```ts
export type DataTableSelector<TData, TFilterSchema, TSelected> = (
  dt: DataTableInstance<TData, TFilterSchema>,
) => TSelected

export function useDataTableSelector<TData, TFilterSchema, TSelected>(
  selector: DataTableSelector<TData, TFilterSchema, TSelected>,
): TSelected
```

---

## 12. i18n 与可访问性约束

### 12.1 i18n

所有文案统一来自 `TableConfigProvider`：

- `emptyText/loadingText/refreshingText`
- pagination 文案
- column toggle 文案
- search placeholder
- search 清空按钮 aria 文案
- view options 文案（触发器、密度分组、恢复默认）

组件允许局部覆盖，但不得硬编码默认值。

建议接口形态：

```ts
export interface DataTableI18n {
  emptyText: string
  loadingText: string
  refreshingText: string
  retryText: string
  searchPlaceholder: string
  clearSearchAriaLabel: string
  columnToggleLabel: string
  selectionCheckboxLabel: string
  viewOptions: {
    triggerAriaLabel: string
    densityLabel: string
    resetAllText: string
  }
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
- 搜索清空按钮与 View Options 触发器必须提供可访问性名称（建议由 i18n 下发）。
- selection checkbox 的 `aria-label` 统一配置，不在列定义里写死英文。

---


## 13. 错误处理策略


### 13.1 错误类型定义

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

### 13.2 错误处理原则

- **blocking**：首次加载失败、无可渲染数据时的刷新失败 → 全屏错误态
- **nonBlocking**：有数据时后台刷新失败 → 保留旧数据，轻量提示（toast/banner）
- **retryable**：4xx 参数错误外的大部分错误均可重试

### 13.3 UI 反馈规范

- **blocking**：替代整个表格区域，显示错误图标、信息与重试按钮
- **nonBlocking**：Toast/Banner 形式展示，提供"重试"和"关闭"操作

---


## 16. 查询区 UI 规范

### 16.1 单一 Query Schema

```ts
export type DataTableQueryFieldPanelSlot = "primary" | "secondary" | "hidden"

export interface DataTableQueryFieldSearchConfig {
  enabled?: boolean
  pickerVisible?: boolean
  order?: number
}

export interface DataTableQueryFieldUiConfig {
  panel?: DataTableQueryFieldPanelSlot
  containerClassName?: string
}

export interface DataTableQuerySchema<TFilterSchema> {
  fields: DataTableQueryField<TFilterSchema>[]
  search?: {
    defaultFieldId?: string
    mode?: "simple" | "advanced"
    debounceMs?: number
    placeholder?: string
    className?: string
  } | false
}

export interface DataTableQueryField<TFilterSchema, TValue = unknown> {
  id: string
  label: string
  kind: FilterType
  search?: DataTableQueryFieldSearchConfig
  ui?: DataTableQueryFieldUiConfig
  binding:
    | { mode: "single"; key: keyof TFilterSchema }
    | {
        mode: "composite"
        keys: readonly (keyof TFilterSchema)[]
        getValue: (filters: Readonly<TFilterSchema>) => TValue
        setValue: (value: TValue, prev: Readonly<TFilterSchema>) => Partial<TFilterSchema>
        clearValue: (prev: Readonly<TFilterSchema>) => Partial<TFilterSchema>
      }
  chip?: {
    hidden?: boolean
    formatValue?: (value: TValue) => string
  }
}
```

约束：
- `fields` 是唯一筛选语义来源。
- `search` 不能独立定义筛选字段；只能配置行为，筛选字段由 `fields[].search` 决定。
- `chips` 完全由 `fields` 驱动，不再维护独立 active 列表。

### 16.2 布局与动作区

```ts
export interface DataTablePresetQueryProps<TFilterSchema> {
  schema: DataTableQuerySchema<TFilterSchema>
  layout?: {
    mode?: "inline" | "stacked"
    primary?: { search?: boolean; fieldIds?: string[] }
    secondary?: {
      fieldIds?: string[]
      collapsible?: boolean
      defaultExpanded?: boolean
    }
    chips?: {
      visible?: boolean
      showClearAll?: boolean
    }
  }
  slots?: {
    actionsLeft?: ReactNode
    actionsRight?: ReactNode
  }
}
```

约束：
- `mode="stacked"`：第一排 actions，第二排搜索/主筛选区。
- `secondary` 展开区始终全宽渲染，可覆盖 actions 下方横向空间。
- 当 `secondary.fieldIds` 为空时，不展示展开按钮。

### 16.3 复合字段与清空语义

- 复合字段（如 `startTimeMs/endTimeMs`）必须通过 `binding.mode = "composite"` 建模。
- 复合字段在 chips 区应表现为一个 chip，清除一次同时清理绑定的全部 key。
- 单项清空语义：`text -> ""`，其他默认 `null`；复合字段以 `clearValue` 为准。
- “清除全部”应逐字段执行清理并合并为一次 `dt.filters.setBatch(...)`。

---
