import type * as React from "react"
import { useState } from "react"
import type {
  FlattenedNode,
  TreeDataNode,
  TreeDropInfo,
  TreeDropPosition,
  TreeKey,
} from "./tree-types"

export function useControllableKeys({
  value,
  defaultValue,
}: {
  value?: TreeKey[] | undefined
  defaultValue?: TreeKey[] | undefined
}) {
  const [internalValue, setInternalValue] = useState<TreeKey[]>(defaultValue ?? [])
  const isControlled = value !== undefined
  return {
    keys: isControlled ? value : internalValue,
    setKeys: setInternalValue,
    isControlled,
  }
}

export function updateInternalState(
  keys: TreeKey[],
  isControlled: boolean,
  setKeys: (keys: TreeKey[]) => void,
) {
  if (!isControlled) {
    setKeys(keys)
  }
}

export function flattenTree(
  nodes: TreeDataNode[],
  expandedSet: Set<TreeKey>,
  level = 0,
  parentKey: TreeKey | null = null,
): FlattenedNode[] {
  const result: FlattenedNode[] = []
  for (const node of nodes) {
    const hasChildren = Boolean(node.children && node.children.length > 0)
    result.push({ key: node.key, level, node, parentKey, hasChildren })
    if (hasChildren && expandedSet.has(node.key)) {
      result.push(...flattenTree(node.children ?? [], expandedSet, level + 1, node.key))
    }
  }
  return result
}

export function findNodeByKey(nodes: TreeDataNode[], key: TreeKey): TreeDataNode | null {
  for (const node of nodes) {
    if (node.key === key) {
      return node
    }
    if (node.children) {
      const found = findNodeByKey(node.children, key)
      if (found) {
        return found
      }
    }
  }
  return null
}

export function collectDescendantKeys(node: TreeDataNode): TreeKey[] {
  const keys: TreeKey[] = [node.key]
  if (!node.children) {
    return keys
  }
  for (const child of node.children) {
    keys.push(...collectDescendantKeys(child))
  }
  return keys
}

export function buildParentMap(nodes: TreeDataNode[], parentKey: TreeKey | null = null) {
  const map = new Map<TreeKey, TreeKey | null>()
  for (const node of nodes) {
    map.set(node.key, parentKey)
    if (node.children) {
      const childMap = buildParentMap(node.children, node.key)
      for (const [key, parent] of childMap.entries()) {
        map.set(key, parent)
      }
    }
  }
  return map
}

export function updateParentCheckedState(
  checkedSet: Set<TreeKey>,
  nodes: TreeDataNode[],
  targetKey: TreeKey,
  parentMap: Map<TreeKey, TreeKey | null>,
) {
  let currentParent = parentMap.get(targetKey) ?? null
  while (currentParent) {
    const parentNode = findNodeByKey(nodes, currentParent)
    if (!parentNode?.children?.length) {
      currentParent = parentMap.get(currentParent) ?? null
      continue
    }
    const allChecked = parentNode.children.every((child) => checkedSet.has(child.key))
    if (allChecked) {
      checkedSet.add(parentNode.key)
    } else {
      checkedSet.delete(parentNode.key)
    }
    currentParent = parentMap.get(currentParent) ?? null
  }
}

function cloneTreeData(nodes: TreeDataNode[]): TreeDataNode[] {
  return nodes.map((node) => ({
    ...node,
    ...(node.children ? { children: cloneTreeData(node.children) } : {}),
  }))
}

function findNodeLocation(
  nodes: TreeDataNode[],
  key: TreeKey,
  parent: TreeDataNode | null = null,
): { siblings: TreeDataNode[]; index: number; parent: TreeDataNode | null } | null {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]
    if (!node) {
      continue
    }
    if (node.key === key) {
      return { siblings: nodes, index, parent }
    }
    if (node.children) {
      const location = findNodeLocation(node.children, key, node)
      if (location) {
        return location
      }
    }
  }
  return null
}

export function moveTreeNode(
  sourceData: TreeDataNode[],
  dragKey: TreeKey,
  dropKey: TreeKey,
  dropPosition: TreeDropPosition,
): TreeDataNode[] {
  const nextData = cloneTreeData(sourceData)
  const dragLocation = findNodeLocation(nextData, dragKey)
  const dropLocation = findNodeLocation(nextData, dropKey)
  if (!dragLocation || !dropLocation) {
    return nextData
  }

  const [dragNode] = dragLocation.siblings.splice(dragLocation.index, 1)
  if (!dragNode) {
    return nextData
  }

  if (dropPosition === "inside") {
    const targetNode = findNodeByKey(nextData, dropKey)
    if (!targetNode) {
      return sourceData
    }
    targetNode.children = [...(targetNode.children ?? []), dragNode]
    return nextData
  }

  const dropTargetLocation = findNodeLocation(nextData, dropKey)
  if (!dropTargetLocation) {
    return sourceData
  }

  const insertOffset = dropPosition === "before" ? 0 : 1
  dropTargetLocation.siblings.splice(dropTargetLocation.index + insertOffset, 0, dragNode)
  return nextData
}

export function buildTreeDropInfo(
  treeData: TreeDataNode[],
  dragKey: TreeKey,
  dropKey: TreeKey,
  dropPosition: TreeDropPosition,
): TreeDropInfo | null {
  const dragNode = findNodeByKey(treeData, dragKey)
  const dropNode = findNodeByKey(treeData, dropKey)
  if (!dragNode || !dropNode) {
    return null
  }
  const descendants = new Set(collectDescendantKeys(dragNode))
  if (descendants.has(dropKey)) {
    return null
  }
  const nextTreeData = moveTreeNode(treeData, dragKey, dropKey, dropPosition)
  return {
    dragKey,
    dropKey,
    dropPosition,
    dragNode,
    dropNode,
    treeData: nextTreeData,
  }
}

export function resolveDropPosition(event: React.DragEvent<HTMLDivElement>): TreeDropPosition {
  const rect = event.currentTarget.getBoundingClientRect()
  const offsetY = event.clientY - rect.top
  if (offsetY < rect.height / 3) {
    return "before"
  }
  if (offsetY > (rect.height * 2) / 3) {
    return "after"
  }
  return "inside"
}

export function highlightDropClass(isDragging: boolean, dropPosition: TreeDropPosition | null) {
  if (!isDragging || !dropPosition) {
    return ""
  }
  if (dropPosition === "inside") {
    return "bg-accent"
  }
  if (dropPosition === "before") {
    return "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary"
  }
  return "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary"
}
