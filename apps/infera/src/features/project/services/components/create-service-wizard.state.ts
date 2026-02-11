import type {
  AutoscalingMetricType,
  ServiceEnvironment,
  ServiceNetworkExposure,
  ServiceRuntime,
} from "../types"

export interface CreateServiceWizardState {
  name: string
  description: string
  env: ServiceEnvironment
  networkExposure: ServiceNetworkExposure
  ipAllowlistInput: string
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
  estimatedMonthlyCost: string
  autoscalingMetric: AutoscalingMetricType
  minReplicas: number
  maxReplicas: number
  scaleDownDelaySeconds: number
  scaleToZero: boolean
}

export const INITIAL_CREATE_SERVICE_WIZARD_STATE: CreateServiceWizardState = {
  name: "",
  description: "",
  env: "Dev",
  networkExposure: "Private",
  ipAllowlistInput: "",
  modelId: "",
  modelTag: "latest",
  resolvedModelVersionId: "",
  runtime: "vLLM",
  runtimeParams: {},
  resourceProfileId: "",
  gpuModel: "A10",
  gpuCount: 1,
  cpuRequest: "4",
  cpuLimit: "8",
  memoryRequest: "16Gi",
  memoryLimit: "32Gi",
  estimatedMonthlyCost: "-",
  autoscalingMetric: "Concurrency",
  minReplicas: 0,
  maxReplicas: 2,
  scaleDownDelaySeconds: 600,
  scaleToZero: true,
}

export function splitAllowlist(input: string) {
  return input
    .split(/\n|,|;/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}
