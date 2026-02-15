import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import type * as React from "react"
import { useMemo, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Badge } from "./badge"
import { Button } from "./button"
import { Input } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Tree } from "./tree"
import type { TreeDataNode, TreeKey } from "./tree-types"

export type TreeSelectValue = TreeKey | TreeKey[] | undefined

export interface TreeSelectProps
  extends Omit<React.ComponentProps<"div">, "value" | "defaultValue" | "onChange"> {
  treeData: TreeDataNode[]
  value?: TreeSelectValue | undefined
  defaultValue?: TreeSelectValue | undefined
  onChange?: ((value: TreeSelectValue, selectedNodes: TreeDataNode[]) => void) | undefined
  multiple?: boolean | undefined
  searchable?: boolean | undefined
  placeholder?: React.ReactNode | undefined
  emptyText?: React.ReactNode | undefined
  allowClear?: boolean | undefined
  maxTagCount?: number | undefined
  treeHeight?: number | undefined
  popoverClassName?: string | undefined
  disabled?: boolean | undefined
}

function normalizeKeys(value: TreeSelectValue, multiple: boolean) {
  if (value === undefined) {
    return [] as TreeKey[]
  }
  if (multiple) {
    return Array.isArray(value) ? value : [value]
  }
  return Array.isArray(value) ? value.slice(0, 1) : [value]
}

function buildValue(keys: TreeKey[], multiple: boolean): TreeSelectValue {
  if (multiple) {
    return keys
  }
  return keys[0]
}

function getNodeText(node: TreeDataNode): string {
  if (typeof node.title === "string") {
    return node.title
  }
  if (typeof node.title === "number") {
    return String(node.title)
  }
  return ""
}

function buildNodeMap(nodes: TreeDataNode[]) {
  const map = new Map<TreeKey, TreeDataNode>()
  const stack = [...nodes]

  while (stack.length > 0) {
    const node = stack.shift()
    if (!node) {
      continue
    }
    map.set(node.key, node)
    if (node.children?.length) {
      stack.push(...node.children)
    }
  }

  return map
}

function filterTreeData(nodes: TreeDataNode[], keyword: string): TreeDataNode[] {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) {
    return nodes
  }

  return nodes
    .map((node) => {
      const currentMatch = getNodeText(node).toLowerCase().includes(normalizedKeyword)
      const filteredChildren = node.children ? filterTreeData(node.children, normalizedKeyword) : []
      if (!currentMatch && filteredChildren.length === 0) {
        return null
      }
      return {
        ...node,
        ...(filteredChildren.length > 0 ? { children: filteredChildren } : {}),
      }
    })
    .filter((node): node is TreeDataNode => node !== null)
}

export function TreeSelect({
  treeData,
  value,
  defaultValue,
  onChange,
  multiple = false,
  searchable = true,
  placeholder = "请选择",
  emptyText = "暂无数据",
  allowClear = true,
  maxTagCount = 2,
  treeHeight = 280,
  popoverClassName,
  disabled,
  className,
  ...props
}: TreeSelectProps) {
  const [internalValue, setInternalValue] = useState<TreeSelectValue>(defaultValue)
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")

  const isControlled = value !== undefined
  const resolvedValue = isControlled ? value : internalValue
  const selectedKeys = normalizeKeys(resolvedValue, multiple)

  const nodeMap = useMemo(() => buildNodeMap(treeData), [treeData])
  const selectedNodes = useMemo(
    () =>
      selectedKeys
        .map((key) => nodeMap.get(key))
        .filter((node): node is TreeDataNode => Boolean(node)),
    [nodeMap, selectedKeys],
  )
  const filteredTreeData = useMemo(() => filterTreeData(treeData, keyword), [treeData, keyword])

  const setValue = (nextValue: TreeSelectValue) => {
    const nextKeys = normalizeKeys(nextValue, multiple)
    const nextNodes = nextKeys
      .map((key) => nodeMap.get(key))
      .filter((node): node is TreeDataNode => Boolean(node))

    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onChange?.(nextValue, nextNodes)
  }

  const handleSingleSelect = (key: TreeKey) => {
    setValue(buildValue([key], false))
    setOpen(false)
  }

  const handleMultiSelect = (keys: TreeKey[]) => {
    setValue(buildValue(keys, true))
  }

  const handleRemoveKey = (key: TreeKey) => {
    if (disabled) {
      return
    }
    const nextKeys = selectedKeys.filter((currentKey) => currentKey !== key)
    setValue(buildValue(nextKeys, multiple))
  }

  const visibleTags = selectedNodes.slice(0, maxTagCount)
  const hiddenCount = selectedNodes.length - visibleTags.length

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled) {
          return
        }
        setOpen(nextOpen)
      }}
    >
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          className={cn(
            "border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            className,
          )}
          onKeyDown={(event) => {
            if (disabled) {
              return
            }
            if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
              event.preventDefault()
              setOpen((prev) => !prev)
            }
          }}
          {...props}
        >
          <span className="min-w-0 flex-1">
            {selectedNodes.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : multiple ? (
              <span className="flex flex-wrap items-center gap-1">
                {visibleTags.map((node) => (
                  <Badge key={node.key} variant="secondary" className="max-w-[12rem]">
                    <span className="truncate">{node.title}</span>
                    <button
                      type="button"
                      className="cursor-pointer rounded-full"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleRemoveKey(node.key)
                      }}
                      aria-label={`移除 ${getNodeText(node) || "标签"}`}
                    >
                      <XIcon aria-hidden className="size-3" />
                    </button>
                  </Badge>
                ))}
                {hiddenCount > 0 ? <Badge variant="outline">+{hiddenCount}</Badge> : null}
              </span>
            ) : (
              <span className="truncate text-foreground">{selectedNodes[0]?.title}</span>
            )}
          </span>
          <span className="flex items-center gap-1">
            {allowClear && selectedNodes.length > 0 ? (
              <button
                type="button"
                className="cursor-pointer rounded-sm p-0.5 text-muted-foreground hover:bg-accent"
                onClick={(event) => {
                  event.stopPropagation()
                  setValue(multiple ? [] : undefined)
                }}
                aria-label="清空已选"
              >
                <XIcon aria-hidden className="size-3.5" />
              </button>
            ) : null}
            <ChevronDownIcon aria-hidden className="size-4 text-muted-foreground" />
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[var(--radix-popover-trigger-width)] p-0", popoverClassName)}
      >
        <div className="space-y-2 p-2">
          {searchable ? (
            <div className="relative">
              <SearchIcon
                aria-hidden
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2"
              />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.currentTarget.value)}
                placeholder="搜索节点"
                className="pl-8"
              />
            </div>
          ) : null}

          {filteredTreeData.length === 0 ? (
            <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            <Tree
              treeData={filteredTreeData}
              selectedKeys={multiple ? undefined : selectedKeys}
              checkedKeys={multiple ? selectedKeys : undefined}
              checkable={multiple}
              virtual
              height={treeHeight}
              onSelect={(keys) => {
                const nextKey = keys[0]
                if (nextKey) {
                  handleSingleSelect(nextKey)
                }
              }}
              onCheck={(keys) => {
                handleMultiSelect(keys)
              }}
            />
          )}

          {multiple ? (
            <div className="flex justify-end border-t border-border/50 pt-2">
              <Button
                type="button"
                size="sm"
                className="cursor-pointer"
                onClick={() => setOpen(false)}
              >
                完成
              </Button>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
