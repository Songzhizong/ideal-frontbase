import { Copy, Download, Pause, Play, Search, TriangleAlert } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { cn } from "@/packages/ui-utils"

type LogLevel = "debug" | "info" | "warn" | "error"

type TimeRangeOption = {
  value: string
  label: string
}

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  instance?: string
  revision?: string
}

export interface LogStreamSource {
  connect: (onMessage: (entry: LogEntry) => void, onError?: (error: unknown) => void) => () => void
}

export interface LogViewerProps {
  logs: LogEntry[]
  streamSource?: LogStreamSource
  level?: LogLevel | "all"
  onLevelChange?: (level: LogLevel | "all") => void
  keyword?: string
  onKeywordChange?: (keyword: string) => void
  instance?: string
  onInstanceChange?: (instance: string) => void
  revision?: string
  onRevisionChange?: (revision: string) => void
  timeRange?: string
  onTimeRangeChange?: (timeRange: string) => void
  paused?: boolean
  onPausedChange?: (paused: boolean) => void
  timeRangeOptions?: TimeRangeOption[]
  onDownload?: (logs: LogEntry[]) => void
  className?: string
  emptyText?: string
}

const DEFAULT_TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: "5m", label: "最近 5 分钟" },
  { value: "15m", label: "最近 15 分钟" },
  { value: "1h", label: "最近 1 小时" },
  { value: "6h", label: "最近 6 小时" },
  { value: "24h", label: "最近 24 小时" },
]

const LEVEL_OPTIONS: Array<{ value: LogLevel | "all"; label: string }> = [
  { value: "all", label: "全部级别" },
  { value: "debug", label: "Debug" },
  { value: "info", label: "Info" },
  { value: "warn", label: "Warn" },
  { value: "error", label: "Error" },
]

function formatLogLine(log: LogEntry) {
  return `${log.timestamp} ${log.level.toUpperCase()} ${log.instance ?? "-"} ${log.revision ?? "-"} ${log.message}`
}

function parseTimeRangeMs(timeRange: string) {
  const match = /^(\d+)(m|h|d)$/.exec(timeRange)
  if (!match) {
    return null
  }

  const amount = Number(match[1])
  const unit = match[2]

  if (unit === "m") {
    return amount * 60 * 1000
  }
  if (unit === "h") {
    return amount * 60 * 60 * 1000
  }
  return amount * 24 * 60 * 60 * 1000
}

function getLogLevelClassName(level: LogLevel) {
  switch (level) {
    case "debug":
      return "text-muted-foreground"
    case "info":
      return "text-blue-500"
    case "warn":
      return "text-amber-500 bg-amber-500/5"
    case "error":
      return "text-destructive bg-destructive/5"
    default:
      return "text-muted-foreground"
  }
}

function useControllableState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlledValue ?? internalValue

  const setValue = useCallback(
    (nextValue: T) => {
      if (controlledValue === undefined) {
        setInternalValue(nextValue)
      }
      onChange?.(nextValue)
    },
    [controlledValue, onChange],
  )

  return [value, setValue] as const
}

