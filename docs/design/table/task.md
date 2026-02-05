# Table V2 实现任务清单

> 基于 [DESIGN_V2.md](./DESIGN_V2.md) 和 [implementation_plan.md](./implementation_plan.md) 的分阶段实施计划

---

## 阶段 1：dt 统一模型（核心基础）

### 1.1 类型定义
- [ ] 创建 `types.ts`：核心类型
  - [ ] `DataTableInstance`、`DataTableStatus`、`DataTableActivity`
  - [ ] `DataTablePagination`、`DataTableSelection`、`DataTableTree`、`DataTableDragSort`
  - [ ] `DataTableActions`、`TableFilters`
  - [ ] `DataTableError`、`DataTableErrors`
- [ ] 创建状态适配器类型
  - [ ] `TableStateSnapshot`、`TableStateAdapter`
  - [ ] `TableSort`、`TableStateChangeReason`
  - [ ] `UrlStateOptions`、`ControlledStateOptions`、`InternalStateOptions`
- [ ] 创建数据源类型
  - [ ] `DataSource`、`DataTableQuery`、`DataTableDataState`、`DataTableDataResult`
  - [ ] `RemoteDataSourceOptions`、`LocalDataSourceOptions`
- [ ] 创建 Feature 配置类型
  - [ ] `DataTableFeatures`
  - [ ] `SelectionFeatureOptions`（含 `CrossPageSelection`）
  - [ ] `ColumnVisibilityFeatureOptions`、`ColumnSizingFeatureOptions`
  - [ ] `PinningFeatureOptions`、`ExpansionFeatureOptions`、`DensityFeatureOptions`
  - [ ] `TreeFeatureOptions`、`DragSortFeatureOptions`
- [ ] 创建列定义扩展类型
  - [ ] `DataTableColumnMeta`
  - [ ] `FilterType`、`FilterDefinition`

### 1.2 状态适配器
- [ ] 实现 `stateUrl()`：URL 状态同步适配器
  - [ ] 使用 TanStack Router 的 search API
  - [ ] 支持 parsers/codec 类型转换
  - [ ] 支持 middleware 自定义行为
  - [ ] 默认 `resetPageOnFilterChange=true`
  - [ ] 数组参数使用重复 key（`?status=a&status=b`）
  - [ ] `sort` 序列化为 `field.asc|field.desc`
- [ ] 实现 `stateControlled()`：受控状态适配器
  - [ ] 支持 `resetPageOnFilterChange` 配置
  - [ ] 同步调用 onChange
- [ ] 实现 `stateInternal()`：内部状态适配器
  - [ ] 支持 `resetPageOnFilterChange` 配置
  - [ ] 使用 useSyncExternalStore 模式

### 1.3 数据源适配器
- [ ] 实现 `remote()`：TanStack Query 数据源
  - [ ] `queryKey` 由 core 统一追加 state 依赖
  - [ ] `filters/sort` 稳定化（结构化序列化）
  - [ ] `map` 是唯一的非标准响应格式入口
  - [ ] `extraMeta` 透传到 `dt.meta.data.extraMeta`
- [ ] 实现 `local()`：本地数据源
  - [ ] 前端实现 filter/sort/pagination
  - [ ] 支持同步返回数据

### 1.4 核心 Hook
- [ ] 实现 `useDataTable()`：统一入口
  - [ ] 从 `state` 适配器获取 snapshot
  - [ ] 调用 `dataSource.use(query)` 获取数据
  - [ ] 创建 TanStack Table 实例
  - [ ] 组合 `actions`、`filters`、`selection`、`tree`、`dragSort`
  - [ ] 应用 `features`（按确定顺序）
  - [ ] 计算 `status`（error | empty | ready）
  - [ ] 计算 `activity`（isInitialLoading, isFetching, preferencesReady）
  - [ ] 处理错误分类（blocking vs nonBlocking）
- [ ] 实现 `actions` 对象：所有交互动作
  - [ ] 数据操作：`refetch`、`retry`、`resetAll`
  - [ ] 分页与排序：`setPage`、`setPageSize`、`setSort`、`clearSort`
  - [ ] 选择操作：`clearSelection`、`selectAllCurrentPage`、`selectAllMatching`
  - [ ] 偏好重置：`resetColumnVisibility`、`resetColumnSizing`、`resetDensity`
  - [ ] 树形操作：`expandRow`、`collapseRow`、`toggleRowExpanded`、`expandAll`、`collapseAll`、`expandToDepth`
  - [ ] 拖拽排序：`moveRow`
