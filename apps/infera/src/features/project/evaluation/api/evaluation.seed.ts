import type { EvaluationRunDetail, EvaluationWizardOptions } from "../types"

interface EvaluationSeedStore {
  runs: EvaluationRunDetail[]
  wizardOptions: EvaluationWizardOptions
}

function createReportRows(): EvaluationRunDetail["reportRows"] {
  return [
    { segment: "overall", loss: 1.21, perplexity: 7.3, rougeL: 0.61, passRate: 0.93 },
    { segment: "reasoning", loss: 1.36, perplexity: 8.2, rougeL: 0.57, passRate: 0.9 },
    { segment: "tool-calling", loss: 1.08, perplexity: 6.9, rougeL: 0.68, passRate: 0.95 },
  ]
}

export function createEvaluationSeeds(projectId: string): EvaluationSeedStore {
  const wizardOptions: EvaluationWizardOptions = {
    models: [
      { modelVersionId: "mv-chat-103", label: "Chat LLM Base · latest", tag: "latest" },
      { modelVersionId: "mv-chat-ft-201", label: "chat-full-v2 · candidate", tag: "candidate" },
      { modelVersionId: "mv-rerank-12", label: "Tenant ReRanker · prod", tag: "prod" },
    ],
    datasets: [
      { datasetVersionId: "dv-chat-031", label: "chat-sft-zh-en", type: "dataset" },
      { datasetVersionId: "bm-gsm8k-v2", label: "GSM8K benchmark v2", type: "benchmark" },
      { datasetVersionId: "bm-rag-regression", label: "RAG 回归门禁集", type: "benchmark" },
    ],
    metrics: ["loss", "perplexity", "rouge-l", "bleu", "tool-call-accuracy", "latency-p95"],
  }

  const runs: EvaluationRunDetail[] = [
    {
      evalRunId: "eval-20260210-301",
      evalType: "gate",
      targetLabel: "mv-chat-ft-201",
      datasetLabel: "RAG 回归门禁集",
      metricsSummary: "loss=1.18 / rouge-l=0.64 / pass-rate=94%",
      status: "Succeeded",
      result: "Pass",
      createdAt: "2026-02-10T10:20:00Z",
      createdBy: "owner@mock.ai",
      modelVersionIdA: "mv-chat-ft-201",
      modelVersionIdB: null,
      reportMetrics: [
        { key: "loss", label: "Loss", value: "1.18", trend: "较上次 -0.08" },
        { key: "perplexity", label: "Perplexity", value: "7.1", trend: "较上次 -0.6" },
        { key: "rouge", label: "Rouge-L", value: "0.64", trend: "+0.03" },
        { key: "pass", label: "Pass Rate", value: "94%", trend: "+2%" },
      ],
      reportRows: createReportRows(),
      summaryConclusion: "本次评估通过全部门禁规则，建议进入 Promote 审批流程。",
      comparisonSamples: [],
      gateRules: [
        {
          ruleId: "gate-1",
          name: "Loss <= 1.3",
          threshold: "<= 1.30",
          actual: "1.18",
          passed: true,
          suggestion: "维持当前学习率和数据配比。",
        },
        {
          ruleId: "gate-2",
          name: "Rouge-L >= 0.60",
          threshold: ">= 0.60",
          actual: "0.64",
          passed: true,
          suggestion: "可继续扩展长上下文样本验证稳定性。",
        },
      ],
      canPromote: true,
      audits: [
        {
          auditId: "audit-eval-301",
          action: "evaluation.run.succeeded",
          actor: "eval-bot",
          happenedAt: "2026-02-10T10:42:00Z",
        },
      ],
    },
    {
      evalRunId: "eval-20260210-188",
      evalType: "comparison",
      targetLabel: "mv-chat-ft-201 vs mv-chat-103",
      datasetLabel: "chat-sft-zh-en",
      metricsSummary: "win-rate=58% / rouge-l=0.62",
      status: "Succeeded",
      result: "N/A",
      createdAt: "2026-02-10T07:05:00Z",
      createdBy: "ml.dev@mock.ai",
      modelVersionIdA: "mv-chat-ft-201",
      modelVersionIdB: "mv-chat-103",
      reportMetrics: [
        { key: "win-rate", label: "Win Rate", value: "58%", trend: "+6%" },
        { key: "rouge", label: "Rouge-L", value: "0.62" },
        { key: "latency", label: "Latency P95", value: "318ms", trend: "+18ms" },
      ],
      reportRows: createReportRows(),
      summaryConclusion: "候选模型在质量上领先，但延迟略有上升。",
      comparisonSamples: [
        {
          sampleId: "sample-1",
          prompt: "给我总结一下这段技术文档的重点。",
          responseA: "候选模型输出了三点重点，并补充了风险项。",
          responseB: "基线模型输出较短，缺少风险说明。",
          scoreA: 5,
          scoreB: 3,
          winner: "A",
          note: "A 版本结构更完整。",
        },
        {
          sampleId: "sample-2",
          prompt: "请写一个 Python 函数做二分查找。",
          responseA: "候选模型实现正确并覆盖边界条件。",
          responseB: "基线模型未处理空数组。",
          scoreA: 4,
          scoreB: 2,
          winner: "A",
          note: "A 版更健壮。",
        },
      ],
      gateRules: [],
      canPromote: false,
      audits: [
        {
          auditId: "audit-eval-188",
          action: "evaluation.run.review.completed",
          actor: "ml.dev@mock.ai",
          happenedAt: "2026-02-10T07:30:00Z",
        },
      ],
    },
    {
      evalRunId: "eval-20260210-099",
      evalType: "auto",
      targetLabel: "mv-rerank-12",
      datasetLabel: "GSM8K benchmark v2",
      metricsSummary: "loss=1.48 / perplexity=8.8",
      status: "Running",
      result: "N/A",
      createdAt: "2026-02-10T11:10:00Z",
      createdBy: "mlops@mock.ai",
      modelVersionIdA: "mv-rerank-12",
      modelVersionIdB: null,
      reportMetrics: [
        { key: "loss", label: "Loss", value: "1.48" },
        { key: "perplexity", label: "Perplexity", value: "8.8" },
      ],
      reportRows: createReportRows(),
      summaryConclusion: "评估仍在运行中，结果将自动更新。",
      comparisonSamples: [],
      gateRules: [],
      canPromote: false,
      audits: [
        {
          auditId: "audit-eval-099",
          action: "evaluation.run.started",
          actor: "eval-bot",
          happenedAt: "2026-02-10T11:10:00Z",
        },
      ],
    },
    {
      evalRunId: "eval-20260209-041",
      evalType: "gate",
      targetLabel: "mv-chat-ft-199",
      datasetLabel: "RAG 回归门禁集",
      metricsSummary: "loss=1.52 / rouge-l=0.55 / pass-rate=81%",
      status: "Failed",
      result: "Fail",
      createdAt: "2026-02-09T16:20:00Z",
      createdBy: "owner@mock.ai",
      modelVersionIdA: "mv-chat-ft-199",
      modelVersionIdB: null,
      reportMetrics: [
        { key: "loss", label: "Loss", value: "1.52", trend: "+0.14" },
        { key: "rouge", label: "Rouge-L", value: "0.55", trend: "-0.07" },
        { key: "pass", label: "Pass Rate", value: "81%", trend: "-12%" },
      ],
      reportRows: createReportRows(),
      summaryConclusion: "门禁未通过，建议调整训练数据质量并重新评估。",
      comparisonSamples: [],
      gateRules: [
        {
          ruleId: "gate-1",
          name: "Loss <= 1.30",
          threshold: "<= 1.30",
          actual: "1.52",
          passed: false,
          suggestion: "增加高质量指令样本并降低学习率。",
        },
        {
          ruleId: "gate-2",
          name: "Rouge-L >= 0.60",
          threshold: ">= 0.60",
          actual: "0.55",
          passed: false,
          suggestion: "增加 retrieval grounding 样本，强化摘要一致性。",
        },
      ],
      canPromote: false,
      audits: [
        {
          auditId: "audit-eval-041",
          action: "evaluation.run.failed",
          actor: "eval-bot",
          happenedAt: "2026-02-09T16:36:00Z",
        },
      ],
    },
  ]

  return {
    runs: runs.map((run) => ({
      ...run,
      targetLabel:
        projectId === "project-chat" ? run.targetLabel : `${run.targetLabel} (${projectId})`,
    })),
    wizardOptions,
  }
}
