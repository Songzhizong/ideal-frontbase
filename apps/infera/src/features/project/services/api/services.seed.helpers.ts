import type {
  ServiceAuditItem,
  ServiceEventItem,
  ServiceLogItem,
  ServiceMetricPoint,
  ServiceRevisionItem,
  ServiceRuntime,
} from "../types"

const LOG_TEMPLATES = [
  "healthcheck passed",
  "prefill queue accepted",
  "kv-cache warmup completed",
  "batch scheduler updated",
  "request finished with status=200",
  "request timeout guard triggered",
]

export function buildTimestamp(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString()
}

export function buildMetricSeries(seed: number): ServiceMetricPoint[] {
  const points: ServiceMetricPoint[] = []
  for (let index = 0; index < 84; index += 1) {
    const progress = index / 84
    const wave = Math.sin((index + seed) / 4)
    const qps = Math.max(0.5, 18 + seed * 3 + wave * 8)
    const successRate = Math.min(99.95, Math.max(92, 97 + Math.sin((index + seed) / 8) * 1.6))
    const errorRate = Number((100 - successRate).toFixed(2))
    const p95Ms = Math.max(22, 48 + Math.cos((index + seed) / 7) * 16)
    const p99Ms = p95Ms + 14 + Math.max(0, Math.sin(index / 5) * 5)
    const ttftMs = Math.max(80, 132 + Math.sin((index + seed) / 9) * 24)
    const tpotMs = Math.max(16, 34 + Math.cos((index + seed) / 6) * 8)
    const tokensPerSec = Math.max(64, 820 + Math.sin((index + seed) / 10) * 180)
    const gpuUtil = Math.min(99, Math.max(24, 66 + Math.sin((index + seed) / 8) * 18))
    const gpuMemoryGb = Math.max(2, 19 + Math.cos((index + seed) / 11) * 4)
    const concurrency = Math.max(1, Math.round(24 + Math.sin((index + seed) / 5) * 8))
    const coldStartCount = index % 21 === 0 ? 1 : 0
    const coldStartLatencyMs = coldStartCount > 0 ? 38_000 + Math.round(progress * 7_000) : 0

    points.push({
      timestamp: buildTimestamp((84 - index) * 5),
      qps: Number(qps.toFixed(2)),
      p95Ms: Number(p95Ms.toFixed(2)),
      p99Ms: Number(p99Ms.toFixed(2)),
      successRate: Number(successRate.toFixed(2)),
      errorRate,
      ttftMs: Number(ttftMs.toFixed(2)),
      tpotMs: Number(tpotMs.toFixed(2)),
      tokensPerSec: Number(tokensPerSec.toFixed(2)),
      gpuUtil: Number(gpuUtil.toFixed(2)),
      gpuMemoryGb: Number(gpuMemoryGb.toFixed(2)),
      concurrency,
      coldStartCount,
      coldStartLatencyMs,
    })
  }
  return points
}

export function buildLogs(serviceName: string, revisions: readonly string[]): ServiceLogItem[] {
  const logs: ServiceLogItem[] = []
  for (let index = 0; index < 96; index += 1) {
    const revision = revisions[index % revisions.length] ?? "rev-unknown"
    const level: ServiceLogItem["level"] =
      index % 19 === 0 ? "error" : index % 7 === 0 ? "warn" : "info"
    const template = LOG_TEMPLATES[index % LOG_TEMPLATES.length] ?? "event"
    logs.push({
      id: `${serviceName}-log-${index}`,
      timestamp: buildTimestamp(480 - index * 5),
      level,
      message: `${serviceName}/${revision} ${template}`,
      instance: `${serviceName}-pod-${(index % 4) + 1}`,
      revision,
    })
  }
  return logs
}

export function buildRevision(input: {
  revisionId: string
  modelVersionId: string
  runtime: ServiceRuntime
  status: ServiceRevisionItem["status"]
  trafficWeight: number
  gpuModel: string
  gpuCount: number
  minReplicas: number
  maxReplicas: number
  metricType: "Concurrency" | "QPS"
  createdBy: string
  createdMinutesAgo: number
}): ServiceRevisionItem {
  const createdAt = buildTimestamp(input.createdMinutesAgo)
  return {
    revisionId: input.revisionId,
    createdAt,
    createdBy: input.createdBy,
    modelVersionId: input.modelVersionId,
    runtime: input.runtime,
    imageDigest: `sha256:${input.revisionId.replace(/[^a-z0-9]/gi, "").slice(0, 12)}`,
    resourceSpecSummary: `${input.gpuCount}x ${input.gpuModel} / 8 CPU / 32Gi`,
    autoscalingSummary: `min ${input.minReplicas} / max ${input.maxReplicas} · ${input.metricType}`,
    configHash: `cfg-${input.revisionId.slice(-6)}`,
    status: input.status,
    trafficWeight: input.trafficWeight,
    resourceSpec: {
      gpuModel: input.gpuModel,
      gpuCount: input.gpuCount,
      cpuRequest: "4",
      cpuLimit: "8",
      memoryRequest: "16Gi",
      memoryLimit: "32Gi",
    },
    autoscaling: {
      metricType: input.metricType,
      minReplicas: input.minReplicas,
      maxReplicas: input.maxReplicas,
      scaleDownDelaySeconds: 600,
      scaleToZero: input.minReplicas === 0,
    },
    configSnapshot: {
      runtime: {
        runtime: input.runtime,
        imageDigest: `sha256:${input.revisionId.replace(/[^a-z0-9]/gi, "").slice(0, 12)}`,
        params: {
          maxBatchSize: "32",
          tensorParallel: input.gpuCount > 1 ? "2" : "1",
        },
      },
      resources: {
        gpuModel: input.gpuModel,
        gpuCount: input.gpuCount,
        cpuRequest: "4",
        cpuLimit: "8",
        memoryRequest: "16Gi",
        memoryLimit: "32Gi",
      },
      autoscaling: {
        metricType: input.metricType,
        minReplicas: input.minReplicas,
        maxReplicas: input.maxReplicas,
        scaleDownDelaySeconds: 600,
        scaleToZero: input.minReplicas === 0,
      },
    },
  }
}

export function buildAudits(serviceId: string): ServiceAuditItem[] {
  return [
    {
      auditId: `${serviceId}-audit-1`,
      action: "service.create",
      actor: "owner@infera.ai",
      happenedAt: buildTimestamp(420),
    },
    {
      auditId: `${serviceId}-audit-2`,
      action: "service.revision.deploy",
      actor: "developer@infera.ai",
      happenedAt: buildTimestamp(160),
    },
    {
      auditId: `${serviceId}-audit-3`,
      action: "service.traffic.update",
      actor: "owner@infera.ai",
      happenedAt: buildTimestamp(45),
    },
  ]
}

export function buildEvents(): ServiceEventItem[] {
  return [
    {
      eventId: "evt-1",
      type: "deploy",
      title: "部署成功",
      description: "Revision 已完成健康检查并开始接流量。",
      happenedAt: buildTimestamp(42),
    },
    {
      eventId: "evt-2",
      type: "traffic",
      title: "灰度流量调整",
      description: "将 15% 流量导向新 Revision，观察 20 分钟。",
      happenedAt: buildTimestamp(41),
    },
    {
      eventId: "evt-3",
      type: "cold_start",
      title: "发生冷启动",
      description: "Scale-to-zero 后首个请求触发冷启动。",
      happenedAt: buildTimestamp(33),
    },
  ]
}
