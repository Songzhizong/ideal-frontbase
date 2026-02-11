import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  LoaderCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
} from "lucide-react"
import type * as React from "react"
import { Badge } from "@/packages/ui/badge"
import { cn } from "@/packages/ui-utils"

export type InferaStatus =
  | "Pending"
  | "Downloading"
  | "Starting"
  | "Ready"
  | "Inactive"
  | "Failed"
  | "Queued"
  | "Running"
  | "Succeeded"
  | "Canceled"

type StatusConfig = {
  label: string
  icon: LucideIcon
  colorClassName: string
  iconClassName?: string
}

const UNKNOWN_STATUS_CONFIG: StatusConfig = {
  label: "未知状态",
  icon: AlertTriangle,
  colorClassName: "border-border/60 bg-muted text-muted-foreground",
}

const STATUS_CONFIG_MAP: Record<string, StatusConfig> = {
  pending: {
    label: "待处理",
    icon: Clock3,
    colorClassName: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  },
  downloading: {
    label: "下载中",
    icon: LoaderCircle,
    colorClassName: "border-blue-500/20 bg-blue-500/10 text-blue-500",
    iconClassName: "animate-spin",
  },
  starting: {
    label: "启动中",
    icon: PlayCircle,
    colorClassName: "border-blue-500/20 bg-blue-500/10 text-blue-500",
  },
  ready: {
    label: "已就绪",
    icon: CheckCircle2,
    colorClassName: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  },
  inactive: {
    label: "已停用",
    icon: PauseCircle,
    colorClassName: "border-border/60 bg-muted text-muted-foreground",
  },
  failed: {
    label: "失败",
    icon: XCircle,
    colorClassName: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  queued: {
    label: "排队中",
    icon: CircleDashed,
    colorClassName: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  },
  running: {
    label: "运行中",
    icon: LoaderCircle,
    colorClassName: "border-blue-500/20 bg-blue-500/10 text-blue-500",
    iconClassName: "animate-spin",
  },
  succeeded: {
    label: "成功",
    icon: CheckCircle2,
    colorClassName: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  },
  canceled: {
    label: "已取消",
    icon: CircleDashed,
    colorClassName: "border-border/60 bg-muted text-muted-foreground",
  },
  unknown: UNKNOWN_STATUS_CONFIG,
}

function normalizeStatus(status: string) {
  return status.trim().toLowerCase()
}

export interface InferaStatusBadgeProps
  extends Omit<React.ComponentProps<typeof Badge>, "children"> {
  status: InferaStatus | string
  label?: string
}

export function StatusBadge({ status, label, className, ...props }: InferaStatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status)
  const config = STATUS_CONFIG_MAP[normalizedStatus] ?? UNKNOWN_STATUS_CONFIG
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        config.colorClassName,
        className,
      )}
      {...props}
    >
      <Icon className={cn("size-3.5", config.iconClassName)} aria-hidden />
      <span>{label ?? config.label}</span>
    </Badge>
  )
}
