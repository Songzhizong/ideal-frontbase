import { createContext, type ReactNode, useContext, useMemo } from "react"

export interface DataTableI18n {
	emptyText: string
	loadingText: string
	refreshingText: string
	errorText: string
	retryText: string
	searchPlaceholder: string
	columnToggleLabel: string
	columnResizeHandleLabel: string
	selectionCheckboxLabel: string
	selectionBar: {
		selected: (count: number | "all") => string
		clear: string
		selectAllMatching: (total?: number) => string
		backToPage: string
	}
	pagination: {
		total: (count: number) => string
		perPage: string
		previous: string
		next: string
	}
}

export type DataTableI18nOverrides = Omit<Partial<DataTableI18n>, "pagination" | "selectionBar"> & {
	pagination?: Partial<DataTableI18n["pagination"]>
	selectionBar?: Partial<DataTableI18n["selectionBar"]>
}

const defaultI18n: DataTableI18n = {
	emptyText: "暂无数据",
	loadingText: "加载中...",
	refreshingText: "刷新中...",
	errorText: "数据加载失败",
	retryText: "重试",
	searchPlaceholder: "搜索...",
	columnToggleLabel: "列设置",
	columnResizeHandleLabel: "调整列宽",
	selectionCheckboxLabel: "选择行",
	selectionBar: {
		selected: (count) => (count === "all" ? "已选择全部" : `已选择 ${count} 条`),
		clear: "清空",
		selectAllMatching: (total) => (typeof total === "number" ? `选择全部 ${total} 条` : "选择全部"),
		backToPage: "仅保留本页",
	},
	pagination: {
		total: (count: number) => `共 ${count} 条`,
		perPage: "条/页",
		previous: "上一页",
		next: "下一页",
	},
}

const DataTableConfigContext = createContext<{ i18n: DataTableI18n }>({
	i18n: defaultI18n,
})

export function DataTableConfigProvider({
	children,
	i18n,
}: {
	children: ReactNode
	i18n?: DataTableI18nOverrides
}) {
	const merged = useMemo<DataTableI18n>(() => {
		return {
			...defaultI18n,
			...i18n,
			selectionBar: {
				...defaultI18n.selectionBar,
				...i18n?.selectionBar,
			},
			pagination: {
				...defaultI18n.pagination,
				...i18n?.pagination,
			},
		}
	}, [i18n])

	return (
		<DataTableConfigContext.Provider value={{ i18n: merged }}>
			{children}
		</DataTableConfigContext.Provider>
	)
}

export function useDataTableConfig() {
	return useContext(DataTableConfigContext)
}
