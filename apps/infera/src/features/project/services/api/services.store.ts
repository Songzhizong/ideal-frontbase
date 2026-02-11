import { z } from "zod"
import type {
  CreateServiceInput,
  ProjectServiceDetail,
  ServiceEventItem,
  ServiceMutationInput,
  ServiceTrafficItem,
  ServiceWizardOptions,
} from "../types"
import { createServiceSeeds } from "./services.seed"

interface ServiceStore {
  services: ProjectServiceDetail[]
  wizardOptions: ServiceWizardOptions
}

const store = new Map<string, ServiceStore>()

function toStoreKey(tenantId: string, projectId: string) {
  return `${tenantId}:${projectId}`
}

export function clone<T>(value: T): T {
  return structuredClone(value)
}

export const ServiceMutationInputSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  serviceId: z.string().trim().min(1),
})

export const CreateServiceInputSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  name: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "服务名称仅允许小写字母、数字和中划线"),
  description: z.string().max(240),
  env: z.enum(["Dev", "Test", "Prod"]),
  networkExposure: z.enum(["Public", "Private"]),
  ipAllowlist: z.array(z.string().trim().min(1)).default([]),
  apiProtocol: z.literal("OpenAI-compatible"),
  modelId: z.string().trim().min(1),
  modelTag: z.string().trim().min(1),
  resolvedModelVersionId: z.string().trim().min(1),
  runtime: z.enum(["vLLM", "TGI", "Triton", "HF"]),
  runtimeParams: z.record(z.string(), z.string()),
  resourceProfileId: z.string().trim().min(1),
  gpuModel: z.string().trim().min(1),
  gpuCount: z.number().int().min(1),
  cpuRequest: z.string().trim().min(1),
  cpuLimit: z.string().trim().min(1),
  memoryRequest: z.string().trim().min(1),
  memoryLimit: z.string().trim().min(1),
  autoscalingMetric: z.enum(["Concurrency", "QPS"]),
  minReplicas: z.number().int().min(0),
  maxReplicas: z.number().int().min(1),
  scaleDownDelaySeconds: z.number().int().min(0),
  scaleToZero: z.boolean(),
  estimatedMonthlyCost: z.string().trim().min(1),
})

export const ToggleDesiredStateInputSchema = ServiceMutationInputSchema.extend({
  desiredState: z.enum(["Active", "Inactive"]),
})

export const UpdateTrafficInputSchema = ServiceMutationInputSchema.extend({
  weights: z
    .array(
      z.object({
        revisionId: z.string().trim().min(1),
        weight: z.number().min(0).max(100),
      }),
    )
    .min(1),
})

export const DeployRevisionInputSchema = ServiceMutationInputSchema.extend({
  modelVersionId: z.string().trim().min(1),
  runtime: z.enum(["vLLM", "TGI", "Triton", "HF"]),
  resourceSpec: z.object({
    gpuModel: z.string().trim().min(1),
    gpuCount: z.number().int().min(1),
    cpuRequest: z.string().trim().min(1),
    cpuLimit: z.string().trim().min(1),
    memoryRequest: z.string().trim().min(1),
    memoryLimit: z.string().trim().min(1),
  }),
  autoscaling: z.object({
    metricType: z.enum(["Concurrency", "QPS"]),
    minReplicas: z.number().int().min(0),
    maxReplicas: z.number().int().min(1),
    scaleDownDelaySeconds: z.number().int().min(0),
    scaleToZero: z.boolean(),
  }),
  strategy: z.enum(["full", "keep_zero", "canary"]),
  canaryWeight: z.number().min(1).max(99).optional(),
})

export const RollbackInputSchema = ServiceMutationInputSchema.extend({
  targetRevisionId: z.string().trim().min(1),
})

export const UpdateServiceSettingsSchema = ServiceMutationInputSchema.extend({
  name: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "服务名称仅允许小写字母、数字和中划线"),
  description: z.string().trim().max(240),
  networkExposure: z.enum(["Public", "Private"]),
  ipAllowlist: z.array(z.string().trim().min(1)).default([]),
})

export const DeleteServiceInputSchema = ServiceMutationInputSchema.extend({
  confirmName: z.string().trim().min(1),
})

export function ensureStore(tenantId: string, projectId: string) {
  const key = toStoreKey(tenantId, projectId)
  const existing = store.get(key)
  if (existing) {
    return existing
  }
  const seed = createServiceSeeds(projectId)
  store.set(key, seed)
  return seed
}

