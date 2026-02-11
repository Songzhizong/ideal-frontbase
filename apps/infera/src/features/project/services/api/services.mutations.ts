import type {
  CreateServiceInput,
  DeleteServiceInput,
  DeployRevisionInput,
  PlaygroundRunResult,
  RollbackServiceInput,
  ServiceMutationInput,
  ServiceRevisionItem,
  ToggleDesiredStateInput,
  UpdateServiceSettingsInput,
  UpdateTrafficInput,
} from "../types"
import {
  appendAudit,
  appendEvent,
  CreateServiceInputSchema,
  clone,
  DeleteServiceInputSchema,
  DeployRevisionInputSchema,
  ensureStore,
  getServiceOrThrow,
  normalizeTrafficWeights,
  RollbackInputSchema,
  refreshSummaryFromRevision,
  ToggleDesiredStateInputSchema,
  UpdateServiceSettingsSchema,
  UpdateTrafficInputSchema,
} from "./services.store"

export async function createProjectService(input: CreateServiceInput) {
  const payload = CreateServiceInputSchema.parse(input)
  const currentStore = ensureStore(payload.tenantId, payload.projectId)
  if (currentStore.services.some((item) => item.name === payload.name.trim())) {
    throw new Error("服务名称已存在，请更换名称")
  }

  const now = new Date().toISOString()
  const revision: ServiceRevisionItem = {
    revisionId: `${payload.projectId}-rev-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    createdBy: "current.user@mock.ai",
    modelVersionId: payload.resolvedModelVersionId,
    runtime: payload.runtime,
    imageDigest: `sha256:${Math.random().toString(16).slice(2, 14)}`,
    resourceSpecSummary: `${payload.gpuCount}x ${payload.gpuModel} / ${payload.cpuRequest} CPU / ${payload.memoryRequest}`,
    autoscalingSummary: `min ${payload.minReplicas} / max ${payload.maxReplicas} · ${payload.autoscalingMetric}`,
    configHash: `cfg-${Math.random().toString(36).slice(2, 10)}`,
    status: "Pending",
    trafficWeight: 100,
    resourceSpec: {
      gpuModel: payload.gpuModel,
      gpuCount: payload.gpuCount,
      cpuRequest: payload.cpuRequest,
      cpuLimit: payload.cpuLimit,
      memoryRequest: payload.memoryRequest,
      memoryLimit: payload.memoryLimit,
    },
    autoscaling: {
      metricType: payload.autoscalingMetric,
      minReplicas: payload.minReplicas,
      maxReplicas: payload.maxReplicas,
      scaleDownDelaySeconds: payload.scaleDownDelaySeconds,
      scaleToZero: payload.scaleToZero,
    },
    configSnapshot: {
      runtime: {
        runtime: payload.runtime,
        imageDigest: `sha256:${Math.random().toString(16).slice(2, 14)}`,
        params: payload.runtimeParams,
      },
      resources: {
        gpuModel: payload.gpuModel,
        gpuCount: payload.gpuCount,
        cpuRequest: payload.cpuRequest,
        cpuLimit: payload.cpuLimit,
        memoryRequest: payload.memoryRequest,
        memoryLimit: payload.memoryLimit,
      },
      autoscaling: {
        metricType: payload.autoscalingMetric,
        minReplicas: payload.minReplicas,
        maxReplicas: payload.maxReplicas,
        scaleDownDelaySeconds: payload.scaleDownDelaySeconds,
        scaleToZero: payload.scaleToZero,
      },
    },
  }

  const created = {
    serviceId: `${payload.projectId}-svc-${Math.random().toString(36).slice(2, 7)}`,
    name: payload.name,
    description: payload.description,
    env: payload.env,
    currentState: "Pending" as const,
    desiredState: "Active" as const,
    endpoint: `https://${payload.name}.mock.infera.ai/v1/chat/completions`,
    modelVersionId: payload.resolvedModelVersionId,
    runtime: payload.runtime,
    replicas: { min: payload.minReplicas, max: payload.maxReplicas, current: 0 },
    metrics1h: { qps: 0, p95Ms: 0, errorRate: 0 },
    updatedAt: now,
    networkExposure: payload.networkExposure,
    ipAllowlist: payload.ipAllowlist,
    apiProtocol: payload.apiProtocol,
    statusSteps: [
      {
        state: "Pending" as const,
        note: "服务创建完成，等待调度资源。",
        durationSeconds: 30,
        at: now,
      },
      { state: "Downloading" as const, note: "等待中", durationSeconds: 0, at: now },
      { state: "Starting" as const, note: "等待中", durationSeconds: 0, at: now },
      { state: "Ready" as const, note: "等待中", durationSeconds: 0, at: now },
    ],
    pendingTimeout: {
      enabled: payload.env !== "Prod",
      reason: "如果长时间 Pending，请尝试降低规格或更换资源池。",
      recommendations: ["降低 GPU 数量", "更换运行时", "稍后重试"],
    },
    runtimeConfig: clone(revision.configSnapshot.runtime),
    resourceSpec: clone(revision.resourceSpec),
    autoscaling: clone(revision.autoscaling),
    trafficSummary: [{ revisionId: revision.revisionId, weight: 100 }],
    revisions: [revision],
    events: [
      {
        eventId: `evt-${Math.random().toString(36).slice(2, 10)}`,
        type: "deploy" as const,
        title: "创建服务",
        description: "初始 revision 已创建，等待就绪。",
        happenedAt: now,
      },
    ],
    metrics: [],
    logs: [],
    playgroundConfig: {
      modelVersionId: payload.resolvedModelVersionId,
      revisionId: revision.revisionId,
      temperature: 0.7,
      topP: 0.95,
      maxTokens: 512,
      stop: "",
      presencePenalty: 0,
      stream: true,
      recordPromptResponse: payload.env !== "Prod",
    },
    playgroundTokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    compliance: {
      prodRecordLocked: payload.env === "Prod",
      notice:
        payload.env === "Prod"
          ? "生产环境默认关闭 Prompt/Response 记录；仅 Owner 可申请临时开启。"
          : "测试环境可按需开启 Prompt/Response 记录。",
    },
    audits: [
      {
        auditId: `audit-${Math.random().toString(36).slice(2, 10)}`,
        action: "service.create",
        actor: "current.user@mock.ai",
        happenedAt: now,
      },
    ],
  }

  currentStore.services.unshift(created)
  return clone(created)
}

