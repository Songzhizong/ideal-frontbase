import { createContext, type ReactNode, useContext } from "react"

export interface TableI18nConfig {
	// DataTable
	emptyText: string
	loadingText: string
	refreshingText: string

	// Pagination
	total: (count: number) => string
	perPage: string
	firstPage: string
	previousPage: string
	nextPage: string
	lastPage: string

	// Column Toggle
	columns: string
	toggleColumns: string

	// Search
	searchPlaceholder: string

	// Filter
	filterPlaceholder: string
	clearFilters: string
}

export interface TableConfigContextValue {
	i18n: TableI18nConfig
}

// 默认中文配置
const defaultI18nConfig: TableI18nConfig = {
	emptyText: "暂无数据",
	loadingText: "加载中...",
	refreshingText: "刷新中...",
	total: (count: number) => `共 ${count} 条`,
	perPage: "条/页",
	firstPage: "第一页",
	previousPage: "上一页",
	nextPage: "下一页",
	lastPage: "最后一页",
	columns: "列",
	toggleColumns: "切换列显示",
	searchPlaceholder: "搜索...",
	filterPlaceholder: "筛选...",
	clearFilters: "清除筛选",
}

const TableConfigContext = createContext<TableConfigContextValue>({
	i18n: defaultI18nConfig,
})

export interface TableConfigProviderProps {
	children: ReactNode
	i18n?: Partial<TableI18nConfig>
}

/**
 * Table configuration provider for global i18n settings
 * Provides default text for all table components
 * Can be overridden at component level via props
 */
export function TableConfigProvider({ children, i18n }: TableConfigProviderProps) {
	const config = {
		i18n: { ...defaultI18nConfig, ...i18n },
	}

	return <TableConfigContext.Provider value={config}>{children}</TableConfigContext.Provider>
}

/**
 * Hook to access table configuration
 * Returns i18n config for table components
 */
export function useTableConfig() {
	return useContext(TableConfigContext)
}
