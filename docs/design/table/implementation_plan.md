# Table V2 实现计划

> 基于 [DESIGN_V2.md](./DESIGN_V2.md) 的彻底不兼容升级方案

---

## 背景与目标

### 当前问题
- URL 同步能力入口分散（`useDataTable` + `DataTableSearch` 两套口径）
- UI 状态（loading/empty/fetching/error）在 Hook 与 UI 之间缺少统一模型
- 功能扩展缺少统一的 feature 接入方式与持久化约束
- 组合方式过多，责任边界不清晰

### V2 目标
**统一 `dt`（DataTableInstance）模型**为核心：
- 一个核心 Hook：`useDataTable()` 统一产出 `dt`
- UI 组件只消费 `dt`，不再要求传散乱的 `loading/empty/pagination`
- 状态来源可插拔：支持 URL / 受控 / 内部三种模式
- 数据源可插拔：支持 remote（TanStack Query）与 local
- 功能以 feature 开关接入

---

## 目录结构

```
src/components/table/v2/
├── core/
│   ├── use-data-table.ts           # 核心 Hook
│   ├── types.ts                     # 类型定义
│   ├── data-source/
│   │   ├── index.ts
│   │   ├── remote.ts                # TanStack Query 数据源
│   │   └── local.ts                 # 本地数据源
│   ├── state/
│   │   ├── index.ts
│   │   ├── url.ts                   # URL 状态适配器
│   │   ├── controlled.ts            # 受控状态适配器
│   │   └── internal.ts              # 内部状态适配器
│   ├── features/
│   │   ├── index.ts
│   │   ├── selection.ts
│   │   ├── column-visibility.ts
│   │   ├── column-sizing.ts
│   │   ├── pinning.ts
│   │   ├── expansion.ts
│   │   ├── density.ts
│   │   ├── tree.ts                  # 树形数据
│   │   └── drag-sort.ts             # 拖拽排序
│   └── utils/
│       ├── preference-storage.ts    # 偏好持久化工具
│       └── reference-stability.ts   # 引用稳定性工具
├── ui/
│   ├── root.tsx                     # DataTableRoot
│   ├── preset.tsx                   # DataTablePreset（一把梭组件）
│   ├── table.tsx                    # DataTableTable
│   ├── pagination.tsx               # DataTablePagination
│   ├── toolbar.tsx                  # DataTableToolbar
│   ├── search.tsx                   # DataTableSearch
│   ├── filter-bar.tsx               # DataTableFilterBar
│   ├── filter-item.tsx              # DataTableFilterItem
│   ├── active-filters.tsx           # DataTableActiveFilters
│   ├── column-toggle.tsx            # DataTableColumnToggle
│   ├── selection-bar.tsx            # DataTableSelectionBar
│   ├── tree-cell.tsx                # DataTableTreeCell
│   ├── drag-handle.tsx              # DataTableDragHandle
│   ├── drop-indicator.tsx           # DataTableDropIndicator
│   └── context.tsx                  # Context 定义
├── columns/
│   ├── index.ts
│   ├── helper.ts                    # createColumnHelper
│   ├── select.tsx                   # 选择列
│   ├── expand.tsx                   # 展开列
│   ├── drag-handle.tsx              # 拖拽手柄列
│   └── actions.tsx                  # 操作列
└── index.ts                         # 公开导出
```

---

## 分阶段实施

### 阶段 1：dt 统一模型

> 目标：最小可用闭环 —— `useDataTable` + `DataTableRoot` + `DataTableTable` + `DataTablePagination`

#### 1.1 类型定义（types.ts）

