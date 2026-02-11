import { z } from "zod"
import type {
  CreateFineTuningJobInput,
  FineTuningFilterState,
  FineTuningJobDetail,
  FineTuningJobMutationInput,
  FineTuningJobSummary,
  FineTuningLogItem,
} from "../types"
import { createFineTuningSeeds } from "./fine-tuning.seed"

interface FineTuningStore {
  jobs: FineTuningJobDetail[]
  wizardOptions: ReturnType<typeof createFineTuningSeeds>["wizardOptions"]
}

const CreateFineTuningInputSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  jobName: z.string().trim().min(2).max(80),
  baseModelVersionId: z.string().trim().min(1),
  baseModelTag: z.string().trim().min(1),
  datasetVersionId: z.string().trim().min(1),
  trainingType: z.enum(["LoRA", "Full"]),
  epochs: z.number().int().min(1).max(20),
  batchSize: z.number().int().min(1).max(2048),
  learningRate: z.number().min(0.000001).max(0.01),
  advancedConfig: z.object({
    gradientAccumulation: z.number().int().min(1).max(256),
    warmupSteps: z.number().int().min(0).max(20000),
    weightDecay: z.number().min(0).max(1),
    loraR: z.number().int().min(1).max(256).optional(),
    loraAlpha: z.number().int().min(1).max(256).optional(),
    loraDropout: z.number().min(0).max(1).optional(),
  }),
  resourceId: z.string().trim().min(1),
  resourcePool: z.string().trim().min(1),
  estimatedGpuHours: z.number().min(0),
  estimatedCostRange: z.string().trim().min(1),
  budgetLimit: z.string().trim().optional(),
  outputModelName: z.string().trim().min(2).max(80),
  artifactType: z.enum(["Full", "Adapter", "Merged"]),
})

const JobMutationInputSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  jobId: z.string().trim().min(1),
})

const store = new Map<string, FineTuningStore>()

function toStoreKey(tenantId: string, projectId: string) {
  return `${tenantId}:${projectId}`
}

function cloneJob(job: FineTuningJobDetail): FineTuningJobDetail {
  return {
    ...job,
    hyperParameters: {
      ...job.hyperParameters,
      advancedConfig: { ...job.hyperParameters.advancedConfig },
    },
    timeline: job.timeline.map((item) => ({ ...item })),
    metrics: job.metrics.map((item) => ({ ...item })),
    logs: job.logs.map((item) => ({ ...item })),
    artifacts: job.artifacts.map((item) => ({ ...item })),
    audits: job.audits.map((item) => ({ ...item })),
    failureReason: job.failureReason ? { ...job.failureReason } : null,
  }
}

function toSummary(job: FineTuningJobDetail): FineTuningJobSummary {
  return {
    jobId: job.jobId,
    jobName: job.jobName,
    baseModelVersionId: job.baseModelVersionId,
    datasetVersionId: job.datasetVersionId,
    method: job.method,
    resourceSpec: job.resourceSpec,
    status: job.status,
    progressPercent: job.progressPercent,
    estimatedCost: job.estimatedCost,
    createdAt: job.createdAt,
    createdBy: job.createdBy,
  }
}

function ensureStore(tenantId: string, projectId: string): FineTuningStore {
  const key = toStoreKey(tenantId, projectId)
  const existing = store.get(key)
  if (existing) {
    return existing
  }
  const next = createFineTuningSeeds(projectId)
  store.set(key, next)
  return next
}

function matchesTimeRange(createdAt: string, timeRange: FineTuningFilterState["timeRange"]) {
  if (timeRange === "All") {
    return true
  }
  const createdAtMs = Date.parse(createdAt)
  if (Number.isNaN(createdAtMs)) {
    return false
  }
  const now = Date.parse("2026-02-11T00:00:00Z")
  const diffHours = (now - createdAtMs) / (60 * 60 * 1000)
  if (timeRange === "24h") {
    return diffHours <= 24
  }
  if (timeRange === "7d") {
    return diffHours <= 24 * 7
  }
  if (timeRange === "30d") {
    return diffHours <= 24 * 30
  }
  return true
}

function getJobOrThrow(input: FineTuningJobMutationInput) {
  const payload = JobMutationInputSchema.parse(input)
  const target = ensureStore(payload.tenantId, payload.projectId).jobs.find(
    (job) => job.jobId === payload.jobId,
  )
  if (!target) {
    throw new Error("微调任务不存在")
  }
  return target
}

function appendAudit(job: FineTuningJobDetail, action: string, actor = "current.user@mock.ai") {
  job.audits.unshift({
    auditId: `audit-${Math.random().toString(36).slice(2, 10)}`,
    action,
    actor,
    happenedAt: new Date().toISOString(),
  })
}

export async function getProjectFineTuningJobs(
  tenantId: string,
  projectId: string,
  filters: FineTuningFilterState,
) {
  const currentStore = ensureStore(tenantId, projectId)
  const filtered = currentStore.jobs.filter((job) => {
    if (filters.status !== "All" && job.status !== filters.status) {
      return false
    }
    if (filters.method !== "All" && job.method !== filters.method) {
      return false
    }
    if (filters.createdBy !== "All" && job.createdBy !== filters.createdBy) {
      return false
    }
    if (!matchesTimeRange(job.createdAt, filters.timeRange)) {
      return false
    }
    if (filters.q.trim()) {
      const keyword = filters.q.trim().toLowerCase()
      const target = `${job.jobId} ${job.jobName} ${job.baseModelVersionId} ${job.datasetVersionId}`
      if (!target.toLowerCase().includes(keyword)) {
        return false
      }
    }
    return true
  })

  return filtered.map((job) => toSummary(cloneJob(job)))
}

