import { XIcon } from "lucide-react"
import type * as React from "react"
import { useMemo, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Badge } from "./badge"

export interface TagInputProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  value?: string[] | undefined
  defaultValue?: string[] | undefined
  onChange?: ((nextTags: string[]) => void) | undefined
  separator?: string | string[] | RegExp | undefined
  max?: number | undefined
  validateTag?: ((tag: string) => boolean) | undefined
  onInvalidTag?: ((tag: string) => void) | undefined
  placeholder?: string | undefined
  disabled?: boolean | undefined
  inputClassName?: string | undefined
  tagClassName?: string | undefined
  clearable?: boolean | undefined
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function buildSeparatorRegExp(separator: string | string[] | RegExp | undefined) {
  if (separator instanceof RegExp) {
    return separator
  }
  if (typeof separator === "string") {
    return new RegExp(escapeRegExp(separator), "g")
  }
  if (Array.isArray(separator)) {
    return new RegExp(separator.map((item) => escapeRegExp(item)).join("|"), "g")
  }
  return /[,\n]/g
}

function parseTags(text: string, separatorRegExp: RegExp) {
  return text
    .split(separatorRegExp)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function useControllableTags({
  value,
  defaultValue,
  onChange,
}: {
  value?: string[] | undefined
  defaultValue?: string[] | undefined
  onChange?: ((nextTags: string[]) => void) | undefined
}) {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? [])
  const isControlled = value !== undefined
  const tags = isControlled ? value : internalValue

  const setTags = (nextTags: string[]) => {
    if (!isControlled) {
      setInternalValue(nextTags)
    }
    onChange?.(nextTags)
  }

  return { tags, setTags }
}

export function TagInput({
  value,
  defaultValue,
  onChange,
  separator,
  max,
  validateTag,
  onInvalidTag,
  placeholder = "输入后按回车或分隔符创建标签",
  disabled = false,
  inputClassName,
  tagClassName,
  clearable = true,
  className,
  ...props
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [isComposing, setIsComposing] = useState(false)
  const separatorRegExp = useMemo(() => buildSeparatorRegExp(separator), [separator])
  const { tags, setTags } = useControllableTags({ value, defaultValue, onChange })

  const addTags = (candidateTags: string[]) => {
    if (candidateTags.length === 0) {
      return
    }

    const nextTags = [...tags]
    for (const candidateTag of candidateTags) {
      if (nextTags.includes(candidateTag)) {
        continue
      }
      if (validateTag && !validateTag(candidateTag)) {
        onInvalidTag?.(candidateTag)
        continue
      }
      if (max !== undefined && nextTags.length >= max) {
        break
      }
      nextTags.push(candidateTag)
    }

    if (nextTags.length !== tags.length) {
      setTags(nextTags)
    }
  }

  const commitInputValue = () => {
    const parsed = parseTags(inputValue, separatorRegExp)
    addTags(parsed)
    setInputValue("")
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((item) => item !== tag))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isComposing) {
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      commitInputValue()
      return
    }

    if (event.key === "Backspace" && inputValue.length === 0 && tags.length > 0) {
      event.preventDefault()
      const nextTags = tags.slice(0, -1)
      setTags(nextTags)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return
    }

    const clipboard = event.clipboardData.getData("text")
    if (!clipboard) {
      return
    }

    const parsed = parseTags(clipboard, separatorRegExp)
    if (parsed.length === 0) {
      return
    }

    event.preventDefault()
    addTags(parsed)
  }

  return (
    <div
      data-slot="tag-input"
      className={cn(
        "border-input focus-within:border-ring focus-within:ring-ring/50 flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border bg-transparent px-2 py-1.5 shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]",
        disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      )}
      {...props}
    >
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className={cn("max-w-[16rem]", tagClassName)}>
          <span className="truncate">{tag}</span>
          <button
            type="button"
            className="cursor-pointer rounded-full"
            onClick={() => removeTag(tag)}
            disabled={disabled}
            aria-label={`移除 ${tag}`}
          >
            <XIcon aria-hidden className="size-3" />
          </button>
        </Badge>
      ))}

      <input
        value={inputValue}
        onChange={(event) => {
          const nextValue = event.currentTarget.value
          setInputValue(nextValue)

          if (!isComposing && separatorRegExp.test(nextValue)) {
            const parsed = parseTags(nextValue, separatorRegExp)
            addTags(parsed)
            setInputValue("")
          }
          separatorRegExp.lastIndex = 0
        }}
        onBlur={() => {
          commitInputValue()
        }}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        disabled={disabled || (max !== undefined && tags.length >= max)}
        placeholder={tags.length === 0 ? placeholder : undefined}
        className={cn(
          "min-w-24 flex-1 border-none bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
          inputClassName,
        )}
      />

      {clearable && tags.length > 0 ? (
        <button
          type="button"
          className="cursor-pointer rounded-sm p-1 text-muted-foreground hover:bg-accent"
          onClick={() => setTags([])}
          disabled={disabled}
          aria-label="清空标签"
        >
          <XIcon aria-hidden className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}
