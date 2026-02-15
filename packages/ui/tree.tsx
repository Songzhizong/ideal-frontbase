import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { TreeRow } from "./tree-row"
import type {
  TreeCheckInfo,
  TreeDataNode,
  TreeDropPosition,
  TreeExpandInfo,
  TreeKey,
  TreeProps,
  TreeSelectInfo,
} from "./tree-types"
import {
  buildParentMap,
  buildTreeDropInfo,
  collectDescendantKeys,
  flattenTree,
  resolveDropPosition,
  updateInternalState,
  updateParentCheckedState,
  useControllableKeys,
} from "./tree-utils"

export type {
  TreeCheckInfo,
  TreeDataNode,
  TreeDropInfo,
  TreeDropPosition,
  TreeExpandInfo,
  TreeKey,
  TreeProps,
  TreeSelectInfo,
} from "./tree-types"

export function Tree({
  treeData,
  selectedKeys,
  defaultSelectedKeys,
  checkedKeys,
  defaultCheckedKeys,
  expandedKeys,
  defaultExpandedKeys,
  onSelect,
  onCheck,
  onExpand,
  onDrop,
  checkable = false,
  multiple = false,
  draggable = false,
  virtual = false,
  height = 320,
  itemHeight = 36,
  className,
  ...props
}: TreeProps) {
  const [internalTreeData, setInternalTreeData] = useState(treeData)
  const selectedState = useControllableKeys({
    value: selectedKeys,
    defaultValue: defaultSelectedKeys,
  })
  const checkedState = useControllableKeys({ value: checkedKeys, defaultValue: defaultCheckedKeys })
  const expandedState = useControllableKeys({
    value: expandedKeys,
    defaultValue: defaultExpandedKeys,
  })

  const [focusedKey, setFocusedKey] = useState<TreeKey | null>(selectedState.keys[0] ?? null)
  const [draggingKey, setDraggingKey] = useState<TreeKey | null>(null)
  const [dropTarget, setDropTarget] = useState<{ key: TreeKey; position: TreeDropPosition } | null>(
    null,
  )
  const [scrollTop, setScrollTop] = useState(0)
  const treeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setInternalTreeData(treeData)
  }, [treeData])

  const expandedSet = useMemo(() => new Set(expandedState.keys), [expandedState.keys])
  const checkedSet = useMemo(() => new Set(checkedState.keys), [checkedState.keys])
  const flattenedNodes = useMemo(
    () => flattenTree(internalTreeData, expandedSet),
    [expandedSet, internalTreeData],
  )
  const parentMap = useMemo(() => buildParentMap(internalTreeData), [internalTreeData])

  useEffect(() => {
    if (!focusedKey && flattenedNodes[0]) {
      setFocusedKey(flattenedNodes[0].key)
    }
  }, [flattenedNodes, focusedKey])

  const totalHeight = flattenedNodes.length * itemHeight
  const overscan = 5
  const startIndex = virtual ? Math.max(0, Math.floor(scrollTop / itemHeight) - overscan) : 0
  const visibleCount = virtual
    ? Math.ceil(height / itemHeight) + overscan * 2
    : flattenedNodes.length
  const endIndex = virtual
    ? Math.min(flattenedNodes.length, startIndex + visibleCount)
    : flattenedNodes.length
  const visibleNodes = flattenedNodes.slice(startIndex, endIndex)

  const focusRow = (key: TreeKey) => {
    setFocusedKey(key)
    if (!treeRef.current) {
      return
    }
    const index = flattenedNodes.findIndex((item) => item.key === key)
    if (index < 0) {
      return
    }
    const rowTop = index * itemHeight
    const rowBottom = rowTop + itemHeight
    const viewTop = treeRef.current.scrollTop
    const viewBottom = viewTop + treeRef.current.clientHeight
    if (rowTop < viewTop) {
      treeRef.current.scrollTop = rowTop
    } else if (rowBottom > viewBottom) {
      treeRef.current.scrollTop = rowBottom - treeRef.current.clientHeight
    }
  }

  const handleToggleExpand = (node: TreeDataNode) => {
    const currentExpandedSet = new Set(expandedState.keys)
    const expanded = currentExpandedSet.has(node.key)
    if (expanded) {
      currentExpandedSet.delete(node.key)
    } else {
      currentExpandedSet.add(node.key)
    }
    const nextExpandedKeys = Array.from(currentExpandedSet)
    updateInternalState(nextExpandedKeys, expandedState.isControlled, expandedState.setKeys)
    onExpand?.(nextExpandedKeys, { expanded: !expanded, node } satisfies TreeExpandInfo)
  }

  const handleSelectNode = (
    node: TreeDataNode,
    nativeEvent: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (node.disabled || node.selectable === false) {
      return
    }
    const currentSet = new Set(selectedState.keys)
    const selected = currentSet.has(node.key)
    if (multiple && (nativeEvent.metaKey || nativeEvent.ctrlKey)) {
      if (selected) {
        currentSet.delete(node.key)
      } else {
        currentSet.add(node.key)
      }
    } else {
      currentSet.clear()
      currentSet.add(node.key)
    }
    const nextSelectedKeys = Array.from(currentSet)
    updateInternalState(nextSelectedKeys, selectedState.isControlled, selectedState.setKeys)
    onSelect?.(nextSelectedKeys, {
      selected: !selected,
      node,
      nativeEvent,
    } satisfies TreeSelectInfo)
  }

  const handleCheckNode = (
    node: TreeDataNode,
    nativeEvent: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (!checkable || node.disabled || node.disableCheckbox || node.checkable === false) {
      return
    }
    const nextCheckedSet = new Set(checkedState.keys)
    const descendants = collectDescendantKeys(node)
    const checked = nextCheckedSet.has(node.key)

    if (checked) {
      for (const key of descendants) {
        nextCheckedSet.delete(key)
      }
    } else {
      for (const key of descendants) {
        nextCheckedSet.add(key)
      }
    }
    updateParentCheckedState(nextCheckedSet, internalTreeData, node.key, parentMap)

    const nextCheckedKeys = Array.from(nextCheckedSet)
    updateInternalState(nextCheckedKeys, checkedState.isControlled, checkedState.setKeys)
    onCheck?.(nextCheckedKeys, { checked: !checked, node, nativeEvent } satisfies TreeCheckInfo)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (flattenedNodes.length === 0 || !focusedKey) {
      return
    }
    const currentIndex = flattenedNodes.findIndex((item) => item.key === focusedKey)
    const current = currentIndex >= 0 ? flattenedNodes[currentIndex] : null
    if (!current) {
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      const next = flattenedNodes[Math.min(flattenedNodes.length - 1, currentIndex + 1)]
      if (next) {
        focusRow(next.key)
      }
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      const prev = flattenedNodes[Math.max(0, currentIndex - 1)]
      if (prev) {
        focusRow(prev.key)
      }
      return
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      if (current.hasChildren && !expandedSet.has(current.key)) {
        handleToggleExpand(current.node)
        return
      }
      const next = flattenedNodes[currentIndex + 1]
      if (next && next.parentKey === current.key) {
        focusRow(next.key)
      }
      return
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      if (current.hasChildren && expandedSet.has(current.key)) {
        handleToggleExpand(current.node)
        return
      }
      if (current.parentKey) {
        focusRow(current.parentKey)
      }
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      handleSelectNode(current.node, event)
      return
    }
    if (event.key === " " && checkable) {
      event.preventDefault()
      handleCheckNode(current.node, event)
    }
  }

  return (
    <div data-slot="tree" className={cn("w-full", className)} {...props}>
      <div
        ref={treeRef}
        role="tree"
        tabIndex={0}
        className={cn(
          "rounded-md border border-border/50 bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          virtual ? "overflow-auto" : "overflow-hidden",
        )}
        style={virtual ? { height } : undefined}
        onKeyDown={handleKeyDown}
        onScroll={virtual ? (event) => setScrollTop(event.currentTarget.scrollTop) : undefined}
      >
        <div style={virtual ? { height: totalHeight, position: "relative" } : undefined}>
          {(virtual ? visibleNodes : flattenedNodes).map((item, index) => {
            const rowIndex = virtual ? startIndex + index : index
            return (
              <TreeRow
                key={item.key}
                item={item}
                rowIndex={rowIndex}
                itemHeight={itemHeight}
                virtual={virtual}
                draggable={draggable}
                checkable={checkable}
                dragging={draggingKey !== null}
                isSelected={selectedState.keys.includes(item.key)}
                isChecked={checkedSet.has(item.key)}
                isExpanded={expandedSet.has(item.key)}
                isFocused={focusedKey === item.key}
                dropPosition={dropTarget?.key === item.key ? dropTarget.position : null}
                onFocus={focusRow}
                onSelect={(row, event) => {
                  handleSelectNode(row.node, event)
                }}
                onCheck={(row, event) => {
                  handleCheckNode(row.node, event)
                }}
                onToggleExpand={(row) => {
                  handleToggleExpand(row.node)
                }}
                onDragStart={(row, event) => {
                  if (!draggable || row.node.disabled) {
                    return
                  }
                  setDraggingKey(row.key)
                  event.dataTransfer.effectAllowed = "move"
                }}
                onDragOver={(row, event) => {
                  if (!draggable || !draggingKey) {
                    return
                  }
                  event.preventDefault()
                  setDropTarget({ key: row.key, position: resolveDropPosition(event) })
                }}
                onDragEnd={() => {
                  setDraggingKey(null)
                  setDropTarget(null)
                }}
                onDrop={(row) => {
                  if (!dropTarget || !draggingKey) {
                    return
                  }
                  const dropInfo = buildTreeDropInfo(
                    internalTreeData,
                    draggingKey,
                    row.key,
                    dropTarget.position,
                  )
                  if (!dropInfo) {
                    setDropTarget(null)
                    setDraggingKey(null)
                    return
                  }
                  setInternalTreeData(dropInfo.treeData)
                  onDrop?.(dropInfo)
                  setDropTarget(null)
                  setDraggingKey(null)
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
