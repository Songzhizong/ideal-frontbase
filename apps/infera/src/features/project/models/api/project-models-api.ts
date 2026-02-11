import { z } from "zod"
import type {
  DeleteModelInput,
  DeleteModelVersionInput,
  ModelDependencyConflict,
  ModelFilterState,
  ModelTabType,
  ProjectModelItem,
  PromoteTagInput,
  PromoteTagResult,
  UploadModelInput,
} from "../types/project-models"
import { createProjectModelSeeds } from "./project-models.seed"

class ModelDependencyConflictError extends Error {
  public readonly conflict: ModelDependencyConflict

  constructor(conflict: ModelDependencyConflict) {
    super(conflict.message)
    this.conflict = conflict
  }
}

const UploadModelInputSchema = z.object({
  tenantId: z.string().min(1),
  projectId: z.string().min(1),
  targetType: z.enum(["new", "existing"]),
  modelId: z.string().optional(),
  modelName: z.string().trim().min(2).max(80),
  visibility: z.enum(["Private", "TenantShared", "Public"]),
  description: z.string().trim().max(200),
  uploadMode: z.enum(["web", "cli"]),
  format: z.enum(["safetensors", "gguf", "bin"]),
  artifactType: z.enum(["Full", "Adapter", "Merged"]),
  baseModelVersionId: z.string().trim(),
  parameterSize: z.string().trim().min(1),
  contextLength: z.number().int().nonnegative(),
  license: z.string().trim().min(1),
  quantization: z.string().trim().min(1),
  notes: z.string().trim().max(200),
  uploadFileName: z.string().trim().min(1),
  uploadSizeLabel: z.string().trim().min(1),
})

const PromoteTagInputSchema = z.object({
  tenantId: z.string().min(1),
  projectId: z.string().min(1),
  modelId: z.string().min(1),
  tagName: z.string().min(1),
  targetVersionId: z.string().min(1),
  force: z.boolean(),
  reason: z.string(),
})

function getStoreKey(tenantId: string, projectId: string) {
  return `${tenantId}:${projectId}`
}

const modelStore = new Map<string, ProjectModelItem[]>()

function ensureModels(tenantId: string, projectId: string) {
  const key = getStoreKey(tenantId, projectId)
  const existing = modelStore.get(key)
  if (existing) {
    return existing
  }
  const seed = createProjectModelSeeds(tenantId, projectId)
  modelStore.set(key, seed)
  return seed
}

function cloneModel(model: ProjectModelItem): ProjectModelItem {
  return {
    ...model,
    tags: model.tags.map((tag) => ({ ...tag })),
    versions: model.versions.map((version) => ({
      ...version,
      metadata: { ...version.metadata },
      dependencies: version.dependencies.map((item) => ({ ...item })),
    })),
    usage: model.usage.map((item) => ({ ...item })),
    audits: model.audits.map((item) => ({ ...item })),
  }
}

export async function getProjectModels(
  tenantId: string,
  projectId: string,
  tab: ModelTabType,
  filters: ModelFilterState,
) {
  const models = ensureModels(tenantId, projectId)

  const tabFiltered = models.filter((model) => {
    if (tab === "system") {
      return model.source === "System"
    }
    if (tab === "tenant") {
      return model.source === "Tenant"
    }
    return true
  })

  const filtered = tabFiltered.filter((model) => {
    if (filters.source !== "All" && model.source !== filters.source) {
      return false
    }
    if (filters.visibility !== "All" && model.visibility !== filters.visibility) {
      return false
    }
    if (filters.license.trim() && model.license !== filters.license.trim()) {
      return false
    }
    if (filters.format !== "All" && model.format !== filters.format) {
      return false
    }
    if (filters.artifactType !== "All" && model.artifactType !== filters.artifactType) {
      return false
    }
    if (filters.quantization.trim() && model.quantization !== filters.quantization.trim()) {
      return false
    }
    if (filters.q.trim()) {
      const normalized = filters.q.trim().toLowerCase()
      const matched =
        model.name.toLowerCase().includes(normalized) ||
        model.latestVersionId.toLowerCase().includes(normalized)
      if (!matched) {
        return false
      }
    }
    return true
  })

  return filtered.map(cloneModel)
}

export async function getProjectModelDetail(tenantId: string, projectId: string, modelId: string) {
  const model = ensureModels(tenantId, projectId).find((item) => item.modelId === modelId)
  if (!model) {
    throw new Error("模型不存在")
  }
  return cloneModel(model)
}

