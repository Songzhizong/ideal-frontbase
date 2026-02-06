import { createContext, type ReactNode, useContext } from "react"
import type { DataTableInstance } from "../core"

export type DataTableScrollContainer = "root" | "window"

export interface DataTableLayoutOptions {
	scrollContainer?: DataTableScrollContainer
	stickyHeader?: boolean | { topOffset?: number }
	stickyPagination?: boolean | { bottomOffset?: number }
}

const DataTableInstanceContext = createContext<DataTableInstance<unknown, unknown> | null>(null)
const DataTableLayoutContext = createContext<DataTableLayoutOptions | null>(null)

export function useDataTableInstance<TData, TFilterSchema>() {
	const context = useContext(DataTableInstanceContext)
	if (!context) {
		throw new Error("useDataTableInstance must be used within DataTableRoot")
	}
	return context as DataTableInstance<TData, TFilterSchema>
}

export function useDataTableLayout() {
	return useContext(DataTableLayoutContext)
}

export function DataTableProvider<TData, TFilterSchema>({
	dt,
	layout,
	children,
}: {
	dt: DataTableInstance<TData, TFilterSchema>
	layout?: DataTableLayoutOptions
	children: ReactNode
}) {
	return (
		<DataTableInstanceContext.Provider value={dt as DataTableInstance<unknown, unknown>}>
			<DataTableLayoutContext.Provider value={layout ?? null}>
				{children}
			</DataTableLayoutContext.Provider>
		</DataTableInstanceContext.Provider>
	)
}
