import type * as React from "react"

export type TreeKey = string
export type TreeDropPosition = "inside" | "before" | "after"

export interface TreeDataNode {
  key: TreeKey
  title: React.ReactNode
  children?: TreeDataNode[] | undefined
  disabled?: boolean | undefined
  disableCheckbox?: boolean | undefined
  selectable?: boolean | undefined
  checkable?: boolean | undefined
  icon?: React.ReactNode | undefined
  isLeaf?: boolean | undefined
  className?: string | undefined
}

export interface TreeSelectInfo {
  selected: boolean
  node: TreeDataNode
  nativeEvent: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
}

export interface TreeCheckInfo {
  checked: boolean
  node: TreeDataNode
  nativeEvent: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>
}

export interface TreeExpandInfo {
  expanded: boolean
  node: TreeDataNode
}

export interface TreeDropInfo {
  dragKey: TreeKey
  dropKey: TreeKey
  dropPosition: TreeDropPosition
  dragNode: TreeDataNode
  dropNode: TreeDataNode
  treeData: TreeDataNode[]
}

export interface TreeProps extends Omit<React.ComponentProps<"div">, "onSelect" | "onDrop"> {
  treeData: TreeDataNode[]
  selectedKeys?: TreeKey[] | undefined
  defaultSelectedKeys?: TreeKey[] | undefined
  checkedKeys?: TreeKey[] | undefined
  defaultCheckedKeys?: TreeKey[] | undefined
  expandedKeys?: TreeKey[] | undefined
  defaultExpandedKeys?: TreeKey[] | undefined
  onSelect?: ((selectedKeys: TreeKey[], info: TreeSelectInfo) => void) | undefined
  onCheck?: ((checkedKeys: TreeKey[], info: TreeCheckInfo) => void) | undefined
  onExpand?: ((expandedKeys: TreeKey[], info: TreeExpandInfo) => void) | undefined
  onDrop?: ((info: TreeDropInfo) => void) | undefined
  checkable?: boolean | undefined
  multiple?: boolean | undefined
  draggable?: boolean | undefined
  virtual?: boolean | undefined
  height?: number | undefined
  itemHeight?: number | undefined
}

export interface FlattenedNode {
  key: TreeKey
  level: number
  node: TreeDataNode
  parentKey: TreeKey | null
  hasChildren: boolean
}
