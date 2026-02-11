import { z } from "zod"
import type {
  CreateEvaluationRunInput,
  EvaluationFilterState,
  EvaluationResult,
  EvaluationRunDetail,
  EvaluationRunMutationInput,
  EvaluationRunSummary,
  UpdateEvaluationReviewInput,
} from "../types"
import { createEvaluationSeeds } from "./evaluation.seed"

interface EvaluationStore {
  runs: EvaluationRunDetail[]
  wizardOptions: ReturnType<typeof createEvaluationSeeds>["wizardOptions"]
}

const store = new Map<string, EvaluationStore>()

const CreateEvaluationInputSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  evalType: z.enum(["auto", "comparison", "gate"]),
  modelVersionIdA: z.string().trim().min(1),
  modelVersionIdB: z.string().trim().optional(),
  datasetVersionId: z.string().trim().min(1),
  selectedMetrics: z.array(z.string().trim().min(1)).min(1),
  notes: z.string().trim().optional(),
})

const EvaluationMutationSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  evalRunId: z.string().trim().min(1),
})

const UpdateEvaluationReviewSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
  evalRunId: z.string().trim().min(1),
  sampleId: z.string().trim().min(1),
  scoreA: z.number().min(1).max(5),
  scoreB: z.number().min(1).max(5),
  winner: z.enum(["A", "B", "Tie"]),
  note: z.string().trim().max(200),
})

function getStoreKey(tenantId: string, projectId: string) {
  return `${tenantId}:${projectId}`
}

function ensureStore(tenantId: string, projectId: string) {
  const key = getStoreKey(tenantId, projectId)
  const existing = store.get(key)
  if (existing) {
    return existing
  }
  const seed = createEvaluationSeeds(projectId)
  store.set(key, seed)
  return seed
}

function cloneRun(run: EvaluationRunDetail): EvaluationRunDetail {
  return {
    ...run,
    reportMetrics: run.reportMetrics.map((item) => ({ ...item })),
    reportRows: run.reportRows.map((item) => ({ ...item })),
    comparisonSamples: run.comparisonSamples.map((item) => ({ ...item })),
    gateRules: run.gateRules.map((item) => ({ ...item })),
    audits: run.audits.map((item) => ({ ...item })),
  }
}

function toSummary(run: EvaluationRunDetail): EvaluationRunSummary {
  return {
    evalRunId: run.evalRunId,
    evalType: run.evalType,
    targetLabel: run.targetLabel,
    datasetLabel: run.datasetLabel,
    metricsSummary: run.metricsSummary,
    status: run.status,
    result: run.result,
    createdAt: run.createdAt,
    createdBy: run.createdBy,
  }
}

function appendAudit(run: EvaluationRunDetail, action: string, actor = "current.user@mock.ai") {
  run.audits.unshift({
    auditId: `audit-${Math.random().toString(36).slice(2, 10)}`,
    action,
    actor,
    happenedAt: new Date().toISOString(),
  })
}

function resolveResultByGate(run: EvaluationRunDetail): EvaluationResult {
  if (run.evalType !== "gate") {
    return "N/A"
  }
  if (run.gateRules.length === 0) {
    return "N/A"
  }
  return run.gateRules.every((item) => item.passed) ? "Pass" : "Fail"
}

function getRunOrThrow(input: EvaluationRunMutationInput) {
  const payload = EvaluationMutationSchema.parse(input)
  const run = ensureStore(payload.tenantId, payload.projectId).runs.find(
    (item) => item.evalRunId === payload.evalRunId,
  )
  if (!run) {
    throw new Error("评估任务不存在")
  }
  return run
}

export async function getProjectEvaluationRuns(
  tenantId: string,
  projectId: string,
  filters: EvaluationFilterState,
) {
  const runs = ensureStore(tenantId, projectId).runs
  const filtered = runs.filter((run) => {
    if (filters.status !== "All" && run.status !== filters.status) {
      return false
    }
    if (filters.type !== "All" && run.evalType !== filters.type) {
      return false
    }
    if (filters.result !== "All" && run.result !== filters.result) {
      return false
    }
    if (filters.q.trim()) {
      const keyword = filters.q.trim().toLowerCase()
      const target = `${run.evalRunId} ${run.targetLabel} ${run.datasetLabel}`
      if (!target.toLowerCase().includes(keyword)) {
        return false
      }
    }
    return true
  })

  return filtered.map((run) => toSummary(cloneRun(run)))
}

