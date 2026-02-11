import { createContext, type ReactNode, useContext } from "react"
import type { DataTableInstance } from "../core"

export type DataTableScrollContainer = "root" | "window"
export type DataTableVariant = "default" | "subtle" | "dense"

export interface DataTableLayoutOptions {
  scrollContainer?: DataTableScrollContainer
  stickyQueryPanel?: boolean | { topOffset?: number }
  stickyHeader?: boolean | { topOffset?: number }
  stickyPagination?: boolean | { bottomOffset?: number }
}

const DataTableInstanceContext = createContext<DataTableInstance<unknown, unknown> | null>(null)
const DataTableLayoutContext = createContext<DataTableLayoutOptions | null>(null)
const DataTableVariantContext = createContext<DataTableVariant>("default")

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

export function useDataTableVariant() {
  return useContext(DataTableVariantContext)
}

export function DataTableProvider<TData, TFilterSchema>({
  dt,
  layout,
  variant,
  children,
}: {
  dt: DataTableInstance<TData, TFilterSchema>
  layout?: DataTableLayoutOptions
  variant?: DataTableVariant
  children: ReactNode
}) {
  return (
    <DataTableInstanceContext.Provider value={dt as DataTableInstance<unknown, unknown>}>
      <DataTableLayoutContext.Provider value={layout ?? null}>
        <DataTableVariantContext.Provider value={variant ?? "default"}>
          {children}
        </DataTableVariantContext.Provider>
      </DataTableLayoutContext.Provider>
    </DataTableInstanceContext.Provider>
  )
}
