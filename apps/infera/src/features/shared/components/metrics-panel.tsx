import { Download } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { Button } from "@/packages/ui/button"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Switch } from "@/packages/ui/switch"
import { cn } from "@/packages/ui-utils"

export type MetricsRange = "1h" | "6h" | "24h" | "7d" | "custom"

export interface MetricsOption {
  value: string
  label: string
}

export interface MetricCard {
  key: string
  label: string
  value: string
  subtitle?: string
  trendText?: string
  trendTone?: "positive" | "negative" | "neutral"
}

export interface MetricsPanelProps {
  metrics: MetricCard[]
  children: React.ReactNode
  className?: string
  range?: MetricsRange
  onRangeChange?: (range: MetricsRange) => void
  rangeOptions?: Array<{ value: MetricsRange; label: string }>
  granularity?: string
  onGranularityChange?: (value: string) => void
  granularityOptions?: MetricsOption[]
  revision?: string
  onRevisionChange?: (value: string) => void
  revisionOptions?: MetricsOption[]
  compareMode?: boolean
  onCompareModeChange?: (checked: boolean) => void
  onExportCsv?: () => void
}

const DEFAULT_RANGE_OPTIONS: Array<{ value: MetricsRange; label: string }> = [
  { value: "1h", label: "1h" },
  { value: "6h", label: "6h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "custom", label: "自定义" },
]

const DEFAULT_GRANULARITY_OPTIONS: MetricsOption[] = [
  { value: "auto", label: "自动" },
  { value: "1m", label: "1 分钟" },
  { value: "5m", label: "5 分钟" },
  { value: "1h", label: "1 小时" },
]

const DEFAULT_REVISION_OPTIONS: MetricsOption[] = [{ value: "all", label: "全部 Revision" }]

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

function getTrendClassName(tone: MetricCard["trendTone"]) {
  if (tone === "positive") {
    return "text-emerald-500"
  }
  if (tone === "negative") {
    return "text-destructive"
  }
  return "text-muted-foreground"
}

export function MetricsPanel({
  metrics,
  children,
  className,
  range,
  onRangeChange,
  rangeOptions = DEFAULT_RANGE_OPTIONS,
  granularity,
  onGranularityChange,
  granularityOptions = DEFAULT_GRANULARITY_OPTIONS,
  revision,
  onRevisionChange,
  revisionOptions = DEFAULT_REVISION_OPTIONS,
  compareMode,
  onCompareModeChange,
  onExportCsv,
}: MetricsPanelProps) {
  const [activeRange, setActiveRange] = useControllableState<MetricsRange>(
    range,
    "24h",
    onRangeChange,
  )
  const [activeGranularity, setActiveGranularity] = useControllableState(
    granularity,
    "auto",
    onGranularityChange,
  )
  const [activeRevision, setActiveRevision] = useControllableState(
    revision,
    "all",
    onRevisionChange,
  )
  const [activeCompareMode, setActiveCompareMode] = useControllableState(
    compareMode,
    false,
    onCompareModeChange,
  )

  const normalizedRevisionOptions = useMemo(() => {
    if (revisionOptions.length > 0) {
      return revisionOptions
    }
    return DEFAULT_REVISION_OPTIONS
  }, [revisionOptions])

  return (
    <section className={cn("space-y-4 rounded-lg border border-border/50 bg-card p-4", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {rangeOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={activeRange === option.value ? "default" : "outline"}
              onClick={() => setActiveRange(option.value)}
              className="cursor-pointer"
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={activeGranularity} onValueChange={setActiveGranularity}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {granularityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={activeRevision} onValueChange={setActiveRevision}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {normalizedRevisionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 rounded-md border border-border/50 px-2 py-1.5">
            <Switch
              size="sm"
              checked={activeCompareMode}
              onCheckedChange={setActiveCompareMode}
              aria-label="切换对比模式"
            />
            <Label className="text-xs text-muted-foreground">对比模式</Label>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onExportCsv}
            disabled={!onExportCsv}
            className="cursor-pointer"
          >
            <Download className="size-4" aria-hidden />
            导出 CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-lg border border-border/50 bg-card px-4 py-3 shadow-sm"
          >
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{metric.value}</p>
            {metric.trendText ? (
              <p className={cn("mt-1 text-xs", getTrendClassName(metric.trendTone))}>
                {metric.trendText}
              </p>
            ) : metric.subtitle ? (
              <p className="mt-1 text-xs text-muted-foreground">{metric.subtitle}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  )
}
