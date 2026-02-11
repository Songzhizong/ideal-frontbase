import { z } from "zod"
import type {
  DatasetDependencyConflict,
  DatasetFilterState,
  DeleteDatasetInput,
  DeleteDatasetVersionInput,
  ProjectDatasetItem,
  UploadDatasetInput,
} from "../types/project-datasets"
import { createProjectDatasetSeeds } from "./project-datasets.seed"

class DatasetDependencyConflictError extends Error {
  public readonly conflict: DatasetDependencyConflict

  constructor(conflict: DatasetDependencyConflict) {
    super(conflict.message)
    this.conflict = conflict
  }
}

const UploadDatasetInputSchema = z.object({
  tenantId: z.string().min(1),
  projectId: z.string().min(1),
  targetType: z.enum(["new", "existing"]),
  datasetId: z.string().optional(),
  datasetName: z.string().trim().min(2).max(80),
  fileNames: z.array(z.string().min(1)).min(1),
  rows: z.number().int().nonnegative(),
  schema: z.record(z.string(), z.string()),
  tokenStats: z.object({
    promptTokens: z.number().int().nonnegative(),
    totalTokens: z.number().int().nonnegative(),
    avgTokensPerRow: z.number().nonnegative(),
  }),
  errorLines: z.array(z.string()),
})

function getStoreKey(tenantId: string, projectId: string) {
  return `${tenantId}:${projectId}`
}

const datasetStore = new Map<string, ProjectDatasetItem[]>()

function ensureDatasets(tenantId: string, projectId: string) {
  const key = getStoreKey(tenantId, projectId)
  const existing = datasetStore.get(key)
  if (existing) {
    return existing
  }
  const seed = createProjectDatasetSeeds(tenantId, projectId)
  datasetStore.set(key, seed)
  return seed
}

function cloneDataset(dataset: ProjectDatasetItem): ProjectDatasetItem {
  return {
    ...dataset,
    tokenStats: { ...dataset.tokenStats },
    versions: dataset.versions.map((version) => ({
      ...version,
      schema: { ...version.schema },
      tokenStats: { ...version.tokenStats },
      usage: version.usage.map((item) => ({ ...item })),
    })),
    previewSamples: [...dataset.previewSamples],
    audits: dataset.audits.map((item) => ({ ...item })),
  }
}

export async function getProjectDatasets(
  tenantId: string,
  projectId: string,
  filters: DatasetFilterState,
) {
  const datasets = ensureDatasets(tenantId, projectId)
  const filtered = datasets.filter((item) => {
    if (filters.q.trim()) {
      const keyword = filters.q.trim().toLowerCase()
      if (
        !item.name.toLowerCase().includes(keyword) &&
        !item.latestDatasetVersionId.includes(keyword)
      ) {
        return false
      }
    }
    if (filters.onlyUsed && item.usedBy <= 0) {
      return false
    }
    if (filters.minRows !== null && item.rows < filters.minRows) {
      return false
    }
    if (filters.maxRows !== null && item.rows > filters.maxRows) {
      return false
    }
    return true
  })

  return filtered.map(cloneDataset)
}

export async function getProjectDatasetDetail(
  tenantId: string,
  projectId: string,
  datasetId: string,
) {
  const dataset = ensureDatasets(tenantId, projectId).find((item) => item.datasetId === datasetId)
  if (!dataset) {
    throw new Error("数据集不存在")
  }
  return cloneDataset(dataset)
}

export async function uploadProjectDatasetVersion(input: UploadDatasetInput) {
  const payload = UploadDatasetInputSchema.parse(input)
  const datasets = ensureDatasets(payload.tenantId, payload.projectId)
  const datasetVersionId = `dv-${Math.random().toString(36).slice(2, 10)}`

  const nextVersion = {
    datasetVersionId,
    sha256: `sha256-${Math.random().toString(36).slice(2, 18)}`,
    rows: payload.rows,
    schema: payload.schema,
    tokenStats: payload.tokenStats,
    createdAt: new Date().toISOString(),
    usedByCount: 0,
    storageUri: `oss://mock-bucket/datasets/${datasetVersionId}.jsonl`,
    usage: [],
  }

  if (payload.targetType === "existing" && payload.datasetId) {
    const target = datasets.find((item) => item.datasetId === payload.datasetId)
    if (!target) {
      throw new Error("目标数据集不存在")
    }
    target.versions.unshift(nextVersion)
    target.latestDatasetVersionId = datasetVersionId
    target.rows = payload.rows
    target.tokenStats = payload.tokenStats
    target.schemaFieldCount = Object.keys(payload.schema).length
    target.updatedAt = new Date().toISOString()
    return cloneDataset(target)
  }

  const newDataset: ProjectDatasetItem = {
    datasetId: `ds-${Math.random().toString(36).slice(2, 10)}`,
    name: payload.datasetName,
    latestDatasetVersionId: datasetVersionId,
    rows: payload.rows,
    tokenStats: payload.tokenStats,
    schemaFieldCount: Object.keys(payload.schema).length,
    usedBy: 0,
    updatedAt: new Date().toISOString(),
    versions: [nextVersion],
    previewSamples:
      payload.errorLines.length > 0 ? payload.errorLines.slice(0, 2) : payload.fileNames,
    audits: [],
  }
  datasets.unshift(newDataset)
  return cloneDataset(newDataset)
}

export async function deleteProjectDatasetVersion(input: DeleteDatasetVersionInput) {
  const dataset = ensureDatasets(input.tenantId, input.projectId).find(
    (item) => item.datasetId === input.datasetId,
  )
  if (!dataset) {
    throw new Error("数据集不存在")
  }
  const version = dataset.versions.find((item) => item.datasetVersionId === input.datasetVersionId)
  if (!version) {
    throw new Error("数据集版本不存在")
  }
  if (version.usage.length > 0) {
    throw new DatasetDependencyConflictError({
      message: "当前数据集版本仍被任务引用，无法删除。",
      usage: version.usage,
    })
  }
  dataset.versions = dataset.versions.filter(
    (item) => item.datasetVersionId !== input.datasetVersionId,
  )
  if (dataset.versions[0]) {
    dataset.latestDatasetVersionId = dataset.versions[0].datasetVersionId
  }
}

export async function deleteProjectDataset(input: DeleteDatasetInput) {
  const datasets = ensureDatasets(input.tenantId, input.projectId)
  const dataset = datasets.find((item) => item.datasetId === input.datasetId)
  if (!dataset) {
    throw new Error("数据集不存在")
  }
  const dependencyVersion = dataset.versions.find((version) => version.usage.length > 0)
  if (dependencyVersion) {
    throw new DatasetDependencyConflictError({
      message: "数据集仍有关联任务，无法删除。",
      usage: dependencyVersion.usage,
    })
  }
  const next = datasets.filter((item) => item.datasetId !== input.datasetId)
  datasetStore.set(getStoreKey(input.tenantId, input.projectId), next)
}

export function isDatasetDependencyConflict(
  error: unknown,
): error is DatasetDependencyConflictError {
  return error instanceof DatasetDependencyConflictError
}
