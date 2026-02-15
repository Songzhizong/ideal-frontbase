import { ArrowLeftIcon, ArrowRightIcon, SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { Input } from "./input"

type CheckedState = boolean | "indeterminate"

export interface TransferItem {
  key: string
  title: React.ReactNode
  description?: React.ReactNode | undefined
  disabled?: boolean | undefined
}

export interface TransferProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  dataSource: TransferItem[]
  targetKeys?: string[] | undefined
  defaultTargetKeys?: string[] | undefined
  onChange?:
    | ((targetKeys: string[], movedKeys: string[], direction: "left" | "right") => void)
    | undefined
  searchable?: boolean | undefined
  renderItem?: ((item: TransferItem) => React.ReactNode) | undefined
  sourceTitle?: React.ReactNode | undefined
  targetTitle?: React.ReactNode | undefined
  sourceEmptyText?: React.ReactNode | undefined
  targetEmptyText?: React.ReactNode | undefined
}

interface TransferListProps {
  title: React.ReactNode
  items: TransferItem[]
  selectedKeys: Set<string>
  keyword: string
  searchable: boolean
  emptyText: React.ReactNode
  renderItem?: ((item: TransferItem) => React.ReactNode) | undefined
  onKeywordChange: (value: string) => void
  onToggleItem: (key: string, checked: boolean) => void
  onSelectAll: (keys: string[]) => void
  onInvert: (keys: string[]) => void
}

function renderDefaultItem(item: TransferItem) {
  return (
    <span className="min-w-0">
      <span className="block truncate">{item.title}</span>
      {item.description ? (
        <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
      ) : null}
    </span>
  )
}