**核心类型**：
```diff
+ DataTableStatus（error | empty | ready）
+ DataTableActivity（isInitialLoading, isFetching, preferencesReady）
+ DataTablePagination（page, size, pageCount, total）
+ DataTableSelection<TData>（enabled, mode, selectedRowIds, selectedRowsCurrentPage, crossPage?）
+ DataTableTree（enabled, expandedRowIds, loadingRowIds）
+ DataTableDragSort（enabled, isDragging, activeId）
+ DataTableActions（refetch, retry, resetAll, setPage, setPageSize, setSort, clearSort, 
                    clearSelection, selectAllCurrentPage, selectAllMatching,
                    resetColumnVisibility, resetColumnSizing, resetDensity,
                    expandRow, collapseRow, toggleRowExpanded, expandAll, collapseAll, expandToDepth,
                    moveRow）
+ TableFilters<TFilterSchema>（state, set, setBatch, reset）
+ DataTableInstance<TData, TFilterSchema>（table, status, activity, pagination, filters, actions, 
                                            selection, tree, dragSort, errors, meta）
+ TableStateAdapter<TFilterSchema>（getSnapshot, setSnapshot, subscribe）
+ DataSource<TData, TFilterSchema>（use）
+ DataTableFeatures<TData, TFilterSchema>
+ DataTableError（severity, code, message, original, retryable）
+ DataTableErrors（blocking?, nonBlocking?）
```

**状态适配器类型**：
```diff
+ TableStateSnapshot<TFilterSchema>（page, size, sort, filters）
+ TableSort（field, order）
+ TableStateChangeReason（init | page | size | sort | filters | reset）
+ UrlStateOptions<TParsers>（key, parsers?, codec?, defaults?, behavior?）
+ ControlledStateOptions<TFilterSchema>（value, onChange, behavior?）
+ InternalStateOptions<TFilterSchema>（initial, behavior?）
```

**数据源类型**：
```diff
+ DataTableQuery<TFilterSchema>（page, size, sort, filters）
+ DataTableDataResult<TData>（rows, pageCount, total?, extraMeta?）
+ DataTableDataState<TData>（data, isInitialLoading, isFetching, error, refetch?, retry?）
+ RemoteDataSourceOptions<TData, TFilterSchema, TResponse>（queryKey, queryFn, map）
+ LocalDataSourceOptions<TData>（rows, total?）
```

**Feature 配置类型**：
```diff
+ SelectionFeatureOptions（enabled?, mode?, crossPage?）
+ ColumnVisibilityFeatureOptions（enabled?, storageKey, defaultVisible?, storage?）
+ ColumnSizingFeatureOptions（enabled?, storageKey, defaultSizing?, storage?）
+ PinningFeatureOptions（enabled?, left?, right?）
+ ExpansionFeatureOptions<TData>（enabled?, getRowCanExpand?）
+ DensityFeatureOptions（enabled?, storageKey, default?, storage?）
+ TreeFeatureOptions<TData>（enabled?, getSubRows?, loadChildren?, getRowCanExpand?, 
                              defaultExpandedDepth?, defaultExpandedRowIds?, indentSize?, scrollOnExpand?）
+ DragSortFeatureOptions<TData>（enabled?, onReorder, handle?, canDrag?, canDrop?, 
                                  dragOverlay?, allowNesting?）
```

**列定义扩展类型**：
```diff
+ DataTableColumnMeta（headerClassName?, cellClassName?, sortable?, filterable?, filterKey?,
                       hideable?, resizable?, pinned?, headerLabel?）
+ FilterType（text | select | multi-select | date | date-range | number-range | boolean | custom）
+ FilterDefinition<TFilterSchema, K>（key, label, type, options?, placeholder?, render?, 
                                       defaultVisible?, alwaysVisible?）
```

#### 1.2 状态适配器

| 适配器 | 文件 | 职责 | 关键实现点 |
|--------|------|------|-----------|
| `stateUrl` | url.ts | URL 读写、筛选变化自动重置 page | • 使用 TanStack Router 的 search API<br>• 支持 parsers/codec 类型转换<br>• 支持 middleware 自定义行为<br>• 默认 `resetPageOnFilterChange=true`<br>• 数组参数使用重复 key（`?status=a&status=b`）<br>• `sort` 序列化为 `field.asc\|field.desc` |
| `stateControlled` | controlled.ts | 接受外部 value/onChange | • 支持 `resetPageOnFilterChange` 配置<br>• 同步调用 onChange |
| `stateInternal` | internal.ts | React 内部 useState | • 支持 `resetPageOnFilterChange` 配置<br>• 使用 useSyncExternalStore 模式 |

**关键约定**：
- `getSnapshot` 必须同步可用（用于首屏初始化）
- `setSnapshot` 的行为约束（如筛选变化自动 page=1）必须在 adapter 内完成
- `subscribe` 仅用于驱动 core 重新计算 query

