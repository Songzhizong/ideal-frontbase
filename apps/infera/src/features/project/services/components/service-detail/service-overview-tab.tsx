import type { ProjectServiceDetail } from "../../types"
import { buildTrafficSummary, formatDateTime } from "../service-formatters"

interface ServiceOverviewTabProps {
  service: ProjectServiceDetail
}

export function ServiceOverviewTab({ service }: ServiceOverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">当前流量摘要</p>
          <p className="mt-2 text-sm">{buildTrafficSummary(service.trafficSummary)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Runtime / 资源</p>
          <p className="mt-2 text-sm">{service.runtime}</p>
          <p className="text-xs text-muted-foreground">
            {service.resourceSpec.gpuCount}x {service.resourceSpec.gpuModel} ·{" "}
            {service.resourceSpec.cpuRequest}
            CPU · {service.resourceSpec.memoryRequest}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Autoscaling</p>
          <p className="mt-2 text-sm">
            {service.autoscaling.metricType} · {service.autoscaling.minReplicas} -{" "}
            {service.autoscaling.maxReplicas}
          </p>
          <p className="text-xs text-muted-foreground">
            scale-down {service.autoscaling.scaleDownDelaySeconds}s
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-4">
        <p className="mb-3 text-sm font-medium">最近事件</p>
        <div className="space-y-2">
          {service.events.map((event) => (
            <div
              key={event.eventId}
              className="rounded-md border border-border/50 bg-muted/20 px-3 py-2 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(event.happenedAt)}</p>
              </div>
              <p className="text-xs text-muted-foreground">{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
