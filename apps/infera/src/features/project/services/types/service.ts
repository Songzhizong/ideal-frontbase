export type ServiceEnvironment = "Dev" | "Test" | "Prod"

export type ServiceCurrentState =
  | "Pending"
  | "Downloading"
  | "Starting"
  | "Ready"
  | "Inactive"
  | "Failed"

export type ServiceDesiredState = "Active" | "Inactive"

export type ServiceRuntime = "vLLM" | "TGI" | "Triton" | "HF"

export type ServiceNetworkExposure = "Public" | "Private"

export type AutoscalingMetricType = "Concurrency" | "QPS"

export type ServiceRevisionStatus = "Pending" | "Ready" | "Failed"

export interface ServiceFilterState {
  q: string
  env: ServiceEnvironment | "All"
  state: ServiceCurrentState | "All"
  runtime: ServiceRuntime | "All"
  model: string | "All"
  onlyInactive: "all" | "yes" | "no"
  errorRateRange: "all" | "lt1" | "1to5" | "gt5"
}

export interface ServiceReplicasSummary {
  min: number
  max: number
  current: number
}

export interface ServiceOneHourStats {
  qps: number
  p95Ms: number
  errorRate: number
}

export interface ProjectServiceSummary {
  serviceId: string
  name: string
  description: string
  env: ServiceEnvironment
  currentState: ServiceCurrentState
  desiredState: ServiceDesiredState
  endpoint: string
  modelVersionId: string
  runtime: ServiceRuntime
  replicas: ServiceReplicasSummary
  metrics1h: ServiceOneHourStats
  updatedAt: string
}

export interface ServiceModelAssetOption {
  modelId: string
  modelName: string
  owner: "system" | "tenant" | "project"
  tagOptions: string[]
  defaultTag: string
  resolvedVersionMap: Record<string, string>
  metadata: {
    parameterSize: string
    contextLength: number
    license: string
    quantization: string
  }
}

export interface ServiceRuntimeOption {
  runtime: ServiceRuntime
  label: string
  recommendation: string
  defaultParams: Record<string, string>
}

export interface ServiceResourceProfileOption {
  profileId: string
  label: string
  gpuModel: string
  gpuCount: number
  cpuRequest: string
  cpuLimit: string
  memoryRequest: string
  memoryLimit: string
  estimatedMonthlyCost: string
  riskHints: string[]
}

export interface ServiceWizardOptions {
  modelAssets: ServiceModelAssetOption[]
  runtimeOptions: ServiceRuntimeOption[]
  resourceProfiles: ServiceResourceProfileOption[]
  environmentOptions: ServiceEnvironment[]
  prodPolicy: {
    scaleToZeroAllowed: boolean
    note: string
  }
}

export interface CreateServiceInput {
  tenantId: string
  projectId: string
  name: string
  description: string
  env: ServiceEnvironment
  networkExposure: ServiceNetworkExposure
  ipAllowlist: string[]
  apiProtocol: "OpenAI-compatible"
  modelId: string
  modelTag: string
  resolvedModelVersionId: string
  runtime: ServiceRuntime
  runtimeParams: Record<string, string>
  resourceProfileId: string
  gpuModel: string
  gpuCount: number
  cpuRequest: string
  cpuLimit: string
  memoryRequest: string
  memoryLimit: string
  autoscalingMetric: AutoscalingMetricType
  minReplicas: number
  maxReplicas: number
  scaleDownDelaySeconds: number
  scaleToZero: boolean
  estimatedMonthlyCost: string
}

export interface ServiceStatusStep {
  state: "Pending" | "Downloading" | "Starting" | "Ready"
  note: string
  durationSeconds: number
  at: string
}

export interface ServiceRuntimeConfig {
  runtime: ServiceRuntime
  imageDigest: string
  params: Record<string, string>
}

export interface ServiceResourceSpec {
  gpuModel: string
  gpuCount: number
  cpuRequest: string
  cpuLimit: string
  memoryRequest: string
  memoryLimit: string
}

