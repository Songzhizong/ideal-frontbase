import type {
  FineTuningJobDetail,
  FineTuningMetricPoint,
  FineTuningStatus,
  FineTuningTimelineItem,
  FineTuningWizardOptions,
} from "../types"

interface FineTuningSeedStore {
  jobs: FineTuningJobDetail[]
  wizardOptions: FineTuningWizardOptions
}

function buildMetricSeries(baseLoss: number, steps: number, lr: number): FineTuningMetricPoint[] {
  const points: FineTuningMetricPoint[] = []
  for (let index = 0; index < steps; index += 1) {
    const decay = Math.max(0.25, 1 - index / (steps * 1.15))
    const jitter = ((index % 4) - 1.5) * 0.008
    points.push({
      step: index + 1,
      timestamp: new Date(Date.UTC(2026, 1, 10, 2, index * 2)).toISOString(),
      loss: Number((baseLoss * decay + jitter).toFixed(4)),
      learningRate: Number((lr * (1 - index / (steps * 1.5))).toFixed(8)),
    })
  }
  return points
}

function buildTimeline(status: FineTuningStatus, createdAt: string) {
  const timeline: FineTuningTimelineItem[] = [
    {
      id: "queued",
      status: "Queued" as const,
      at: createdAt,
      note: "任务进入调度队列，等待资源分配。",
    },
  ]

  if (status !== "Queued") {
    timeline.push({
      id: "running",
      status: "Running" as const,
      at: "2026-02-10T03:10:00Z",
      note: "训练容器启动完成，开始执行训练步骤。",
    })
  }

  if (status === "Succeeded") {
    timeline.push({
      id: "succeeded",
      status: "Succeeded" as const,
      at: "2026-02-10T04:10:00Z",
      note: "训练完成，产物已写入模型仓库。",
    })
  }

  if (status === "Failed") {
    timeline.push({
      id: "failed",
      status: "Failed" as const,
      at: "2026-02-10T03:42:00Z",
      note: "训练失败，已生成失败诊断。",
    })
  }

  if (status === "Canceled") {
    timeline.push({
      id: "canceled",
      status: "Canceled" as const,
      at: "2026-02-10T03:20:00Z",
      note: "任务已由用户取消。",
    })
  }

  return timeline
}

function buildLogs(jobId: string, status: FineTuningStatus) {
  const baseLogs = [
    {
      id: `${jobId}-1`,
      timestamp: "2026-02-10T03:09:15Z",
      level: "info" as const,
      message: "Allocated worker pod and mounting dataset shard.",
      instance: "ft-worker-0",
      revision: "rev-ft-01",
    },
    {
      id: `${jobId}-2`,
      timestamp: "2026-02-10T03:10:03Z",
      level: "info" as const,
      message: "Tokenizer and model checkpoints initialized.",
      instance: "ft-worker-0",
      revision: "rev-ft-01",
    },
  ]

  if (status === "Failed") {
    return [
      ...baseLogs,
      {
        id: `${jobId}-3`,
        timestamp: "2026-02-10T03:41:44Z",
        level: "error" as const,
        message: "CUDA OOM when allocating attention kv cache.",
        instance: "ft-worker-0",
        revision: "rev-ft-01",
      },
    ]
  }

  if (status === "Succeeded") {
    return [
      ...baseLogs,
      {
        id: `${jobId}-3`,
        timestamp: "2026-02-10T04:09:58Z",
        level: "info" as const,
        message: "Artifact upload complete. Final checkpoint promoted.",
        instance: "ft-worker-0",
        revision: "rev-ft-01",
      },
    ]
  }

  return baseLogs
}

