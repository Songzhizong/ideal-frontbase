# 表格组件架构设计

## 1. 设计核心：单一事实来源 (Single Source of Truth)

本表格系统基于 **TanStack Table (v8)** 构建。所有的表格状态（排序、筛选、分页、选择、列可见性）全部存储在 `table` 实例中，杜绝任何并行的外部状态。

### 核心原则

- **实例驱动渲染**：`DataTable` 组件本身不持有任何状态，它仅作为一个受控组件接收 `table` 实例并渲染视图。
- **Context 自动解耦**：利用 `TableProvider` 将 `table` 实例及常用 UI 状态（loading, empty）注入 Context。子组件（如 `DataTableContent`）优先从 Context 中读取这些值,极大减少了 Prop Drilling。
- **防御性数据流**：在 Hook 层确保 `data` 始终有默认值 `[]`，防止 TanStack Table 内部因 `undefined` 崩溃。

---

## 2. Hook 分层架构

### 高级 Hook：`useTablePagination`

**推荐用于标准场景**。集成了数据获取、表格实例创建和状态管理:

- **TanStack Query 集成**：自动处理数据获取、缓存和 loading 状态
- **Server-side 支持**：支持服务端排序和筛选
- **智能重置**：筛选条件变化时自动重置页码为 1
- **URL 同步**：配合 `nuqs` 可实现状态持久化

```tsx
const { table, loading, pagination, empty } = useTablePagination({
    queryKey: ['users'],
    queryFn: fetchUsers,
    columns: userColumns,
    enableServerSorting: true,
})
```

### 底层 Hook：灵活组合

适用于需要自定义数据获取逻辑的场景:

#### `useTableQuery` - 数据获取层

专注于数据获取和转换,包含类型守卫验证:

```tsx
const { pageData, loading, refetch } = useTableQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    pageNumber: 1,
    pageSize: 10,
    transform: (response) => ({
        content: response.items,
        pageNumber: response.page,
        pageSize: response.limit,
        totalElements: response.total,
        totalPages: Math.ceil(response.total / response.limit),
    }),
})
```

#### `useTableInstance` - 表格实例层

专注于 TanStack Table 实例创建和状态管理:

```tsx
const table = useTableInstance({
    data: pageData?.content ?? [],
    columns: userColumns,
    pageNumber: 1,
    pageSize: 10,
    totalPages: pageData?.totalPages ?? 0,
    enableServerSorting: true,
})
```

---

## 3. 组件分层架构

### 第零层：业务 Hook (`useDataTable`)

最为推荐的接入方式。它集成了:

- **URL 参数同步**：利用 `nuqs` 自动将表格状态同步至地址栏
- **智能重置**：当筛选条件变化时,自动将页码重置为 1
- **防抖处理**：内置搜索防抖,减少 API 调用频率

### 第一层：基础容器 (`DataTableContainer`)

负责表格的外部布局与性能优化:

- **高度测量**：通过 `useElementSize` 实时测量 Toolbar 高度
- **布局变量**：将偏移量通过 CSS 变量 `--data-table-sticky-offset` 注入,驱动 Header 的 `sticky` 效果
- **自适应空间**：使用 `flex-1 min-h-0` 确保在 Flex 布局中能够正确占满剩余空间并支持内部溢出滚动

### 第二层：渲染核心 (`DataTable`)

- **DataTableContent**：高性能渲染逻辑
- **Sticky Header**：支持表头吸顶,对接 Toolbar 高度
- **RAF 滚动同步**：使用 `requestAnimationFrame` 优化表头与表体的横向滚动同步,避免掉帧

---

## 4. 性能优化

### 滚动同步优化

使用 `requestAnimationFrame` 将滚动同步操作放入浏览器渲染周期:

- **防抖机制**：避免重复调度 RAF
- **内存安全**：组件卸载时正确清理 RAF
- **性能提升**：避免高频滚动时的掉帧问题

### 数据获取优化

- **keepPreviousData**：分页切换时保留上一页数据,避免闪烁
- **类型守卫**：运行时验证 API 响应结构,提供清晰的错误提示

---

## 5. 国际化支持

### TableConfigContext

提供全局国际化配置,支持局部覆盖:

```tsx
// 全局配置
<TableConfigProvider
    i18n={{
        emptyText: "No data available",
        loadingText: "Loading...",
        total: (count) => `Total: ${count}`,
    }}
>
    <App />
</TableConfigProvider>

// 局部覆盖
<DataTablePagination
    text={{
        total: (count) => `显示 ${count} 条记录`,
    }}
/>
```

---

## 6. 高度自适应机制

表格的"自适应高度"是由 **布局结构** 和 **测量辅助** 共同实现的:

1. **容器层 (Flex)**：`DataTableContainer` 设置为 `flex-col flex-1`
2. **测量层 (JS)**：`useElementSize` 监听 Toolbar 高度,动态更新 `--data-table-sticky-offset`
3. **展示层 (CSS)**：`DataTable` 的 `thead` 设置为 `sticky`,其 `top` 位置由上述变量控制
4. **内部滚动**：当显式设置 `maxHeight` 时,`DataTableContent` 的 Body 区域会开启 `overflow-y: auto`

---

## 7. 最佳实践

### ✅ 推荐做法

- 使用 `useTablePagination` 处理标准分页表格
- 使用 `useTableQuery` + `useTableInstance` 处理自定义场景
- 通过 `TableConfigProvider` 配置全局国际化文案
- 利用 `TableProvider` 减少 props 传递

### ❌ 禁止做法

- **严禁**在 `DataTable` 外部手动维护列显示状态（已由 `table` 实例管理）
- **严禁**手动编写 API 分页参数与 `table` 状态的同步逻辑（应由 Hook 自动完成）
- **严禁**在没有固定高度容器的情况下给表格加 `overflow: hidden`（会破坏 Sticky 效果）