function TransferList({
  title,
  items,
  selectedKeys,
  keyword,
  searchable,
  emptyText,
  renderItem,
  onKeywordChange,
  onToggleItem,
  onSelectAll,
  onInvert,
}: TransferListProps) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  const filteredItems = items.filter((item) => {
    if (!normalizedKeyword) {
      return true
    }
    const titleText = typeof item.title === "string" ? item.title : ""
    const descriptionText = typeof item.description === "string" ? item.description : ""
    return (
      titleText.toLowerCase().includes(normalizedKeyword) ||
      descriptionText.toLowerCase().includes(normalizedKeyword)
    )
  })

  const selectableKeys = filteredItems.filter((item) => !item.disabled).map((item) => item.key)
  const checkedCount = selectableKeys.filter((key) => selectedKeys.has(key)).length
  const checkState: CheckedState =
    checkedCount === 0 ? false : checkedCount === selectableKeys.length ? true : "indeterminate"

  return (
    <div className="flex min-h-72 flex-col rounded-lg border border-border/50 bg-card">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={checkState}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectAll(selectableKeys)
              } else {
                onSelectAll([])
              }
            }}
            disabled={selectableKeys.length === 0}
            aria-label="全选"
          />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {checkedCount}/{selectableKeys.length}
        </span>
      </div>

      <div className="border-b border-border/50 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => onSelectAll(selectableKeys)}
            disabled={selectableKeys.length === 0}
            className="cursor-pointer"
          >
            全选
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => onInvert(selectableKeys)}
            disabled={selectableKeys.length === 0}
            className="cursor-pointer"
          >
            反选
          </Button>
        </div>
      </div>

      {searchable ? (
        <div className="border-b border-border/50 p-3">
          <div className="relative">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={keyword}
              onChange={(event) => onKeywordChange(event.currentTarget.value)}
              placeholder="搜索"
              className="pl-8"
            />
          </div>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">{emptyText}</div>
        ) : (
          filteredItems.map((item) => {
            const checked = selectedKeys.has(item.key)
            return (
              <div
                key={item.key}
                className={cn(
                  "flex cursor-pointer items-center gap-2 border-b border-border/50 px-3 py-2 text-sm last:border-b-0",
                  item.disabled ? "cursor-not-allowed opacity-60" : "hover:bg-muted/50",
                )}
              >
                <Checkbox
                  checked={checked}
                  disabled={item.disabled}
                  onClick={(event) => {
                    event.stopPropagation()
                  }}
                  onCheckedChange={(nextChecked) => {
                    if (item.disabled) {
                      return
                    }
                    onToggleItem(item.key, Boolean(nextChecked))
                  }}
                  aria-label={`选择 ${typeof item.title === "string" ? item.title : item.key}`}
                />
                <span className="min-w-0 flex-1">
                  {renderItem ? renderItem(item) : renderDefaultItem(item)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export function Transfer({
  dataSource,
  targetKeys,
  defaultTargetKeys,
  onChange,
  searchable = true,
  renderItem,
  sourceTitle = "源列表",
  targetTitle = "目标列表",
  sourceEmptyText = "暂无可选项",
  targetEmptyText = "暂无已选项",
  className,
  ...props
}: TransferProps) {
  const [internalTargetKeys, setInternalTargetKeys] = useState<string[]>(defaultTargetKeys ?? [])
  const [sourceKeyword, setSourceKeyword] = useState("")
  const [targetKeyword, setTargetKeyword] = useState("")
  const [sourceSelected, setSourceSelected] = useState<Set<string>>(new Set())
  const [targetSelected, setTargetSelected] = useState<Set<string>>(new Set())

  const isControlled = targetKeys !== undefined
  const resolvedTargetKeys = isControlled ? targetKeys : internalTargetKeys
  const targetKeySet = useMemo(() => new Set(resolvedTargetKeys), [resolvedTargetKeys])

  const sourceItems = useMemo(
    () => dataSource.filter((item) => !targetKeySet.has(item.key)),
    [dataSource, targetKeySet],
  )
  const targetItems = useMemo(
    () =>
      resolvedTargetKeys
        .map((key) => dataSource.find((item) => item.key === key))
        .filter((item): item is TransferItem => Boolean(item)),
    [dataSource, resolvedTargetKeys],
  )

  const setTarget = (nextKeys: string[], movedKeys: string[], direction: "left" | "right") => {
    if (!isControlled) {
      setInternalTargetKeys(nextKeys)
    }
    onChange?.(nextKeys, movedKeys, direction)
  }

  const moveToRight = () => {
    const movable = sourceItems
      .filter((item) => sourceSelected.has(item.key) && !item.disabled)
      .map((item) => item.key)
    if (movable.length === 0) {
      return
    }
    const nextTargetKeys = Array.from(new Set([...resolvedTargetKeys, ...movable]))
    setTarget(nextTargetKeys, movable, "right")
    setSourceSelected(new Set())
  }

  const moveToLeft = () => {
    const movable = targetItems
      .filter((item) => targetSelected.has(item.key) && !item.disabled)
      .map((item) => item.key)
    if (movable.length === 0) {
      return
    }
    const removeSet = new Set(movable)
    const nextTargetKeys = resolvedTargetKeys.filter((key) => !removeSet.has(key))
    setTarget(nextTargetKeys, movable, "left")
    setTargetSelected(new Set())
  }

  return (
    <div
      data-slot="transfer"
      className={cn("grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]", className)}
      {...props}
    >
      <TransferList
        title={sourceTitle}
        items={sourceItems}
        selectedKeys={sourceSelected}
        keyword={sourceKeyword}
        searchable={searchable}
        emptyText={sourceEmptyText}
        renderItem={renderItem}
        onKeywordChange={setSourceKeyword}
        onToggleItem={(key, checked) => {
          setSourceSelected((prev) => {
            const next = new Set(prev)
            if (checked) {
              next.add(key)
            } else {
              next.delete(key)
            }
            return next
          })
        }}
        onSelectAll={(keys) => {
          setSourceSelected(new Set(keys))
        }}
        onInvert={(keys) => {
          setSourceSelected((prev) => {
            const next = new Set(prev)
            for (const key of keys) {
              if (next.has(key)) {
                next.delete(key)
              } else {
                next.add(key)
              }
            }
            return next
          })
        }}
      />

      <div className="flex items-center justify-center">
        <div className="flex flex-row gap-2 lg:flex-col">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={moveToRight}
            className="cursor-pointer"
            disabled={sourceSelected.size === 0}
            aria-label="移动到右侧"
          >
            <ArrowRightIcon aria-hidden className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={moveToLeft}
            className="cursor-pointer"
            disabled={targetSelected.size === 0}
            aria-label="移动到左侧"
          >
            <ArrowLeftIcon aria-hidden className="size-4" />
          </Button>
        </div>
      </div>

      <TransferList
        title={targetTitle}
        items={targetItems}
        selectedKeys={targetSelected}
        keyword={targetKeyword}
        searchable={searchable}
        emptyText={targetEmptyText}
        renderItem={renderItem}
        onKeywordChange={setTargetKeyword}
        onToggleItem={(key, checked) => {
          setTargetSelected((prev) => {
            const next = new Set(prev)
            if (checked) {
              next.add(key)
            } else {
              next.delete(key)
            }
            return next
          })
        }}
        onSelectAll={(keys) => {
          setTargetSelected(new Set(keys))
        }}
        onInvert={(keys) => {
          setTargetSelected((prev) => {
            const next = new Set(prev)
            for (const key of keys) {
              if (next.has(key)) {
                next.delete(key)
              } else {
                next.add(key)
              }
            }
            return next
          })
        }}
      />
    </div>
  )
}