#### 1.3 数据源适配器

| 数据源 | 文件 | 职责 | 关键实现点 |
|--------|------|------|-----------|
| `remote` | remote.ts | TanStack Query 封装 | • `queryKey` 由 core 统一追加 state 依赖<br>• `filters/sort` 稳定化（结构化序列化）<br>• `map` 是唯一的非标准响应格式入口<br>• `extraMeta` 透传到 `dt.meta.data.extraMeta` |
| `local` | local.ts | 前端数据分页/排序 | • 前端实现 filter/sort/pagination<br>• 支持同步返回数据 |

**关键约定**：
- dataSource 不拥有 URL 读写权
- `query.filters` 必须保持强类型贯通
- 必须明确区分"进入 queryKey 的状态"和"只进入 queryFn 的参数"

#### 1.4 核心 Hook（use-data-table.ts）

```ts
export function useDataTable<TData, TFilterSchema>(
  options: UseDataTableOptions<TData, TFilterSchema>
): DataTableInstance<TData, TFilterSchema>
```

**核心职责**：
1. 从 `state` 适配器获取 snapshot
2. 调用 `dataSource.use(query)` 获取数据
3. 创建 TanStack Table 实例
4. 组合 `actions`、`filters`、`selection`、`tree`、`dragSort`
5. 应用 `features`（按确定顺序：state -> features -> table -> dataSource -> dt）
6. 计算 `status`（error | empty | ready）
7. 计算 `activity`（isInitialLoading, isFetching, preferencesReady）
8. 处理错误分类（blocking vs nonBlocking）

**引用稳定性要求**：
- `dt.actions` 使用稳定回调（useCallback + memo）
- `dt.filters` 对象引用稳定，只在内部字段变化
- 避免整个 `dt` 对象变化导致所有子组件刷新

**错误处理策略**：
- 首次加载失败 → `status=error`, `errors.blocking`
- 有数据时刷新失败 → `status=ready`, `errors.nonBlocking`

#### 1.5 最小 UI 闭环

| 组件 | 文件 | 职责 | 关键实现点 |
|------|------|------|-----------|
| `DataTableRoot` | root.tsx | 接收 `dt`，提供 Context | • 使用拆分 Context 减少重渲染<br>• 支持 `layout` 配置（scrollContainer, stickyHeader, stickyPagination）<br>• 支持 `height` 约束 |
| `DataTableTable` | table.tsx | 渲染 header/body/empty/error/loading | • 根据 `dt.status` 渲染不同状态<br>• 支持自定义 `renderEmpty/renderError`<br>• 处理 `activity.isInitialLoading` 骨架屏<br>• 处理 `activity.isFetching` 轻量反馈 |
| `DataTablePagination` | pagination.tsx | 调用 `dt.actions.setPage/setPageSize` | • 显示 `dt.pagination`<br>• i18n 文案统一管理 |

**布局与滚动规范**：
- `scrollContainer="root"`：表格在 `DataTableRoot` 内部滚动，需要 `height` 约束
- `scrollContainer="window"`：表格跟随页面滚动，sticky 使用 `topOffset/bottomOffset`
- 支持 CSS 变量 `--dt-sticky-top` / `--dt-sticky-bottom` 作为默认偏移源

---

### 阶段 2：筛选与搜索能力

#### 2.1 搜索组件

- **组件**：`DataTableSearch`
- **文件**：`ui/search.tsx`
- **职责**：更新 `dt.filters.set(filterKey, value)`，默认 `filterKey="q"`
- **关键实现点**：
  - 支持 `debounceMs` 配置（默认 300ms）
  - URL 模式下由 state adapter 统一处理"输入态"和"已提交态"
  - 支持 i18n placeholder
  - 使用 `Input` 组件 + `Search` 图标

#### 2.2 筛选器组件体系

| 组件 | 文件 | 职责 | 关键实现点 |
|------|------|------|-----------|
| `DataTableFilterBar` | filter-bar.tsx | 筛选条容器 | • 支持折叠/展开<br>• 支持 `maxVisible` 控制默认显示数量<br>• 支持 `collapsible` 配置 |
| `DataTableFilterItem` | filter-item.tsx | 单个筛选项 | • 根据 `FilterDefinition.type` 渲染不同控件<br>• 通过 `dt.filters.set` 更新值<br>• 支持自定义 `render` |
| `DataTableActiveFilters` | active-filters.tsx | 已激活筛选标签 | • 以 Badge/Tag 形式展示<br>• 支持单个移除与全部清除<br>• 只展示非空值 |

