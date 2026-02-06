import type { DataTableActions } from "../types"

export function createNoopActions(): DataTableActions {
  const noop = () => {}
  const noopAsync = async () => {}
  return {
    refetch: noopAsync,
    retry: noopAsync,
    resetAll: noop,
    setPage: noop,
    setPageSize: noop,
    setSort: noop,
    clearSort: noop,
    clearSelection: noop,
    selectAllCurrentPage: noop,
    selectAllMatching: noopAsync,
    resetColumnVisibility: noop,
    resetColumnSizing: noop,
    resetDensity: noop,
    expandRow: noop,
    collapseRow: noop,
    toggleRowExpanded: noop,
    expandAll: noop,
    collapseAll: noop,
    expandToDepth: noop,
    moveRow: noopAsync,
  }
}

export function createDeferred<T>() {
  let resolve: (value: T) => void = () => {}
  let reject: (reason?: unknown) => void = () => {}
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}
