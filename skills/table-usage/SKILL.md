---
name: table-usage
description: "Use when implementing or modifying table components in this codebase, especially paginated tables, server-side pagination, search, filters, or URL-synced table state (nuqs). Triggers include: 新增分页表格, 分页表格, 表格分页."
---

# Table Usage Skill

提供本项目表格组件的标准用法与踩坑规则，确保分页/筛选与 URL 状态同步。

## Quick Workflow (推荐)

1) **优先使用 `useDataTable`** 来管理分页、筛选、搜索、URL 状态。  
2) **用 `TableProvider` 作为上下文容器**，并传入 `pagination`、`onPageChange`、`onPageSizeChange`。  
3) **分页回调必须走 `useDataTable` 的 `setPage` / `setPageSize`**，避免直接 `table.setPageIndex` 破坏 nuqs 同步。  
4) **筛选/搜索走 `filters`**：`filters.set` / `filters.reset` / `filters.onSearch`。

## Must Follow Rules

- 使用 `useDataTable` 时：
  - `TableProvider` 的 `onPageChange` 用 `setPage`，`onPageSizeChange` 用 `setPageSize`。
  - 不要在分页按钮里调用 `table.setPageIndex` 或 `table.setPageSize`。
  - 业务筛选需要在 `filterParsers` 中声明，并用 `filters.set` 修改。
  - 搜索走 `filters.onSearch`，不要自己做 debounce。
- `DataTablePagination` 只能放在 `TableProvider` 内。
- 表格 UI 组件只能用 `@/components/table` 与 `@/components/ui`。

## Minimal Example (分页 + 筛选)

```tsx
import { parseAsString } from "nuqs"
import {
	DataTable,
	DataTableContainer,
	DataTableFilterBar,
	DataTablePagination,
	TableProvider,
} from "@/components/table"
import { useDataTable } from "@/hooks"

export function UsersPage() {
	const {
		table,
		filters,
		loading,
		empty,
		fetching,
		refetch,
		pagination,
		setPage,
		setPageSize,
	} = useDataTable({
		queryKey: ["users"],
		queryFn: getUsers,
		columns: usersTableColumns,
		filterParsers: {
			status: parseAsString.withDefault("all"),
		},
		defaultFilters: {
			status: "all",
		},
	})

	return (
		<TableProvider
			table={table}
			loading={loading}
			empty={empty}
			pagination={pagination}
			onPageChange={(page) => setPage(page)}
			onPageSizeChange={(size) => setPageSize(size)}
		>
			<DataTableContainer
				toolbar={
					<DataTableFilterBar
						onSearch={async () => refetch()}
						onReset={() => filters.reset()}
						onRefresh={async () => refetch()}
					>
						{/* 筛选组件: filters.state + filters.set */}
					</DataTableFilterBar>
				}
				table={
					<DataTable
						table={table}
						loading={loading}
						empty={empty}
						fetching={fetching}
					/>
				}
				pagination={<DataTablePagination />}
			/>
		</TableProvider>
	)
}
```

## Common Pitfalls

- **分页点击无效**：通常是 `onPageChange`/`onPageSizeChange` 直接操作了 `table`，导致 nuqs 未更新。应使用 `setPage` / `setPageSize`。
- **筛选不生效**：`filterParsers` 没定义或 key 不一致。
- **搜索不防抖**：不要自己写 debounce，使用 `filters.onSearch`。

## Where to Look

- `src/hooks/use-data-table.ts`：URL + 分页 + 筛选核心逻辑
- `src/components/table/components/data-table-pagination.tsx`：分页 UI
- `src/components/table/ARCHITECTURE.md`：架构原则