**支持的筛选器类型**：
- `text`：文本输入（`Input`）
- `select`：单选下拉（`Select`）
- `multi-select`：多选下拉（`MultiSelect` 或 `Combobox`）
- `date`：日期选择（`DatePicker`）
- `date-range`：日期范围（`DateRangePicker`）
- `number-range`：数字范围（两个 `Input type="number"`）
- `boolean`：布尔开关（`Switch`）
- `custom`：自定义渲染

---

### 阶段 3：Feature 基础能力

#### 3.1 Selection Feature

- **配置**：`features.selection: { enabled, mode: "page" | "cross-page", crossPage? }`
- **文件**：`core/features/selection.ts`
- **选择列工厂**：`columnHelper.select()`（`columns/select.tsx`）
- **UI 组件**：`DataTableSelectionBar`（`ui/selection-bar.tsx`）
- **关键实现点**：
  - `mode="page"`：翻页清空选择（默认）
  - `mode="cross-page"`：保留选择，必须提供 `getRowId`
  - 支持 `selectAllStrategy: "client" | "server"`
  - 支持 `maxSelection` 限制
  - `selectedRowsCurrentPage` 永远只代表当前页可见行数据
  - 跨页选择使用 `CrossPageSelection` 模型（include/exclude 模式）
  - 选择列使用 `Checkbox` 组件，支持 `aria-label`

#### 3.2 Column Visibility Feature

- **配置**：`features.columnVisibility: { storageKey, defaultVisible, storage }`
- **文件**：`core/features/column-visibility.ts`
- **持久化**：localStorage / 自定义 storage
- **UI 组件**：`DataTableColumnToggle`（`ui/column-toggle.tsx`）
- **关键实现点**：
  - 使用 envelope 格式（`PreferenceEnvelope<Record<string, boolean>>`）
  - 合并规则：丢弃已不存在的列，新增列使用默认值
  - 支持迁移函数处理列重命名
  - 优先使用 `getSync` 同步 hydration，避免布局跳变
  - UI 使用 `DropdownMenu` + `Checkbox` 列表
  - 列名从 `column.meta.headerLabel` 或 `column.header` 获取

#### 3.3 Column Sizing Feature

- **配置**：`features.columnSizing: { storageKey, defaultSizing, storage }`
- **文件**：`core/features/column-sizing.ts`
- **持久化**：localStorage / 自定义 storage
- **关键实现点**：
  - 使用 envelope 格式（`PreferenceEnvelope<Record<string, number>>`）
  - 合并规则：约束修正（最小/最大宽度、非法值丢弃）
  - 支持迁移函数
  - 使用 TanStack Table 的 `columnResizeMode="onChange"`
  - 拖拽手柄使用 `cursor-col-resize`

#### 3.4 Pinning Feature

- **配置**：`features.pinning: { enabled, left, right }`
- **文件**：`core/features/pinning.ts`
- **关键实现点**：
  - 固定列使用 `position: sticky`
  - 固定列 header 的交叉区域层级必须更高（`z-index`）
  - 与 sticky header 配合时注意层级关系
  - 左固定列：`left: 0`，右固定列：`right: 0`
  - 支持阴影提示（滚动时显示）

#### 3.5 Expansion Feature

- **配置**：`features.expansion: { enabled, getRowCanExpand }`
- **文件**：`core/features/expansion.ts`
- **展开列工厂**：`columnHelper.expand()`（`columns/expand.tsx`）
- **关键实现点**：
  - 展开按钮使用 `ChevronRight`/`ChevronDown` 图标
  - 支持 `aria-label` 可访问性
  - 展开内容通过 `renderSubComponent` 渲染

#### 3.6 Density Feature

- **配置**：`features.density: { storageKey, default: "compact" | "comfortable", storage }`
- **文件**：`core/features/density.ts`
- **持久化**：localStorage / 自定义 storage
- **关键实现点**：
  - 通过 CSS 类控制行高与内边距
  - `compact`：`py-2`，`comfortable`：`py-4`
  - 提供切换按钮（可选）