- [ ] 实现 `filters` 对象：强类型筛选模型
  - [ ] `state`、`set`、`setBatch`、`reset`
- [ ] 确保引用稳定性
  - [ ] `dt.actions` 使用稳定回调
  - [ ] `dt.filters` 对象引用稳定

### 1.5 最小 UI 闭环
- [ ] 实现 `DataTableRoot`：根容器 + Context Provider
  - [ ] 使用拆分 Context 减少重渲染
  - [ ] 支持 `layout` 配置（scrollContainer, stickyHeader, stickyPagination）
  - [ ] 支持 `height` 约束
  - [ ] 支持 CSS 变量 `--dt-sticky-top` / `--dt-sticky-bottom`
- [ ] 实现 `DataTableTable`：表格渲染组件
  - [ ] 根据 `dt.status` 渲染不同状态
  - [ ] 支持自定义 `renderEmpty/renderError`
  - [ ] 处理 `activity.isInitialLoading` 骨架屏
  - [ ] 处理 `activity.isFetching` 轻量反馈
  - [ ] 使用 Shadcn `Table` 组件
- [ ] 实现 `DataTablePagination`：分页组件
  - [ ] 调用 `dt.actions.setPage/setPageSize`
  - [ ] 显示 `dt.pagination`
  - [ ] i18n 文案统一管理
  - [ ] 使用 Shadcn `Pagination` 组件

---

## 阶段 2：筛选与搜索能力

### 2.1 搜索组件
- [ ] 实现 `DataTableSearch`
  - [ ] 更新 `dt.filters.set(filterKey, value)`，默认 `filterKey="q"`
  - [ ] 支持 `debounceMs` 配置（默认 300ms）
  - [ ] 支持 i18n placeholder
  - [ ] 使用 Shadcn `Input` 组件 + `Search` 图标

### 2.2 筛选器组件体系
- [ ] 实现 `DataTableFilterBar`：筛选条容器
  - [ ] 支持折叠/展开
  - [ ] 支持 `maxVisible` 控制默认显示数量
  - [ ] 支持 `collapsible` 配置
- [ ] 实现 `DataTableFilterItem`：单个筛选项
  - [ ] 根据 `FilterDefinition.type` 渲染不同控件
  - [ ] 支持 8 种筛选器类型（text, select, multi-select, date, date-range, number-range, boolean, custom）
  - [ ] 通过 `dt.filters.set` 更新值
  - [ ] 支持自定义 `render`
- [ ] 实现 `DataTableActiveFilters`：已激活筛选标签
  - [ ] 以 Badge/Tag 形式展示
  - [ ] 支持单个移除与全部清除
  - [ ] 只展示非空值

---

## 阶段 3：Feature 基础能力

### 3.1 Selection Feature
- [ ] 实现 `selection` feature（`core/features/selection.ts`）
  - [ ] 支持 `mode="page"` 和 `mode="cross-page"`
  - [ ] 实现 `CrossPageSelection` 模型（include/exclude 模式）
  - [ ] 支持 `selectAllStrategy: "client" | "server"`
  - [ ] 支持 `maxSelection` 限制
  - [ ] `selectedRowsCurrentPage` 永远只代表当前页可见行数据
- [ ] 创建选择列工厂 `select()`（`columns/select.tsx`）
  - [ ] 40px 宽，不可隐藏/调整，`id: __select__`
  - [ ] 使用 Shadcn `Checkbox` 组件
  - [ ] 支持 `aria-label` 可访问性
- [ ] 实现 `DataTableSelectionBar`（`ui/selection-bar.tsx`）
  - [ ] 显示选中数量
  - [ ] 提供 `actions` 插槽
  - [ ] 跨页选择时提供升级/回退入口

### 3.2 Column Visibility Feature
- [ ] 实现 `columnVisibility` feature（`core/features/column-visibility.ts`）
  - [ ] 使用 envelope 格式（`PreferenceEnvelope<Record<string, boolean>>`）
  - [ ] 实现合并规则（丢弃已不存在的列，新增列使用默认值）
  - [ ] 支持迁移函数处理列重命名
  - [ ] 优先使用 `getSync` 同步 hydration
- [ ] 实现 `DataTableColumnToggle`（`ui/column-toggle.tsx`）
  - [ ] 使用 Shadcn `DropdownMenu` + `Checkbox` 列表
  - [ ] 列名从 `column.meta.headerLabel` 或 `column.header` 获取
  - [ ] 支持全选/取消全选