export async function toggleServiceDesiredState(input: ToggleDesiredStateInput) {
  const payload = ToggleDesiredStateInputSchema.parse(input)
  const target = getServiceOrThrow(payload)
  target.desiredState = payload.desiredState
  if (payload.desiredState === "Inactive") {
    target.currentState = "Inactive"
    target.replicas.current = 0
  } else if (target.currentState === "Inactive") {
    target.currentState = "Pending"
  }
  appendAudit(target, "service.desired_state.update")
  refreshSummaryFromRevision(target)
  return clone(target)
}

export async function updateServiceTraffic(input: UpdateTrafficInput) {
  const payload = UpdateTrafficInputSchema.parse(input)
  const target = getServiceOrThrow(payload)
  const total = payload.weights.reduce((sum, item) => sum + item.weight, 0)
  if (Math.abs(total - 100) > 0.01) {
    throw new Error("流量权重总和必须为 100")
  }

  const failedAll = payload.weights.every((item) => {
    const revision = target.revisions.find((row) => row.revisionId === item.revisionId)
    return revision?.status === "Failed" && item.weight > 0
  })
  if (failedAll) {
    throw new Error("不能将全部流量分配到 Failed revision")
  }

  for (const revision of target.revisions) {
    const next = payload.weights.find((item) => item.revisionId === revision.revisionId)
    revision.trafficWeight = Number((next?.weight ?? 0).toFixed(2))
  }
  appendEvent(target, "流量已更新", "新流量策略已生效，建议关注 Metrics 指标。", "traffic")
  appendAudit(target, "service.traffic.update")
  refreshSummaryFromRevision(target)
  return clone(target)
}