export async function uploadProjectModelVersion(input: UploadModelInput) {
  const payload = UploadModelInputSchema.parse(input)
  const models = ensureModels(payload.tenantId, payload.projectId)
  const versionId = `mv-${Math.random().toString(36).slice(2, 10)}`

  const nextVersion = {
    modelVersionId: versionId,
    artifactType: payload.artifactType,
    format: payload.format,
    sha256: `sha256-${Math.random().toString(36).slice(2, 18)}`,
    size: payload.uploadSizeLabel,
    source: payload.uploadMode === "cli" ? ("System" as const) : ("Upload" as const),
    baseModelVersionId: payload.baseModelVersionId || null,
    createdAt: new Date().toISOString(),
    usedByCount: 0,
    metadata: {
      parameterSize: payload.parameterSize,
      contextLength: payload.contextLength,
      license: payload.license,
      quantization: payload.quantization,
      notes: payload.notes,
      gatePassed: true,
    },
    dependencies: [],
  }

  if (payload.targetType === "existing" && payload.modelId) {
    const target = models.find((item) => item.modelId === payload.modelId)
    if (!target) {
      throw new Error("目标模型不存在")
    }
    target.versions.unshift(nextVersion)
    target.latestVersionId = versionId
    target.updatedAt = new Date().toISOString()
    target.tags = target.tags.map((tag) =>
      tag.tagName === "latest" ? { ...tag, versionId, updatedAt: target.updatedAt } : tag,
    )
    return cloneModel(target)
  }

  const newModel: ProjectModelItem = {
    modelId: `model-${Math.random().toString(36).slice(2, 10)}`,
    name: payload.modelName,
    source: "Project",
    visibility: payload.visibility,
    tags: [
      {
        tagName: "latest",
        versionId,
        updatedBy: "current.user@mock.ai",
        updatedAt: new Date().toISOString(),
      },
    ],
    latestVersionId: versionId,
    parameterContextSummary: `${payload.parameterSize} / ${payload.contextLength}`,
    usedByServices: 0,
    updatedAt: new Date().toISOString(),
    license: payload.license,
    format: payload.format,
    artifactType: payload.artifactType,
    quantization: payload.quantization,
    description: payload.description,
    versions: [nextVersion],
    usage: [],
    audits: [],
  }
  models.unshift(newModel)
  return cloneModel(newModel)
}

export async function promoteModelTag(input: PromoteTagInput): Promise<PromoteTagResult> {
  const payload = PromoteTagInputSchema.parse(input)
  const model = ensureModels(payload.tenantId, payload.projectId).find(
    (item) => item.modelId === payload.modelId,
  )
  if (!model) {
    throw new Error("模型不存在")
  }

  const version = model.versions.find((item) => item.modelVersionId === payload.targetVersionId)
  if (!version) {
    throw new Error("目标版本不存在")
  }

  if (payload.tagName === "prod" && !version.metadata.gatePassed && !payload.force) {
    return {
      allowed: false,
      reason: "目标版本 Gate 校验未通过，请先完成评估或启用强制 Promote。",
    }
  }

  const existingTag = model.tags.find((tag) => tag.tagName === payload.tagName)
  if (existingTag) {
    existingTag.versionId = payload.targetVersionId
    existingTag.updatedAt = new Date().toISOString()
    existingTag.updatedBy = "current.user@mock.ai"
  } else {
    model.tags.push({
      tagName: payload.tagName,
      versionId: payload.targetVersionId,
      updatedAt: new Date().toISOString(),
      updatedBy: "current.user@mock.ai",
    })
  }

  return {
    allowed: true,
    reason: null,
  }
}

export async function deleteProjectModelVersion(input: DeleteModelVersionInput) {
  const model = ensureModels(input.tenantId, input.projectId).find(
    (item) => item.modelId === input.modelId,
  )
  if (!model) {
    throw new Error("模型不存在")
  }
  const version = model.versions.find((item) => item.modelVersionId === input.modelVersionId)
  if (!version) {
    throw new Error("版本不存在")
  }
  if (version.dependencies.length > 0) {
    throw new ModelDependencyConflictError({
      message: "该版本仍被服务修订引用，无法删除。",
      dependencies: version.dependencies,
    })
  }
  model.versions = model.versions.filter((item) => item.modelVersionId !== input.modelVersionId)
  if (model.versions[0]) {
    model.latestVersionId = model.versions[0].modelVersionId
  }
}

export async function deleteProjectModel(input: DeleteModelInput) {
  const models = ensureModels(input.tenantId, input.projectId)
  const model = models.find((item) => item.modelId === input.modelId)
  if (!model) {
    throw new Error("模型不存在")
  }
  const hasDependencyVersion = model.versions.find((version) => version.dependencies.length > 0)
  if (hasDependencyVersion) {
    throw new ModelDependencyConflictError({
      message: "模型存在被引用版本，无法删除。",
      dependencies: hasDependencyVersion.dependencies,
    })
  }
  const next = models.filter((item) => item.modelId !== input.modelId)
  modelStore.set(getStoreKey(input.tenantId, input.projectId), next)
}

export function isModelDependencyConflict(error: unknown): error is ModelDependencyConflictError {
  return error instanceof ModelDependencyConflictError
}
