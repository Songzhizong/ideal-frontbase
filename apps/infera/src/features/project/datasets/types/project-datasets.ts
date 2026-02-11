export interface DatasetTokenStats {
  promptTokens: number
  totalTokens: number
  avgTokensPerRow: number
}

export interface DatasetUsageItem {
  usageType: "Fine-tuning" | "Evaluation"
  targetName: string
  createdAt: string
}

export interface DatasetVersionItem {
  datasetVersionId: string
  sha256: string
  rows: number
  schema: Record<string, string>
  tokenStats: DatasetTokenStats
  createdAt: string
  usedByCount: number
  storageUri: string
  usage: DatasetUsageItem[]
}

export interface DatasetAuditItem {
  auditId: string
  action: string
  actor: string
  happenedAt: string
}

export interface ProjectDatasetItem {
  datasetId: string
  name: string
  latestDatasetVersionId: string
  rows: number
  tokenStats: DatasetTokenStats
  schemaFieldCount: number
  usedBy: number
  updatedAt: string
  versions: DatasetVersionItem[]
  previewSamples: string[]
  audits: DatasetAuditItem[]
}

export interface DatasetFilterState {
  q: string
  onlyUsed: boolean
  minRows: number | null
  maxRows: number | null
}

export interface UploadDatasetInput {
  tenantId: string
  projectId: string
  targetType: "new" | "existing"
  datasetId?: string
  datasetName: string
  fileNames: string[]
  rows: number
  schema: Record<string, string>
  tokenStats: DatasetTokenStats
  errorLines: string[]
}

export interface DeleteDatasetVersionInput {
  tenantId: string
  projectId: string
  datasetId: string
  datasetVersionId: string
}

export interface DeleteDatasetInput {
  tenantId: string
  projectId: string
  datasetId: string
}

export interface DatasetDependencyConflict {
  message: string
  usage: DatasetUsageItem[]
}
