import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CircleXIcon,
  InfoIcon,
  SearchIcon,
  ShieldAlertIcon,
  TriangleAlertIcon,
} from "lucide-react"
import type * as React from "react"
import { cn } from "@/packages/ui-utils"

export type ResultStatus = "success" | "error" | "warning" | "info" | "403" | "404" | "500"

export interface ResultProps extends Omit<React.ComponentProps<"section">, "title"> {
  status?: ResultStatus | undefined
  title?: React.ReactNode | undefined
  subtitle?: React.ReactNode | undefined
  icon?: React.ReactNode | undefined
  extra?: React.ReactNode | undefined
}

interface ResultMeta {
  title: string
  subtitle: string
  containerClassName: string
  iconClassName: string
  icon: React.ComponentType<React.ComponentProps<"svg">>
}

const RESULT_META_MAP: Record<ResultStatus, ResultMeta> = {
  success: {
    title: "操作成功",
    subtitle: "请求已成功处理。",
    containerClassName: "bg-success-subtle text-success-on-subtle border-success/20",
    iconClassName: "text-success",
    icon: CheckCircle2Icon,
  },
  error: {
    title: "操作失败",
    subtitle: "请求未能完成，请稍后重试。",
    containerClassName: "bg-error-subtle text-error-on-subtle border-error/20",
    iconClassName: "text-error",
    icon: CircleXIcon,
  },
  warning: {
    title: "注意",
    subtitle: "当前操作需要进一步确认。",
    containerClassName: "bg-warning-subtle text-warning-on-subtle border-warning/20",
    iconClassName: "text-warning",
    icon: TriangleAlertIcon,
  },
  info: {
    title: "提示",
    subtitle: "这是一个信息提示。",
    containerClassName: "bg-info-subtle text-info-on-subtle border-info/20",
    iconClassName: "text-info",
    icon: InfoIcon,
  },
  "403": {
    title: "403 - 访问受限",
    subtitle: "抱歉，您没有权限访问此页面。如果您认为这是一个错误，请联系管理员。",
    containerClassName: "bg-warning-subtle text-warning-on-subtle border-warning/20",
    iconClassName: "text-warning",
    icon: ShieldAlertIcon,
  },
  "404": {
    title: "404 - 页面未找到",
    subtitle: "抱歉，我们找不到您要查看的页面。它可能已被移动、删除，或您输入的 URL 有误。",
    containerClassName: "bg-muted text-muted-foreground border-border/50",
    iconClassName: "text-muted-foreground",
    icon: SearchIcon,
  },
  "500": {
    title: "500 - 服务器错误",
    subtitle: "抱歉，服务器出现了点问题。请稍后再试，或联系我们的支持团队。",
    containerClassName: "bg-error-subtle text-error-on-subtle border-error/20",
    iconClassName: "text-error",
    icon: AlertCircleIcon,
  },
}

function resolveRole(status: ResultStatus) {
  if (status === "success" || status === "info") {
    return "status"
  }
  return "alert"
}

export function Result({
  status = "info",
  title,
  subtitle,
  icon,
  extra,
  className,
  ...props
}: ResultProps) {
  const meta = RESULT_META_MAP[status]
  const Icon = meta.icon

  return (
    <section
      data-slot="result"
      data-status={status}
      role={resolveRole(status)}
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-xl border border-border/50 bg-card px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "mb-5 flex size-16 items-center justify-center rounded-full border",
          meta.containerClassName,
        )}
      >
        {icon ?? <Icon aria-hidden className={cn("size-8", meta.iconClassName)} />}
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        {title ?? meta.title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle ?? meta.subtitle}</p>
      {extra ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">{extra}</div>
      ) : null}
    </section>
  )
}
