import { CheckIcon, ChevronDownIcon, ChevronRightIcon, GripVerticalIcon } from "lucide-react"
import type * as React from "react"
import { cn } from "@/packages/ui-utils"
import { Checkbox } from "./checkbox"
import type { FlattenedNode, TreeDropPosition } from "./tree-types"
import { highlightDropClass } from "./tree-utils"

export interface TreeRowProps {
  item: FlattenedNode
  rowIndex: number
  itemHeight: number
  virtual: boolean
  draggable: boolean
  checkable: boolean
  dragging: boolean
  isSelected: boolean
  isChecked: boolean
  isExpanded: boolean
  isFocused: boolean
  dropPosition: TreeDropPosition | null
  onFocus: (key: string) => void
  onSelect: (
    item: FlattenedNode,
    event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => void
  onCheck: (
    item: FlattenedNode,
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => void
  onToggleExpand: (item: FlattenedNode) => void
  onDragStart: (item: FlattenedNode, event: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (item: FlattenedNode, event: React.DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
  onDrop: (item: FlattenedNode) => void
}

export function TreeRow({
  item,
  rowIndex,
  itemHeight,
  virtual,
  draggable,
  checkable,
  dragging,
  isSelected,
  isChecked,
  isExpanded,
  isFocused,
  dropPosition,
  onFocus,
  onSelect,
  onCheck,
  onToggleExpand,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: TreeRowProps) {
  const hasCheckbox = checkable && item.node.checkable !== false
  const canExpand = item.hasChildren && item.node.isLeaf !== true

  return (
    <div
      key={item.key}
      role="treeitem"
      aria-level={item.level + 1}
      aria-selected={isSelected}
      tabIndex={isFocused ? 0 : -1}
      {...(canExpand ? { "aria-expanded": isExpanded } : {})}
      className={cn(
        "relative flex h-9 items-center gap-1.5 px-2 text-sm transition-colors",
        isFocused ? "bg-accent/70" : "",
        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50",
        item.node.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        highlightDropClass(dragging, dropPosition),
        item.node.className,
      )}
      style={
        virtual
          ? {
              position: "absolute",
              top: rowIndex * itemHeight,
              left: 0,
              right: 0,
              paddingLeft: item.level * 16 + 8,
            }
          : { paddingLeft: item.level * 16 + 8 }
      }
      draggable={draggable && !item.node.disabled}
      onDragStart={(event) => onDragStart(item, event)}
      onDragOver={(event) => onDragOver(item, event)}
      onDragEnd={onDragEnd}
      onDrop={() => onDrop(item)}
      onClick={(event) => {
        onFocus(item.key)
        onSelect(item, event)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          event.stopPropagation()
          onFocus(item.key)
          onSelect(item, event)
          return
        }
        if (event.key === " " && checkable) {
          event.preventDefault()
          event.stopPropagation()
          onFocus(item.key)
          onCheck(item, event)
        }
      }}
    >
      {draggable ? (
        <GripVerticalIcon aria-hidden className="size-3.5 text-muted-foreground" />
      ) : null}
      <button
        type="button"
        className={cn(
          "inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground",
          !canExpand ? "invisible" : "hover:bg-accent",
        )}
        onClick={(event) => {
          event.stopPropagation()
          if (!canExpand || item.node.disabled) {
            return
          }
          onToggleExpand(item)
        }}
        aria-label={isExpanded ? "折叠" : "展开"}
        disabled={!canExpand || item.node.disabled}
      >
        {isExpanded ? (
          <ChevronDownIcon aria-hidden className="size-4" />
        ) : (
          <ChevronRightIcon aria-hidden className="size-4" />
        )}
      </button>
      {hasCheckbox ? (
        <Checkbox
          checked={isChecked}
          disabled={item.node.disabled || item.node.disableCheckbox}
          onClick={(event) => {
            event.stopPropagation()
            onCheck(item, event)
          }}
          aria-label={`选择 ${typeof item.node.title === "string" ? item.node.title : "当前节点"}`}
        />
      ) : null}
      {item.node.icon ? <span className="text-muted-foreground">{item.node.icon}</span> : null}
      <span className="min-w-0 truncate">{item.node.title}</span>
      {isSelected && !hasCheckbox ? <CheckIcon aria-hidden className="ml-auto size-4" /> : null}
    </div>
  )
}
