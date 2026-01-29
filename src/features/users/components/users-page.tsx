import { Plus } from "lucide-react"
import { useCallback } from "react"
import { PageContainer } from "@/components/common"
import {
	DataTable,
	DataTableContainer,
	DataTableFilterBar,
	DataTablePagination,
	TableProvider,
} from "@/components/table"
import { Button } from "@/components/ui/button"
import { useUsersFilters, useUsersQuery } from "@/features/users"
import { UsersExtraFilters, UsersFilterForm } from "./users-filter-form"
import { usersTableColumns } from "./users-table-columns"

export function UsersPage() {
	const {
		urlFilters,
		updateSelectFilter,
		resetFilters,
		getApiFilters,
	} = useUsersFilters()

	const tableQuery = useUsersQuery({
		columns: usersTableColumns,
		initialFilters: getApiFilters(),
	})

	const handleReset = useCallback(() => {
		resetFilters()
	}, [resetFilters])

	const handleRefresh = useCallback(async () => {
		await tableQuery.refetch()
	}, [tableQuery])

	return (
		<PageContainer>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-foreground">用户管理</h1>
						<p className="text-sm text-muted-foreground">管理系统用户账户和权限设置</p>
					</div>
				</div>

				{/* Table */}
				<TableProvider
					{...tableQuery}
					onPageChange={tableQuery.setPage}
					onPageSizeChange={tableQuery.setPageSize}
				>
					<DataTableContainer
						toolbar={
							<DataTableFilterBar
								onReset={handleReset}
								onRefresh={handleRefresh}
								actions={
									<Button size="sm" className="h-9">
										<Plus className="mr-2 h-4 w-4" />
										新增
									</Button>
								}
								extraFilters={
									<UsersExtraFilters
										urlFilters={urlFilters}
										onSelectChange={updateSelectFilter}
									/>
								}
							>
								<UsersFilterForm
									urlFilters={urlFilters}
									onSelectChange={updateSelectFilter}
								/>
							</DataTableFilterBar>
						}
						table={
							<DataTable
								columns={usersTableColumns}
								data={tableQuery.data}
								loading={tableQuery.loading}
								empty={tableQuery.empty}
								emptyText="暂无用户数据"
								rowSelection={tableQuery.rowSelection}
								onRowSelectionChange={tableQuery.onRowSelectionChange}
								columnVisibility={tableQuery.columnVisibility}
								fetching={tableQuery.fetching}
							/>
						}
						pagination={<DataTablePagination />}
					/>
				</TableProvider>
			</div>
		</PageContainer>
	)
}
