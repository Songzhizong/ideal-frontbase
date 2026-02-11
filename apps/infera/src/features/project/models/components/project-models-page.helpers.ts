import type { LucideIcon } from "lucide-react"
import { BarChart3, Binary, Bot } from "lucide-react"
import { toast } from "sonner"
import type { ModelFilterState, ProjectModelItem } from "../types/project-models"

export type ModelTypeFilter = "All" | "LLM" | "Embedding" | "Rerank"
export type HealthFilter = "All" | "Active" | "Offline"
export type ViewMode = "list" | "grid"
export type ModelType = Exclude<ModelTypeFilter, "All">
export type HealthStatus = Exclude<HealthFilter, "All">

export interface ModelViewItem extends ProjectModelItem {
  modelType: ModelType
  healthStatus: HealthStatus
  parameterSize: string
  contextLength: string
  estimatedLatencyMs: number
}

export interface VersionHistoryItem {
  versionId: string
  updatedAt: string
}

export const DEFAULT_FILTERS: ModelFilterState = {
  source: "All",
  visibility: "All",
  license: "",
  format: "All",
  artifactType: "All",
  quantization: "",
  q: "",
}

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return "操作失败，请稍后重试。"
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("zh-CN", { hour12: false })
}

export function inferModelType(item: ProjectModelItem): ModelType {
  const source = `${item.name} ${item.modelId}`.toLowerCase()
  if (source.includes("embed") || source.includes("vector")) {
    return "Embedding"
  }
  if (source.includes("rerank")) {
    return "Rerank"
  }
  return "LLM"
}

export function inferHealthStatus(item: ProjectModelItem): HealthStatus {
  return item.usedByServices > 0 ? "Active" : "Offline"
}

function parseParameterContext(value: string) {
  const [parameter, context] = value.split("/").map((part) => part.trim())
  return {
    parameterSize: parameter && parameter.length > 0 ? parameter : "-",
    contextLength: context && context.length > 0 ? context : "-",
  }
}

export function estimateLatency(item: ProjectModelItem, modelType: ModelType) {
  const base = modelType === "LLM" ? 720 : modelType === "Embedding" ? 145 : 220
  return base + item.usedByServices * 18
}

export function shortVersion(versionId: string) {
  if (versionId.length <= 12) {
    return versionId
  }
  return `${versionId.slice(0, 12)}...`
}

export function getTagClassName(tagName: string) {
  const normalized = tagName.trim().toLowerCase()
  if (normalized === "prod") {
    return "border-success/30 bg-success-subtle text-success-on-subtle"
  }
  if (normalized === "staging") {
    return "border-warning/30 bg-warning-subtle text-warning-on-subtle"
  }
  if (normalized === "latest") {
    return "border-info/30 bg-info-subtle text-info-on-subtle"
  }
  return "border-border/50 bg-muted text-muted-foreground"
}

export function getModelTypeIcon(type: ModelType): LucideIcon {
  if (type === "Embedding") {
    return Binary
  }
  if (type === "Rerank") {
    return BarChart3
  }
  return Bot
}

export function getVersionHistory(item: ProjectModelItem): VersionHistoryItem[] {
  if (item.versions.length > 0) {
    return item.versions.map((version) => ({
      versionId: version.modelVersionId,
      updatedAt: version.createdAt,
    }))
  }

  const history = new Map<string, string>()
  for (const tag of item.tags) {
    if (!history.has(tag.versionId)) {
      history.set(tag.versionId, tag.updatedAt)
    }
  }
  if (!history.has(item.latestVersionId)) {
    history.set(item.latestVersionId, item.updatedAt)
  }

  return Array.from(history, ([versionId, updatedAt]) => ({ versionId, updatedAt }))
}

export async function copyText(value: string, successMessage: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    toast.error("当前环境不支持复制")
    return
  }

  try {
    await navigator.clipboard.writeText(value)
    toast.success(successMessage)
  } catch {
    toast.error("复制失败，请重试")
  }
}

export function toModelViewItems(items: ProjectModelItem[]): ModelViewItem[] {
  return items.map((item) => {
    const modelType = inferModelType(item)
    const parsed = parseParameterContext(item.parameterContextSummary)

    return {
      ...item,
      modelType,
      healthStatus: inferHealthStatus(item),
      parameterSize: parsed.parameterSize,
      contextLength: parsed.contextLength,
      estimatedLatencyMs: estimateLatency(item, modelType),
    }
  })
}
