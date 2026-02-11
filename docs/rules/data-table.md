# 数据表格开发规范（Data Table Guidelines, V2）

本规范定义项目中表格开发的唯一标准：`@/packages/table`。

## 1. 核心原则

- **统一入口**：必须使用 `useDataTable<TData, TFilterSchema>()` 产出 `dt`。
- **单一事实来源**：分页、排序、筛选、选择、列偏好、树展开、拖拽状态均以 `dt` 为准。
- **UI 纯消费**：UI 组件只读 `dt` + 调 `dt.actions`，禁止直接操作 URL、Query 或 TanStack Table 内部状态。
- **类型优先**：必须显式定义 `TFilterSchema`，禁止使用松散 `Record<string, unknown>`。

## 2. 标准接入流程

### 2.1 必须步骤

1. 定义 `TData`、`TFilterSchema` 与列定义（推荐 `createColumnHelper`）。
2. 选择状态适配器：`stateInternal` / `stateControlled` / `stateUrl`。
3. 选择数据源：`local` / `remote`。
4. 通过 `useDataTable` 组装 `dt`。
5. 使用 `DataTablePreset`（标准场景）或组合式 `DataTableRoot`（定制场景）渲染。
6. 标准页面统一采用 `DataTablePreset.query` 单入口组织查询区（搜索、筛选、活动筛选、右侧操作）；`query` 为必填。

### 2.2 推荐组件组合顺序

```tsx
<DataTableRoot dt={dt}>
  <DataTableToolbar />
  <DataTableFilterBar />
  <DataTableActiveFilters />
  <DataTableTable />
  <DataTableSelectionBar />
  <DataTablePagination />
</DataTableRoot>
```

### 2.3 `DataTablePreset` 标准写法（默认模板）

```tsx
<DataTablePreset<TData, TFilterSchema>
  dt={dt}
  layout={{ stickyHeader: true, stickyPagination: true }}
  query={createCrudQueryPreset<TFilterSchema>({
    search: {
      // 如使用 stateUrl.behavior.searchKey，可省略 filterKey
      mode: "simple", // 或 "advanced"
      placeholder: "请输入关键字",
    },
    quickFilters: QUICK_FILTERS,
    advancedFilters: ADVANCED_FILTERS,
    activeFilters: ACTIVE_FILTERS,
    actions: <DataTableActions />,
    showActiveFilters: true,
  })}
  table={{ renderEmpty: () => "暂无数据" }}
/>
```

> [!TIP]
> `DataTablePreset` 已统一为 `query` 单入口；`toolbar/filterBar/activeFilters` 分散入口已不再作为可用配置。

## 3. 状态适配器规则

### 3.1 `stateInternal`

- 用于页面内自管理状态（最常见）。
- 初始化必须给出完整 `initial`（至少 `page/size/sort/filters`）。
- 如使用 `DataTableSearch` 且搜索字段不是默认 `"q"`，应配置 `searchKey`，避免隐式回退导致的错绑字段。

### 3.2 `stateControlled`

- 用于父组件统一托管状态。
- 所有变更通过 `onChange` 回传，表格内部不维护业务状态。
- 如使用 `DataTableSearch` 且搜索字段不是默认 `"q"`，应配置 `searchKey`，与受控状态字段保持一致。

### 3.3 `stateUrl`

- URL 同步必须使用 `stateUrl`，禁止手写 `useEffect` 同步 query。
- 必须提供唯一 `key` 作为命名空间，避免多个表格参数冲突。
- 推荐使用 `parsers` 或 `codec` 做类型转换，不要在 UI 层做字符串手动解析。
- 搜索字段优先级：`DataTableSearch.filterKey > stateUrl.behavior.searchKey > "q"`。
- 禁止 `state as unknown as TableStateAdapter<TFilterSchema>` 双重断言；应通过正确的 `parsers/defaults` 或泛型声明消除类型不匹配。

## 4. 数据源规则

### 4.1 `remote`

- 远程列表必须使用 `remote`。
- `map` 必须返回标准结构：`rows/pageCount/total`（可选 `extraMeta`）。
- 可按需使用 `keepPreviousData`（默认开启）优化翻页体验。

### 4.2 `local`

