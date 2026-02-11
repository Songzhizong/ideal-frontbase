import {
  CheckCircle2,
  Copy,
  RefreshCcw,
  Rocket,
  ToggleLeft,
  ToggleRight,
  TriangleAlert,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ContentLayout } from "@/components/content-layout"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { EmptyState, ErrorState, StatusBadge } from "@/features/shared/components"
import { useBaseNavigate } from "@/packages/platform-router"
import { Button } from "@/packages/ui/button"
import { Separator } from "@/packages/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import { useProjectServiceActions, useProjectServiceDetailQuery } from "../../hooks"
import { formatDateTime, toErrorMessage } from "../service-formatters"
import { PlaygroundTab } from "./playground"
import { RevisionsTrafficTab } from "./revisions-traffic"
import { ServiceAuditTab } from "./service-audit"
import { ServiceLogsTab } from "./service-logs"
import { ServiceMetricsTab } from "./service-metrics"
import { ServiceOverviewTab } from "./service-overview-tab"
import { ServiceSettingsTab } from "./service-settings"

interface ServiceDetailPageProps {
  tenantId: string
  projectId: string
  serviceId: string
  initialTab?: ServiceDetailTab | undefined
}

type ServiceDetailTab =
  | "overview"
  | "revisions"
  | "metrics"
  | "logs"
  | "playground"
  | "settings"
  | "audit"

const TABS: Array<{ value: ServiceDetailTab; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "revisions", label: "Revisions & Traffic" },
  { value: "metrics", label: "Metrics" },
  { value: "logs", label: "Logs" },
  { value: "playground", label: "Playground" },
  { value: "settings", label: "Settings" },
  { value: "audit", label: "Audit" },
]

