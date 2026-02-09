import type { LayoutNavItem, LayoutPermissionChecker } from "./types"

export type ParentLayoutNavItem = LayoutNavItem & {
  children: readonly LayoutNavItem[]
}

export function hasChildren(item: LayoutNavItem): item is ParentLayoutNavItem {
  return Array.isArray(item.children) && item.children.length > 0
}

export function isParentActive(item: ParentLayoutNavItem, pathname: string) {
  return item.children.some((child) => child.to === pathname) || pathname.startsWith(`${item.to}/`)
}

export function isLeafActive(item: LayoutNavItem, pathname: string) {
  if (item.to === "/") {
    return pathname === "/"
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function flattenNavItems(items: readonly LayoutNavItem[]) {
  const result: LayoutNavItem[] = []
  const seenPaths = new Set<string>()

  const walk = (nodes: readonly LayoutNavItem[]) => {
    for (const item of nodes) {
      if (!seenPaths.has(item.to)) {
        seenPaths.add(item.to)
        result.push(item)
      }

      if (hasChildren(item)) {
        walk(item.children)
      }
    }
  }

  walk(items)

  return result
}

function hasPermissionAccess(item: LayoutNavItem, checker?: LayoutPermissionChecker) {
  return !checker || !item.permission || checker(item.permission)
}

export function filterNavByPermission(
  items: readonly LayoutNavItem[],
  checker?: LayoutPermissionChecker,
) {
  const result: LayoutNavItem[] = []

  for (const item of items) {
    if (!hasPermissionAccess(item, checker)) {
      continue
    }

    if (item.children) {
      const children = filterNavByPermission(item.children, checker)
      if (children.length > 0) {
        result.push({
          ...item,
          children,
        })
      } else {
        const { children: _children, ...leafItem } = item
        result.push(leafItem)
      }
      continue
    }

    result.push({
      ...item,
    })
  }

  return result
}

export function findFirstAccessibleNav(
  items: readonly LayoutNavItem[],
  checker?: LayoutPermissionChecker,
): LayoutNavItem | null {
  for (const item of items) {
    if (!hasPermissionAccess(item, checker)) {
      continue
    }

    if (item.children && item.children.length > 0) {
      const firstChild = findFirstAccessibleNav(item.children, checker)
      if (firstChild) {
        return firstChild
      }
    }

    return item
  }

  return null
}
