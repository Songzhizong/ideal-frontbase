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
│   └── features/
│       ├── index.ts
│       ├── selection.ts
│       ├── column-visibility.ts
│       ├── column-sizing.ts
│       ├── pinning.ts
│       ├── expansion.ts
│       └── density.ts
├── ui/
│   ├── root.tsx                     # DataTableRoot
│   ├── table.tsx                    # DataTableTable
│   ├── pagination.tsx               # DataTablePagination
│   ├── toolbar.tsx                  # DataTableToolbar
│   ├── search.tsx                   # DataTableSearch
│   ├── column-toggle.tsx            # DataTableColumnToggle
│   ├── selection-bar.tsx            # DataTableSelectionBar
│   └── context.tsx                  # Context 定义
├── columns/
│   ├── index.ts
│   ├── select.tsx                   # 选择列
│   ├── expand.tsx                   # 展开列
│   └── actions.tsx                  # 操作列
└── index.ts                         # 公开导出
```

---

## 分阶段实施

### 阶段 1：dt 统一模型

> 目标：最小可用闭环 —— `useDataTable` + `DataTableRoot` + `DataTableTable` + `DataTablePagination`

#### 1.1 类型定义（[types.ts](file:///Users/zzsong/Work/infrastructure/frontend/idealtemplate/src/components/table/v2/core/types.ts)）

```diff
+ DataTableStatus（error | empty | ready）
+ DataTableActivity（isInitialLoading, isFetching, preferencesReady）
+ DataTablePagination（page, size, pageCount, total）
+ DataTableSelection<TData>（enabled, mode, selectedRowIds, selectedRowsCurrentPage）
+ DataTableActions（refetch, retry, resetAll, setPage, setPageSize, setSort, clearSort, ...）
+ TableFilters<TFilterSchema>（state, set, setBatch, reset）
+ DataTableInstance<TData, TFilterSchema>（table, status, activity, pagination, filters, actions, selection, errors, meta）
+ TableStateAdapter<TFilterSchema>（getSnapshot, setSnapshot, subscribe）
+ DataSource<TData, TFilterSchema>（use）
+ DataTableFeatures<TData, TFilterSchema>
```

#### 1.2 状态适配器

| 适配器 | 文件 | 职责 |
|--------|------|------|
| `stateUrl` | [url.ts](file:///Users/zzsong/Work/infrastructure/frontend/idealtemplate/src/components/table/v2/core/state/url.ts) | URL 读写、筛选变化自动重置 page |
| `stateControlled` | [controlled.ts](file:///Users/zzsong/Work/infrastructure/frontend/idealtemplate/src/components/table/v2/core/state/controlled.ts) | 接受外部 value/onChange |
| `stateInternal` | [internal.ts](file:///Users/zzsong/Work/infrastructure/frontend/idealtemplate/src/components/table/v2/core/state/internal.ts) | React 内部 useState |

#### 1.3 数据源适配器

| 数据源 | 文件 | 职责 |
|--------|------|------|
| `remote` | [remote.ts](file:///Users/zzsong/Work/infrastructure/frontend/idealtemplate/src/components/table/v2/core/data-source/remote.ts) | TanStack Query 封装 |
| `local` | [local.ts](file:///Users/zzsong/Work/infrastructure/frontend/idealtemplate/src/components/table/v2/core/data-source/local.ts) | 前端数据分页/排序 |

#### 1.4 核心 Hook（[use-data-table.ts](file:///Users/zzsong/Work/infrastructure/frontend/idealtemplate/src/components/table/v2/core/use-data-table.ts)）

```ts
export function useDataTable<TData, TFilterSchema>(
  options: UseDataTableOptions<TData, TFilterSchema>
): DataTableInstance<TData, TFilterSchema>
```

**核心职责**：
1. 从 `state` 适配器获取 snapshot
2. 调用 `dataSource.use(query)` 获取数据
3. 创建 TanStack Table 实例
4. 组合 `actions`、`filters`、`selection`
5. 应用 `features`

#### 1.5 最小 UI 闭环

| 组件 | 文件 | 职责 |
|------|------|------|
| `DataTableRoot` | [root.tsx](file:///Users/zzsong/Work/infrastructure/frontend/idealtemplate/src/components/table/v2/ui/root.tsx) | 接收 `dt`，提供 Context |
| `DataTableTable` | [table.tsx](file:///Users/zzsong/Work/infrastructure/frontend/idealtemplate/src/components/table/v2/ui/table.tsx) | 渲染 header/body/empty/error/loading |
| `DataTablePagination` | [pagination.tsx](file:///Users/zzsong/Work/infrastructure/frontend/idealtemplate/src/components/table/v2/ui/pagination.tsx) | 调用 `dt.actions.setPage/setPageSize` |

---

### 阶段 2：Feature 基础能力

#### 2.1 Selection Feature

- **配置**：`features.selection: { enabled, mode: "page" | "cross-page" }`
- **选择列工厂**：`columnHelper.select()`
- **UI 组件**：`DataTableSelectionBar`

#### 2.2 Column Visibility Feature

- **配置**：`features.columnVisibility: { storageKey, defaultVisible, storage }`
- **持久化**：localStorage / 自定义 storage
- **UI 组件**：`DataTableColumnToggle`

#### 2.3 Column Sizing Feature

- **配置**：`features.columnSizing: { storageKey, defaultSizing, storage }`
- **持久化**：localStorage / 自定义 storage

---

### 阶段 3：高级能力（后续版本）

| Feature | 说明 |
|---------|------|
| `pinning` | 固定列（左/右） |
| `expansion` | 行展开 |
| `density` | 紧凑/宽松模式 |
| 虚拟滚动 | 仅预留 API |

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