export async function getProjectEvaluationRunDetail(
  tenantId: string,
  projectId: string,
  evalRunId: string,
) {
  const run = ensureStore(tenantId, projectId).runs.find((item) => item.evalRunId === evalRunId)
  if (!run) {
    throw new Error("评估任务不存在")
  }
  return cloneRun(run)
}

export async function getEvaluationWizardOptions(tenantId: string, projectId: string) {
  return structuredClone(ensureStore(tenantId, projectId).wizardOptions)
}

export async function createEvaluationRun(input: CreateEvaluationRunInput) {
  const payload = CreateEvaluationInputSchema.parse(input)
  const currentStore = ensureStore(payload.tenantId, payload.projectId)
  const dataset = currentStore.wizardOptions.datasets.find(
    (item) => item.datasetVersionId === payload.datasetVersionId,
  )

  if (!dataset) {
    throw new Error("未找到对应评估数据集")
  }

  const now = new Date().toISOString()
  const nextRun: EvaluationRunDetail = {
    evalRunId: `eval-${Math.random().toString(36).slice(2, 10)}`,
    evalType: payload.evalType,
    targetLabel:
      payload.evalType === "comparison"
        ? `${payload.modelVersionIdA} vs ${payload.modelVersionIdB ?? "-"}`
        : payload.modelVersionIdA,
    datasetLabel: dataset.label,
    metricsSummary: payload.selectedMetrics.join(" / "),
    status: "Running",
    result: payload.evalType === "gate" ? "Fail" : "N/A",
    createdAt: now,
    createdBy: "current.user@mock.ai",
    modelVersionIdA: payload.modelVersionIdA,
    modelVersionIdB: payload.evalType === "comparison" ? (payload.modelVersionIdB ?? null) : null,
    reportMetrics: payload.selectedMetrics.slice(0, 4).map((metric, index) => ({
      key: metric,
      label: metric,
      value: `${(Math.random() * 0.8 + 0.2 + index * 0.1).toFixed(2)}`,
    })),
    reportRows: [
      { segment: "overall", loss: 1.33, perplexity: 7.9, rougeL: 0.58, passRate: 0.89 },
      { segment: "tool-calling", loss: 1.27, perplexity: 7.2, rougeL: 0.63, passRate: 0.92 },
    ],
    summaryConclusion: payload.notes?.trim() || "评估任务已创建，等待执行完成。",
    comparisonSamples:
      payload.evalType === "comparison"
        ? [
            {
              sampleId: "sample-new-1",
              prompt: "示例 Prompt",
              responseA: "候选模型输出",
              responseB: "基线模型输出",
              winner: "Tie",
              note: "待人工评分",
            },
          ]
        : [],
    gateRules:
      payload.evalType === "gate"
        ? [
            {
              ruleId: "gate-new-1",
              name: "Loss <= 1.30",
              threshold: "<= 1.30",
              actual: "running",
              passed: false,
              suggestion: "任务运行中，待结果产出后判断。",
            },
          ]
        : [],
    canPromote: false,
    audits: [
      {
        auditId: `audit-${Math.random().toString(36).slice(2, 10)}`,
        action: "evaluation.run.create",
        actor: "current.user@mock.ai",
        happenedAt: now,
      },
    ],
  }

  currentStore.runs.unshift(nextRun)
  return cloneRun(nextRun)
}

export async function rerunEvaluationRun(input: EvaluationRunMutationInput) {
  const run = getRunOrThrow(input)
  run.status = "Running"
  run.result = run.evalType === "gate" ? "Fail" : "N/A"
  run.canPromote = false
  appendAudit(run, "evaluation.run.rerun")
  return cloneRun(run)
}

export async function updateEvaluationReview(input: UpdateEvaluationReviewInput) {
  const payload = UpdateEvaluationReviewSchema.parse(input)
  const run = getRunOrThrow(payload)
  const sample = run.comparisonSamples.find((item) => item.sampleId === payload.sampleId)
  if (!sample) {
    throw new Error("评估样本不存在")
  }
  sample.scoreA = payload.scoreA
  sample.scoreB = payload.scoreB
  sample.winner = payload.winner
  sample.note = payload.note
  appendAudit(run, "evaluation.sample.review.update")
  return cloneRun(run)
}

export async function promoteEvaluationResult(input: EvaluationRunMutationInput) {
  const run = getRunOrThrow(input)
  const result = resolveResultByGate(run)
  if (run.evalType !== "gate") {
    throw new Error("仅门禁评估支持 Promote")
  }
  if (result !== "Pass") {
    throw new Error("门禁未通过，当前不允许 Promote")
  }
  run.canPromote = true
  appendAudit(run, "evaluation.gate.promote")
  return cloneRun(run)
}
