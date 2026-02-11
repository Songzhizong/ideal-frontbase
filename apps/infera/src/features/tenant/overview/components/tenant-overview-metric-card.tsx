import type { LucideIcon } from "lucide-react"
import { cn } from "@/packages/ui-utils"

type MetricCardTone = "primary" | "info" | "success" | "warning" | "error"

interface TenantOverviewMetricCardProps {
  title: string
  value: React.ReactNode
  description: string
  icon: LucideIcon
  tone?: MetricCardTone | undefined
  onClick?: (() => void) | undefined
}

const METRIC_TONE_CLASSNAME: Readonly<Record<MetricCardTone, string>> = {
  primary:
    "border-primary/20 bg-primary/5 text-primary shadow-[0_0_15px_rgba(var(--primary),0.05)]",
  info: "border-info/20 bg-info/5 text-info shadow-[0_0_15px_rgba(var(--info),0.05)]",
  success:
    "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]",
  warning:
    "border-warning/20 bg-warning/5 text-warning shadow-[0_0_15px_rgba(var(--warning),0.05)]",
  error: "border-error/25 bg-error/10 text-error shadow-[0_0_15px_rgba(var(--error),0.1)]",
}

export function TenantOverviewMetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "primary",
  onClick,
}: TenantOverviewMetricCardProps) {
  const cardContent = (
    <>
      <div
        className={cn(
          "absolute -right-4 -top-4 size-24 opacity-[0.03] transition-transform duration-500 group-hover:scale-110",
          tone === "primary" && "text-primary",
          tone === "info" && "text-info",
          tone === "success" && "text-emerald-500",
          tone === "warning" && "text-warning",
          tone === "error" && "text-error",
        )}
      >
        <Icon className="size-full" />
      </div>
      <div
        className={cn(
          "absolute right-5 top-5 flex size-10 items-center justify-center rounded-xl border",
          METRIC_TONE_CLASSNAME[tone],
        )}
      >
        <Icon className="size-4.5" aria-hidden />
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-bold text-foreground/90 tracking-tight">{title}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/60">{description}</p>
        </div>
        <div className="whitespace-nowrap tabular-nums">{value}</div>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative flex h-full min-h-35 flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-border/80",
          "cursor-pointer active:scale-[0.98]",
        )}
      >
        {cardContent}
      </button>
    )
  }

  return (
    <div className="group relative flex h-full min-h-35 flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border/80">
      {cardContent}
    </div>
  )
}
