import type * as React from "react"
import { useMemo, useRef, useState } from "react"
import { cn } from "@/packages/ui-utils"
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

  return (
    <div data-slot="mentions" className="relative">
      <Textarea
        ref={textareaRef}
        value={resolvedValue}
        disabled={disabled}
        className={className}
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
          setTimeout(() => {
            setOpen(false)
          }, 120)
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
            setActiveIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length)
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

      {open ? (
        <div
          className={cn(
            "bg-popover text-popover-foreground absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border/50 shadow-md",
            dropdownClassName,
          )}
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
                    "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm",
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
        </div>
      ) : null}
    </div>
  )
}
