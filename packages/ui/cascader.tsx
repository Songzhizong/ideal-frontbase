import { ChevronRightIcon, SearchIcon, XIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Button } from "./button"
import type {
  CascaderMultiValue,
  CascaderOption,
  CascaderProps,
  CascaderSingleValue,
  CascaderValue,
} from "./cascader-types"
import {
  buildColumns,
  collectSearchResults,
  findOptionPath,
  getLabelText,
  keyToPath,
  pathToKey,
  renderLabelWithHighlight,
  updateChildrenByPath,
} from "./cascader-utils"
import { Input } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Tag } from "./tag"

export type {
  CascaderMultiValue,
  CascaderOption,
  CascaderProps,
  CascaderSingleValue,
  CascaderValue,
} from "./cascader-types"

export function Cascader({
  options,
  value,
  defaultValue,
  onChange,
  loadData,
  multiple = false,
  searchable = true,
  placeholder = "请选择",
  emptyText = "暂无可选项",
  allowClear = true,
  maxTagCount = 2,
  popoverClassName,
  disabled,
  className,
  ...props
}: CascaderProps) {
  const [internalOptions, setInternalOptions] = useState(options)
  const [internalValue, setInternalValue] = useState<CascaderValue>(defaultValue)
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [activePath, setActivePath] = useState<string[]>([])
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set())

  const isControlled = value !== undefined
  const resolvedValue = isControlled ? value : internalValue
  const selectedPaths = useMemo(() => {
    if (multiple) {
      return Array.isArray(resolvedValue) && Array.isArray(resolvedValue[0])
        ? (resolvedValue as CascaderMultiValue)
        : []
    }
    return Array.isArray(resolvedValue) && !Array.isArray(resolvedValue[0])
      ? [resolvedValue as CascaderSingleValue]
      : []
  }, [multiple, resolvedValue])

  useEffect(() => {
    setInternalOptions(options)
  }, [options])

  const selectedOptionsList = useMemo(
    () =>
      selectedPaths
        .map((path) => findOptionPath(internalOptions, path))
        .filter((item) => item.length > 0),
    [internalOptions, selectedPaths],
  )

  const columns = useMemo(
    () => buildColumns(internalOptions, activePath),
    [internalOptions, activePath],
  )
  const searchResults = useMemo(
    () => collectSearchResults(internalOptions, keyword),
    [internalOptions, keyword],
  )

  const setCascaderValue = (nextValue: CascaderValue, selectedOptions: CascaderOption[][]) => {
    if (!isControlled) {
      setInternalValue(nextValue)
    }

    if (multiple) {
      ;(
        onChange as
          | ((value: CascaderMultiValue, selectedOptions: CascaderOption[][]) => void)
          | undefined
      )?.((nextValue as CascaderMultiValue) ?? [], selectedOptions)
      return
    }

    const singleValue = (nextValue as CascaderSingleValue | undefined) ?? undefined
    const singleOptions = selectedOptions[0]
    ;(
      onChange as
        | ((
            value: CascaderSingleValue | undefined,
            selectedOptions: CascaderOption[] | undefined,
          ) => void)
        | undefined
    )?.(singleValue, singleOptions)
  }

  const handleSelectPath = (path: string[]) => {
    if (multiple) {
      const key = pathToKey(path)
      const pathSet = new Set(selectedPaths.map((selectedPath) => pathToKey(selectedPath)))
      if (pathSet.has(key)) {
        pathSet.delete(key)
      } else {
        pathSet.add(key)
      }
      const nextPaths = Array.from(pathSet).map(keyToPath)
      const nextSelectedOptions = nextPaths
        .map((nextPath) => findOptionPath(internalOptions, nextPath))
        .filter((item) => item.length > 0)
      setCascaderValue(nextPaths, nextSelectedOptions)
      return
    }

    const nextSelectedOptions = findOptionPath(internalOptions, path)
    setCascaderValue(path, nextSelectedOptions.length > 0 ? [nextSelectedOptions] : [])
    setOpen(false)
  }

  const handleOptionClick = async (level: number, option: CascaderOption) => {
    if (option.disabled) {
      return
    }

    const prefix = activePath.slice(0, level)
    const nextPath = [...prefix, option.value]
    const selectedOptions = findOptionPath(internalOptions, nextPath)

    const hasChildren = Boolean(option.children && option.children.length > 0)
    const isLeaf = option.isLeaf === true || (!loadData && !hasChildren)

    setActivePath(nextPath)

    if (isLeaf) {
      handleSelectPath(nextPath)
      return
    }

    if (!hasChildren && loadData) {
      const loadingKey = pathToKey(nextPath)
      if (loadingPaths.has(loadingKey)) {
        return
      }

      setLoadingPaths((prev) => {
        const next = new Set(prev)
        next.add(loadingKey)
        return next
      })

      try {
        const loadedChildren = await loadData(selectedOptions)
        if (loadedChildren && loadedChildren.length > 0) {
          setInternalOptions((prev) => updateChildrenByPath(prev, nextPath, loadedChildren))
        }
      } finally {
        setLoadingPaths((prev) => {
          const next = new Set(prev)
          next.delete(loadingKey)
          return next
        })
      }
    }
  }

  const visibleTags = selectedOptionsList.slice(0, maxTagCount)
  const hiddenTagCount = selectedOptionsList.length - visibleTags.length

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
            "border-input bg-input-background focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm shadow-xs outline-none focus-visible:ring-[3px]",
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
            {selectedOptionsList.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : multiple ? (
              <span className="flex flex-wrap items-center gap-1">
                {visibleTags.map((item) => {
                  const path = item.map((option) => option.value)
                  const label = item.map((option) => getLabelText(option.label)).join(" / ")
                  return (
                    <Tag
                      key={pathToKey(path)}
                      variant="solid"
                      color="secondary"
                      className="max-w-[16rem]"
                    >
                      <span className="truncate">{label}</span>
                      <button
                        type="button"
                        className="cursor-pointer rounded-full"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleSelectPath(path)
                        }}
                        aria-label={`移除 ${label}`}
                      >
                        <XIcon aria-hidden className="size-3" />
                      </button>
                    </Tag>
                  )
                })}
                {hiddenTagCount > 0 ? <Tag variant="outline">+{hiddenTagCount}</Tag> : null}
              </span>
            ) : (
              <span className="truncate text-foreground">
                {selectedOptionsList[0]?.map((option) => getLabelText(option.label)).join(" / ")}
              </span>
            )}
          </span>
          {allowClear && selectedOptionsList.length > 0 ? (
            <button
              type="button"
              className="cursor-pointer rounded-sm p-0.5 text-muted-foreground hover:bg-accent"
              onClick={(event) => {
                event.stopPropagation()
                setCascaderValue(multiple ? [] : undefined, [])
              }}
              aria-label="清空已选"
            >
              <XIcon aria-hidden className="size-3.5" />
            </button>
          ) : null}
        </div>
      </PopoverTrigger>

      <PopoverContent className={cn("w-[min(680px,90vw)] p-0", popoverClassName)}>
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
                placeholder="搜索路径"
                className="pl-8"
              />
            </div>
          ) : null}

          {keyword.trim() ? (
            searchResults.length === 0 ? (
              <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto rounded-md border border-border/50">
                {searchResults.map((result) => {
                  const selected = selectedPaths.some(
                    (item) => pathToKey(item) === pathToKey(result.path),
                  )
                  const text = result.labels.join(" / ")
                  return (
                    <button
                      key={pathToKey(result.path)}
                      type="button"
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between border-b border-border/50 px-3 py-2 text-left text-sm last:border-b-0",
                        selected ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
                      )}
                      onClick={() => handleSelectPath(result.path)}
                    >
                      <span className="truncate">{renderLabelWithHighlight(text, keyword)}</span>
                    </button>
                  )
                })}
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
              {columns.map((column, level) => (
                <div
                  key={pathToKey(activePath.slice(0, level)) || "root"}
                  className="max-h-72 overflow-y-auto rounded-md border border-border/50"
                >
                  {column.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground">{emptyText}</div>
                  ) : (
                    column.map((option) => {
                      const currentPath = [...activePath.slice(0, level), option.value]
                      const selected = selectedPaths.some(
                        (path) => pathToKey(path) === pathToKey(currentPath),
                      )
                      const loading = loadingPaths.has(pathToKey(currentPath))
                      const hasChildren = Boolean(option.children && option.children.length > 0)

                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={option.disabled}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between border-b border-border/50 px-3 py-2 text-left text-sm last:border-b-0",
                            selected ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
                            option.disabled ? "cursor-not-allowed opacity-60" : "",
                            option.className,
                          )}
                          onMouseEnter={() => {
                            setActivePath([...activePath.slice(0, level), option.value])
                          }}
                          onClick={() => {
                            void handleOptionClick(level, option)
                          }}
                        >
                          <span className="truncate">{option.label}</span>
                          {loading ? (
                            <span className="text-xs text-muted-foreground">加载中...</span>
                          ) : hasChildren || option.isLeaf !== true ? (
                            <ChevronRightIcon
                              aria-hidden
                              className="size-4 text-muted-foreground"
                            />
                          ) : null}
                        </button>
                      )
                    })
                  )}
                </div>
              ))}
            </div>
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
