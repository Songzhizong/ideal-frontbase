# 表格组件使用示例

## 🚀 推荐模式：`useDataTable` + `PaginatedTable`

这种模式适用于 90% 的业务场景,提供了自动化的 URL 同步、分页管理和极简的组件调用。

### 基础用法

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
                    <Select value={filters.state.status} onValueChange={(v) => filters.set("status", v)}>
                        {/* ... 状态选项 */}
                    </Select>
                </div>
            }
        />
    )
}
```

---

## 💡 进阶：使用底层 Hook

### 场景 1: 自定义数据转换

当后端 API 响应格式与标准 `PageInfo` 不一致时:

```tsx
import { useTableQuery, useTableInstance } from "@/components/table"

export function CustomDataTable() {
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // 使用 useTableQuery 处理数据获取
    const { pageData, loading } = useTableQuery({
        queryKey: ["users"],
        queryFn: fetchUsers,
        pageNumber,
        pageSize,
        // 自定义转换函数
        transform: (response) => ({
            content: response.items,
            pageNumber: response.page,
            pageSize: response.limit,
            totalElements: response.total,
            totalPages: Math.ceil(response.total / response.limit),
        }),
    })

    // 使用 useTableInstance 创建表格实例
    const table = useTableInstance({
        data: pageData?.content ?? [],
        columns: userColumns,
        pageNumber,
        pageSize,
        totalPages: pageData?.totalPages ?? 0,
        onPaginationChange: ({ pageNumber, pageSize }) => {
            setPageNumber(pageNumber)
            setPageSize(pageSize)
        },
    })

    return (
        <PaginatedTable
            table={table}
            loading={loading}
            empty={!loading && pageData?.content.length === 0}
            pagination={{
                pageNumber,
                pageSize,
                totalElements: pageData?.totalElements ?? 0,
                totalPages: pageData?.totalPages ?? 0,
            }}
        />
    )
}
```

### 场景 2: 前端分页

不需要服务端分页时,只使用 `useTableInstance`:

```tsx
import { useTableInstance } from "@/components/table"

export function LocalDataTable({ data }: { data: User[] }) {
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const table = useTableInstance({
        data,
        columns: userColumns,
        pageNumber,
        pageSize,
        totalPages: Math.ceil(data.length / pageSize),
        onPaginationChange: ({ pageNumber, pageSize }) => {
            setPageNumber(pageNumber)
            setPageSize(pageSize)
        },
    })

    return (
        <PaginatedTable
            table={table}
            loading={false}
            empty={data.length === 0}
            pagination={{
                pageNumber,
                pageSize,
                totalElements: data.length,
                totalPages: Math.ceil(data.length / pageSize),
            }}
        />
    )
}
```

---

## 🎨 灵活组合模式 (Compound Components)

如果你需要更复杂的布局（例如将分页器放在顶部,或者自定义 Toolbar 结构）,可以手动组合组件。由于 `DataTable` 系列组件会自动消费 `TableProvider` 的 Context,你无需重复传递 `loading` 或 `empty` 等 props。

```tsx
import { TableProvider, DataTableContainer, DataTable, DataTablePagination } from "@/components/table"

export function CustomLayoutTable() {
    const { table, loading, empty, pagination } = useTablePagination({
        queryKey: ["users"],
        queryFn: fetchUsers,
        columns: userColumns,
    })

    return (
        <TableProvider
            table={table}
            loading={loading}
            empty={empty}
            pagination={pagination}
            onPageChange={(page) => console.log("Page changed:", page)}
            onPageSizeChange={(size) => console.log("Page size changed:", size)}
        >
            <DataTableContainer
                toolbar={<MyCustomToolbar />}
                table={<DataTable table={table} emptyText="无数据" />}
                pagination={<DataTablePagination />}
            />
        </TableProvider>
    )
}
```

---

## 🌐 国际化配置

### 全局配置

在应用根组件配置默认文案:

```tsx
import { TableConfigProvider } from "@/components/table"

export default function App() {
    return (
        <TableConfigProvider
            i18n={{
                emptyText: "No data available",
                loadingText: "Loading...",
                refreshingText: "Refreshing...",
                total: (count) => `Total: ${count}`,
                perPage: "per page",
                previousPage: "Previous",
                nextPage: "Next",
            }}
        >
            <YourApp />
        </TableConfigProvider>
    )
}
```

### 局部覆盖

在特定表格中覆盖文案:

```tsx
<DataTablePagination
    text={{
        total: (count) => `显示 ${count} 条记录`,
        perPage: "条/页",
    }}
/>
```

---

## 📏 布局参考：内部滚动

仅在抽屉（Drawer）或固定高度卡片中,当页面无法整体滚动时,请为表格指定 `maxHeight`:

```tsx
<DataTable
    table={table}
    maxHeight="400px" // 开启内部 Y 轴滚动
    emptyText="暂无记录"
/>
```

---

## ⚠️ 开发者必读

### Hook 选择指南

1. **标准场景**：使用 `useTablePagination`
    - 服务端分页 + 标准 API 响应格式
    - 需要自动处理 loading/error 状态
2. **自定义数据源**：使用 `useTableQuery` + `useTableInstance`
    - 非标准 API 响应格式
    - 需要自定义数据转换逻辑
3. **前端分页**：只使用 `useTableInstance`
    - 数据已在前端,不需要 API 调用
    - 静态数据展示

### Context 利好

在 `TableProvider` 或 `PaginatedTable` 下使用 `DataTable` 时,可以省略 `loading` 和 `empty` props,它们会自动从 Context 中读取。

### Sticky 注意项

确保表格的外层容器没有设置 `overflow: hidden/auto`,否则表头吸顶功能会失效。

### 性能优化

- 表格滚动使用 `requestAnimationFrame` 优化,无需手动处理
- 分页切换时使用 `keepPreviousData`,避免数据闪烁
- 类型守卫自动验证 API 响应,提供清晰的错误提示