### 3.3 Column Sizing Feature
- [ ] 实现 `columnSizing` feature（`core/features/column-sizing.ts`）
  - [ ] 使用 envelope 格式（`PreferenceEnvelope<Record<string, number>>`）
  - [ ] 实现合并规则（约束修正：最小/最大宽度、非法值丢弃）
  - [ ] 支持迁移函数
  - [ ] 使用 TanStack Table 的 `columnResizeMode="onChange"`
  - [ ] 拖拽手柄使用 `cursor-col-resize`

### 3.4 Pinning Feature
- [ ] 实现 `pinning` feature（`core/features/pinning.ts`）
  - [ ] 固定列使用 `position: sticky`
  - [ ] 固定列 header 的交叉区域层级必须更高（`z-index`）
  - [ ] 左固定列：`left: 0`，右固定列：`right: 0`
  - [ ] 支持阴影提示（滚动时显示）

### 3.5 Expansion Feature
- [ ] 实现 `expansion` feature（`core/features/expansion.ts`）
  - [ ] 支持 `getRowCanExpand` 配置
- [ ] 创建展开列工厂 `expand()`（`columns/expand.tsx`）
  - [ ] 40px 宽，不可隐藏/调整，`id: __expand__`
  - [ ] 展开按钮使用 `ChevronRight`/`ChevronDown` 图标
  - [ ] 支持 `aria-label` 可访问性

### 3.6 Density Feature
- [ ] 实现 `density` feature（`core/features/density.ts`）
  - [ ] 使用 envelope 格式
  - [ ] 通过 CSS 类控制行高与内边距
  - [ ] `compact`：`py-2`，`comfortable`：`py-4`
  - [ ] 提供切换按钮（可选）

---

## 阶段 4：高级能力

### 4.1 Tree Feature（树形数据）
- [ ] 实现 `tree` feature（`core/features/tree.ts`）
  - [ ] 支持同步数据（`getSubRows`）
  - [ ] 支持异步懒加载（`loadChildren`）
  - [ ] `dt.tree.expandedRowIds` 管理展开状态
  - [ ] `dt.tree.loadingRowIds` 管理加载状态
  - [ ] 支持 `defaultExpandedDepth` 和 `defaultExpandedRowIds`
  - [ ] 与 selection 组合时支持 `selectionBehavior: "independent" | "cascade"`
  - [ ] 与 dragSort 组合时支持 `allowNesting`
- [ ] 实现 `DataTableTreeCell`（`ui/tree-cell.tsx`）
  - [ ] 缩进使用 `paddingLeft: depth * indentSize`（默认 24px）
  - [ ] 展开图标状态：可展开/已展开/正在加载/无子节点
  - [ ] 使用 `ChevronRight`/`ChevronDown`/`Spinner` 图标

### 4.2 Drag Sort Feature（拖拽排序）
- [ ] 安装依赖：`@dnd-kit/core`、`@dnd-kit/sortable`
- [ ] 实现 `dragSort` feature（`core/features/drag-sort.ts`）
  - [ ] 基于 `@dnd-kit` 实现
  - [ ] 支持拖拽手柄模式和整行拖拽模式
  - [ ] `dt.dragSort.isDragging` 管理拖拽状态
  - [ ] `dt.dragSort.activeId` 记录当前拖拽的行 ID
  - [ ] 支持 `dragOverlay: "row" | "ghost" | "minimal"`
  - [ ] 与 tree 组合时支持跨层级拖拽（`allowNesting`）
  - [ ] 实现放置策略（上方/下方/内部）
  - [ ] 支持乐观更新和服务端确认
  - [ ] 防止将父节点拖入自己的子节点
- [ ] 创建拖拽手柄列工厂 `dragHandle()`（`columns/drag-handle.tsx`）
  - [ ] 40px 宽，不可隐藏/调整，`id: __drag_handle__`
  - [ ] 使用 `GripVertical` 图标，`cursor: grab`
- [ ] 实现 `DataTableDragHandle`（`ui/drag-handle.tsx`）
- [ ] 实现 `DataTableDropIndicator`（`ui/drop-indicator.tsx`）
  - [ ] 2px 高亮线，颜色使用 `--primary`
  - [ ] 动画：fade-in 150ms

### 4.3 虚拟滚动（预留）
- [ ] API 预留：`features.virtualization`
- [ ] 文档说明约束与实现方向

---

## 阶段 5：DX 收敛与工具

### 5.1 DataTablePreset（一把梭组件）
- [ ] 实现 `DataTablePreset`（`ui/preset.tsx`）
  - [ ] 提供标准组合（Root + Toolbar + Table + SelectionBar + Pagination）
  - [ ] 支持插槽：`toolbar`、`toolbarActions`、`selectionBarActions`、`renderEmpty`、`renderError`
  - [ ] 支持 `layout` 配置

