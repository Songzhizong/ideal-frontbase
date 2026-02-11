import type { ProjectDatasetItem } from "../types/project-datasets"

export function createProjectDatasetSeeds(
  _tenantId: string,
  projectId: string,
): ProjectDatasetItem[] {
  const seeds: ProjectDatasetItem[] = [
    {
      datasetId: "ds-chat-train",
      name: "chat-train-main",
      latestDatasetVersionId: "dv-chat-003",
      rows: 182030,
      tokenStats: {
        promptTokens: 8450021,
        totalTokens: 15430021,
        avgTokensPerRow: 84,
      },
      schemaFieldCount: 4,
      usedBy: 2,
      updatedAt: "2026-02-10T10:12:00Z",
      versions: [
        {
          datasetVersionId: "dv-chat-003",
          sha256: "sha256-dataset-chat-003",
          rows: 182030,
          schema: {
            prompt: "string",
            response: "string",
            context: "string",
            source: "string",
          },
          tokenStats: {
            promptTokens: 8450021,
            totalTokens: 15430021,
            avgTokensPerRow: 84,
          },
          createdAt: "2026-02-10T10:12:00Z",
          usedByCount: 2,
          storageUri: "oss://mock-bucket/datasets/chat-train/dv-chat-003.jsonl",
          usage: [
            {
              usageType: "Fine-tuning",
              targetName: "ft-job-229",
              createdAt: "2026-02-10T11:00:00Z",
            },
            {
              usageType: "Evaluation",
              targetName: "eval-run-9001",
              createdAt: "2026-02-10T12:30:00Z",
            },
          ],
        },
      ],
      previewSamples: [
        '{"prompt":"请总结这段日志","response":"..."}',
        '{"prompt":"帮我生成部署脚本","response":"..."}',
      ],
      audits: [
        {
          auditId: "audit-ds-1001",
          action: "dataset.version.upload",
          actor: "ml.dev@mock.ai",
          happenedAt: "2026-02-10T10:12:00Z",
        },
      ],
    },
    {
      datasetId: "ds-rag-eval",
      name: "rag-eval-set",
      latestDatasetVersionId: "dv-rag-011",
      rows: 20311,
      tokenStats: {
        promptTokens: 331200,
        totalTokens: 760031,
        avgTokensPerRow: 37,
      },
      schemaFieldCount: 3,
      usedBy: 1,
      updatedAt: "2026-02-08T14:20:00Z",
      versions: [
        {
          datasetVersionId: "dv-rag-011",
          sha256: "sha256-dataset-rag-011",
          rows: 20311,
          schema: {
            question: "string",
            reference_answer: "string",
            context: "string",
          },
          tokenStats: {
            promptTokens: 331200,
            totalTokens: 760031,
            avgTokensPerRow: 37,
          },
          createdAt: "2026-02-08T14:20:00Z",
          usedByCount: 1,
          storageUri: "oss://mock-bucket/datasets/rag-eval/dv-rag-011.jsonl",
          usage: [
            {
              usageType: "Evaluation",
              targetName: "eval-run-8791",
              createdAt: "2026-02-09T08:21:00Z",
            },
          ],
        },
      ],
      previewSamples: ['{"question":"向量召回如何配置","reference_answer":"..."}'],
      audits: [
        {
          auditId: "audit-ds-0901",
          action: "dataset.version.upload",
          actor: "qa@mock.ai",
          happenedAt: "2026-02-08T14:20:00Z",
        },
      ],
    },
  ]

  return seeds.map(
    (item): ProjectDatasetItem => ({
      ...item,
      name: projectId === "project-chat" ? item.name : `${item.name}-${projectId}`,
    }),
  )
}