export async function getProjectFineTuningJobDetail(
  tenantId: string,
  projectId: string,
  jobId: string,
) {
  const target = ensureStore(tenantId, projectId).jobs.find((job) => job.jobId === jobId)
  if (!target) {
    throw new Error("微调任务不存在")
  }
  return cloneJob(target)
}

export async function getFineTuningWizardOptions(tenantId: string, projectId: string) {
  return structuredClone(ensureStore(tenantId, projectId).wizardOptions)
}

export async function createFineTuningJob(input: CreateFineTuningJobInput) {
  const payload = CreateFineTuningInputSchema.parse(input)
  const currentStore = ensureStore(payload.tenantId, payload.projectId)
  const model = currentStore.wizardOptions.baseModels.find(
    (item) => item.resolvedVersionId === payload.baseModelVersionId,
  )
  const dataset = currentStore.wizardOptions.datasets.find(
    (item) => item.datasetVersionId === payload.datasetVersionId,
  )
  const resource = currentStore.wizardOptions.resources.find(
    (item) => item.resourceId === payload.resourceId,
  )

  if (!model || !dataset || !resource) {
    throw new Error("创建任务参数不完整，请重新选择模型、数据集和资源规格")
  }

  const createdAt = new Date().toISOString()
  const advancedConfig = {
    gradientAccumulation: payload.advancedConfig.gradientAccumulation,
    warmupSteps: payload.advancedConfig.warmupSteps,
    weightDecay: payload.advancedConfig.weightDecay,
    ...(typeof payload.advancedConfig.loraR === "number"
      ? { loraR: payload.advancedConfig.loraR }
      : {}),
    ...(typeof payload.advancedConfig.loraAlpha === "number"
      ? { loraAlpha: payload.advancedConfig.loraAlpha }
      : {}),
    ...(typeof payload.advancedConfig.loraDropout === "number"
      ? { loraDropout: payload.advancedConfig.loraDropout }
      : {}),
  }

  const nextJob: FineTuningJobDetail = {
    jobId: `ft-job-${Math.random().toString(36).slice(2, 10)}`,
    jobName: payload.jobName,
    baseModelVersionId: payload.baseModelVersionId,
    baseModelName: model.modelName,
    datasetVersionId: payload.datasetVersionId,
    datasetName: dataset.datasetName,
    method: payload.trainingType,
    resourceSpec: `${resource.gpuCount}x ${resource.gpuModel}`,
    resourcePool: payload.resourcePool,
    status: "Queued",
    progressPercent: 0,
    estimatedCost: payload.estimatedCostRange,
    createdAt,
    createdBy: "current.user@mock.ai",
    outputModelName: payload.outputModelName,
    artifactType: payload.artifactType,
    hyperParameters: {
      epochs: payload.epochs,
      batchSize: payload.batchSize,
      learningRate: payload.learningRate,
      advancedConfig,
    },
    timeline: [
      {
        id: "queued",
        status: "Queued",
        at: createdAt,
        note: "任务创建成功，等待训练资源调度。",
      },
    ],
    failureReason: null,
    metrics: [],
    logs: [],
    artifacts: [],
    audits: [
      {
        auditId: `audit-${Math.random().toString(36).slice(2, 10)}`,
        action: "fine_tuning.job.create",
        actor: "current.user@mock.ai",
        happenedAt: createdAt,
      },
    ],
  }

  currentStore.jobs.unshift(nextJob)
  return cloneJob(nextJob)
}

export async function cancelFineTuningJob(input: FineTuningJobMutationInput) {
  const target = getJobOrThrow(input)
  if (target.status !== "Queued" && target.status !== "Running") {
    throw new Error("当前任务状态不允许取消")
  }
  target.status = "Canceled"
  target.timeline.push({
    id: `timeline-${Math.random().toString(36).slice(2, 8)}`,
    status: "Canceled",
    at: new Date().toISOString(),
    note: "任务已取消。",
  })
  appendAudit(target, "fine_tuning.job.cancel")
  return cloneJob(target)
}

export async function retryFineTuningJob(input: FineTuningJobMutationInput) {
  const target = getJobOrThrow(input)
  if (target.status !== "Failed" && target.status !== "Canceled") {
    throw new Error("仅失败或已取消任务支持重试")
  }
  target.status = "Queued"
  target.progressPercent = 0
  target.failureReason = null
  target.logs = []
  target.timeline.push({
    id: `timeline-${Math.random().toString(36).slice(2, 8)}`,
    status: "Queued",
    at: new Date().toISOString(),
    note: "任务已重试，重新进入调度队列。",
  })
  appendAudit(target, "fine_tuning.job.retry")
  return cloneJob(target)
}

export async function cloneFineTuningJob(input: FineTuningJobMutationInput) {
  const source = getJobOrThrow(input)
  const currentStore = ensureStore(input.tenantId, input.projectId)
  const clonedAt = new Date().toISOString()
  const cloned: FineTuningJobDetail = {
    ...cloneJob(source),
    jobId: `ft-job-${Math.random().toString(36).slice(2, 10)}`,
    jobName: `${source.jobName}-clone`,
    status: "Queued",
    progressPercent: 0,
    createdAt: clonedAt,
    createdBy: "current.user@mock.ai",
    timeline: [
      {
        id: "queued",
        status: "Queued",
        at: clonedAt,
        note: "基于历史任务克隆创建。",
      },
    ],
    failureReason: null,
    metrics: [],
    logs: [] satisfies FineTuningLogItem[],
    artifacts: [],
    audits: [
      {
        auditId: `audit-${Math.random().toString(36).slice(2, 10)}`,
        action: "fine_tuning.job.clone",
        actor: "current.user@mock.ai",
        happenedAt: clonedAt,
      },
    ],
  }
  currentStore.jobs.unshift(cloned)
  return cloneJob(cloned)
}
