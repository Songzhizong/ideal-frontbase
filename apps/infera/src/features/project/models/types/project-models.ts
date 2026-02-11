export type ModelSource = "System" | "Tenant" | "Project"

export type ModelVisibility = "Private" | "TenantShared" | "Public"

export type ModelArtifactType = "Full" | "Adapter" | "Merged"

export type ModelFormat = "safetensors" | "gguf" | "bin"

export type ModelTabType = "available" | "system" | "tenant"

export interface ModelFilterState {
  source: ModelSource | "All"
  visibility: ModelVisibility | "All"
  license: string
  format: ModelFormat | "All"
  artifactType: ModelArtifactType | "All"
  quantization: string
  q: string
}

export interface ModelTagItem {
  tagName: string
  versionId: string
  updatedBy: string
  updatedAt: string
}

export interface ModelVersionDependency {
  serviceName: string
  revisionId: string
  environment: "Dev" | "Test" | "Prod"
  trafficWeight: string
  endpoint: string
}

export interface ModelVersionItem {
  modelVersionId: string
  artifactType: ModelArtifactType
  format: ModelFormat
  sha256: string
  size: string
  source: "Upload" | "Fine-tune" | "System"
  baseModelVersionId: string | null
  createdAt: string
  usedByCount: number
  metadata: {
    parameterSize: string
    contextLength: number
    license: string
    quantization: string
    notes: string
    gatePassed: boolean
  }
  dependencies: ModelVersionDependency[]
}

export interface ModelUsageItem {
  serviceName: string
  revisionId: string
  environment: "Dev" | "Test" | "Prod"
  trafficWeight: string
  endpoint: string
}

export interface ModelAuditItem {
  auditId: string
  action: string
  actor: string
  happenedAt: string
}

export interface ProjectModelItem {
  modelId: string
  name: string
  source: ModelSource
  visibility: ModelVisibility
  tags: ModelTagItem[]
  latestVersionId: string
  parameterContextSummary: string
  usedByServices: number
  updatedAt: string
  license: string
  format: ModelFormat
  artifactType: ModelArtifactType
  quantization: string
  description: string
  versions: ModelVersionItem[]
  usage: ModelUsageItem[]
  audits: ModelAuditItem[]
}

export interface PromoteTagResult {
  allowed: boolean
  reason: string | null
}

export interface PromoteTagInput {
  tenantId: string
  projectId: string
  modelId: string
  tagName: string
  targetVersionId: string
  force: boolean
  reason: string
}

export interface UploadModelInput {
  tenantId: string
  projectId: string
  targetType: "new" | "existing"
  modelId?: string
  modelName: string
  visibility: ModelVisibility
  description: string
  uploadMode: "web" | "cli"
  format: ModelFormat
  artifactType: ModelArtifactType
  baseModelVersionId: string
  parameterSize: string
  contextLength: number
  license: string
  quantization: string
  notes: string
  uploadFileName: string
  uploadSizeLabel: string
}

export interface DeleteModelVersionInput {
  tenantId: string
  projectId: string
  modelId: string
  modelVersionId: string
}

export interface DeleteModelInput {
  tenantId: string
  projectId: string
  modelId: string
}

export interface ModelDependencyConflict {
  message: string
  dependencies: ModelVersionDependency[]
}
