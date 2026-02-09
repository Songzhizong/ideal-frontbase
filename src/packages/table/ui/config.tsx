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
  columnArrangement: {
    resetPinningText: string
    resetOrderText: string
    pinLeftAriaLabel: (label: string) => string
    pinRightAriaLabel: (label: string) => string
    unpinAriaLabel: (label: string) => string
    moveLeftAriaLabel: (label: string) => string
    moveRightAriaLabel: (label: string) => string
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
    errorText: string
  }
  filters: {
    selectPlaceholder: string
    numberRangeMinPlaceholder: string
    numberRangeMaxPlaceholder: string
    booleanTrueText: string
    booleanFalseText: string
    formatDate: (value: Date) => string
    clearAllText: string
    removeFilterAriaLabel: (label: string) => string
  }
  advancedSearch: {
    fieldTriggerText: string
    fieldSearchPlaceholder: string
    fieldEmptyText: string
    fieldGroupLabel: string
    noMatchingOptionsText: string
    typeText: string
    typeSelect: string
    typeMultiSelect: string
    typeBoolean: string
    typeNumberRange: string
    typeDate: string
    typeDateRange: string
    chooseField: (label: string) => string
    inputField: (label: string) => string
    defaultPlaceholder: string
    textFieldPlaceholder: (label: string) => string
    optionFieldPlaceholder: (label: string) => string
    cancelText: string
    confirmText: string
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
  | "columnArrangement"
  | "viewOptions"
  | "density"
  | "dragSort"
  | "filters"
  | "advancedSearch"
  | "rowExpansion"
  | "pagination"
  | "selectionBar"
> & {
  filterBar?: Partial<DataTableI18n["filterBar"]>
  columnToggle?: Partial<DataTableI18n["columnToggle"]>
  columnArrangement?: Partial<DataTableI18n["columnArrangement"]>
  viewOptions?: Partial<DataTableI18n["viewOptions"]>
  density?: Partial<DataTableI18n["density"]>
  dragSort?: Partial<DataTableI18n["dragSort"]>
  filters?: Partial<DataTableI18n["filters"]>
  advancedSearch?: Partial<DataTableI18n["advancedSearch"]>
  rowExpansion?: Partial<DataTableI18n["rowExpansion"]>
  pagination?: Partial<DataTableI18n["pagination"]>
  selectionBar?: Partial<DataTableI18n["selectionBar"]>
}

const systemDateFormatter = new Intl.DateTimeFormat()

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
  columnArrangement: {
    resetPinningText: "重置固定",
    resetOrderText: "重置顺序",
    pinLeftAriaLabel: (label) => `固定 ${label} 到左侧`,
    pinRightAriaLabel: (label) => `固定 ${label} 到右侧`,
    unpinAriaLabel: (label) => `取消固定 ${label}`,
    moveLeftAriaLabel: (label) => `${label} 左移`,
    moveRightAriaLabel: (label) => `${label} 右移`,
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
    errorText: "拖拽排序失败",
  },
  filters: {
    selectPlaceholder: "请选择",
    numberRangeMinPlaceholder: "最小值",
    numberRangeMaxPlaceholder: "最大值",
    booleanTrueText: "是",
    booleanFalseText: "否",
    formatDate: (value) => systemDateFormatter.format(value),
    clearAllText: "清除全部",
    removeFilterAriaLabel: (label) => `移除筛选 ${label}`,
  },
  advancedSearch: {
    fieldTriggerText: "筛选字段",
    fieldSearchPlaceholder: "搜索筛选字段",
    fieldEmptyText: "暂无匹配字段",
    fieldGroupLabel: "可用字段",
    noMatchingOptionsText: "暂无匹配选项",
    typeText: "文本",
    typeSelect: "单选",
    typeMultiSelect: "多选",
    typeBoolean: "布尔",
    typeNumberRange: "区间",
    typeDate: "日期",
    typeDateRange: "日期区间",
    chooseField: (label) => `选择${label}`,
    inputField: (label) => `输入${label}`,
    defaultPlaceholder: "输入关键字后按回车添加",
    textFieldPlaceholder: (label) => `输入${label}`,
    optionFieldPlaceholder: (label) => `选择${label}`,
    cancelText: "取消",
    confirmText: "确认",
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
    columnArrangement,
    viewOptions,
    density,
    dragSort,
    filters,
    advancedSearch,
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
    columnArrangement: {
      ...base.columnArrangement,
      ...columnArrangement,
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
    advancedSearch: {
      ...base.advancedSearch,
      ...advancedSearch,
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
