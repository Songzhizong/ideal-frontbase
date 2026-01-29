# 表格组件系统文档

本系统基于 [TanStack Table v8](https://tanstack.com/table/v8) 构建，为项目提供统一、高性能且易于使用的表格解决方案。

## 📦 核心特性

- **集成 TanStack Query**: 自动处理数据获取、缓存、刷新和加载状态。
- **服务端分页与排序**: 深度集成服务端分页逻辑，支持列排序。
- **高度灵活的架构**:
  - **PaginatedTable**: 一站式解决方案，适用于 90% 的标准分页场景。
  - **TableCompound**: 复合组件模式，适用于需要高度定制化布局的场景。
- **列显隐控制**: 支持列显示/隐藏切换，并支持通过 `tableId` 实现本地持久化。
- **固定表头与自动滚动**: 表头自动吸顶，主体内容区域独立滚动。
- **增强型列定义**: 扩展 TanStack Table 的元数据，支持居中、居右对齐等布局控制。

---

## 🚀 快速上手

### 1. 标准分页表格 (PaginatedTable)

适用于最常见的管理后台列表页。

```tsx
import { PaginatedTable, useTablePagination } from "@/components/table"
import { getUsers } from "@/api/users"
import { columns } from "./columns"

export function UserList() {
  // 1. 初始化表格 Hook
  const table = useTablePagination({
    queryKey: ["users"],
    queryFn: ({ pageNumber, pageSize, sorting }) =>
      getUsers({ pageNumber, pageSize, ...sorting }),
    columns,
    tableId: "user-management-table", // 开启列持久化
    enableServerSorting: true,
  })

  // 2. 渲染组件
  return (
    <PaginatedTable
      {...table} // 展开 Hook 返回的所有状态和方法
      columns={columns}
      emptyText="暂无用户数据"
      onPageChange={table.setPage}
      onPageSizeChange={table.setPageSize}
      // toolbar={<UserTableToolbar />} // 可选：自定义工具栏
    />
  )
}
```

### 2. 高度自定义模式 (TableCompound)

当需要更复杂的布局（例如将工具栏放在特定位置，或在表格中间插入自定义内容）时使用。

```tsx
import { TableCompound, useTablePagination } from "@/components/table"

export function CustomTable() {
  const table = useTablePagination({ /* ...config */ })

  return (
    <TableCompound.Root {...table}>
      {/* 自定义布局 */}
      <div className="flex justify-between items-center mb-4">
        <h2>用户列表</h2>
        <TableCompound.ColumnToggle />
      </div>

      <TableCompound.Container
        toolbar={<TableCompound.Toolbar />}
        pagination={<TableCompound.Pagination />}
      >
        <TableCompound.Table
          columns={columns}
          loading={table.loading}
        />
      </TableCompound.Container>
    </TableCompound.Root>
  )
}
```

---

## 🛠 核心 Hook 说明

### `useTablePagination`

表格系统的灵魂，负责管理分页、排序、过滤和数据流。

| 参数                    | 类型            | 说明                                    |
|:----------------------|:--------------|:--------------------------------------|
| `queryKey`            | `unknown[]`   | TanStack Query 的缓存键。                  |
| `queryFn`             | `Function`    | 数据抓取函数，接收分页和排序参数。                     |
| `columns`             | `ColumnDef[]` | 列定义。                                  |
| `tableId`             | `string`      | (可选) 唯一 ID，用于在 LocalStorage 中存储列显隐配置。 |
| `enableServerSorting` | `boolean`     | (默认 false) 是否开启服务端排序。                 |
| `initialPageSize`     | `number`      | (默认 10) 初始每页条数。                       |

**返回对象常用属性**:
- `data`: 当前渲染的数据数组。
- `pagination`: 包含 `pageNumber`, `pageSize`, `totalElements` 等。
- `setPage(page)` / `setPageSize(size)`: 分页控制函数。
- `loading` / `fetching`: 是否正在初次加载 / 是否正在静默刷新。
- `columnChecks` / `setColumnChecks`: 控制列显示的原始状态。

### 其他 Hook
- `useTable`: 基础 Hook，适用于非异步加载的静态数据表格。
- `useTableQuery`: 适用于异步加载但无需分页的表格。
- `useTableOperate`: 用于处理表格中的操作（如删除、编辑）后的刷新逻辑。

---

## 📐 列定义 (Column Definition) 指南

列定义完全兼容 TanStack Table 规范。

### 扩展元数据 (`meta`)

通过在列定义中添加 `meta` 属性，可以控制表格的具体表现：

```tsx
const columns = [
  {
    accessorKey: "status",
    header: "状态",
    meta: {
      label: "用户状态",      // 在“列显示设置”中显示的友好名称
      align: "center",      // 单元格对齐方式: "left" | "center" | "right"
      hideInSetting: false,  // 是否在“列显示设置”中隐藏此选项
    }
  }
]
```

### 复选框列

使用内置辅助函数快速添加首列复选框：

```tsx
import { createSelectionColumn } from "@/components/table"

const columns = [
  createSelectionColumn(), // 自动添加带“全选”逻辑的复选框列
  // ... 其他列
]
```

---

## 💡 开发建议与最佳实践

1. **务必提供 `tableId`**: 只要是业务表格，都应提供唯一的 `tableId`。这能极大提升用户体验，让用户自定义的列配置在刷新后依然有效。
2. **定义 `meta.label`**: 默认情况下，列设置面板会使用 `header` 字符串。如果 `header` 是复杂的 React 节点（如排序按钮），请务必在 `meta.label` 中提供纯文本名称。
3. **固定列宽**: 对于操作列或状态列，建议在列定义中显式设置 `size` (像素值)，以保证在不同屏幕下的布局稳定性。
4. **性能优化**: 尽量在组件外定义 `columns` 数组，或者使用 `useMemo` 包裹，避免不必要的表格重绘。
5. **高度控制**: `PaginatedTable` 默认会自动填充父容器高度。如果容器没有固定高度，请通过 `height` 属性指定。

---

## ❓ 常见问题

**Q: 如何手动触发数据刷新？**
A: `useTablePagination` 返回的对象中包含 `refetch` 方法，直接调用即可。

**Q: 如何获取当前选中的行？**
A: `useTablePagination` 返回 `rowSelection` 状态。建议结合 `getRowId` 参数使用以获取稳定的 ID 映射。

**Q: 表格内容溢出怎么办？**
A: 表格内部已封装了 `overflow-y: auto`。只要给父容器设置了固定高度或 `flex: 1`，表格就会在内部滚动，而不会撑开页面。
