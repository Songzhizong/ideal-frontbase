export type EvaluationStatus = "Running" | "Succeeded" | "Failed"

export type EvaluationType = "auto" | "comparison" | "gate"

export type EvaluationResult = "Pass" | "Fail" | "N/A"

export interface EvaluationFilterState {
  q: string
  status: EvaluationStatus | "All"
  type: EvaluationType | "All"
  result: EvaluationResult | "All"
}

export interface EvaluationModelOption {
  modelVersionId: string
  label: string
  tag?: string
}

export interface EvaluationDatasetOption {
  datasetVersionId: string
  label: string
  type: "dataset" | "benchmark"
}

export interface EvaluationWizardOptions {
  models: EvaluationModelOption[]
  datasets: EvaluationDatasetOption[]
  metrics: string[]
}

export interface CreateEvaluationRunInput {
  tenantId: string
  projectId: string
  evalType: EvaluationType
  modelVersionIdA: string
  modelVersionIdB?: string
  datasetVersionId: string
  selectedMetrics: string[]
  notes?: string
}

export interface EvaluationRunSummary {
  evalRunId: string
  evalType: EvaluationType
  targetLabel: string
  datasetLabel: string
  metricsSummary: string
  status: EvaluationStatus
  result: EvaluationResult
  createdAt: string
  createdBy: string
}

export interface EvaluationReportMetric {
  key: string
  label: string
  value: string
  trend?: string
}

export interface EvaluationReportRow {
  segment: string
  loss: number
  perplexity: number
  rougeL: number
  passRate: number
}

export interface EvaluationCompareSample {
  sampleId: string
  prompt: string
  responseA: string
  responseB: string
  scoreA?: number
  scoreB?: number
  winner?: "A" | "B" | "Tie"
  note?: string
}

export interface EvaluationGateRule {
  ruleId: string
  name: string
  threshold: string
  actual: string
  passed: boolean
  suggestion: string
}

export interface EvaluationAuditItem {
  auditId: string
  action: string
  actor: string
  happenedAt: string
}

export interface EvaluationRunDetail extends EvaluationRunSummary {
  modelVersionIdA: string
  modelVersionIdB: string | null
  reportMetrics: EvaluationReportMetric[]
  reportRows: EvaluationReportRow[]
  summaryConclusion: string
  comparisonSamples: EvaluationCompareSample[]
  gateRules: EvaluationGateRule[]
  canPromote: boolean
  audits: EvaluationAuditItem[]
}

export interface EvaluationRunMutationInput {
  tenantId: string
  projectId: string
  evalRunId: string
}

export interface UpdateEvaluationReviewInput {
  tenantId: string
  projectId: string
  evalRunId: string
  sampleId: string
  scoreA: number
  scoreB: number
  winner: "A" | "B" | "Tie"
  note: string
}