### 5.2 列定义工具
- [ ] 实现 `createColumnHelper<TData>()`（`columns/helper.ts`）
  - [ ] `accessor(accessor, column)`：访问器列
  - [ ] `display(column)`：显示列
  - [ ] `select()`：选择列
  - [ ] `expand()`：展开列
  - [ ] `dragHandle()`：拖拽手柄列
  - [ ] `actions(render)`：操作列（80px 宽，固定右侧，`id: __actions__`）

### 5.3 偏好持久化工具
- [ ] 实现偏好持久化工具（`core/utils/preference-storage.ts`）
  - [ ] `PreferenceEnvelope<TValue>` 类型
  - [ ] `mergeRecordPreference()` 函数
  - [ ] `PreferenceMigration` 类型
  - [ ] 合并规则实现

### 5.4 i18n 配置
- [ ] 定义 `DataTableI18n` 接口
- [ ] 实现 `TableConfigProvider`（可选）
- [ ] 支持全局配置 + 组件局部覆盖
- [ ] 提供默认中文文案

### 5.5 引用稳定性工具
- [ ] 实现引用稳定性工具（`core/utils/reference-stability.ts`）
  - [ ] `useStableCallback()`：稳定回调引用
  - [ ] `useStableObject()`：稳定对象引用（浅比较）

---

## 验证与测试

### 单元测试
- [ ] 状态适配器单元测试
  - [ ] `stateUrl` 测试
  - [ ] `stateControlled` 测试
  - [ ] `stateInternal` 测试
- [ ] 数据源适配器单元测试
  - [ ] `remote` 测试
  - [ ] `local` 测试
- [ ] `useDataTable` 集成测试
- [ ] Feature 单元测试
  - [ ] `selection` 测试
  - [ ] `columnVisibility` 测试
  - [ ] `columnSizing` 测试
  - [ ] `tree` 测试
  - [ ] `dragSort` 测试

### 手动验证
- [ ] 创建示例页面 `src/pages/examples/table-v2-demo.tsx`
- [ ] 验证阶段 1 场景
  - [ ] 首次加载显示 loading
  - [ ] 数据加载后正常渲染
  - [ ] 空数据显示 empty state
  - [ ] 分页切换正常
  - [ ] 排序正常
  - [ ] URL 参数同步正常
  - [ ] 刷新保留状态
- [ ] 验证阶段 2 场景
  - [ ] 搜索框 debounce 正常
  - [ ] 筛选器更新正常
  - [ ] 筛选变化自动重置 page
  - [ ] 已激活筛选标签显示正常
- [ ] 验证阶段 3 场景
  - [ ] 选择功能正常（page 模式）
  - [ ] 跨页选择正常（cross-page 模式）
  - [ ] 列显示切换正常
  - [ ] 列宽调整正常
  - [ ] 固定列正常
  - [ ] 行展开正常
  - [ ] 密度切换正常
- [ ] 验证阶段 4 场景
  - [ ] 树形数据展开/折叠正常
  - [ ] 树形数据懒加载正常
  - [ ] 拖拽排序正常（local 数据源）
  - [ ] 拖拽排序正常（remote 数据源 + 乐观更新）
  - [ ] 树形数据拖拽改变层级正常
- [ ] 验证阶段 5 场景
  - [ ] `DataTablePreset` 一把梭用法正常
  - [ ] 列定义工厂函数正常
  - [ ] 偏好持久化正常
  - [ ] i18n 配置正常

---

## 文档与示例

- [ ] 编写 API 文档
  - [ ] `useDataTable` API
  - [ ] 状态适配器 API
  - [ ] 数据源适配器 API
  - [ ] Feature 配置 API
  - [ ] UI 组件 API
- [ ] 编写使用指南
  - [ ] 快速开始
  - [ ] 基础用法
  - [ ] 高级用法
  - [ ] 最佳实践
- [ ] 编写迁移指南（V1 -> V2）
- [ ] 提供示例代码
  - [ ] 基础表格
  - [ ] 远程分页表格
  - [ ] 带筛选的表格
  - [ ] 带选择的表格
  - [ ] 树形表格
  - [ ] 可拖拽排序的表格

---

## 发布准备

- [ ] 代码审查
- [ ] 性能测试
- [ ] 可访问性测试
- [ ] 浏览器兼容性测试
- [ ] 编写 CHANGELOG
- [ ] 更新 README
- [ ] 发布 V2.0.0
