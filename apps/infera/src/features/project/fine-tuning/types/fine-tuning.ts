export type FineTuningStatus = "Queued" | "Running" | "Succeeded" | "Failed" | "Canceled"

export type FineTuningMethod = "LoRA" | "Full"

export interface FineTuningFilterState {
  q: string
  status: FineTuningStatus | "All"
  method: FineTuningMethod | "All"
  createdBy: string | "All"
  timeRange: "24h" | "7d" | "30d" | "All"
}

export interface FineTuningBaseModelOption {
  modelId: string
  modelName: string
  tag: string
  resolvedVersionId: string
  metadata: {
    parameterSize: string
    contextLength: number
    license: string
    quantization: string
  }
}

export interface FineTuningDatasetOption {
  datasetId: string
  datasetName: string
  datasetVersionId: string
  rows: number
  schemaFields: string[]
  tokenStats: {
    promptTokens: number
    totalTokens: number
    avgTokensPerRow: number
  }
  riskHints: string[]
}

export interface FineTuningResourceOption {
  resourceId: string
  label: string
  gpuModel: string
  gpuCount: number
  resourcePool: string
  estimatedGpuHours: number
  estimatedCostRange: string
}

export interface FineTuningWizardOptions {
  baseModels: FineTuningBaseModelOption[]
  datasets: FineTuningDatasetOption[]
  resources: FineTuningResourceOption[]
}

export interface FineTuningAdvancedConfig {
  gradientAccumulation: number
  warmupSteps: number
  weightDecay: number
  loraR?: number
  loraAlpha?: number
  loraDropout?: number
}

export interface CreateFineTuningJobInput {
  tenantId: string
  projectId: string
  jobName: string
  baseModelVersionId: string
  baseModelTag: string
  datasetVersionId: string
  trainingType: FineTuningMethod
  epochs: number
  batchSize: number
  learningRate: number
  advancedConfig: FineTuningAdvancedConfig
  resourceId: string
  resourcePool: string
  estimatedGpuHours: number
  estimatedCostRange: string
  budgetLimit?: string
  outputModelName: string
  artifactType: "Full" | "Adapter" | "Merged"
}

export interface FineTuningTimelineItem {
  id: string
  status: FineTuningStatus
  at: string
  note: string
}

export interface FineTuningMetricPoint {
  step: number
  timestamp: string
  loss: number
  learningRate: number
}

export interface FineTuningLogItem {
  id: string
  timestamp: string
  level: "debug" | "info" | "warn" | "error"
  message: string
  instance: string
  revision: string
}

export interface FineTuningArtifactItem {
  artifactId: string
  artifactType: "Adapter" | "Merged" | "Checkpoint"
  outputModelVersionId: string
  storageUri: string
  ready: boolean
}

export interface FineTuningAuditItem {
  auditId: string
  action: string
  actor: string
  happenedAt: string
}

export interface FineTuningFailureReason {
  category: "OOM" | "DatasetFormat" | "TokenizerMismatch" | "ImagePull" | "Download" | "Unknown"
  message: string
  suggestion: string
}

export interface FineTuningJobSummary {
  jobId: string
  jobName: string
  baseModelVersionId: string
  datasetVersionId: string
  method: FineTuningMethod
  resourceSpec: string
  status: FineTuningStatus
  progressPercent: number
  estimatedCost: string
  createdAt: string
  createdBy: string
}

export interface FineTuningJobDetail extends FineTuningJobSummary {
  baseModelName: string
  datasetName: string
  resourcePool: string
  outputModelName: string
  artifactType: "Full" | "Adapter" | "Merged"
  hyperParameters: {
    epochs: number
    batchSize: number
    learningRate: number
    advancedConfig: FineTuningAdvancedConfig
  }
  timeline: FineTuningTimelineItem[]
  failureReason: FineTuningFailureReason | null
  metrics: FineTuningMetricPoint[]
  logs: FineTuningLogItem[]
  artifacts: FineTuningArtifactItem[]
  audits: FineTuningAuditItem[]
}

export interface FineTuningJobMutationInput {
  tenantId: string
  projectId: string
  jobId: string
}
