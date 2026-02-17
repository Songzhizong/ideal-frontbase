import type * as React from "react"
import { cn } from "@/packages/ui-utils"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card"
import { Statistic, type StatisticProps } from "./statistic"

type BaseStatisticProps = Pick<
  StatisticProps,
  | "value"
  | "label"
  | "prefix"
  | "suffix"
  | "trend"
  | "trendValue"
  | "icon"
  | "loading"
  | "locale"
  | "formatOptions"
  | "precision"
  | "formatter"
  | "empty"
>

export interface StatCardProps
  extends Omit<React.ComponentProps<typeof Card>, "children" | "prefix">,
    BaseStatisticProps {
  description?: React.ReactNode | undefined
  action?: React.ReactNode | undefined
  footer?: React.ReactNode | undefined
}

export function StatCard({
  value,
  label,
  prefix,
  suffix,
  trend,
  trendValue,
  icon,
  loading,
  locale,
  formatOptions,
  precision,
  formatter,
  empty,
  description,
  action,
  footer,
  className,
  ...props
}: StatCardProps) {
  const hasHeader = Boolean(description) || Boolean(action)

  return (
    <Card data-slot="stat-card" className={cn("gap-4", className)} {...props}>
      {hasHeader ? (
        <CardHeader className="gap-1.5 pb-0">
          {label ? <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle> : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
          {action ? <CardAction>{action}</CardAction> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn(hasHeader ? "pt-0" : "")}>
        <Statistic
          value={value}
          label={hasHeader ? undefined : label}
          prefix={prefix}
          suffix={suffix}
          trend={trend}
          trendValue={trendValue}
          icon={icon}
          loading={loading}
          locale={locale}
          formatOptions={formatOptions}
          precision={precision}
          formatter={formatter}
          empty={empty}
        />
      </CardContent>
      {footer ? <CardFooter className="border-t border-border/50 pt-4">{footer}</CardFooter> : null}
    </Card>
  )
}
