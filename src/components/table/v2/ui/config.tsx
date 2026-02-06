import { createContext, type ReactNode, useContext, useMemo } from "react"

export interface DataTableI18n {
  emptyText: string
  loadingText: string
  refreshingText: string
  errorText: string
  retryText: string
  searchPlaceholder: string
  clearSearchAriaLabel: string
  columnToggleLabel: string
  columnResizeHandleLabel: string
  selectionCheckboxLabel: string
  filterBar: {
    expandText: string
    collapseText: string
  }
  columnToggle: {
    resetText: string
    selectAllText: string
  }
  viewOptions: {
    triggerAriaLabel: string
    densityLabel: string
    resetAllText: string
  }
  density: {
    compactText: string
    comfortableText: string
  }
  dragSort: {
    handleLabel: string
  }
  filters: {
    selectPlaceholder: string
    numberRangeMinPlaceholder: string
    numberRangeMaxPlaceholder: string
    booleanTrueText: string
    booleanFalseText: string
    clearAllText: string
    removeFilterAriaLabel: (label: string) => string
  }
  rowExpansion: {
    expandLabel: string
    collapseLabel: string
  }
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

export type DataTableI18nOverrides = Omit<
  Partial<DataTableI18n>,
  | "filterBar"
  | "columnToggle"
  | "viewOptions"
  | "density"
  | "dragSort"
  | "filters"
  | "rowExpansion"
  | "pagination"
  | "selectionBar"
> & {
  filterBar?: Partial<DataTableI18n["filterBar"]>
  columnToggle?: Partial<DataTableI18n["columnToggle"]>
  viewOptions?: Partial<DataTableI18n["viewOptions"]>
  density?: Partial<DataTableI18n["density"]>
  dragSort?: Partial<DataTableI18n["dragSort"]>
  filters?: Partial<DataTableI18n["filters"]>
  rowExpansion?: Partial<DataTableI18n["rowExpansion"]>
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
  clearSearchAriaLabel: "清空搜索",
  columnToggleLabel: "列设置",
  columnResizeHandleLabel: "调整列宽",
  selectionCheckboxLabel: "选择行",
  filterBar: {
    expandText: "展开",
    collapseText: "收起",
  },
  columnToggle: {
    resetText: "重置",
    selectAllText: "全选",
  },
  viewOptions: {
    triggerAriaLabel: "更多选项",
    densityLabel: "显示密度",
    resetAllText: "恢复表格默认设置",
  },
  density: {
    compactText: "紧凑",
    comfortableText: "舒适",
  },
  dragSort: {
    handleLabel: "拖拽排序",
  },
  filters: {
    selectPlaceholder: "请选择",
    numberRangeMinPlaceholder: "最小值",
    numberRangeMaxPlaceholder: "最大值",
    booleanTrueText: "是",
    booleanFalseText: "否",
    clearAllText: "清除全部",
    removeFilterAriaLabel: (label) => `移除筛选 ${label}`,
  },
  rowExpansion: {
    expandLabel: "展开",
    collapseLabel: "收起",
  },
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

export function mergeDataTableI18n(
  base: DataTableI18n,
  overrides?: DataTableI18nOverrides,
): DataTableI18n {
  if (!overrides) return base
  const {
    filterBar,
    columnToggle,
    viewOptions,
    density,
    dragSort,
    filters,
    rowExpansion,
    pagination,
    selectionBar,
    ...rest
  } = overrides

  return {
    ...base,
    ...rest,
    filterBar: {
      ...base.filterBar,
      ...filterBar,
    },
    columnToggle: {
      ...base.columnToggle,
      ...columnToggle,
    },
    viewOptions: {
      ...base.viewOptions,
      ...viewOptions,
    },
    density: {
      ...base.density,
      ...density,
    },
    dragSort: {
      ...base.dragSort,
      ...dragSort,
    },
    filters: {
      ...base.filters,
      ...filters,
    },
    rowExpansion: {
      ...base.rowExpansion,
      ...rowExpansion,
    },
    selectionBar: {
      ...base.selectionBar,
      ...selectionBar,
    },
    pagination: {
      ...base.pagination,
      ...pagination,
    },
  }
}

export function DataTableConfigProvider({
  children,
  i18n,
}: {
  children: ReactNode
  i18n?: DataTableI18nOverrides
}) {
  const merged = useMemo<DataTableI18n>(() => {
    return mergeDataTableI18n(defaultI18n, i18n)
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