export function LogViewer({
  logs,
  streamSource,
  level,
  onLevelChange,
  keyword,
  onKeywordChange,
  instance,
  onInstanceChange,
  revision,
  onRevisionChange,
  timeRange,
  onTimeRangeChange,
  paused,
  onPausedChange,
  timeRangeOptions = DEFAULT_TIME_RANGE_OPTIONS,
  onDownload,
  className,
  emptyText = "暂无日志",
}: LogViewerProps) {
  const [allLogs, setAllLogs] = useState(logs)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [levelFilter, setLevelFilter] = useControllableState<LogLevel | "all">(
    level,
    "all",
    onLevelChange,
  )
  const [keywordFilter, setKeywordFilter] = useControllableState(keyword, "", onKeywordChange)
  const [instanceFilter, setInstanceFilter] = useControllableState(
    instance,
    "all",
    onInstanceChange,
  )
  const [revisionFilter, setRevisionFilter] = useControllableState(
    revision,
    "all",
    onRevisionChange,
  )
  const [timeRangeFilter, setTimeRangeFilter] = useControllableState(
    timeRange,
    "15m",
    onTimeRangeChange,
  )
  const [isPaused, setIsPaused] = useControllableState(paused, false, onPausedChange)

  useEffect(() => {
    setAllLogs(logs)
  }, [logs])

  useEffect(() => {
    if (!streamSource || isPaused) {
      return
    }

    setStreamError(null)

    const disconnect = streamSource.connect(
      (entry) => {
        setAllLogs((currentLogs) => {
          const nextLogs = [...currentLogs, entry]
          return nextLogs.slice(-2000)
        })
      },
      (error) => {
        const message = error instanceof Error ? error.message : "日志流连接失败"
        setStreamError(message)
      },
    )

    return () => {
      disconnect()
    }
  }, [streamSource, isPaused])

  const instanceOptions = useMemo(() => {
    const values = new Set<string>()
    for (const log of allLogs) {
      if (log.instance) {
        values.add(log.instance)
      }
    }
    return Array.from(values).sort()
  }, [allLogs])

  const revisionOptions = useMemo(() => {
    const values = new Set<string>()
    for (const log of allLogs) {
      if (log.revision) {
        values.add(log.revision)
      }
    }
    return Array.from(values).sort()
  }, [allLogs])

  const filteredLogs = useMemo(() => {
    const now = Date.now()
    const rangeMs = parseTimeRangeMs(timeRangeFilter)
    const keywordLower = keywordFilter.trim().toLowerCase()

    return allLogs.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) {
        return false
      }

      if (instanceFilter !== "all" && log.instance !== instanceFilter) {
        return false
      }

      if (revisionFilter !== "all" && log.revision !== revisionFilter) {
        return false
      }

      if (keywordLower && !formatLogLine(log).toLowerCase().includes(keywordLower)) {
        return false
      }

      if (rangeMs !== null) {
        const timestamp = Date.parse(log.timestamp)
        if (!Number.isNaN(timestamp) && now - timestamp > rangeMs) {
          return false
        }
      }

      return true
    })
  }, [allLogs, keywordFilter, levelFilter, instanceFilter, revisionFilter, timeRangeFilter])

  const handleCopyLine = async (log: LogEntry) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("当前环境不支持复制")
      return
    }

    try {
      await navigator.clipboard.writeText(formatLogLine(log))
      toast.success("日志行已复制")
    } catch {
      toast.error("复制失败，请重试")
    }
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload(filteredLogs)
      return
    }

    if (typeof window === "undefined") {
      return
    }

    const content = filteredLogs.map((log) => formatLogLine(log)).join("\n")
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `logs-${Date.now()}.txt`
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className={cn("space-y-3 rounded-lg border border-border/50 bg-card p-4", className)}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keywordFilter}
              onChange={(event) => setKeywordFilter(event.target.value)}
              placeholder="搜索日志关键字"
              className="pl-8"
            />
          </div>

          <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={levelFilter}
            onValueChange={(value) => setLevelFilter(value as LogLevel | "all")}
          >
            <SelectTrigger className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={instanceFilter} onValueChange={setInstanceFilter}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue placeholder="实例" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部实例</SelectItem>
              {instanceOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={revisionFilter} onValueChange={setRevisionFilter}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue placeholder="Revision" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部 Revision</SelectItem>
              {revisionOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="cursor-pointer"
          >
            {isPaused ? (
              <Play className="size-4" aria-hidden />
            ) : (
              <Pause className="size-4" aria-hidden />
            )}
            {isPaused ? "继续" : "暂停"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="cursor-pointer"
          >
            <Download className="size-4" aria-hidden />
            下载
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex size-2 rounded-full",
              isPaused ? "bg-muted-foreground" : "animate-pulse bg-blue-500",
            )}
          />
          <span>{isPaused ? "日志流已暂停" : "日志流接收中"}</span>
        </div>
        <span>共 {filteredLogs.length} 条</span>
      </div>

      {streamError ? (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <TriangleAlert className="size-3.5" aria-hidden />
          <span>{streamError}</span>
        </div>
      ) : null}

      <div className="h-[420px] overflow-auto rounded-md border border-border/50 bg-muted/20 font-mono text-xs">
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-border/50">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  "group flex items-start gap-3 px-3 py-2 transition-colors hover:bg-muted/50",
                  getLogLevelClassName(log.level),
                )}
              >
                <span className="min-w-40 text-muted-foreground">{log.timestamp}</span>
                <span className="min-w-12 uppercase">{log.level}</span>
                <span className="flex-1 break-all text-foreground">{log.message}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleCopyLine(log)}
                  className="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="复制该行日志"
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  )
}
