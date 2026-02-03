# 表格组件使用示例

## 🚀 推荐模式：`useDataTable` + `PaginatedTable`

这种模式适用于 90% 的业务场景，提供了自动化的 URL 同步、分页管理和极简的组件调用。

### 1. 业务逻辑实现

```tsx
import { parseAsString } from "nuqs"
import { useDataTable } from "@/hooks"
import { PaginatedTable, DataTableToolbar, DataTableSearch } from "@/components/table"

export function UserList() {
  const { table, filters, loading, empty, fetching, refetch, pagination } = useDataTable({
    queryKey: ["users"],
    queryFn: getUsersApi,
    columns: userColumns,
    filterParsers: {
      status: parseAsString.withDefault("all"),
    },
    defaultFilters: {
      status: "all",
    },
  })

  return (
    <PaginatedTable
      table={table}
      loading={loading}
      empty={empty}
      emptyText="未找到相关用户"
      pagination={pagination}
      toolbar={
        <div className="flex items-center gap-2">
          <DataTableSearch queryKey="username" placeholder="搜索用户名..." />
          <Select 
            value={filters.state.status} 
            onValueChange={(v) => filters.set("status", v)}
          >
            {/* ... 状态选项 */}
          </Select>
        </div>
      }
    />
  )
}
```

---

## 💡 进阶：灵活组合模式 (Compound Components)

如果你需要更复杂的布局（例如将分页器放在顶部，或者自定义 Toolbar 结构），可以手动组合组件。由于 `DataTable` 系列组件会自动消费 `TableProvider` 的 Context，你无需重复传递 `loading` 或 `empty` 等 props。

```tsx
<TableProvider
  table={table}
  loading={loading}
  empty={empty}
  pagination={pagination}
>
  <DataTableContainer
    toolbar={<MyCustomToolbar />}
    table={<DataTable table={table} emptyText="无数据" />}
    pagination={<DataTablePagination />}
  />
</TableProvider>
```

---

## 📏 布局参考：内部滚动

仅在抽屉（Drawer）或固定高度卡片中，当页面无法整体滚动时，请为表格指定 `maxHeight`：

```tsx
<DataTable
  table={table}
  maxHeight="400px" // 开启内部 Y 轴滚动
  emptyText="暂无记录"
/>
```

---

## ⚠️ 开发者必读

1. **唯一实例**：始终通过 `useDataTable` 获取 `table` 实例并传递给组件。
2. **Context 利好**：在 `TableProvider` 或 `PaginatedTable` 下使用 `DataTable` 时，可以省略 `loading` 和 `empty` props。
3. **Sticky 注意项**：确保表格的外层容器没有设置 `overflow: hidden/auto`，否则表头吸顶功能会失效。