export interface ServiceAutoscalingConfig {
  metricType: AutoscalingMetricType
  minReplicas: number
  maxReplicas: number
  scaleDownDelaySeconds: number
  scaleToZero: boolean
}

export interface ServiceTrafficItem {
  revisionId: string
  weight: number
}

export interface ServiceRevisionItem {
  revisionId: string
  createdAt: string
  createdBy: string
  modelVersionId: string
  runtime: ServiceRuntime
  imageDigest: string
  resourceSpecSummary: string
  autoscalingSummary: string
  configHash: string
  status: ServiceRevisionStatus
  trafficWeight: number
  resourceSpec: ServiceResourceSpec
  autoscaling: ServiceAutoscalingConfig
  configSnapshot: {
    runtime: ServiceRuntimeConfig
    resources: ServiceResourceSpec
    autoscaling: ServiceAutoscalingConfig
  }
}

export interface ServiceEventItem {
  eventId: string
  type: "deploy" | "autoscaling" | "cold_start" | "traffic"
  title: string
  description: string
  happenedAt: string
}

export interface ServiceMetricPoint {
  timestamp: string
  qps: number
  p95Ms: number
  p99Ms: number
  successRate: number
  errorRate: number
  ttftMs: number
  tpotMs: number
  tokensPerSec: number
  gpuUtil: number
  gpuMemoryGb: number
  concurrency: number
  coldStartCount: number
  coldStartLatencyMs: number
}

export interface ServiceLogItem {
  id: string
  timestamp: string
  level: "debug" | "info" | "warn" | "error"
  message: string
  instance: string
  revision: string
}

export interface ServicePlaygroundConfig {
  modelVersionId: string
  revisionId: string
  temperature: number
  topP: number
  maxTokens: number
  stop: string
  presencePenalty: number
  stream: boolean
  recordPromptResponse: boolean
}

export interface ServiceAuditItem {
  auditId: string
  action: string
  actor: string
  happenedAt: string
}

export interface ServicePendingTimeoutInfo {
  enabled: boolean
  reason: string
  recommendations: string[]
}

export interface ProjectServiceDetail extends ProjectServiceSummary {
  networkExposure: ServiceNetworkExposure
  ipAllowlist: string[]
  apiProtocol: "OpenAI-compatible"
  statusSteps: ServiceStatusStep[]
  pendingTimeout: ServicePendingTimeoutInfo
  runtimeConfig: ServiceRuntimeConfig
  resourceSpec: ServiceResourceSpec
  autoscaling: ServiceAutoscalingConfig
  trafficSummary: ServiceTrafficItem[]
  revisions: ServiceRevisionItem[]
  events: ServiceEventItem[]
  metrics: ServiceMetricPoint[]
  logs: ServiceLogItem[]
  playgroundConfig: ServicePlaygroundConfig
  playgroundTokenUsage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  compliance: {
    prodRecordLocked: boolean
    notice: string
  }
  audits: ServiceAuditItem[]
}

export interface ServiceMutationInput {
  tenantId: string
  projectId: string
  serviceId: string
}

export interface ToggleDesiredStateInput extends ServiceMutationInput {
  desiredState: ServiceDesiredState
}

export interface DeleteServiceInput extends ServiceMutationInput {
  confirmName: string
}

export interface UpdateTrafficInput extends ServiceMutationInput {
  weights: ServiceTrafficItem[]
}

export interface DeployRevisionInput extends ServiceMutationInput {
  modelVersionId: string
  runtime: ServiceRuntime
  resourceSpec: ServiceResourceSpec
  autoscaling: ServiceAutoscalingConfig
  strategy: "full" | "keep_zero" | "canary"
  canaryWeight?: number
}

export interface RollbackServiceInput extends ServiceMutationInput {
  targetRevisionId: string
}

export interface UpdateServiceSettingsInput extends ServiceMutationInput {
  name: string
  description: string
  networkExposure: ServiceNetworkExposure
  ipAllowlist: string[]
}

export interface PlaygroundMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
  tokens: number
}

export interface PlaygroundRunResult {
  request: string
  response: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  message: PlaygroundMessage
}
