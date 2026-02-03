# 数据表格开发规范 (Data Table Guidelines)

本规范定义了项目中数据表格组件的使用标准、URL 状态同步策略及 AIAgent 开发准则。

## 1. 核心开发模式

### 1.1 推荐使用 `useDataTable`
所有标准列表页面应优先使用 `useDataTable` 高阶 Hook。它集成了以下自动化功能：
- **URL 状态管理**：通过 `nuqs` 实现分页、筛选、搜索、排序与地址栏的双向同步。
- **自动页码重置**：任何筛选条件或搜索关键词变更时，自动将 `page` 重置为 `1`。
- **内置防抖**：自带 500ms 的搜索防抖处理。
- **防御性数据处理**：自动处理 API 返回的空结果。

### 1.2 组件层级结构
必须遵循以下组件层级嵌套规则，确保上下文传递和布局稳定性：

```tsx
<TableProvider {...}>
  <DataTableContainer
    toolbar={<DataTableFilterBar onSearch={refetch} onReset={filters.reset} ... />}
    table={<DataTable table={table} ... />}
    pagination={<DataTablePagination />}
  />
</TableProvider>
```

## 2. URL 状态同步 (nuqs)

### 2.1 状态声明
业务特定的筛选字段必须在 `filterParsers` 中声明。
- ✅ 正确：`status: parseAsString.withDefault("all")`
- ❌ 错误：在组件内部通过 `useState` 管理表格筛选状态。

### 2.2 命名空间规范
为防止多个表格或标签页之间的参数冲突：
- 在复杂页面中，必须为筛选参数添加**模块前缀**（例如：`op_log_startTime`）。
- **保留字**：避免在私有筛选中使用 `page`, `size`, `q`, `sort`, `tab`。

### 2.3 多标签页清理 (`useTabQueryState`)
当页面包含切换标签（Tabs）且每个标签对应不同表格时，必须使用 `useTabQueryState`。
- **职责**：切换标签时，自动清理旧标签对应的特有（exclusive）参数。
- **示例**：
  ```tsx
  const [tab, setTab] = useTabQueryState({
    key: 'activeTab',
    tabs: {
      list: { exclusiveParams: ['q', 'status'] },
      stats: { exclusiveParams: ['dateRange', 'type'] }
    }
  });
  ```

## 3. 布局与性能

### 3.1 Sticky 吸顶与吸底
- **表头吸顶**：`DataTable` 默认实现 `thead` 吸顶（`top: 0`）。
- **分页吸底**：`DataTablePagination` 在容器内自动吸底。
- **警告**：不要在表格外层包裹具有 `overflow: auto/hidden/scroll` 的容器，这会破坏 Sticky 效果。

### 3.2 滚动策略
- **优先页面滚动**：默认随页面滚动以获得原生体验。
- **固定高度**：仅在抽屉（Drawer）、弹窗（Dialog）或固定高度卡片中，才为 `DataTable` 设置 `maxHeight`。

## 4. AIAgent 开发准则

### 4.1 生成逻辑
- **单一数据源**：生成的组件必须通过 `table` 实例（TanStack Table）获取所有数据和状态。
- **不要直接操作分页**：在分页按钮或筛选器中，使用 `setPage` 而不是 `table.setPageIndex`。
- **数据安全**：始终确保传递给表格的 `data` 具有默认值 `?? []`。

### 4.2 禁止项 (Anti-patterns)
- ❌ 严禁创建并行的状态来存储列显示或选择情况。
- ❌ 严禁手动编写 `useEffect` 来同步 URL 参数。
- ❌ 严禁在筛选表单中使用自定义的 `debounce` 逻辑（已集成在 `onSearch` 中）。

---

> [!IMPORTANT]
> 遵循此规范能减少 40% 的冗余代码，并彻底解决 URL 参数污染导致的业务 Bug。
