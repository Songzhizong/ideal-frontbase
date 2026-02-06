import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { DataSource, DataTableQuery, RemoteDataSourceOptions } from "../types"

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function stableStructure(value: unknown): unknown {
	if (value instanceof Date) return value.toISOString()
	if (Array.isArray(value)) return value.map(stableStructure)
	if (!isRecord(value)) return value
	const keys = Object.keys(value).sort()
	const next: Record<string, unknown> = {}
	for (const key of keys) {
		next[key] = stableStructure(value[key])
	}
	return next
}

function buildQueryKey<TFilterSchema>(
	baseKey: unknown[],
	query: DataTableQuery<TFilterSchema>,
): unknown[] {
	return [
		...baseKey,
		{
			page: query.page,
			size: query.size,
			sort: stableStructure(query.sort),
			filters: stableStructure(query.filters),
		},
	]
}

export function remote<TData, TFilterSchema, TResponse>(
	options: RemoteDataSourceOptions<TData, TFilterSchema, TResponse>,
): DataSource<TData, TFilterSchema> {
	return {
		use: (query) => {
			const queryKey = buildQueryKey(options.queryKey, query)
			const enableKeepPreviousData = options.keepPreviousData !== false
			const result = useQuery({
				queryKey,
				queryFn: () =>
					options.queryFn({
						page: query.page,
						size: query.size,
						sort: query.sort,
						filters: query.filters,
					}),
				...(enableKeepPreviousData ? { placeholderData: keepPreviousData } : {}),
			})
			const refetch = async () => {
				await result.refetch()
			}
			return {
				data: result.data ? options.map(result.data) : null,
				isInitialLoading: result.isLoading,
				isFetching: result.isFetching,
				error: result.error ?? null,
				refetch,
				retry: refetch,
			}
		},
	}
}
