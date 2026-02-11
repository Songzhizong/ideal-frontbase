export interface CreateJobWizardState {
  jobName: string
  baseModelVersionId: string
  baseModelTag: string
  datasetVersionId: string
  trainingType: "LoRA" | "Full"
  epochs: number
  batchSize: number
  learningRate: number
  gradientAccumulation: number
  warmupSteps: number
  weightDecay: number
  loraR: number
  loraAlpha: number
  loraDropout: number
  resourceId: string
  budgetLimit: string
  outputModelName: string
  artifactType: "Full" | "Adapter" | "Merged"
}

export const INITIAL_CREATE_JOB_STATE: CreateJobWizardState = {
  jobName: "",
  baseModelVersionId: "",
  baseModelTag: "latest",
  datasetVersionId: "",
  trainingType: "LoRA",
  epochs: 3,
  batchSize: 64,
  learningRate: 0.0001,
  gradientAccumulation: 8,
  warmupSteps: 100,
  weightDecay: 0.01,
  loraR: 64,
  loraAlpha: 32,
  loraDropout: 0.05,
  resourceId: "",
  budgetLimit: "",
  outputModelName: "",
  artifactType: "Adapter",
}