---

### 阶段 4：高级能力

#### 4.1 Tree Feature（树形数据）

- **配置**：`features.tree: { getSubRows?, loadChildren?, getRowCanExpand?, defaultExpandedDepth?, ... }`
- **文件**：`core/features/tree.ts`
- **UI 组件**：`DataTableTreeCell`（`ui/tree-cell.tsx`）
- **关键实现点**：
  - 支持同步数据（`getSubRows`）和异步懒加载（`loadChildren`）
  - `dt.tree.expandedRowIds` 管理展开状态
  - `dt.tree.loadingRowIds` 管理加载状态
  - 展开图标状态：
    - 可展开（折叠中）：`ChevronRight`
    - 已展开：`ChevronDown`
    - 正在加载：`Spinner`
    - 无子节点：空占位（保持缩进对齐）
  - 缩进使用 `paddingLeft: depth * indentSize`（默认 24px）
  - 与 selection 组合时支持 `selectionBehavior: "independent" | "cascade"`
  - 与 dragSort 组合时支持 `allowNesting`
  - 使用 TanStack Table 的 `getSubRows` 或 `getExpandedRowModel`

#### 4.2 Drag Sort Feature（拖拽排序）

- **配置**：`features.dragSort: { onReorder, handle?, canDrag?, canDrop?, dragOverlay?, allowNesting? }`
- **文件**：`core/features/drag-sort.ts`
- **UI 组件**：
  - `DataTableDragHandle`（`ui/drag-handle.tsx`）
  - `DataTableDropIndicator`（`ui/drop-indicator.tsx`）
- **拖拽手柄列工厂**：`columnHelper.dragHandle()`（`columns/drag-handle.tsx`）
- **关键实现点**：
  - 基于 `@dnd-kit/core` 和 `@dnd-kit/sortable` 实现
  - 支持拖拽手柄模式（`handle=true`）和整行拖拽模式（`handle=false`）
  - `dt.dragSort.isDragging` 管理拖拽状态
  - `dt.dragSort.activeId` 记录当前拖拽的行 ID
  - 支持 `dragOverlay: "row" | "ghost" | "minimal"`
  - 拖拽手柄使用 `GripVertical` 图标，`cursor: grab`
  - 放置指示器：2px 高亮线，颜色使用 `--primary`
  - 与 tree 组合时支持跨层级拖拽（`allowNesting`）
  - 放置策略（树形数据）：
    - 上方（鼠标在行的上 1/4 区域）：成为同级，排在前面
    - 下方（鼠标在行的下 1/4 区域）：成为同级，排在后面
    - 内部（鼠标在行的中间 1/2 区域）：成为子节点
  - 支持乐观更新（local 数据源）和服务端确认（remote 数据源）
  - 防止将父节点拖入自己的子节点（`canDrop` 校验）

#### 4.3 虚拟滚动（预留）

- **API 预留**：`features.virtualization?: { mode: "windowed" | "infinite", estimatedRowHeight, overscan }`
- **约束**：与 sticky header 和 selection 需保持兼容
- **实现方向**：考虑使用 `@tanstack/react-virtual`

---

### 阶段 5：DX 收敛与工具

#### 5.1 DataTablePreset（一把梭组件）

- **组件**：`DataTablePreset`
- **文件**：`ui/preset.tsx`
- **职责**：对 80% 场景提供标准组合，对复杂场景可降级到组合式 API
- **插槽**：
  - `toolbar`：自定义工具栏内容
  - `toolbarActions`：工具栏右侧操作区
  - `selectionBarActions`：选择栏操作按钮
  - `renderEmpty`：自定义空状态
  - `renderError`：自定义错误状态
- **默认组合**：
  ```tsx
  <DataTableRoot>
    <DataTableToolbar>
      {toolbar || <DataTableSearch />}
      {toolbarActions}
    </DataTableToolbar>
    <DataTableTable />
    <DataTableSelectionBar actions={selectionBarActions} />
    <DataTablePagination />
  </DataTableRoot>
  ```

#### 5.2 列定义工具

