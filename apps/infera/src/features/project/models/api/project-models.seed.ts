import type { ProjectModelItem } from "../types/project-models"

export function createProjectModelSeeds(_tenantId: string, projectId: string): ProjectModelItem[] {
  const seeds: ProjectModelItem[] = [
    {
      modelId: "model-chat-base",
      name: "Chat LLM Base",
      source: "Project",
      visibility: "Private",
      tags: [
        {
          tagName: "latest",
          versionId: "mv-chat-103",
          updatedBy: "owner@mock.ai",
          updatedAt: "2026-02-10T08:30:00Z",
        },
        {
          tagName: "prod",
          versionId: "mv-chat-102",
          updatedBy: "release-bot",
          updatedAt: "2026-02-09T14:22:00Z",
        },
        {
          tagName: "staging",
          versionId: "mv-chat-103",
          updatedBy: "ml.dev@mock.ai",
          updatedAt: "2026-02-10T08:31:00Z",
        },
      ],
      latestVersionId: "mv-chat-103",
      parameterContextSummary: "34B / 128K",
      usedByServices: 3,
      updatedAt: "2026-02-10T08:31:00Z",
      license: "Apache-2.0",
      format: "safetensors",
      artifactType: "Full",
      quantization: "FP16",
      description: "用于企业问答与函数调用的主力模型资产。",
      versions: [
        {
          modelVersionId: "mv-chat-103",
          artifactType: "Full",
          format: "safetensors",
          sha256: "acbf98221f023417a0a11de900c1f000",
          size: "18.2 GB",
          source: "Upload",
          baseModelVersionId: "mv-base-009",
          createdAt: "2026-02-10T08:30:00Z",
          usedByCount: 1,
          metadata: {
            parameterSize: "34B",
            contextLength: 128000,
            license: "Apache-2.0",
            quantization: "FP16",
            notes: "Q1 回归增强版本",
            gatePassed: true,
          },
          dependencies: [
            {
              serviceName: "chat-gateway-prod",
              revisionId: "rev-9083",
              environment: "Prod",
              trafficWeight: "20%",
              endpoint: "https://api.infera.mock/chat-gateway",
            },
          ],
        },
        {
          modelVersionId: "mv-chat-102",
          artifactType: "Full",
          format: "safetensors",
          sha256: "acbf98221f023417a0a11de900c1f222",
          size: "18.1 GB",
          source: "Fine-tune",
          baseModelVersionId: "mv-base-008",
          createdAt: "2026-02-09T14:20:00Z",
          usedByCount: 2,
          metadata: {
            parameterSize: "34B",
            contextLength: 128000,
            license: "Apache-2.0",
            quantization: "FP16",
            notes: "稳定生产版本",
            gatePassed: true,
          },
          dependencies: [
            {
              serviceName: "chat-gateway-prod",
              revisionId: "rev-8991",
              environment: "Prod",
              trafficWeight: "80%",
              endpoint: "https://api.infera.mock/chat-gateway",
            },
          ],
        },
      ],
      usage: [
        {
          serviceName: "chat-gateway-prod",
          revisionId: "rev-8991",
          environment: "Prod",
          trafficWeight: "80%",
          endpoint: "https://api.infera.mock/chat-gateway",
        },
      ],
      audits: [
        {
          auditId: "audit-model-1001",
          action: "model.version.upload",
          actor: "ml.dev@mock.ai",
          happenedAt: "2026-02-10T08:30:00Z",
        },
        {
          auditId: "audit-model-1000",
          action: "model.tag.promote",
          actor: "release-bot",
          happenedAt: "2026-02-09T14:22:00Z",
        },
      ],
    },
    {
      modelId: "model-embed-system",
      name: "Embedding Foundation",
      source: "System",
      visibility: "Public",
      tags: [
        {
          tagName: "latest",
          versionId: "mv-embed-221",
          updatedBy: "system",
          updatedAt: "2026-02-07T11:00:00Z",
        },
      ],
      latestVersionId: "mv-embed-221",
      parameterContextSummary: "1.3B / 8K",
      usedByServices: 1,
      updatedAt: "2026-02-07T11:00:00Z",
      license: "MIT",
      format: "gguf",
      artifactType: "Full",
      quantization: "Q8",
      description: "系统内置向量检索模型。",
      versions: [],
      usage: [],
      audits: [],
    },
    {
      modelId: "model-tenant-rerank",
      name: "Tenant ReRanker",
      source: "Tenant",
      visibility: "TenantShared",
      tags: [
        {
          tagName: "latest",
          versionId: "mv-rerank-12",
          updatedBy: "owner@mock.ai",
          updatedAt: "2026-02-06T16:10:00Z",
        },
      ],
      latestVersionId: "mv-rerank-12",
      parameterContextSummary: "6B / 16K",
      usedByServices: 2,
      updatedAt: "2026-02-06T16:10:00Z",
      license: "Apache-2.0",
      format: "safetensors",
      artifactType: "Adapter",
      quantization: "BF16",
      description: "租户共享 rerank 模型。",
      versions: [],
      usage: [],
      audits: [],
    },
  ]

  return seeds.map(
    (model): ProjectModelItem => ({
      ...model,
      description:
        projectId === "project-chat" ? model.description : `${model.description}（${projectId}）`,
    }),
  )
}