export function createFineTuningSeeds(projectId: string): FineTuningSeedStore {
  const wizardOptions: FineTuningWizardOptions = {
    baseModels: [
      {
        modelId: "model-chat-base",
        modelName: "Chat LLM Base",
        tag: "latest",
        resolvedVersionId: "mv-chat-103",
        metadata: {
          parameterSize: "34B",
          contextLength: 128000,
          license: "Apache-2.0",
          quantization: "FP16",
        },
      },
      {
        modelId: "model-tenant-rerank",
        modelName: "Tenant ReRanker",
        tag: "prod",
        resolvedVersionId: "mv-rerank-12",
        metadata: {
          parameterSize: "6B",
          contextLength: 16000,
          license: "Apache-2.0",
          quantization: "BF16",
        },
      },
    ],
    datasets: [
      {
        datasetId: "dataset-chat-sft",
        datasetName: "chat-sft-zh-en",
        datasetVersionId: "dv-chat-031",
        rows: 92000,
        schemaFields: ["messages", "tools", "meta"],
        tokenStats: {
          promptTokens: 24600000,
          totalTokens: 48200000,
          avgTokensPerRow: 524,
        },
        riskHints: [],
      },
      {
        datasetId: "dataset-rag-preference",
        datasetName: "rag-preference-pairs",
        datasetVersionId: "dv-rag-020",
        rows: 18000,
        schemaFields: ["prompt", "chosen", "rejected"],
        tokenStats: {
          promptTokens: 4200000,
          totalTokens: 9300000,
          avgTokensPerRow: 516,
        },
        riskHints: ["Tokenizer mismatch：目标模型 tokenizer=v2，数据集编码版本=v1"],
      },
    ],
    resources: [
      {
        resourceId: "res-a100x8",
        label: "8 x A100 80G",
        gpuModel: "A100 80G",
        gpuCount: 8,
        resourcePool: "prod-train-pool",
        estimatedGpuHours: 6.8,
        estimatedCostRange: "¥ 3,800 - ¥ 4,500",
      },
      {
        resourceId: "res-h100x4",
        label: "4 x H100 80G",
        gpuModel: "H100 80G",
        gpuCount: 4,
        resourcePool: "premium-train-pool",
        estimatedGpuHours: 4.2,
        estimatedCostRange: "¥ 4,100 - ¥ 5,200",
      },
    ],
  }

  const jobs: FineTuningJobDetail[] = [
    {
      jobId: "ft-job-20260210-001",
      jobName: "chat-lora-sft-v4",
      baseModelVersionId: "mv-chat-103",
      baseModelName: "Chat LLM Base",
      datasetVersionId: "dv-chat-031",
      datasetName: "chat-sft-zh-en",
      method: "LoRA",
      resourceSpec: "8x A100 80G",
      resourcePool: "prod-train-pool",
      status: "Running",
      progressPercent: 46,
      estimatedCost: "¥ 4,120",
      createdAt: "2026-02-10T03:08:00Z",
      createdBy: "ml.dev@mock.ai",
      outputModelName: `${projectId}-chat-lora-v4`,
      artifactType: "Adapter",
      hyperParameters: {
        epochs: 4,
        batchSize: 64,
        learningRate: 0.0001,
        advancedConfig: {
          gradientAccumulation: 8,
          warmupSteps: 120,
          weightDecay: 0.01,
          loraR: 64,
          loraAlpha: 32,
          loraDropout: 0.05,
        },
      },
      timeline: buildTimeline("Running", "2026-02-10T03:08:00Z"),
      failureReason: null,
      metrics: buildMetricSeries(2.2, 50, 0.0001),
      logs: buildLogs("ft-job-20260210-001", "Running"),
      artifacts: [],
      audits: [
        {
          auditId: "audit-ft-001",
          action: "fine_tuning.job.create",
          actor: "ml.dev@mock.ai",
          happenedAt: "2026-02-10T03:08:00Z",
        },
      ],
    },
    {
      jobId: "ft-job-20260209-008",
      jobName: "chat-full-finetune-prod",
      baseModelVersionId: "mv-chat-103",
      baseModelName: "Chat LLM Base",
      datasetVersionId: "dv-chat-031",
      datasetName: "chat-sft-zh-en",
      method: "Full",
      resourceSpec: "4x H100 80G",
      resourcePool: "premium-train-pool",
      status: "Succeeded",
      progressPercent: 100,
      estimatedCost: "¥ 5,060",
      createdAt: "2026-02-09T20:00:00Z",
      createdBy: "owner@mock.ai",
      outputModelName: `${projectId}-chat-full-v2`,
      artifactType: "Full",
      hyperParameters: {
        epochs: 2,
        batchSize: 32,
        learningRate: 0.00002,
        advancedConfig: {
          gradientAccumulation: 4,
          warmupSteps: 60,
          weightDecay: 0.01,
        },
      },
      timeline: buildTimeline("Succeeded", "2026-02-09T20:00:00Z"),
      failureReason: null,
      metrics: buildMetricSeries(1.6, 36, 0.00002),
      logs: buildLogs("ft-job-20260209-008", "Succeeded"),
      artifacts: [
        {
          artifactId: "artifact-ft-008-a",
          artifactType: "Merged",
          outputModelVersionId: "mv-chat-ft-201",
          storageUri: "oss://infera/project-chat/models/mv-chat-ft-201",
          ready: true,
        },
      ],
      audits: [
        {
          auditId: "audit-ft-008",
          action: "fine_tuning.job.succeeded",
          actor: "trainer-bot",
          happenedAt: "2026-02-10T04:10:00Z",
        },
      ],
    },
    {
      jobId: "ft-job-20260209-005",
      jobName: "rag-lora-pref-v1",
      baseModelVersionId: "mv-rerank-12",
      baseModelName: "Tenant ReRanker",
      datasetVersionId: "dv-rag-020",
      datasetName: "rag-preference-pairs",
      method: "LoRA",
      resourceSpec: "8x A100 80G",
      resourcePool: "prod-train-pool",
      status: "Failed",
      progressPercent: 61,
      estimatedCost: "¥ 2,760",
      createdAt: "2026-02-09T15:30:00Z",
      createdBy: "mlops@mock.ai",
      outputModelName: `${projectId}-rerank-lora-v1`,
      artifactType: "Adapter",
      hyperParameters: {
        epochs: 3,
        batchSize: 128,
        learningRate: 0.00015,
        advancedConfig: {
          gradientAccumulation: 16,
          warmupSteps: 200,
          weightDecay: 0.02,
          loraR: 32,
          loraAlpha: 16,
          loraDropout: 0.08,
        },
      },
      timeline: buildTimeline("Failed", "2026-02-09T15:30:00Z"),
      failureReason: {
        category: "OOM",
        message: "训练过程中显存峰值超出限制，worker 在 step 1842 退出。",
        suggestion: "建议减小 batch size 或切换更高显存 GPU 规格后重试。",
      },
      metrics: buildMetricSeries(2.8, 28, 0.00015),
      logs: buildLogs("ft-job-20260209-005", "Failed"),
      artifacts: [],
      audits: [
        {
          auditId: "audit-ft-005",
          action: "fine_tuning.job.failed",
          actor: "trainer-bot",
          happenedAt: "2026-02-10T03:42:00Z",
        },
      ],
    },
    {
      jobId: "ft-job-20260210-010",
      jobName: "chat-ablation-exp",
      baseModelVersionId: "mv-chat-103",
      baseModelName: "Chat LLM Base",
      datasetVersionId: "dv-chat-031",
      datasetName: "chat-sft-zh-en",
      method: "LoRA",
      resourceSpec: "8x A100 80G",
      resourcePool: "prod-train-pool",
      status: "Queued",
      progressPercent: 0,
      estimatedCost: "¥ 3,920",
      createdAt: "2026-02-10T06:20:00Z",
      createdBy: "owner@mock.ai",
      outputModelName: `${projectId}-chat-ablation-v1`,
      artifactType: "Adapter",
      hyperParameters: {
        epochs: 1,
        batchSize: 32,
        learningRate: 0.00008,
        advancedConfig: {
          gradientAccumulation: 4,
          warmupSteps: 20,
          weightDecay: 0.01,
          loraR: 32,
          loraAlpha: 16,
          loraDropout: 0.05,
        },
      },
      timeline: buildTimeline("Queued", "2026-02-10T06:20:00Z"),
      failureReason: null,
      metrics: [],
      logs: [],
      artifacts: [],
      audits: [
        {
          auditId: "audit-ft-010",
          action: "fine_tuning.job.queued",
          actor: "owner@mock.ai",
          happenedAt: "2026-02-10T06:20:00Z",
        },
      ],
    },
  ]

  return {
    jobs,
    wizardOptions,
  }
}