export function ServiceDetailPage({
  tenantId,
  projectId,
  serviceId,
  initialTab,
}: ServiceDetailPageProps) {
  const navigate = useBaseNavigate()
  const [activeTab, setActiveTab] = useState<ServiceDetailTab>(initialTab ?? "overview")
  const query = useProjectServiceDetailQuery(tenantId, projectId, serviceId)
  const actions = useProjectServiceActions({ tenantId, projectId, serviceId })

  const service = query.data

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  const handleCopy = async (value: string, successMessage: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("当前环境不支持复制")
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      toast.success(successMessage)
    } catch {
      toast.error("复制失败，请稍后重试")
    }
  }

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void query.refetch()
        }}
        disabled={query.isFetching}
        className="cursor-pointer"
      >
        <RefreshCcw className={query.isFetching ? "size-4 animate-spin" : "size-4"} />
        刷新
      </Button>

      {service ? (
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            void actions.toggleDesiredStateMutation
              .mutateAsync({
                tenantId,
                projectId,
                serviceId,
                desiredState: service.desiredState === "Active" ? "Inactive" : "Active",
              })
              .catch((error: unknown) => {
                toast.error(toErrorMessage(error))
              })
          }}
        >
          {service.desiredState === "Active" ? (
            <ToggleRight className="size-4" />
          ) : (
            <ToggleLeft className="size-4" />
          )}
          Desired: {service.desiredState}
        </Button>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={() => setActiveTab("revisions")}
      >
        <Rocket className="size-4" />
        Deploy Revision
      </Button>

      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={() => setActiveTab("playground")}
      >
        Open Playground
      </Button>
    </div>
  )

  return (
    <ContentLayout
      title={service ? service.name : "服务详情"}
      description={
        service
          ? `${service.description} · env=${service.env} · updated=${formatDateTime(service.updatedAt)}`
          : "查看服务状态流转、Revision 流量、运行指标、日志与配置。"
      }
      actions={headerActions}
    >
      {query.isPending ? (
        <div className="rounded-lg border border-border/50 bg-card p-6 text-sm text-muted-foreground">
          服务详情加载中...
        </div>
      ) : null}

      {query.isError ? (
        <ErrorState
          title="服务详情加载失败"
          message="请稍后重试，或返回服务列表确认服务状态。"
          error={query.error}
          onRetry={() => {
            void query.refetch()
          }}
        />
      ) : null}

      {!query.isPending && !query.isError && !service ? (
        <EmptyState
          title="服务不存在"
          description="该服务可能已删除，或 service_id 无效。"
          primaryAction={{
            label: "返回服务列表",
            onClick: () => {
              void navigate({ to: buildProjectPath(tenantId, projectId, "/services") })
            },
          }}
        />
      ) : null}

      {!query.isPending && !query.isError && service ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={service.currentState} />
              <span className="rounded-md border border-border/50 bg-muted/20 px-2 py-1 text-xs">
                {service.env}
              </span>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border/50 bg-muted/20 px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted/40"
                onClick={() => {
                  void handleCopy(service.endpoint, "Endpoint 已复制")
                }}
              >
                {service.endpoint}
                <Copy className="size-3" />
              </button>
              <span className="text-xs text-muted-foreground">Desired: {service.desiredState}</span>
            </div>

            <Separator className="my-4" />

            <StatusStepBar
              currentState={service.currentState}
              steps={service.statusSteps}
              pendingEnabled={service.pendingTimeout.enabled}
              pendingReason={service.pendingTimeout.reason}
              pendingRecommendations={service.pendingTimeout.recommendations}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ServiceDetailTab)}
          >
            <TabsList className="bg-muted/50 p-1">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="cursor-pointer px-3">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-4 border-none p-0 outline-none">
              <ServiceOverviewTab service={service} />
            </TabsContent>

            <TabsContent value="revisions" className="mt-4 border-none p-0 outline-none">
              <RevisionsTrafficTab tenantId={tenantId} projectId={projectId} service={service} />
            </TabsContent>

            <TabsContent value="metrics" className="mt-4 border-none p-0 outline-none">
              <ServiceMetricsTab service={service} />
            </TabsContent>

            <TabsContent value="logs" className="mt-4 border-none p-0 outline-none">
              <ServiceLogsTab service={service} />
            </TabsContent>

            <TabsContent value="playground" className="mt-4 border-none p-0 outline-none">
              <PlaygroundTab tenantId={tenantId} projectId={projectId} service={service} />
            </TabsContent>

            <TabsContent value="settings" className="mt-4 border-none p-0 outline-none">
              <ServiceSettingsTab
                tenantId={tenantId}
                projectId={projectId}
                service={service}
                actions={actions}
              />
            </TabsContent>

            <TabsContent value="audit" className="mt-4 border-none p-0 outline-none">
              <ServiceAuditTab service={service} />
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </ContentLayout>
  )
}

interface StatusStepBarProps {
  currentState: string
  steps: Array<{
    state: "Pending" | "Downloading" | "Starting" | "Ready"
    note: string
    durationSeconds: number
  }>
  pendingEnabled: boolean
  pendingReason: string
  pendingRecommendations: string[]
}

function StatusStepBar({
  currentState,
  steps,
  pendingEnabled,
  pendingReason,
  pendingRecommendations,
}: StatusStepBarProps) {
  const order = ["Pending", "Downloading", "Starting", "Ready"] as const
  const currentIndex = Math.max(0, order.indexOf(currentState as (typeof order)[number]))

  return (
    <div className="space-y-4">
      <ol className="grid gap-3 lg:grid-cols-4">
        {steps.map((step) => {
          const index = order.indexOf(step.state)
          const isDone = index < currentIndex
          const isCurrent = step.state === currentState
          return (
            <li
              key={step.state}
              className="rounded-lg border border-border/50 bg-muted/20 p-3 transition-all duration-200"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">{step.state}</p>
                {isDone ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : isCurrent ? (
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{step.note}</p>
              <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                已持续：{Math.round(step.durationSeconds / 60)}m
              </p>
            </li>
          )
        })}
      </ol>

      {pendingEnabled && currentState === "Pending" ? (
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-sm">
          <div className="mb-1 flex items-center gap-2 font-medium text-orange-500">
            <TriangleAlert className="size-4" />
            Pending 超时提示
          </div>
          <p className="text-orange-500/90">{pendingReason}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {pendingRecommendations.map((item) => (
              <span
                key={item}
                className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-xs text-orange-500"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
