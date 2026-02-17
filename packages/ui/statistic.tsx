import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import type * as React from "react"
import { cn } from "@/packages/ui-utils"
import { Skeleton } from "./skeleton"

export type StatisticTrend = "up" | "down" | "neutral"

export interface StatisticProps extends Omit<React.ComponentProps<"div">, "prefix"> {
  value: number | string | null | undefined
  label?: React.ReactNode | undefined
  prefix?: React.ReactNode | undefined
  suffix?: React.ReactNode | undefined
  trend?: StatisticTrend | undefined
  trendValue?: React.ReactNode | undefined
  icon?: React.ReactNode | undefined
  loading?: boolean | undefined
  locale?: string | undefined
  formatOptions?: Intl.NumberFormatOptions | undefined
  precision?: number | undefined
  formatter?: ((value: number | string | null | undefined) => React.ReactNode) | undefined
  empty?: React.ReactNode | undefined
}

interface TrendStyle {
  className: string
  icon: React.ComponentType<React.ComponentProps<"svg">>
}

const TREND_STYLE_MAP: Record<StatisticTrend, TrendStyle> = {
  up: {
    className: "text-success",
    icon: TrendingUpIcon,
  },
  down: {
    className: "text-error",
    icon: TrendingDownIcon,
  },
  neutral: {
    className: "text-muted-foreground",
    icon: MinusIcon,
  },
}

function formatValue({
  value,
  formatter,
  locale,
  formatOptions,
  precision,
  empty,
}: Pick<
  StatisticProps,
  "value" | "formatter" | "locale" | "formatOptions" | "precision" | "empty"
>) {
  if (formatter) {
    return formatter(value)
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const options = { ...formatOptions }
    if (
      precision !== undefined &&
      options.minimumFractionDigits === undefined &&
      options.maximumFractionDigits === undefined
    ) {
      options.minimumFractionDigits = precision
      options.maximumFractionDigits = precision
    }
    return new Intl.NumberFormat(locale, options).format(value)
  }

  if (typeof value === "string") {
    return value.trim().length > 0 ? value : (empty ?? "--")
  }

  return empty ?? "--"
}

export function Statistic({
  value,
  label,
  prefix,
  suffix,
  trend = "neutral",
  trendValue,
  icon,
  loading = false,
  locale,
  formatOptions,
  precision,
  formatter,
  empty = "--",
  className,
  ...props
}: StatisticProps) {
  const TrendIcon = TREND_STYLE_MAP[trend].icon
  const displayValue = formatValue({
    value,
    formatter,
    locale,
    formatOptions,
    precision,
    empty,
  })

  if (loading) {
    return (
      <div data-slot="statistic" className={cn("space-y-3", className)} {...props}>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          {icon ? <Skeleton className="size-5 rounded-md" /> : null}
        </div>
        <Skeleton className="h-8 w-32" />
        {trendValue ? <Skeleton className="h-4 w-20" /> : null}
      </div>
    )
  }

  return (
    <div data-slot="statistic" className={cn("space-y-2", className)} {...props}>
      {label || icon ? (
        <div className="flex min-w-0 items-center justify-between gap-2">
          {label ? <div className="truncate text-sm text-muted-foreground">{label}</div> : <span />}
          {icon ? <div className="shrink-0 text-muted-foreground">{icon}</div> : null}
        </div>
      ) : null}
      <div className="flex min-w-0 items-end gap-1.5">
        {prefix ? <span className="text-base text-muted-foreground">{prefix}</span> : null}
        <div className="truncate text-3xl font-semibold tabular-nums text-foreground">
          {displayValue}
        </div>
        {suffix ? <span className="text-base text-muted-foreground">{suffix}</span> : null}
      </div>
      {trendValue ? (
        <div
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium",
            TREND_STYLE_MAP[trend].className,
          )}
        >
          <TrendIcon aria-hidden className="size-3.5" />
          <span>{trendValue}</span>
        </div>
      ) : null}
    </div>
  )
}
