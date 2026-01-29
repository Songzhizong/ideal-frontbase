import type { ColumnDef } from "@tanstack/react-table"
import { useTablePagination } from "@/components/table"
import { type GetUsersParams, getUsers } from "../api/get-users"
import type { User } from "../types"

export interface UseUsersQueryOptions {
	columns: ColumnDef<User>[]
	initialFilters?: Partial<GetUsersParams>
}

export function useUsersQuery({ columns, initialFilters = {} }: UseUsersQueryOptions) {
	return useTablePagination<User>({
		queryKey: ["users"],
		queryFn: async ({ pageNumber, pageSize, sorting, filters }) => {
			const params: GetUsersParams = {
				pageNumber,
				pageSize,
				...initialFilters,
				...filters,
				...(sorting && { sorting }),
			}
			return getUsers(params)
		},
		columns,
		enableServerSorting: true,
		enableServerFiltering: true,
		tableId: "users-table",
	})
}
