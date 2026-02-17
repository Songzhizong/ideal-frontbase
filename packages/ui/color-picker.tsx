import type * as React from "react"
import { useMemo, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Input } from "./input"

export interface ColorPickerProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  value?: string | undefined
  defaultValue?: string | undefined
  onChange?: ((color: string) => void) | undefined
  presets?: string[] | undefined
  showInput?: boolean | undefined
  disabled?: boolean | undefined
}

function normalizeHexColor(input: string) {
  const value = input.trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/.test(value)) {
    return value
  }
  if (/^#[0-9a-f]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
  }
  return null
}

export function ColorPicker({
  value,
  defaultValue = "#1677ff",
  onChange,
  presets,
  showInput = true,
  disabled = false,
  className,
  ...props
}: ColorPickerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [draftValue, setDraftValue] = useState(defaultValue)

  const isControlled = value !== undefined
  const resolvedValue = isControlled ? value : internalValue

  const normalizedColor = useMemo(
    () => normalizeHexColor(resolvedValue) ?? "#000000",
    [resolvedValue],
  )

  const updateValue = (nextColor: string) => {
    const normalized = normalizeHexColor(nextColor)
    if (!normalized) {
      return
    }

    if (!isControlled) {
      setInternalValue(normalized)
    }
    setDraftValue(normalized)
    onChange?.(normalized)
  }

  return (
    <div data-slot="color-picker" className={cn("space-y-2", className)} {...props}>
      <div className="flex items-center gap-2">
        <label
          className={cn(
            "border-input inline-flex h-9 w-11 cursor-pointer overflow-hidden rounded-md border bg-background",
            disabled ? "cursor-not-allowed opacity-60" : "",
          )}
        >
          <input
            type="color"
            value={normalizedColor}
            disabled={disabled}
            onChange={(event) => {
              updateValue(event.currentTarget.value)
            }}
            className="h-full w-full cursor-pointer border-none bg-transparent p-0"
            aria-label="选择颜色"
          />
        </label>

        {showInput ? (
          <Input
            value={draftValue}
            disabled={disabled}
            onChange={(event) => setDraftValue(event.currentTarget.value)}
            onBlur={() => {
              updateValue(draftValue)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                updateValue(draftValue)
              }
            }}
            placeholder="#1677ff"
            className="h-9 max-w-36 font-mono"
          />
        ) : null}
      </div>

      {presets?.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((presetColor) => {
            const normalizedPreset = normalizeHexColor(presetColor)
            if (!normalizedPreset) {
              return null
            }
            const active = normalizedPreset === normalizedColor
            return (
              <button
                key={normalizedPreset}
                type="button"
                disabled={disabled}
                className={cn(
                  "border-input inline-flex size-6 cursor-pointer rounded-md border transition-all",
                  active ? "ring-2 ring-ring ring-offset-2" : "",
                  disabled ? "cursor-not-allowed opacity-60" : "",
                )}
                style={{ backgroundColor: normalizedPreset }}
                onClick={() => updateValue(normalizedPreset)}
                aria-label={`选择颜色 ${normalizedPreset}`}
                title={normalizedPreset}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