- 本地列表可用 `local` 快速搭建。
- 如需复杂筛选/模糊搜索，优先在上游整理数据或改为 `remote`，避免 UI 层重复逻辑。

## 5. Feature 配置规则

- Feature 必须使用对象配置，不使用布尔简写。
  - ✅ `selection: { enabled: true, mode: "page" }`
  - ❌ `selection: true`
- 偏好类 feature（列显隐/列宽/密度/列顺序/固定列）应提供稳定 `storageKey`。
- 需要稳定行标识的能力必须提供 `getRowId`：
  - `selection.mode = "cross-page"`
  - `tree.loadChildren`
  - `dragSort`

### 5.1 已支持 feature（V2 当前实现）

- `selection`
- `columnVisibility`
- `columnSizing`
- `pinning`
- `columnOrder`
- `expansion`
- `density`
- `tree`
- `dragSort`
- `virtualization`
- `analytics`

### 5.2 拖拽排序语义

- 放置位置以实现为准：`"above" | "below" | "inside"`。
- 树形拖拽改层级需同时满足：`tree.enabled` + `dragSort.allowNesting = true`。

## 6. UI 与交互规则

- 标准页面优先 `DataTablePreset`，定制页面使用组合式 API。
- 标准页面必须优先使用 `DataTablePreset.query` 单入口，保证不同页面配置结构一致。
- `DataTablePreset` 不再支持 `toolbar/search/filterBar/activeFilters` 分散配置；如需更细粒度布局，请改用组合式 `DataTableRoot`。
- 吸顶/吸底通过 `DataTableRoot.layout` 控制：
  - `stickyHeader`
  - `stickyPagination`
  - `scrollContainer: "root" | "window"`
- 搜索统一使用 `DataTableSearch`：
  - `mode="simple"`：普通搜索
  - `mode="advanced"`：结构化字段搜索
- 活动筛选（`DataTableActiveFilters`）默认应展示“清空全部”，除非产品需求文档明确要求隐藏。
- 批量操作统一通过 `DataTableSelectionBar`，跨页导出优先使用其 `exportPayload`。

## 7. 状态与错误展示规范

- 主渲染态必须基于 `dt.status`：
  - `error` / `empty` / `ready`
- 刷新态必须基于 `dt.activity`：
  - `isInitialLoading`
  - `isFetching`
  - `preferencesReady`
- 不再向表格组件手工传递并行 `loading/empty/pagination` 状态。

## 8. AIAgent 生成代码准则

- 必须生成 `TFilterSchema` 类型，并让筛选组件走 `dt.filters`。
- 分页/排序/筛选/重置必须调用 `dt.actions` 与 `dt.filters`，不要直接调用 `table.setPageIndex` 等底层 API。
- 列操作优先使用 `createColumnHelper` + `select/expand/dragHandle/actions` 工厂。
- 业务批量导出场景，优先对接 `DataTableSelectionBar.actions` 的 `exportPayload`。
- 默认输出 `DataTablePreset.query` 结构，不要输出同功能的分散配置写法。
- 生成 `DataTablePreset.query` 时优先使用 `createCrudQueryPreset`，减少重复拼装与漏配。
- 生成 `stateUrl` 配置时应同时给出 `parsers`、`pagination`、`behavior`，并与 `TFilterSchema` 对齐。

## 9. 禁止项（Anti-patterns）

- ❌ 禁止使用旧版表格容器模式（`TableProvider/DataTableContainer/InternalDataTable`）。
- ❌ 禁止在表格外维护并行的选择、列显隐、列宽状态。
- ❌ 禁止手动编写 URL 同步逻辑替代 `stateUrl`。
- ❌ 禁止在 `DataTableSearch` 外再包一层自定义 debounce 造成双重防抖。
- ❌ 禁止混用 V1/V2 表格 API。
- ❌ 禁止在 `DataTablePreset` 上传递任何 legacy 查询区参数（`toolbar/search/filterBar/activeFilters`）。
- ❌ 禁止用 `as unknown as` 绕过表格状态适配器类型问题。
- ❌ 禁止将历史错误交互固化为默认行为（例如无产品依据地隐藏“清空全部”）。

---

> [!IMPORTANT]
> 新需求默认按 V2 规范实现；旧页面改造时优先迁移到 `useDataTable + dt` 单实例模式。
