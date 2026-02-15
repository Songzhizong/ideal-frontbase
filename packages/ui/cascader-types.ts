import type * as React from "react"

export interface CascaderOption {
  value: string
  label: React.ReactNode
  children?: CascaderOption[] | undefined
  disabled?: boolean | undefined
  isLeaf?: boolean | undefined
  className?: string | undefined
}

export type CascaderSingleValue = string[]
export type CascaderMultiValue = string[][]
export type CascaderValue = CascaderSingleValue | CascaderMultiValue | undefined

export interface CascaderSearchResult {
  path: string[]
  labels: string[]
}

export interface CascaderProps
  extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> {
  options: CascaderOption[]
  value?: CascaderValue | undefined
  defaultValue?: CascaderValue | undefined
  onChange?:
    | ((
        value: CascaderSingleValue | undefined,
        selectedOptions: CascaderOption[] | undefined,
      ) => void)
    | ((value: CascaderMultiValue, selectedOptions: CascaderOption[][]) => void)
    | undefined
  loadData?:
    | ((selectedOptions: CascaderOption[]) => Promise<CascaderOption[] | undefined>)
    | undefined
  multiple?: boolean | undefined
  searchable?: boolean | undefined
  placeholder?: React.ReactNode | undefined
  emptyText?: React.ReactNode | undefined
  allowClear?: boolean | undefined
  maxTagCount?: number | undefined
  popoverClassName?: string | undefined
  disabled?: boolean | undefined
}