export function getServiceOrThrow(input: ServiceMutationInput) {
  const payload = ServiceMutationInputSchema.parse(input)
  const service = ensureStore(payload.tenantId, payload.projectId).services.find(
    (item) => item.serviceId === payload.serviceId,
  )
  if (!service) {
    throw new Error("服务不存在")
  }
  return service
}

export function appendEvent(
  target: ProjectServiceDetail,
  title: string,
  description: string,
  type: ServiceEventItem["type"],
) {
  target.events.unshift({
    eventId: `evt-${Math.random().toString(36).slice(2, 10)}`,
    type,
    title,
    description,
    happenedAt: new Date().toISOString(),
  })
  target.events = target.events.slice(0, 30)
}

export function appendAudit(
  target: ProjectServiceDetail,
  action: string,
  actor = "current.user@mock.ai",
) {
  target.audits.unshift({
    auditId: `audit-${Math.random().toString(36).slice(2, 10)}`,
    action,
    actor,
    happenedAt: new Date().toISOString(),
  })
  target.audits = target.audits.slice(0, 80)
}

function deriveOneHourStats(target: ProjectServiceDetail) {
  const oneHourPoints = target.metrics.slice(-12)
  if (oneHourPoints.length === 0) {
    return { qps: 0, p95Ms: 0, errorRate: 0 }
  }

  const sum = oneHourPoints.reduce(
    (acc, point) => {
      acc.qps += point.qps
      acc.p95Ms += point.p95Ms
      acc.errorRate += point.errorRate
      return acc
    },
    { qps: 0, p95Ms: 0, errorRate: 0 },
  )

  return {
    qps: Number((sum.qps / oneHourPoints.length).toFixed(2)),
    p95Ms: Number((sum.p95Ms / oneHourPoints.length).toFixed(2)),
    errorRate: Number((sum.errorRate / oneHourPoints.length).toFixed(2)),
  }
}

export function refreshSummaryFromRevision(target: ProjectServiceDetail) {
  const activeRevision =
    target.revisions.find((item) => item.trafficWeight > 0) ??
    target.revisions.find((item) => item.status === "Ready") ??
    target.revisions[0]

  if (!activeRevision) {
    return
  }

  target.modelVersionId = activeRevision.modelVersionId
  target.runtime = activeRevision.runtime
  target.runtimeConfig = clone(activeRevision.configSnapshot.runtime)
  target.resourceSpec = clone(activeRevision.resourceSpec)
  target.autoscaling = clone(activeRevision.autoscaling)
  target.trafficSummary = target.revisions
    .filter((item) => item.trafficWeight > 0)
    .map((item) => ({ revisionId: item.revisionId, weight: item.trafficWeight }))

  target.replicas = {
    min: activeRevision.autoscaling.minReplicas,
    max: activeRevision.autoscaling.maxReplicas,
    current:
      target.desiredState === "Inactive"
        ? 0
        : Math.max(
            activeRevision.autoscaling.minReplicas,
            Math.min(activeRevision.autoscaling.maxReplicas, target.replicas.current),
          ),
  }

  target.metrics1h = deriveOneHourStats(target)
  target.updatedAt = new Date().toISOString()
}

export function normalizeTrafficWeights(weights: ServiceTrafficItem[], targetTotal = 100) {
  const validWeights = weights.filter((item) => Number.isFinite(item.weight) && item.weight >= 0)
  if (validWeights.length === 0) {
    return []
  }

  const total = validWeights.reduce((sum, item) => sum + item.weight, 0)
  const normalized =
    total <= 0
      ? validWeights.map((item) => ({
          revisionId: item.revisionId,
          weight: Number((targetTotal / validWeights.length).toFixed(2)),
        }))
      : validWeights.map((item) => ({
          revisionId: item.revisionId,
          weight: Number(((item.weight / total) * targetTotal).toFixed(2)),
        }))

  const difference = Number(
    (targetTotal - normalized.reduce((sum, item) => sum + item.weight, 0)).toFixed(2),
  )
  const lastWeight = normalized[normalized.length - 1]

  if (Math.abs(difference) > 0.001 && lastWeight) {
    lastWeight.weight = Number((lastWeight.weight + difference).toFixed(2))
  }

  return normalized
}

export function resetServiceStore() {
  store.clear()
}

export function toCreateServiceInputPartial(input: CreateServiceInput) {
  return CreateServiceInputSchema.parse(input)
}