- **工厂函数**：`createColumnHelper<TData>()`（`columns/helper.ts`）
- **标准列**：
  - `select()`：选择列（40px 宽，不可隐藏/调整，`id: __select__`）
  - `expand()`：展开列（40px 宽，不可隐藏/调整，`id: __expand__`）
  - `dragHandle()`：拖拽手柄列（40px 宽，不可隐藏/调整，`id: __drag_handle__`）
  - `actions(render)`：操作列（80px 宽，固定右侧，`id: __actions__`）
- **类型安全**：
  - `accessor(accessor, column)`：访问器列
  - `display(column)`：显示列
- **使用示例**：
  ```ts
  const columnHelper = createColumnHelper<User>()
  const columns = [
    columnHelper.select(),
    columnHelper.accessor("name", { header: "姓名" }),
    columnHelper.actions((row) => <UserActions user={row} />),
  ]
  ```

#### 5.3 偏好持久化工具

- **工具函数**：
  - `mergeRecordPreference()`：合并存储值与默认值
  - `PreferenceMigration`：版本迁移函数类型
- **文件**：`core/utils/preference-storage.ts`
- **Envelope 格式**：
  ```ts
  interface PreferenceEnvelope<TValue> {
    schemaVersion: number
    updatedAt: number
    value: TValue
  }
  ```
- **合并规则**：
  1. 丢弃已不存在的 columnId
  2. 对新增列使用默认值
  3. 对列宽做约束修正（最小/最大宽度、非法值丢弃）
  4. 保持稳定输出（key 排序稳定化）

#### 5.4 i18n 配置

- **Provider**：`TableConfigProvider`（可选，用于全局配置）
- **配置接口**：`DataTableI18n`
- **覆盖方式**：全局配置 + 组件局部覆盖
- **文案项**：
  - `emptyText`：空状态文案
  - `loadingText`：加载中文案
  - `refreshingText`：刷新中文案
  - `retryText`：重试按钮文案
  - `searchPlaceholder`：搜索框占位符
  - `columnToggleLabel`：列显示切换按钮标签
  - `selectionCheckboxLabel`：选择框标签
  - `pagination.*`：分页相关文案

#### 5.5 引用稳定性工具

- **工具函数**：
  - `useStableCallback()`：稳定回调引用
  - `useStableObject()`：稳定对象引用（浅比较）
- **文件**：`core/utils/reference-stability.ts`
- **用途**：确保 `dt.actions` 和 `dt.filters` 引用稳定

---

## 设计要点

### API 稳定性原则

| 原则 | 说明 |
|------|------|
| 数组优于联合 | `sort: TableSort[]` 而非 `TableSort \| null` |
| 始终存在优于可选 | `selection` 始终存在，通过 `enabled` 判断 |
| no-op 优于可选方法 | `actions.clearSelection()` 始终可调用 |
| 对象优于布尔 | `selection: { enabled, mode }` 而非 `selection: true` |

### 引用稳定性

- `dt.actions` 使用稳定回调
- `dt.filters` 对象引用稳定，内部字段变化
- UI 采用拆分 Context 减少重渲染

---

## 验证计划

### 自动化测试

> 项目当前未发现已有单元测试基础设施，建议在阶段 1 完成后补充。

**建议测试范围**：
1. 状态适配器单元测试（`stateUrl`、`stateControlled`、`stateInternal`）
2. 数据源适配器单元测试（`remote`、`local`）
3. `useDataTable` 集成测试

### 手动验证

**阶段 1 完成后**：

1. 创建示例页面 `src/pages/examples/table-v2-demo.tsx`
2. 使用 `remote` 数据源 + `stateUrl` 适配器
3. 验证以下场景：
  - [ ] 首次加载显示 loading
  - [ ] 数据加载后正常渲染
  - [ ] 空数据显示 empty state
  - [ ] 分页切换正常
  - [ ] 排序正常
  - [ ] URL 参数同步正常
  - [ ] 刷新保留状态

---

## 风险与注意事项

> [!IMPORTANT]
> **与现有代码隔离**：所有 V2 代码放在 `v2/` 目录下，不影响现有表格组件使用。

> [!WARNING]
> **完全不兼容升级**：V2 不追求与 V1 API 兼容，迁移需要重写调用代码。

---

## 下一步

如果计划获批，将从 **阶段 1.1 类型定义** 开始实现。
