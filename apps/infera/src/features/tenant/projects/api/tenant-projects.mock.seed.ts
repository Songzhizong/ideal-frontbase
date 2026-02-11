import type {
  TenantProjectItem,
  TenantProjectMemberCandidate,
  TenantProjectOwnerOption,
} from "../types/tenant-projects"

export interface TenantProjectSeed {
  canCreateProject: boolean
  ownerOptions: TenantProjectOwnerOption[]
  memberCandidates: TenantProjectMemberCandidate[]
  projects: TenantProjectItem[]
}

export const TENANT_PROJECT_SEEDS: Readonly<Record<string, TenantProjectSeed>> = {
  "1": {
    canCreateProject: true,
    ownerOptions: [
      {
        userId: "user-owner-1",
        displayName: "赵嘉宁",
        email: "owner@acme.ai",
      },
      {
        userId: "user-owner-2",
        displayName: "韩若曦",
        email: "ml-lead@acme.ai",
      },
      {
        userId: "user-owner-3",
        displayName: "周浩然",
        email: "ops@acme.ai",
      },
    ],
    memberCandidates: [
      {
        userId: "user-owner-1",
        displayName: "赵嘉宁",
        email: "owner@acme.ai",
        defaultRole: "Owner",
      },
      {
        userId: "user-owner-2",
        displayName: "韩若曦",
        email: "ml-lead@acme.ai",
        defaultRole: "Maintainer",
      },
      {
        userId: "user-owner-3",
        displayName: "周浩然",
        email: "ops@acme.ai",
        defaultRole: "Maintainer",
      },
      {
        userId: "user-member-1",
        displayName: "李子墨",
        email: "member-1@acme.ai",
        defaultRole: "Member",
      },
      {
        userId: "user-member-2",
        displayName: "王思远",
        email: "member-2@acme.ai",
        defaultRole: "Member",
      },
    ],
    projects: [
      {
        projectId: "project-chat",
        projectName: "Chat Gateway",
        environment: "Prod",
        ownerId: "user-owner-1",
        ownerName: "赵嘉宁",
        serviceSummary: { ready: 6, total: 7 },
        monthlyEstimatedCostCny: 17230.6,
        tokensToday: 31245020,
        updatedAt: "2026-02-10T09:32:00Z",
        deletionPreview: {
          policy: "blocked",
          dependencies: [
            {
              id: "dep-service-chat",
              resourceType: "service",
              resourceName: "chat-gateway-prod",
              to: "/t/1/p/project-chat/dashboard",
            },
            {
              id: "dep-key-chat",
              resourceType: "api_key",
              resourceName: "chat-partner-key",
              to: "/t/1/p/project-chat/dashboard",
            },
          ],
        },
      },
      {
        projectId: "project-rag",
        projectName: "RAG Platform",
        environment: "Test",
        ownerId: "user-owner-2",
        ownerName: "韩若曦",
        serviceSummary: { ready: 5, total: 6 },
        monthlyEstimatedCostCny: 12320.12,
        tokensToday: 20834120,
        updatedAt: "2026-02-10T08:17:00Z",
        deletionPreview: {
          policy: "cascade",
          dependencies: [
            {
              id: "dep-service-rag",
              resourceType: "service",
              resourceName: "rag-gateway-test",
              to: "/t/1/p/project-rag/dashboard",
            },
            {
              id: "dep-model-rag",
              resourceType: "model",
              resourceName: "rag-embed-v2",
              to: "/t/1/p/project-rag/dashboard",
            },
          ],
        },
      },
      {
        projectId: "project-eval",
        projectName: "Evaluation Hub",
        environment: "Prod",
        ownerId: "user-owner-2",
        ownerName: "韩若曦",
        serviceSummary: { ready: 4, total: 4 },
        monthlyEstimatedCostCny: 9680.75,
        tokensToday: 15223090,
        updatedAt: "2026-02-10T07:52:00Z",
        deletionPreview: {
          policy: "allow",
          dependencies: [],
        },
      },
      {
        projectId: "project-vision",
        projectName: "Vision Stack",
        environment: "Dev",
        ownerId: "user-owner-3",
        ownerName: "周浩然",
        serviceSummary: { ready: 2, total: 3 },
        monthlyEstimatedCostCny: 7312.48,
        tokensToday: 10823520,
        updatedAt: "2026-02-10T06:35:00Z",
        deletionPreview: {
          policy: "allow",
          dependencies: [],
        },
      },
      {
        projectId: "project-ops",
        projectName: "Ops Assistant",
        environment: "Test",
        ownerId: "user-owner-3",
        ownerName: "周浩然",
        serviceSummary: { ready: 2, total: 3 },
        monthlyEstimatedCostCny: 5796.23,
        tokensToday: 8752190,
        updatedAt: "2026-02-10T05:24:00Z",
        deletionPreview: {
          policy: "cascade",
          dependencies: [
            {
              id: "dep-service-ops",
              resourceType: "service",
              resourceName: "ops-assistant-test",
              to: "/t/1/p/project-ops/dashboard",
            },
          ],
        },
      },
    ],
  },
  "2": {
    canCreateProject: false,
    ownerOptions: [
      {
        userId: "user-owner-21",
        displayName: "许可心",
        email: "owner@nebula.ai",
      },
    ],
    memberCandidates: [
      {
        userId: "user-owner-21",
        displayName: "许可心",
        email: "owner@nebula.ai",
        defaultRole: "Owner",
      },
    ],
    projects: [
      {
        projectId: "project-vision",
        projectName: "Vision Stack",
        environment: "Dev",
        ownerId: "user-owner-21",
        ownerName: "许可心",
        serviceSummary: { ready: 3, total: 3 },
        monthlyEstimatedCostCny: 6200.4,
        tokensToday: 11234220,
        updatedAt: "2026-02-10T04:19:00Z",
        deletionPreview: {
          policy: "allow",
          dependencies: [],
        },
      },
    ],
  },
}
