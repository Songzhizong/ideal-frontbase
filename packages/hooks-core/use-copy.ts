import { useCallback, useEffect, useRef, useState } from "react"

export interface CopyOptions {
  timeout?: number | undefined
}

export interface UseCopyOptions extends CopyOptions {
  onCopied?: ((value: string) => void) | undefined
  onError?: ((error: unknown) => void) | undefined
}

async function writeTextToClipboard(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard API is unavailable in this environment.")
  }

  const textarea = document.createElement("textarea")
  textarea.value = value
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  textarea.style.pointerEvents = "none"
  textarea.style.left = "-9999px"
  textarea.style.top = "0"

  document.body.appendChild(textarea)
  const selection = document.getSelection()
  const originalRange = selection?.rangeCount ? selection.getRangeAt(0) : null

  textarea.focus()
  textarea.select()

  const copied = document.execCommand("copy")
  document.body.removeChild(textarea)

  if (originalRange && selection) {
    selection.removeAllRanges()
    selection.addRange(originalRange)
  }

  if (!copied) {
    throw new Error("Failed to copy text.")
  }
}

const DEFAULT_TIMEOUT = 1500

export function useCopy(options: UseCopyOptions = {}) {
  const { onCopied, onError } = options
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  const clearCopiedTimer = useCallback(() => {
    if (timerRef.current === null || typeof window === "undefined") {
      return
    }
    window.clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => clearCopiedTimer, [clearCopiedTimer])

  const copy = useCallback(
    async (value: string, copyOptions?: CopyOptions) => {
      try {
        await writeTextToClipboard(value)
        setCopied(true)
        onCopied?.(value)

        clearCopiedTimer()
        const timeout = copyOptions?.timeout ?? options.timeout ?? DEFAULT_TIMEOUT
        if (timeout > 0 && typeof window !== "undefined") {
          timerRef.current = window.setTimeout(() => {
            setCopied(false)
            timerRef.current = null
          }, timeout)
        }

        return true
      } catch (error) {
        setCopied(false)
        onError?.(error)
        return false
      }
    },
    [clearCopiedTimer, onCopied, onError, options.timeout],
  )

  return {
    copy,
    copied,
  }
}
