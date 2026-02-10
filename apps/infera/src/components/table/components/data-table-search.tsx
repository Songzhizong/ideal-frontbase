import { Search, X } from "lucide-react"
import { parseAsInteger, useQueryState } from "nuqs"
import type React from "react"
import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { useDebouncedQueryState } from "@/packages/hooks-core"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { cn } from "@/packages/ui-utils"

interface DataTableSearchProps {
  value?: string
  onValueChange?: (value: string) => void
  debounceMs?: number
  queryKey?: string // URL parameter name, default 'q'
  placeholder?: string
  className?: string
  showSearchButton?: boolean // Optional search button for manual trigger
  showClearButton?: boolean // Optional clear button
  autoResetPageIndex?: boolean // Whether to reset page index on search
}

type ControlledDataTableSearchProps = Omit<DataTableSearchProps, "onValueChange"> & {
  onValueChange: (value: string) => void
}

function ControlledDataTableSearch({
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  debounceMs = 0,
  placeholder,
  className,
  showClearButton = true,
}: ControlledDataTableSearchProps) {
  const [value, setValue] = useState(controlledValue ?? "")
  useEffect(() => {
    setValue(controlledValue ?? "")
  }, [controlledValue])

  const debouncedOnValueChange = useDebouncedCallback(
    (nextValue: string) => controlledOnValueChange(nextValue),
    debounceMs,
  )

  const emitValueChange = (nextValue: string) => {
    setValue(nextValue)
    if (debounceMs > 0) {
      debouncedOnValueChange(nextValue)
      return
    }
    controlledOnValueChange(nextValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && debounceMs > 0) {
      debouncedOnValueChange.flush()
    }
  }

  const showClear = showClearButton && value.length > 0

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <div className="relative flex-1 max-w-sm">
        <Search
          className={"absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"}
        />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => emitValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-10 pl-9"
        />
        {showClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              debouncedOnValueChange.cancel()
              emitValueChange("")
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

function UrlDataTableSearch({
  queryKey = "q",
  placeholder = "搜索...",
  className,
  showSearchButton = false,
  showClearButton = true,
  autoResetPageIndex = true,
}: DataTableSearchProps) {
  const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1))

  const { value, onValueChange, applyValue, resetValue, urlValue } = useDebouncedQueryState(
    queryKey,
    500,
    {
      onQueryChange: () => {
        if (autoResetPageIndex) {
          void setPage(1)
        }
      },
    },
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyValue()
    }
  }

  const showClear = showClearButton && (value || urlValue)

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <div className="relative flex-1 max-w-sm">
        <Search
          className={"absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"}
        />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-10 pl-9"
        />
        {showClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetValue}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {showSearchButton && (
        <Button onClick={applyValue} size="sm" className="h-10">
          <Search className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export function DataTableSearch(props: DataTableSearchProps) {
  const onValueChange = props.onValueChange
  if (onValueChange) {
    return (
      <ControlledDataTableSearch
        {...props}
        onValueChange={onValueChange}
        placeholder={props.placeholder ?? "搜索..."}
        showClearButton={props.showClearButton ?? true}
      />
    )
  }
  return <UrlDataTableSearch {...props} />
}
