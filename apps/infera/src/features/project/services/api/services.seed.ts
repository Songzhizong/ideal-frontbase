import type { ProjectServiceDetail } from "../types"
import {
  buildAudits,
  buildEvents,
  buildLogs,
  buildMetricSeries,
  buildRevision,
  buildTimestamp,
} from "./services.seed.helpers"
import { createWizardOptions } from "./services.seed.options"

function createServices(projectId: string): ProjectServiceDetail[] {
  const chatRevisions = [
    buildRevision({
      revisionId: `${projectId}-chat-rev-0013`,
      modelVersionId: "mv-chat-2026-02-11",
      runtime: "vLLM",
      status: "Ready",
      trafficWeight: 85,
      gpuModel: "A100-80G",
      gpuCount: 2,
      minReplicas: 1,
      maxReplicas: 6,
      metricType: "Concurrency",
      createdBy: "owner@infera.ai",
      createdMinutesAgo: 220,
    }),
    buildRevision({
      revisionId: `${projectId}-chat-rev-0012`,
      modelVersionId: "mv-chat-2026-02-01",
      runtime: "vLLM",
      status: "Ready",
      trafficWeight: 15,
      gpuModel: "A100-80G",
      gpuCount: 2,
      minReplicas: 1,
      maxReplicas: 6,
      metricType: "Concurrency",
      createdBy: "developer@infera.ai",
      createdMinutesAgo: 410,
    }),
  ]

  const visionRevisions = [
    buildRevision({
      revisionId: `${projectId}-vision-rev-0041`,
      modelVersionId: "mv-vision-2026-02-10",
      runtime: "Triton",
      status: "Pending",
      trafficWeight: 100,
      gpuModel: "A10",
      gpuCount: 1,
      minReplicas: 0,
      maxReplicas: 4,
      metricType: "QPS",
      createdBy: "developer@infera.ai",
      createdMinutesAgo: 58,
    }),
  ]

  const embeddingRevisions = [
    buildRevision({
      revisionId: `${projectId}-embed-rev-0008`,
      modelVersionId: "mv-embed-2026-01-22",
      runtime: "HF",
      status: "Ready",
      trafficWeight: 100,
      gpuModel: "A10",
      gpuCount: 1,
      minReplicas: 0,
      maxReplicas: 2,
      metricType: "QPS",
      createdBy: "owner@infera.ai",
      createdMinutesAgo: 880,
    }),
  ]

  const chatPrimary = chatRevisions[0]
  const visionPrimary = visionRevisions[0]
  const embeddingPrimary = embeddingRevisions[0]

  if (!chatPrimary || !visionPrimary || !embeddingPrimary) {
    return []
  }

  return [
    {
      serviceId: `${projectId}-svc-chat`,
      name: "chat-completion",
      description: "核心对话服务，承接在线推理请求。",
      env: "Prod",
      currentState: "Ready",
      desiredState: "Active",
      endpoint: "https://chat-completion.mock.infera.ai/v1/chat/completions",
      modelVersionId: chatPrimary.modelVersionId,
      runtime: chatPrimary.runtime,
      replicas: { min: 1, max: 6, current: 3 },
      metrics1h: { qps: 32.4, p95Ms: 54.8, errorRate: 0.72 },
      updatedAt: buildTimestamp(15),
      networkExposure: "Public",
      ipAllowlist: ["10.2.0.0/16", "172.20.4.0/24"],
      apiProtocol: "OpenAI-compatible",
      statusSteps: [
        { state: "Pending", note: "调度资源成功", durationSeconds: 26, at: buildTimestamp(230) },
        {
          state: "Downloading",
          note: "镜像拉取完成",
          durationSeconds: 44,
          at: buildTimestamp(229),
        },
        {
          state: "Starting",
          note: "运行时初始化完成",
          durationSeconds: 31,
          at: buildTimestamp(228),
        },
        { state: "Ready", note: "服务已对外提供流量", durationSeconds: 0, at: buildTimestamp(227) },
      ],
      pendingTimeout: {
        enabled: false,
        reason: "",
        recommendations: [],
      },
      runtimeConfig: chatPrimary.configSnapshot.runtime,
      resourceSpec: chatPrimary.resourceSpec,
      autoscaling: chatPrimary.autoscaling,
      trafficSummary: chatRevisions.map((item) => ({
        revisionId: item.revisionId,
        weight: item.trafficWeight,
      })),
      revisions: chatRevisions,
      events: buildEvents(),
      metrics: buildMetricSeries(1),
      logs: buildLogs(
        "chat-completion",
        chatRevisions.map((item) => item.revisionId),
      ),
      playgroundConfig: {
        modelVersionId: chatPrimary.modelVersionId,
        revisionId: chatPrimary.revisionId,
        temperature: 0.7,
        topP: 0.95,
        maxTokens: 1024,
        stop: "",
        presencePenalty: 0,
        stream: true,
        recordPromptResponse: false,
      },
      playgroundTokenUsage: { promptTokens: 12670, completionTokens: 21243, totalTokens: 33913 },
      compliance: {
        prodRecordLocked: true,
        notice: "生产环境默认关闭 Prompt/Response 记录；仅 Owner 可申请临时开启。",
      },
      audits: buildAudits(`${projectId}-svc-chat`),
    },
    {
      serviceId: `${projectId}-svc-vision`,
      name: "vision-ranker",
      description: "图像排序推理服务，当前正在拉起新版本。",
      env: "Test",
      currentState: "Pending",
      desiredState: "Active",
      endpoint: "https://vision-ranker.mock.infera.ai/v1/chat/completions",
      modelVersionId: visionPrimary.modelVersionId,
      runtime: visionPrimary.runtime,
      replicas: { min: 0, max: 4, current: 0 },
      metrics1h: { qps: 0, p95Ms: 0, errorRate: 0 },
      updatedAt: buildTimestamp(58),
      networkExposure: "Private",
      ipAllowlist: [],
      apiProtocol: "OpenAI-compatible",
      statusSteps: [
        {
          state: "Pending",
          note: "等待 GPU 资源池可用。",
          durationSeconds: 1860,
          at: buildTimestamp(58),
        },
        { state: "Downloading", note: "等待中", durationSeconds: 0, at: buildTimestamp(58) },
        { state: "Starting", note: "等待中", durationSeconds: 0, at: buildTimestamp(58) },
        { state: "Ready", note: "等待中", durationSeconds: 0, at: buildTimestamp(58) },
      ],
      pendingTimeout: {
        enabled: true,
        reason: "资源池容量不足，短时无法分配 A10 GPU。",
        recommendations: ["降低 GPU 数量", "切换资源池", "稍后自动重试"],
      },
      runtimeConfig: visionPrimary.configSnapshot.runtime,
      resourceSpec: visionPrimary.resourceSpec,
      autoscaling: visionPrimary.autoscaling,
      trafficSummary: [{ revisionId: visionPrimary.revisionId, weight: 100 }],
      revisions: visionRevisions,
      events: buildEvents(),
      metrics: buildMetricSeries(2),
      logs: buildLogs(
        "vision-ranker",
        visionRevisions.map((item) => item.revisionId),
      ),
      playgroundConfig: {
        modelVersionId: visionPrimary.modelVersionId,
        revisionId: visionPrimary.revisionId,
        temperature: 0.2,
        topP: 0.9,
        maxTokens: 512,
        stop: "",
        presencePenalty: 0,
        stream: true,
        recordPromptResponse: true,
      },
      playgroundTokenUsage: { promptTokens: 2384, completionTokens: 4198, totalTokens: 6582 },
      compliance: {
        prodRecordLocked: false,
        notice: "测试环境可按需开启 Prompt/Response 记录。",
      },
      audits: buildAudits(`${projectId}-svc-vision`),
    },
    {
      serviceId: `${projectId}-svc-embed`,
      name: "embedding-lite",
      description: "低峰时段自动降至零副本，按需唤起。",
      env: "Dev",
      currentState: "Inactive",
      desiredState: "Inactive",
      endpoint: "https://embedding-lite.mock.infera.ai/v1/chat/completions",
      modelVersionId: embeddingPrimary.modelVersionId,
      runtime: embeddingPrimary.runtime,
      replicas: { min: 0, max: 2, current: 0 },
      metrics1h: { qps: 1.8, p95Ms: 33.2, errorRate: 0.2 },
      updatedAt: buildTimestamp(90),
      networkExposure: "Public",
      ipAllowlist: ["192.168.0.0/24"],
      apiProtocol: "OpenAI-compatible",
      statusSteps: [
        {
          state: "Pending",
          note: "最近一次启动成功",
          durationSeconds: 22,
          at: buildTimestamp(400),
        },
        { state: "Downloading", note: "镜像已缓存", durationSeconds: 15, at: buildTimestamp(399) },
        { state: "Starting", note: "容器启动完成", durationSeconds: 18, at: buildTimestamp(398) },
        {
          state: "Ready",
          note: "当前被设置为 Inactive",
          durationSeconds: 0,
          at: buildTimestamp(397),
        },
      ],
      pendingTimeout: {
        enabled: false,
        reason: "",
        recommendations: [],
      },
      runtimeConfig: embeddingPrimary.configSnapshot.runtime,
      resourceSpec: embeddingPrimary.resourceSpec,
      autoscaling: embeddingPrimary.autoscaling,
      trafficSummary: [{ revisionId: embeddingPrimary.revisionId, weight: 100 }],
      revisions: embeddingRevisions,
      events: buildEvents(),
      metrics: buildMetricSeries(3),
      logs: buildLogs(
        "embedding-lite",
        embeddingRevisions.map((item) => item.revisionId),
      ),
      playgroundConfig: {
        modelVersionId: embeddingPrimary.modelVersionId,
        revisionId: embeddingPrimary.revisionId,
        temperature: 0,
        topP: 1,
        maxTokens: 256,
        stop: "",
        presencePenalty: 0,
        stream: true,
        recordPromptResponse: true,
      },
      playgroundTokenUsage: { promptTokens: 620, completionTokens: 512, totalTokens: 1132 },
      compliance: {
        prodRecordLocked: false,
        notice: "开发环境仅用于调试，建议定期清理日志和 Prompt 记录。",
      },
      audits: buildAudits(`${projectId}-svc-embed`),
    },
  ]
}

export function createServiceSeeds(projectId: string) {
  return {
    services: createServices(projectId),
    wizardOptions: createWizardOptions(),
  }
}
