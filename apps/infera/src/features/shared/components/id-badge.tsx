import { Check, Copy } from "lucide-react"
import type * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/packages/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/packages/ui/popover"
import { cn } from "@/packages/ui-utils"

function clampShortLength(length: number) {
  return Math.max(8, Math.min(12, length))
}

function getShortId(id: string, shortLength: number) {
  const safeLength = clampShortLength(shortLength)
  if (id.length <= safeLength) {
    return id
  }
  return `${id.slice(0, safeLength)}...`
}

export interface IdBadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  id: string
  shortLength?: number
  showCopyButton?: boolean
  showPopover?: boolean
  onCopySuccess?: (id: string) => void
}

export function IdBadge({
  id,
  shortLength = 10,
  showCopyButton = true,
  showPopover = true,
  onCopySuccess,
  className,
  ...props
}: IdBadgeProps) {
  const [copied, setCopied] = useState(false)
  const shortId = useMemo(() => getShortId(id, shortLength), [id, shortLength])

  useEffect(() => {
    if (!copied) {
      return
    }

    const timer = window.setTimeout(() => {
      setCopied(false)
    }, 1600)

    return () => {
      window.clearTimeout(timer)
    }
  }, [copied])

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("当前环境不支持复制")
      return
    }

    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      onCopySuccess?.(id)
      toast.success("ID 已复制")
    } catch {
      toast.error("复制失败，请重试")
    }
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground",
        className,
      )}
      {...props}
    >
      {showPopover ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="cursor-pointer rounded-sm text-left outline-none transition-colors hover:text-foreground/80"
              aria-label="查看完整 ID"
            >
              {shortId}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto max-w-xs space-y-2 p-3 text-xs">
            <p className="text-muted-foreground">完整 ID</p>
            <p className="break-all font-mono text-foreground">{id}</p>
          </PopoverContent>
        </Popover>
      ) : (
        <span>{shortId}</span>
      )}
      {showCopyButton ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          className="size-5 cursor-pointer rounded-sm text-muted-foreground hover:text-foreground"
          aria-label={copied ? "已复制" : "复制 ID"}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        </Button>
      ) : null}
    </div>
  )
}
