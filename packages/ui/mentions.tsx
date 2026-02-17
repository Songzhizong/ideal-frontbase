import type * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Popover, PopoverAnchor, PopoverContent } from "./popover"
import { Textarea } from "./textarea"

export interface MentionOption {
  value: string
  label?: React.ReactNode | undefined
  keywords?: string[] | undefined
  disabled?: boolean | undefined
}

export interface MentionsProps
  extends Omit<
    React.ComponentProps<typeof Textarea>,
    "value" | "defaultValue" | "onChange" | "onSelect"
  > {
  value?: string | undefined
  defaultValue?: string | undefined
  onChange?: ((value: string) => void) | undefined
  options: MentionOption[]
  trigger?: string | undefined
  onSearch?: ((keyword: string) => void) | undefined
  onOptionSelect?: ((option: MentionOption) => void) | undefined
  notFoundContent?: React.ReactNode | undefined
  maxSuggestions?: number | undefined
  renderOption?: ((option: MentionOption, active: boolean) => React.ReactNode) | undefined
  dropdownClassName?: string | undefined
}

interface MentionRange {
  start: number
  end: number
  keyword: string
}

function findMentionRange(value: string, cursor: number, trigger: string): MentionRange | null {
  const beforeCursor = value.slice(0, cursor)
  const triggerIndex = beforeCursor.lastIndexOf(trigger)
  if (triggerIndex < 0) {
    return null
  }

  const beforeTrigger = beforeCursor[triggerIndex - 1]
  const validPrefix = triggerIndex === 0 || /\s|[([{,，。；;.!?]/.test(beforeTrigger ?? "")
  if (!validPrefix) {
    return null
  }

  const keyword = beforeCursor.slice(triggerIndex + trigger.length)
  if (/\s/.test(keyword)) {
    return null
  }

  return {
    start: triggerIndex,
    end: cursor,
    keyword,
  }
}

function getOptionSearchText(option: MentionOption) {
  const labelText = typeof option.label === "string" ? option.label : ""
  const keywordsText = option.keywords?.join(" ") ?? ""
  return `${option.value} ${labelText} ${keywordsText}`.toLowerCase()
}

function filterMentionOptions(options: MentionOption[], keyword: string, maxSuggestions: number) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) {
    return options.slice(0, maxSuggestions)
  }
  return options
    .filter((option) => getOptionSearchText(option).includes(normalizedKeyword))
    .slice(0, maxSuggestions)
}

export function Mentions({
  value,
  defaultValue = "",
  onChange,
  options,
  trigger = "@",
  onSearch,
  onOptionSelect,
  notFoundContent = "无匹配项",
  maxSuggestions = 8,
  renderOption,
  dropdownClassName,
  className,
  disabled,
  onBlur,
  onKeyDown,
  ...props
}: MentionsProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [mentionRange, setMentionRange] = useState<MentionRange | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [width, setWidth] = useState(0)

  const isControlled = value !== undefined
  const resolvedValue = isControlled ? value : internalValue

  const keyword = mentionRange?.keyword ?? ""

  const filteredOptions = useMemo(() => {
    return filterMentionOptions(options, keyword, maxSuggestions)
  }, [keyword, maxSuggestions, options])

  const updateValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onChange?.(nextValue)
  }

  const syncMentionRange = (nextValue: string, cursor: number) => {
    const nextRange = findMentionRange(nextValue, cursor, trigger)
    setMentionRange(nextRange)
    setActiveIndex(0)

    setOpen(Boolean(nextRange))
    if (nextRange) {
      onSearch?.(nextRange.keyword)
    }
  }

  const selectOption = (option: MentionOption) => {
    if (!mentionRange || option.disabled) {
      return
    }

    const mentionText = `${trigger}${option.value} `
    const nextValue =
      resolvedValue.slice(0, mentionRange.start) +
      mentionText +
      resolvedValue.slice(mentionRange.end)
    const nextCursor = mentionRange.start + mentionText.length

    updateValue(nextValue)
    setMentionRange(null)
    setOpen(false)
    onOptionSelect?.(option)

    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) {
        return
      }
      textarea.focus()
      textarea.setSelectionRange(nextCursor, nextCursor)
    })
  }

  const hasOptions = filteredOptions.length > 0

  useEffect(() => {
    if (!open) return
    const textarea = textareaRef.current
    if (!textarea) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setWidth(entry.contentRect.width)
      }
    })

    observer.observe(textarea)
    return () => observer.disconnect()
  }, [open])

  // Initial width set
  useEffect(() => {
    if (open && textareaRef.current) {
      setWidth(textareaRef.current.offsetWidth)
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div data-slot="mentions" className="relative w-full">
          <Textarea
            ref={textareaRef}
            value={resolvedValue}
            disabled={disabled}
            className={cn("w-full min-w-full", className)}
            onChange={(event) => {
              const nextValue = event.currentTarget.value
              updateValue(nextValue)
              syncMentionRange(nextValue, event.currentTarget.selectionStart)
            }}
            onClick={(event) => {
              syncMentionRange(resolvedValue, event.currentTarget.selectionStart)
            }}
            onBlur={(event) => {
              onBlur?.(event)
              // Allow popover interaction before closing
              // This Logic needs careful handling with Popover but relying on Popover's own dismiss might be better
              // However, typing needs focus on Textarea.
              // If we click outside, Popover closes (default behavior).
              // If we blur textarea to click dropdown:
              // We need to prevent blur from closing if it's a click on dropdown.
              // But PopoverContent is a Portal.
            }}
            onKeyDown={(event) => {
              onKeyDown?.(event)
              if (!open || !hasOptions) {
                return
              }

              if (event.key === "ArrowDown") {
                event.preventDefault()
                setActiveIndex((prev) => (prev + 1) % filteredOptions.length)
                return
              }
              if (event.key === "ArrowUp") {
                event.preventDefault()
                setActiveIndex(
                  (prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length,
                )
                return
              }
              if (event.key === "Enter") {
                event.preventDefault()
                const selected = filteredOptions[activeIndex]
                if (selected) {
                  selectOption(selected)
                }
                return
              }
              if (event.key === "Escape") {
                event.preventDefault()
                setOpen(false)
              }
            }}
            {...props}
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        className={cn("p-0 max-h-56 overflow-y-auto", dropdownClassName)}
        style={{ width: width ? `${width}px` : undefined }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        align="start"
        sideOffset={5}
      >
        {hasOptions ? (
          filteredOptions.map((option, index) => {
            const active = index === activeIndex
            return (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                  active ? "bg-accent text-accent-foreground" : "hover:bg-muted/70",
                  option.disabled ? "cursor-not-allowed opacity-60" : "",
                )}
                onMouseEnter={() => {
                  setActiveIndex(index)
                }}
                onMouseDown={(event) => {
                  event.preventDefault()
                  selectOption(option)
                }}
              >
                {renderOption ? (
                  renderOption(option, active)
                ) : (
                  <>
                    <span className="text-muted-foreground">{trigger}</span>
                    <span className="truncate">{option.label ?? option.value}</span>
                  </>
                )}
              </button>
            )
          })
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground">{notFoundContent}</div>
        )}
      </PopoverContent>
    </Popover>
  )
}
