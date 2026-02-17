import type * as React from "react"

export type LayoutIcon = React.ComponentType<{
  className?: string
}>

export type LayoutPermissionChecker = (permission: string) => boolean

export interface LayoutNavItem {
  title: string
  to: string
  icon?: LayoutIcon
  permission?: string
  children?: readonly LayoutNavItem[]
}

export interface LayoutNavGroup {
  title?: string
  items: readonly LayoutNavItem[]
}
