import type { ReactNode } from "react"
import type { FilterType } from "../../core"

export type DataTableQueryFieldId = string
export type DataTableQueryFieldPanelSlot = "primary" | "secondary" | "hidden"
export type DataTableQueryLayoutMode = "inline" | "stacked"
export type DataTableQueryFieldLabelMode = "top" | "inside"

export interface DataTableQueryFieldOption<TValue> {
  label: string
  value: TValue
}

export interface DataTableQueryFieldSearchConfig {
  enabled?: boolean
  pickerVisible?: boolean
  order?: number
}

export interface DataTableQueryFieldUiConfig {
  panel?: DataTableQueryFieldPanelSlot
  containerClassName?: string
}

export interface DataTableQuerySingleBinding<
  TFilterSchema,
  K extends Extract<keyof TFilterSchema, string>,
> {
  mode: "single"
  key: K
  clearValue?: TFilterSchema[K] | ((filters: Readonly<TFilterSchema>) => TFilterSchema[K])
}

export interface DataTableQueryCompositeBinding<
  TFilterSchema,
  TValue,
  K extends Extract<keyof TFilterSchema, string> = Extract<keyof TFilterSchema, string>,
> {
  mode: "composite"
  keys: readonly K[]
  getValue: (filters: Readonly<TFilterSchema>) => TValue
  setValue: (value: TValue, prev: Readonly<TFilterSchema>) => Partial<TFilterSchema>
  clearValue: (prev: Readonly<TFilterSchema>) => Partial<TFilterSchema>
  isEmpty?: (value: TValue) => boolean
}

export type DataTableQueryFieldBinding<
  TFilterSchema,
  TValue,
  K extends Extract<keyof TFilterSchema, string> = Extract<keyof TFilterSchema, string>,
> =
  | DataTableQuerySingleBinding<TFilterSchema, K>
  | DataTableQueryCompositeBinding<TFilterSchema, TValue, K>

export interface DataTableQueryField<
  TFilterSchema,
  TValue = unknown,
  TFieldId extends DataTableQueryFieldId = DataTableQueryFieldId,
> {
  id: TFieldId
  label: string
  kind: FilterType
  binding: DataTableQueryFieldBinding<TFilterSchema, TValue>
  search?: DataTableQueryFieldSearchConfig
  ui?: DataTableQueryFieldUiConfig
  placeholder?: string
  options?: ReadonlyArray<DataTableQueryFieldOption<unknown>>
  render?: (args: {
    value: TValue
    setValue: (value: TValue) => void
    clear: () => void
    filters: Readonly<TFilterSchema>
  }) => ReactNode
  chip?: {
    hidden?: boolean
    formatValue?: (value: TValue) => string
    render?: (args: { value: TValue; clear: () => void }) => ReactNode
  }
}

export interface DataTableQuerySearchConfig<
  TFieldId extends DataTableQueryFieldId = DataTableQueryFieldId,
> {
  mode?: "simple" | "advanced"
  defaultFieldId?: TFieldId
  debounceMs?: number
  placeholder?: string
  className?: string
}

export interface DataTableQuerySchema<
  TFilterSchema,
  TFieldId extends DataTableQueryFieldId = DataTableQueryFieldId,
> {
  fields: readonly DataTableQueryField<TFilterSchema, unknown, TFieldId>[]
  search?: DataTableQuerySearchConfig<TFieldId> | false
}

export interface DataTableQueryLayout<
  TFieldId extends DataTableQueryFieldId = DataTableQueryFieldId,
> {
  mode?: DataTableQueryLayoutMode
  inline?: {
    queryGrow?: boolean
  }
  primary?: {
    search?: boolean
    fieldIds?: readonly TFieldId[]
    fieldLabelMode?: DataTableQueryFieldLabelMode
  }
  secondary?: {
    fieldIds?: readonly TFieldId[]
    collapsible?: boolean
    defaultExpanded?: boolean
    expanded?: boolean
    onExpandedChange?: (expanded: boolean) => void
    fieldLabelMode?: DataTableQueryFieldLabelMode
  }
  chips?: {
    visible?: boolean
    showClearAll?: boolean
    clearAllLabel?: string
  }
}

export interface DataTableQuerySlots {
  actionsLeft?: ReactNode
  actionsRight?: ReactNode
}

export interface DataTablePresetQueryProps<
  TFilterSchema,
  TFieldId extends DataTableQueryFieldId = DataTableQueryFieldId,
> {
  className?: string
  schema: DataTableQuerySchema<TFilterSchema, TFieldId>
  layout?: DataTableQueryLayout<TFieldId>
  slots?: DataTableQuerySlots
}