export async function deployServiceRevision(input: DeployRevisionInput) {
  const payload = DeployRevisionInputSchema.parse(input)
  const target = getServiceOrThrow(payload)
  const now = new Date().toISOString()
  const revision: ServiceRevisionItem = {
    revisionId: `${payload.serviceId}-rev-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    createdBy: "current.user@mock.ai",
    modelVersionId: payload.modelVersionId,
    runtime: payload.runtime,
    imageDigest: `sha256:${Math.random().toString(16).slice(2, 14)}`,
    resourceSpecSummary: `${payload.resourceSpec.gpuCount}x ${payload.resourceSpec.gpuModel} / ${payload.resourceSpec.cpuRequest} CPU / ${payload.resourceSpec.memoryRequest}`,
    autoscalingSummary: `min ${payload.autoscaling.minReplicas} / max ${payload.autoscaling.maxReplicas} · ${payload.autoscaling.metricType}`,
    configHash: `cfg-${Math.random().toString(36).slice(2, 10)}`,
    status: "Ready",
    trafficWeight: 0,
    resourceSpec: clone(payload.resourceSpec),
    autoscaling: clone(payload.autoscaling),
    configSnapshot: {
      runtime: {
        runtime: payload.runtime,
        imageDigest: `sha256:${Math.random().toString(16).slice(2, 14)}`,
        params: { source: "deploy-wizard" },
      },
      resources: clone(payload.resourceSpec),
      autoscaling: clone(payload.autoscaling),
    },
  }

  if (payload.strategy === "full") {
    revision.trafficWeight = 100
    for (const row of target.revisions) {
      row.trafficWeight = 0
    }
  }

  if (payload.strategy === "canary") {
    const canary = payload.canaryWeight ?? 10
    revision.trafficWeight = canary
    const rest = normalizeTrafficWeights(
      target.revisions.map((item) => ({ revisionId: item.revisionId, weight: item.trafficWeight })),
      100 - canary,
    )
    for (const row of target.revisions) {
      row.trafficWeight = rest.find((item) => item.revisionId === row.revisionId)?.weight ?? 0
    }
  }

  target.revisions.unshift(revision)
  target.currentState = "Ready"
  appendEvent(target, "部署新 Revision", `${revision.revisionId} 已完成发布。`, "deploy")
  appendAudit(target, "service.revision.deploy")
  refreshSummaryFromRevision(target)
  return clone(target)
}

export async function rollbackServiceRevision(input: RollbackServiceInput) {
  const payload = RollbackInputSchema.parse(input)
  const target = getServiceOrThrow(payload)
  const revision = target.revisions.find((item) => item.revisionId === payload.targetRevisionId)
  if (!revision) {
    throw new Error("目标 revision 不存在")
  }

  for (const row of target.revisions) {
    row.trafficWeight = row.revisionId === payload.targetRevisionId ? 100 : 0
  }
  target.currentState = "Ready"
  appendEvent(target, "回滚完成", `已切换 ${payload.targetRevisionId} 至 100% 流量。`, "traffic")
  appendAudit(target, "service.revision.rollback")
  refreshSummaryFromRevision(target)
  return clone(target)
}

export async function updateServiceSettings(input: UpdateServiceSettingsInput) {
  const payload = UpdateServiceSettingsSchema.parse(input)
  const target = getServiceOrThrow(payload)
  target.name = payload.name
  target.description = payload.description
  target.networkExposure = payload.networkExposure
  target.ipAllowlist = payload.ipAllowlist
  appendAudit(target, "service.settings.update")
  refreshSummaryFromRevision(target)
  return clone(target)
}

export async function deleteProjectService(input: DeleteServiceInput) {
  const payload = DeleteServiceInputSchema.parse(input)
  const currentStore = ensureStore(payload.tenantId, payload.projectId)
  const target = currentStore.services.find((item) => item.serviceId === payload.serviceId)
  if (!target) {
    throw new Error("服务不存在")
  }
  if (payload.confirmName !== target.name) {
    throw new Error("确认名称不匹配")
  }
  currentStore.services = currentStore.services.filter(
    (item) => item.serviceId !== payload.serviceId,
  )
  return { success: true }
}

export async function runPlayground(
  input: ServiceMutationInput & {
    prompt: string
    revisionId: string
    temperature: number
    topP: number
    maxTokens: number
    stream: boolean
  },
): Promise<PlaygroundRunResult> {
  const target = getServiceOrThrow(input)
  const prompt = input.prompt.trim()
  if (!prompt) {
    throw new Error("请输入 Prompt")
  }

  const promptTokens = Math.max(5, Math.ceil(prompt.length / 4))
  const completionTokens = Math.max(18, Math.ceil((prompt.length * 1.6) / 4))
  const totalTokens = promptTokens + completionTokens
  const response = `Mock(${input.revisionId})：已根据你的输入生成回答。temperature=${input.temperature.toFixed(2)}, top_p=${input.topP.toFixed(2)}, max_tokens=${input.maxTokens}`

  target.playgroundTokenUsage.promptTokens += promptTokens
  target.playgroundTokenUsage.completionTokens += completionTokens
  target.playgroundTokenUsage.totalTokens += totalTokens
  target.playgroundConfig.revisionId = input.revisionId
  target.playgroundConfig.temperature = input.temperature
  target.playgroundConfig.topP = input.topP
  target.playgroundConfig.maxTokens = input.maxTokens
  target.playgroundConfig.stream = input.stream

  return {
    request: JSON.stringify(
      {
        model: target.playgroundConfig.modelVersionId,
        revision: input.revisionId,
        messages: [{ role: "user", content: prompt }],
        temperature: input.temperature,
        top_p: input.topP,
        max_tokens: input.maxTokens,
        stream: input.stream,
      },
      null,
      2,
    ),
    response: JSON.stringify(
      {
        id: `chatcmpl-${Math.random().toString(36).slice(2, 10)}`,
        choices: [{ index: 0, message: { role: "assistant", content: response } }],
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens,
        },
      },
      null,
      2,
    ),
    usage: { promptTokens, completionTokens, totalTokens },
    message: {
      id: `msg-${Math.random().toString(36).slice(2, 10)}`,
      role: "assistant",
      content: response,
      createdAt: new Date().toISOString(),
      tokens: totalTokens,
    },
  }
}
